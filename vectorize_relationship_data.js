// UNMASK: Relationship Data Vectorization Pipeline
// Transform raw messages into intelligent vectors for RAG

// Step 1: Data Preprocessing Worker
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

// Core vectorization function
async function vectorizeMessages(env) {
  try {
    // 1. Extract messages from D1 in semantic chunks
    const messages = await env.DB.prepare(`
      SELECT 
        id,
        timestamp,
        sender,
        message_content,
        date(timestamp) as message_date
      FROM messages 
      ORDER BY timestamp ASC
    `).all();

    // 2. Create contextual chunks for better RAG
    const contextualChunks = createContextualChunks(messages.results);
    
    // 3. Generate embeddings and store in Vectorize
    let vectorizedCount = 0;
    
    for (const chunk of contextualChunks) {
      const embedding = await generateEmbedding(chunk.text, env);
      
      // Store in Cloudflare Vectorize
      await env.VECTORIZE_INDEX.upsert([
        {
          id: chunk.id,
          values: embedding,
          metadata: {
            timestamp: chunk.timestamp,
            sender: chunk.sender,
            date: chunk.date,
            context_type: chunk.context_type,
            emotional_intensity: chunk.emotional_intensity,
            message_count: chunk.message_count,
            conversation_thread: chunk.conversation_thread
          }
        }
      ]);
      
      vectorizedCount++;
    }

    return new Response(JSON.stringify({
      status: 'success',
      vectorized_chunks: vectorizedCount,
      message: 'Relationship data successfully vectorized'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Vectorization failed',
      details: error.message
    }), { status: 500 });
  }
}

// Create intelligent chunks that preserve relationship context
function createContextualChunks(messages) {
  const chunks = [];
  let currentChunk = [];
  let chunkId = 1;
  
  // Group messages into conversation threads (within 4 hours = same conversation)
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const nextMessage = messages[i + 1];
    
    currentChunk.push(message);
    
    // Determine if we should close this chunk
    const shouldCloseChunk = 
      currentChunk.length >= 10 || // Max 10 messages per chunk
      !nextMessage || 
      (new Date(nextMessage.timestamp) - new Date(message.timestamp)) > 4 * 60 * 60 * 1000; // 4 hour gap
    
    if (shouldCloseChunk) {
      chunks.push({
        id: `chunk_${chunkId}`,
        text: formatChunkText(currentChunk),
        timestamp: currentChunk[0].timestamp,
        sender: determinePrimarySender(currentChunk),
        date: currentChunk[0].message_date,
        context_type: analyzeContextType(currentChunk),
        emotional_intensity: calculateEmotionalIntensity(currentChunk),
        message_count: currentChunk.length,
        conversation_thread: chunkId
      });
      
      currentChunk = [];
      chunkId++;
    }
  }
  
  return chunks;
}

// Format chunk for optimal embedding
function formatChunkText(messages) {
  const dateStr = messages[0].message_date;
  const messageTexts = messages.map(msg => 
    `${msg.sender}: ${msg.message_content}`
  ).join('\n');
  
  return `Date: ${dateStr}\nConversation:\n${messageTexts}`;
}

// Analyze conversation context type
function analyzeContextType(messages) {
  const text = messages.map(m => m.message_content.toLowerCase()).join(' ');
  
  if (text.includes('love') || text.includes('miss') || text.includes('babe') || text.includes('baby')) {
    return 'affectionate';
  }
  if (text.includes('work') || text.includes('meeting') || text.includes('schedule')) {
    return 'logistical';
  }
  if (text.includes('sorry') || text.includes('upset') || text.includes('angry')) {
    return 'conflict_resolution';
  }
  if (text.includes('?') && messages.length < 5) {
    return 'quick_check_in';
  }
  
  return 'general_conversation';
}

// Calculate emotional intensity score (1-10)
function calculateEmotionalIntensity(messages) {
  const text = messages.map(m => m.message_content).join(' ');
  
  let intensity = 5; // baseline
  
  // Positive emotional markers
  if (text.includes('❤️') || text.includes('🥰') || text.includes('😘')) intensity += 2;
  if (text.includes('love you') || text.includes('miss you')) intensity += 1;
  
  // Negative emotional markers  
  if (text.includes('😢') || text.includes('😞') || text.includes('💔')) intensity += 2;
  if (text.includes('fuck') || text.includes('shit') || text.includes('damn')) intensity += 1;
  
  // High engagement markers
  if (messages.length > 15) intensity += 1; // Long conversation
  if (text.length / messages.length > 100) intensity += 1; // Long messages
  
  return Math.min(Math.max(intensity, 1), 10);
}

function determinePrimarySender(messages) {
  const senderCounts = {};
  messages.forEach(msg => {
    senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
  });
  
  return Object.keys(senderCounts).reduce((a, b) => 
    senderCounts[a] > senderCounts[b] ? a : b
  );
}

// Generate embedding using Workers AI
async function generateEmbedding(text, env) {
  const response = await env.AI.run('@cf/baai/bge-large-en-v1.5', {
    text: [text]
  });
  
  return response.data[0];
}

// Query function for RAG
async function queryRelationshipInsights(request, env) {
  const { query, top_k = 10 } = await request.json();
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query, env);
  
  // Search similar vectors
  const matches = await env.VECTORIZE_INDEX.query(queryEmbedding, {
    topK: top_k,
    returnMetadata: true
  });
  
  // Build context for Claude
  const context = matches.matches.map(match => ({
    similarity: match.score,
    date: match.metadata.date,
    sender: match.metadata.sender,
    context_type: match.metadata.context_type,
    emotional_intensity: match.metadata.emotional_intensity,
    conversation: await getChunkText(match.id, env)
  }));
  
  return new Response(JSON.stringify({
    query,
    context,
    insights: await generateInsights(query, context, env)
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Generate insights using Claude with RAG context
async function generateInsights(query, context, env) {
  const contextText = context.map(c => 
    `Date: ${c.date} | Sender: ${c.sender} | Type: ${c.context_type} | Intensity: ${c.emotional_intensity}/10\n${c.conversation}`
  ).join('\n\n---\n\n');
  
  const prompt = `
As a relationship intelligence AI analyzing 2.5 years of text message data, provide insights based on this query: "${query}"

CONTEXT FROM RELATIONSHIP HISTORY:
${contextText}

Analyze patterns, emotional shifts, and provide specific, actionable insights. Be direct, empathetic, and focused on growth.
`;
  
  // Call Claude via Workers AI or API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const result = await response.json();
  return result.content[0].text;
}

async function getChunkText(chunkId, env) {
  // Retrieve original chunk text from D1 or cache
  // Implementation depends on your storage strategy
  return "Chunk text would be retrieved here";
}