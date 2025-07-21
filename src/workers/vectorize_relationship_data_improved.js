// UNMASK: Improved Relationship Data Vectorization Pipeline
// Transform raw messages into intelligent vectors for RAG

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    
    if (pathname === '/vectorize') {
      return await vectorizeMessages(env);
    }
    
    if (pathname === '/query') {
      return await queryRelationshipInsights(request, env);
    }
    
    return new Response('Unmask Vectorization API', { status: 200 });
  }
};

// Core vectorization function with fixes
async function vectorizeMessages(env) {
  try {
    // 1. Extract messages from D1 with correct schema
    const messages = await env.DB.prepare(`
      SELECT 
        id,
        date_time,
        date,
        time,
        type,
        sender,
        message,
        attachment,
        sentiment,
        category,
        tag
      FROM "texts-bc"
      WHERE message IS NOT NULL AND message != ''
      ORDER BY date_time ASC
      LIMIT 10000
    `).all();

    if (!messages.results || messages.results.length === 0) {
      return new Response(JSON.stringify({
        error: 'No messages found to vectorize'
      }), { status: 404 });
    }

    // 2. Create contextual chunks for better RAG
    const contextualChunks = createContextualChunks(messages.results);
    
    // 3. Store chunks in D1 for retrieval
    await storeChunksInD1(contextualChunks, env);
    
    // 4. Generate embeddings and store in Vectorize
    let vectorizedCount = 0;
    const batchSize = 10;
    
    for (let i = 0; i < contextualChunks.length; i += batchSize) {
      const batch = contextualChunks.slice(i, i + batchSize);
      
      const embeddings = await Promise.all(
        batch.map(chunk => generateEmbedding(chunk.text, env))
      );
      
      const vectors = batch.map((chunk, idx) => ({
        id: chunk.id,
        values: embeddings[idx],
        metadata: {
          timestamp: chunk.timestamp,
          sender: chunk.sender,
          date: chunk.date,
          context_type: chunk.context_type,
          emotional_intensity: chunk.emotional_intensity,
          message_count: chunk.message_count,
          conversation_thread: chunk.conversation_thread,
          has_attachment: chunk.has_attachment
        }
      }));
      
      await env.VECTORIZE_INDEX.upsert(vectors);
      vectorizedCount += batch.length;
    }

    return new Response(JSON.stringify({
      status: 'success',
      total_messages: messages.results.length,
      vectorized_chunks: vectorizedCount,
      message: 'Relationship data successfully vectorized'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Vectorization error:', error);
    return new Response(JSON.stringify({
      error: 'Vectorization failed',
      details: error.message
    }), { status: 500 });
  }
}

// Store chunks in D1 for later retrieval
async function storeChunksInD1(chunks, env) {
  // Create chunks table if it doesn't exist
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS "conversation_chunks" (
      chunk_id TEXT PRIMARY KEY,
      chunk_text TEXT NOT NULL,
      timestamp TEXT,
      date TEXT,
      context_type TEXT,
      emotional_intensity INTEGER,
      message_count INTEGER,
      conversation_thread INTEGER
    )
  `).run();
  
  // Insert chunks
  const stmt = env.DB.prepare(`
    INSERT INTO "conversation_chunks" 
    (chunk_id, chunk_text, timestamp, date, context_type, emotional_intensity, message_count, conversation_thread)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const batch = [];
  for (const chunk of chunks) {
    batch.push(stmt.bind(
      chunk.id,
      chunk.text,
      chunk.timestamp,
      chunk.date,
      chunk.context_type,
      chunk.emotional_intensity,
      chunk.message_count,
      chunk.conversation_thread
    ));
  }
  
  await env.DB.batch(batch);
}

// Create intelligent chunks that preserve relationship context
function createContextualChunks(messages) {
  const chunks = [];
  let currentChunk = [];
  let chunkId = 1;
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const nextMessage = messages[i + 1];
    
    // Skip empty messages
    if (!message.message || message.message.trim() === '') {
      continue;
    }
    
    currentChunk.push(message);
    
    // Determine if we should close this chunk
    const shouldCloseChunk = 
      currentChunk.length >= 10 || // Max 10 messages per chunk
      !nextMessage || 
      (new Date(nextMessage.date_time) - new Date(message.date_time)) > 4 * 60 * 60 * 1000 || // 4 hour gap
      (nextMessage && isDifferentConversationContext(message, nextMessage));
    
    if (shouldCloseChunk && currentChunk.length > 0) {
      chunks.push({
        id: `chunk_${chunkId}`,
        text: formatChunkText(currentChunk),
        timestamp: currentChunk[0].date_time,
        sender: determinePrimarySender(currentChunk),
        date: currentChunk[0].date,
        context_type: analyzeContextType(currentChunk),
        emotional_intensity: calculateEmotionalIntensity(currentChunk),
        message_count: currentChunk.length,
        conversation_thread: chunkId,
        has_attachment: currentChunk.some(m => m.attachment)
      });
      
      currentChunk = [];
      chunkId++;
    }
  }
  
  return chunks;
}

// Check if messages are in different conversation contexts
function isDifferentConversationContext(msg1, msg2) {
  // If sender changes from one person to "Me" or vice versa after long gap
  const timeDiff = new Date(msg2.date_time) - new Date(msg1.date_time);
  const senderChange = msg1.sender !== msg2.sender;
  
  return senderChange && timeDiff > 30 * 60 * 1000; // 30 minutes
}

// Format chunk for optimal embedding
function formatChunkText(messages) {
  const dateStr = messages[0].date;
  const messageTexts = messages.map(msg => {
    const sender = msg.sender || 'Me';
    const text = msg.message;
    const attachment = msg.attachment ? ` [Attachment: ${msg.attachment}]` : '';
    return `${sender}: ${text}${attachment}`;
  }).join('\n');
  
  return `Date: ${dateStr}\nConversation:\n${messageTexts}`;
}

// Enhanced context type analysis
function analyzeContextType(messages) {
  const text = messages.map(m => m.message.toLowerCase()).join(' ');
  const avgLength = text.length / messages.length;
  
  // More sophisticated pattern matching
  const patterns = {
    'intimate': /\b(love|miss|baby|babe|honey|sweetheart|kiss|hug|cuddle)\b/gi,
    'conflict': /\b(sorry|upset|angry|frustrated|hurt|disappointed|argue|fight)\b/gi,
    'support': /\b(proud|support|help|there for you|understand|care)\b/gi,
    'planning': /\b(tomorrow|tonight|weekend|plan|meet|dinner|date|schedule)\b/gi,
    'work': /\b(work|meeting|office|client|project|deadline|boss)\b/gi,
    'daily_check_in': /\b(how are|how was|what's up|hey|morning|night)\b/gi
  };
  
  const matches = {};
  for (const [type, pattern] of Object.entries(patterns)) {
    matches[type] = (text.match(pattern) || []).length;
  }
  
  // Find dominant pattern
  const dominantType = Object.entries(matches)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (dominantType[1] > 0) {
    return dominantType[0];
  }
  
  // Fallback logic
  if (messages.length <= 3 && avgLength < 50) {
    return 'quick_exchange';
  }
  
  return 'general_conversation';
}

// Enhanced emotional intensity calculation
function calculateEmotionalIntensity(messages) {
  const factors = {
    baseScore: 3,
    emojiScore: 0,
    lengthScore: 0,
    keywordScore: 0,
    engagementScore: 0
  };
  
  const text = messages.map(m => m.message).join(' ');
  
  // Emoji analysis
  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojiCount = (text.match(emojiPattern) || []).length;
  factors.emojiScore = Math.min(emojiCount * 0.5, 2);
  
  // Message length factor
  const avgLength = text.length / messages.length;
  if (avgLength > 100) factors.lengthScore += 1.5;
  if (avgLength > 200) factors.lengthScore += 1;
  
  // Emotional keywords
  const emotionalWords = /\b(love|hate|miss|need|want|hurt|happy|sad|angry|excited|worried|scared)\b/gi;
  const emotionalCount = (text.match(emotionalWords) || []).length;
  factors.keywordScore = Math.min(emotionalCount * 0.3, 2);
  
  // Back-and-forth engagement
  const senderChanges = messages.reduce((count, msg, i) => {
    if (i > 0 && msg.sender !== messages[i-1].sender) count++;
    return count;
  }, 0);
  
  if (senderChanges > messages.length * 0.7) {
    factors.engagementScore = 1.5; // High engagement
  }
  
  const totalScore = Object.values(factors).reduce((a, b) => a + b, 0);
  return Math.min(Math.max(Math.round(totalScore), 1), 10);
}

function determinePrimarySender(messages) {
  const senderCounts = {};
  messages.forEach(msg => {
    const sender = msg.sender || 'Me';
    senderCounts[sender] = (senderCounts[sender] || 0) + 1;
  });
  
  return Object.keys(senderCounts).reduce((a, b) => 
    senderCounts[a] > senderCounts[b] ? a : b
  );
}

// Generate embedding using Workers AI
async function generateEmbedding(text, env) {
  try {
    const response = await env.AI.run('@cf/baai/bge-large-en-v1.5', {
      text: [text]
    });
    
    return response.data[0];
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}

// Enhanced query function for RAG
async function queryRelationshipInsights(request, env) {
  try {
    const { query, top_k = 10, filters = {} } = await request.json();
    
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query, env);
    
    // Build vector search options
    const searchOptions = {
      topK: top_k,
      returnMetadata: true
    };
    
    // Add metadata filters if provided
    if (filters.context_type) {
      searchOptions.filter = { context_type: filters.context_type };
    }
    
    // Search similar vectors
    const matches = await env.VECTORIZE_INDEX.query(queryEmbedding, searchOptions);
    
    // Retrieve full chunk texts
    const chunkIds = matches.matches.map(m => m.id);
    const chunks = await env.DB.prepare(`
      SELECT * FROM "conversation_chunks"
      WHERE chunk_id IN (${chunkIds.map(() => '?').join(',')})
    `).bind(...chunkIds).all();
    
    // Build enriched context
    const context = matches.matches.map(match => {
      const chunk = chunks.results.find(c => c.chunk_id === match.id);
      return {
        similarity: match.score,
        date: match.metadata.date,
        sender: match.metadata.sender,
        context_type: match.metadata.context_type,
        emotional_intensity: match.metadata.emotional_intensity,
        conversation: chunk ? chunk.chunk_text : 'Chunk not found'
      };
    });
    
    // Generate insights
    const insights = await generateInsights(query, context, env);
    
    return new Response(JSON.stringify({
      query,
      context_count: context.length,
      insights,
      debug: {
        top_matches: context.slice(0, 3)
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Query error:', error);
    return new Response(JSON.stringify({
      error: 'Query failed',
      details: error.message
    }), { status: 500 });
  }
}

// Generate insights using Claude with RAG context
async function generateInsights(query, context, env) {
  const contextText = context.map(c => 
    `Date: ${c.date} | Type: ${c.context_type} | Intensity: ${c.emotional_intensity}/10
${c.conversation}`
  ).join('\n\n---\n\n');
  
  const prompt = `
As a relationship intelligence AI analyzing text message data, provide insights for: "${query}"

RELEVANT CONVERSATION HISTORY:
${contextText}

Instructions:
1. Identify specific patterns and trends
2. Provide concrete examples from the conversations
3. Offer actionable insights for relationship growth
4. Be empathetic but direct
5. Focus on both challenges and strengths

Format your response with clear sections for Patterns, Examples, and Recommendations.`;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.content[0].text;
    
  } catch (error) {
    console.error('Claude API error:', error);
    return 'Unable to generate insights at this time. Please try again.';
  }
}