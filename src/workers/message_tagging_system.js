// UNMASK: Message Tagging & Classification System
// FILE: src/workers/message-tagger.js

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    
    if (pathname === '/tag-messages') {
      return await tagAllMessages(env);
    }
    
    if (pathname === '/analyze-tags') {
      return await analyzeTaggedMessages(request, env);
    }
    
    if (pathname === '/search-tags') {
      return await searchByTags(request, env);
    }
    
    return new Response('Unmask Message Tagging API', { status: 200 });
  }
};

// Core tagging system
async function tagAllMessages(env) {
  try {
    // Get all messages from D1
    const messages = await env.DB.prepare(`
      SELECT id, message, sender, type, date_time 
      FROM messages 
      WHERE message IS NOT NULL 
      ORDER BY date_time ASC
    `).all();

    let taggedCount = 0;
    const batchSize = 100;
    
    for (let i = 0; i < messages.results.length; i += batchSize) {
      const batch = messages.results.slice(i, i + batchSize);
      
      for (const message of batch) {
        const tags = await classifyMessage(message, env);
        
        if (tags.length > 0) {
          // Store tags in database
          await env.DB.prepare(`
            UPDATE messages 
            SET tags = ?, 
                emotional_score = ?,
                conflict_indicator = ?,
                relationship_context = ?
            WHERE id = ?
          `).bind(
            JSON.stringify(tags),
            tags.find(t => t.category === 'emotional')?.score || null,
            tags.some(t => t.category === 'conflict') ? 1 : 0,
            tags.find(t => t.category === 'relationship_context')?.value || null,
            message.id
          ).run();
          
          taggedCount++;
        }
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      tagged_messages: taggedCount,
      total_processed: messages.results.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Tagging failed',
      details: error.message
    }), { status: 500 });
  }
}

// Intelligent message classification
async function classifyMessage(message) {
  const text = message.message.toLowerCase();
  const tags = [];
  
  // PRIORITY: Chris/Ex-Boyfriend References
  const chrisExTags = detectChrisExReferences(text, message);
  tags.push(...chrisExTags);
  
  // Emotional Classification
  const emotionalTags = detectEmotionalContent(text, message);
  tags.push(...emotionalTags);
  
  // Conflict Detection
  const conflictTags = detectConflictContent(text, message);
  tags.push(...conflictTags);
  
  // Relationship Dynamics
  const dynamicTags = detectRelationshipDynamics(text, message);
  tags.push(...dynamicTags);
  
  // Communication Patterns
  const commTags = detectCommunicationPatterns(text, message);
  tags.push(...commTags);
  
  return tags;
}

// Chris/Ex-Boyfriend Detection System
function detectChrisExReferences(text, message) {
  const tags = [];
  
  // Chris mentions (case insensitive)
  const chrisPatterns = [
    /\bchris\b/i,
    /\bchristopher\b/i
  ];
  
  // Ex-boyfriend patterns
  const exPatterns = [
    /\bex\b/i,
    /\bx\b(?=\s|$)/i, // "x" as standalone word
    /\bex[-\s]?boyfriend\b/i,
    /\bex[-\s]?bf\b/i,
    /\bformer\s+boyfriend\b/i,
    /\bpast\s+relationship\b/i
  ];
  
  // Context detection for Chris mentions
  if (chrisPatterns.some(pattern => pattern.test(text))) {
    const context = determineChrisContext(text);
    tags.push({
      category: 'chris_reference',
      type: 'person_mention',
      context: context,
      intensity: calculateChrisIntensity(text, context),
      sender: message.type,
      timestamp: message.date_time
    });
  }
  
  // Ex-boyfriend references
  if (exPatterns.some(pattern => pattern.test(text))) {
    const context = determineExContext(text);
    tags.push({
      category: 'ex_reference',
      type: 'relationship_history',
      context: context,
      intensity: calculateExIntensity(text, context),
      sender: message.type,
      timestamp: message.date_time
    });
  }
  
  return tags;
}

// Determine context of Chris mentions
function determineChrisContext(text) {
  // Work/Business context
  if (text.includes('work') || text.includes('business') || 
      text.includes('company') || text.includes('meeting') ||
      text.includes('client') || text.includes('project')) {
    return 'work_related';
  }
  
  // Social/Personal context
  if (text.includes('dinner') || text.includes('hang') || 
      text.includes('see') || text.includes('visit') ||
      text.includes('house') || text.includes('home')) {
    return 'social_personal';
  }
  
  // Comparison context (red flag)
  if (text.includes('like chris') || text.includes('unlike') ||
      text.includes('better than') || text.includes('compared to') ||
      text.includes('wish you were') || text.includes('he would')) {
    return 'comparison_threat';
  }
  
  // Support/Advice context
  if (text.includes('advice') || text.includes('help') ||
      text.includes('support') || text.includes('opinion')) {
    return 'support_advice';
  }
  
  // Jealousy/Insecurity context
  if (text.includes('jealous') || text.includes('worried') ||
      text.includes('uncomfortable') || text.includes('bothers')) {
    return 'jealousy_insecurity';
  }
  
  return 'general_mention';
}

// Calculate intensity of Chris references
function calculateChrisIntensity(text, context) {
  let intensity = 1;
  
  // Context modifiers
  switch (context) {
    case 'comparison_threat': intensity = 8; break;
    case 'jealousy_insecurity': intensity = 7; break;
    case 'social_personal': intensity = 5; break;
    case 'support_advice': intensity = 3; break;
    case 'work_related': intensity = 2; break;
    default: intensity = 1;
  }
  
  // Emotional language modifiers
  if (text.includes('love') || text.includes('care about') || 
      text.includes('important')) intensity += 2;
  if (text.includes('angry') || text.includes('upset') || 
      text.includes('hurt')) intensity += 3;
  if (text.includes('trust') || text.includes('loyal')) intensity += 1;
  
  return Math.min(intensity, 10);
}

// Ex-boyfriend context detection
function determineExContext(text) {
  if (text.includes('house') || text.includes('visit') || 
      text.includes('see') || text.includes('hang')) {
    return 'visitation_concern';
  }
  
  if (text.includes('compare') || text.includes('better') || 
      text.includes('different')) {
    return 'comparison_reference';
  }
  
  if (text.includes('past') || text.includes('history') || 
      text.includes('before')) {
    return 'relationship_history';
  }
  
  return 'general_ex_reference';
}

function calculateExIntensity(text, context) {
  let intensity = 1;
  
  switch (context) {
    case 'comparison_reference': intensity = 6; break;
    case 'visitation_concern': intensity = 7; break;
    case 'relationship_history': intensity = 3; break;
    default: intensity = 2;
  }
  
  return Math.min(intensity, 10);
}

// Emotional content detection
function detectEmotionalContent(text, message) {
  const tags = [];
  
  const emotionalMarkers = {
    love: {
      patterns: ['love you', 'i love', 'love u', '❤️', '💕', '💖'],
      score: 8,
      valence: 'positive'
    },
    affection: {
      patterns: ['babe', 'baby', 'honey', 'sweetheart', 'dear'],
      score: 6,
      valence: 'positive'
    },
    anger: {
      patterns: ['angry', 'mad', 'pissed', 'furious', 'fuck', 'shit'],
      score: 7,
      valence: 'negative'
    },
    sadness: {
      patterns: ['sad', 'hurt', 'cry', 'upset', 'disappointed', '😢', '💔'],
      score: 6,
      valence: 'negative'
    },
    anxiety: {
      patterns: ['worried', 'anxious', 'scared', 'nervous', 'stressed'],
      score: 5,
      valence: 'negative'
    },
    excitement: {
      patterns: ['excited', 'amazing', 'awesome', 'great', '🎉', '😄'],
      score: 6,
      valence: 'positive'
    }
  };
  
  Object.entries(emotionalMarkers).forEach(([emotion, config]) => {
    if (config.patterns.some(pattern => text.includes(pattern))) {
      tags.push({
        category: 'emotional',
        type: emotion,
        score: config.score,
        valence: config.valence,
        sender: message.type,
        timestamp: message.date_time
      });
    }
  });
  
  return tags;
}

// Conflict detection
function detectConflictContent(text, message) {
  const tags = [];
  
  const conflictIndicators = {
    direct_conflict: ['argue', 'fight', 'mad at', 'angry with', 'pissed at'],
    apology: ['sorry', 'apologize', 'my fault', 'i was wrong'],
    defense: ['not my fault', 'you always', 'you never', 'unfair'],
    escalation: ['done with this', 'tired of', 'sick of', 'had enough'],
    resolution: ['make up', 'work it out', 'talk about it', 'figure this out']
  };
  
  Object.entries(conflictIndicators).forEach(([type, patterns]) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      tags.push({
        category: 'conflict',
        type: type,
        intensity: calculateConflictIntensity(text, type),
        sender: message.type,
        timestamp: message.date_time
      });
    }
  });
  
  return tags;
}

function calculateConflictIntensity(text, type) {
  const baseIntensity = {
    direct_conflict: 8,
    escalation: 9,
    defense: 6,
    apology: 4,
    resolution: 3
  };
  
  let intensity = baseIntensity[type] || 5;
  
  // Amplifiers
  if (text.includes('always') || text.includes('never')) intensity += 2;
  if (text.includes('fuck') || text.includes('shit')) intensity += 1;
  if (text.includes('!!!') || text.split('!').length > 3) intensity += 1;
  
  return Math.min(intensity, 10);
}

// Relationship dynamics detection
function detectRelationshipDynamics(text, message) {
  const tags = [];
  
  // Pursuit dynamics
  if (text.includes('miss you') || text.includes('miss u') || 
      text.includes('when can') || text.includes('want to see')) {
    tags.push({
      category: 'relationship_dynamic',
      type: 'pursuit',
      sender: message.type,
      timestamp: message.date_time
    });
  }
  
  // Distancing dynamics
  if (text.includes('need space') || text.includes('busy') || 
      text.includes('later') || text.includes('maybe')) {
    tags.push({
      category: 'relationship_dynamic',
      type: 'distancing',
      sender: message.type,
      timestamp: message.date_time
    });
  }
  
  return tags;
}

// Communication pattern detection
function detectCommunicationPatterns(text, message) {
  const tags = [];
  
  // Message length analysis
  const length = text.length;
  let lengthCategory;
  if (length < 20) lengthCategory = 'short';
  else if (length < 100) lengthCategory = 'medium';
  else lengthCategory = 'long';
  
  tags.push({
    category: 'communication_pattern',
    type: 'message_length',
    value: lengthCategory,
    length: length,
    sender: message.type,
    timestamp: message.date_time
  });
  
  // Response pattern (requires sequence analysis)
  // This would need additional logic to analyze message timing
  
  return tags;
}

// Search messages by tags
async function searchByTags(request, env) {
  const { searchParams } = new URL(request.url);
  const tagCategory = searchParams.get('category');
  const tagType = searchParams.get('type');
  const sender = searchParams.get('sender');
  const minIntensity = searchParams.get('min_intensity') || 0;
  
  let query = `
    SELECT m.*, m.tags 
    FROM messages m 
    WHERE m.tags IS NOT NULL
  `;
  
  const params = [];
  
  if (tagCategory) {
    query += ` AND JSON_EXTRACT(m.tags, '$[*].category') LIKE ?`;
    params.push(`%${tagCategory}%`);
  }
  
  if (sender) {
    query += ` AND m.type = ?`;
    params.push(sender);
  }
  
  query += ` ORDER BY m.date_time DESC LIMIT 100`;
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  return new Response(JSON.stringify({
    results: results.results,
    search_params: { tagCategory, tagType, sender, minIntensity }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Analyze tagged message patterns
async function analyzeTaggedMessages(request, env) {
  const { tag_category } = await request.json();
  
  // Chris reference analysis
  if (tag_category === 'chris_analysis') {
    const chrisMessages = await env.DB.prepare(`
      SELECT m.*, m.tags
      FROM messages m 
      WHERE JSON_EXTRACT(m.tags, '$[*].category') LIKE '%chris_reference%'
      ORDER BY m.date_time ASC
    `).all();
    
    const analysis = analyzeChrisPattern(chrisMessages.results);
    
    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown analysis type' }), {
    status: 400
  });
}

// Analyze Chris reference patterns
function analyzeChrisPattern(messages) {
  const analysis = {
    total_mentions: messages.length,
    by_sender: { Incoming: 0, Outgoing: 0 },
    by_context: {},
    intensity_over_time: [],
    concerning_patterns: []
  };
  
  messages.forEach(msg => {
    analysis.by_sender[msg.type]++;
    
    const tags = JSON.parse(msg.tags || '[]');
    const chrisTag = tags.find(t => t.category === 'chris_reference');
    
    if (chrisTag) {
      analysis.by_context[chrisTag.context] = 
        (analysis.by_context[chrisTag.context] || 0) + 1;
      
      analysis.intensity_over_time.push({
        date: msg.date_time,
        intensity: chrisTag.intensity,
        context: chrisTag.context,
        sender: msg.type
      });
      
      // Flag concerning patterns
      if (chrisTag.intensity >= 7) {
        analysis.concerning_patterns.push({
          date: msg.date_time,
          message: msg.message,
          context: chrisTag.context,
          intensity: chrisTag.intensity,
          sender: msg.type
        });
      }
    }
  });
  
  return analysis;
}