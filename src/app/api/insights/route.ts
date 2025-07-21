export const runtime = 'edge';

interface InsightsRequest {
  query: string;
  top_k?: number;
  filters?: {
    context_type?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: InsightsRequest = await request.json();
    
    if (!body.query) {
      return Response.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // For local development, return sample insights
    if (process.env.NODE_ENV === 'development') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleInsights = generateSampleInsights(body.query);
      
      return Response.json({
        success: true,
        query: body.query,
        insights: sampleInsights,
        context_count: 10,
        debug: {
          vectorized_chunks: 194,
          search_time_ms: 245
        }
      });
    }

    // For production, call the vectorization worker
    const workerResponse = await fetch('https://relationship-vectorize-worker.megan-d14.workers.dev/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!workerResponse.ok) {
      throw new Error(`Worker request failed: ${workerResponse.status}`);
    }

    const result = await workerResponse.json() as Record<string, unknown>;
    
    return Response.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Insights API error:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSampleInsights(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('communication') || lowerQuery.includes('pattern')) {
    return `## Communication Pattern Analysis

**Key Patterns Identified:**

1. **Daily Check-in Evolution (2022-2023)**
   - Early relationship: 87% of conversations included emotional check-ins ("How was your day?" followed by detailed sharing)
   - Recent months: 43% shift toward logistical exchanges ("What time?" "Okay" "See you later")

2. **Response Time Correlation**
   - During high-intimacy periods: Average response time 12 minutes
   - During distant phases: Average response time 2.3 hours
   - Current average: 45 minutes (suggesting moderate engagement)

3. **Emotional Expression Changes**
   - 2022: 73% of conversations contained emotional words (love, miss, excited, worried)
   - 2023: 31% emotional content, 69% practical content
   - Emoji usage dropped 60% after moving in together

**Recommendations:**

- **Reintroduce intentional check-ins**: Set aside time for "How was your day?" conversations without logistics
- **Emotional vocabulary recovery**: Consciously include feelings in daily exchanges
- **Response time awareness**: Quick acknowledgments maintain connection during busy periods`;
  }
  
  if (lowerQuery.includes('conflict') || lowerQuery.includes('fight')) {
    return `## Conflict Resolution Analysis

**Conflict Evolution Patterns:**

1. **Resolution Speed Improvement**
   - Early relationship: Conflicts lasted average 2.3 days
   - Current pattern: Resolution within 6-8 hours (67% improvement)
   - Most conflicts now resolved same-day with direct communication

2. **Trigger Pattern Recognition**
   - Primary trigger: Work stress spillover (38% of conflicts)
   - Secondary: Miscommunication about plans (24%)
   - Least common: Personal boundaries (8% - significant improvement)

3. **Resolution Strategies That Work**
   - "I'm sorry, I was stressed about work" - 89% effective resolution
   - Taking space then returning to discuss - 76% effective
   - Immediate discussion when both calm - 84% effective

**Growth Areas:**

- **Preventive communication**: Address work stress before it affects relationship
- **Clear expectation setting**: Reduce planning miscommunications
- **Appreciate progress**: Your conflict resolution has significantly improved`;
  }
  
  if (lowerQuery.includes('intimacy') || lowerQuery.includes('affection') || lowerQuery.includes('love')) {
    return `## Intimacy & Affection Analysis

**Affection Expression Timeline:**

1. **Peak Intimacy Period (Summer 2022)**
   - Daily "good morning beautiful" messages (94% consistency)
   - Spontaneous "thinking of you" texts throughout day
   - Average 3.2 expressions of love per conversation

2. **Transition Period (Fall 2022 - Spring 2023)**
   - Affection became more routine-based
   - Expressions concentrated around arrivals/departures
   - Quality increased even as frequency decreased

3. **Current State Assessment**
   - Affection more intentional and meaningful
   - Physical affection references increased 23%
   - "I love you" carries more weight, used in significant moments

**Positive Trends:**

- **Depth over frequency**: Affection is more thoughtful and specific
- **Comfort-based intimacy**: "Can't wait to cuddle" messages show secure attachment
- **Supportive affection**: Love expressed during stressful times shows growth

**Opportunities:**

- **Spontaneous appreciation**: Random "you're amazing" messages create joy
- **Specific compliments**: Move beyond generic "love you" to "I love how you..."`;
  }
  
  return `## Relationship Insights Analysis

Based on your query about "${query}", here's what the data reveals:

**Key Observations:**
- Your communication patterns show consistent evolution over the 2.5-year period
- Emotional intelligence in your exchanges has notably improved
- There are clear seasonal patterns in your interaction styles

**Conversation Context Breakdown:**
- Supportive conversations: 34%
- Daily logistics: 28%
- Affectionate exchanges: 22%
- Conflict resolution: 11%
- Planning and future-focused: 5%

**Recommendations:**
- Continue building on your strongest communication patterns
- Address areas where connection could be deeper
- Leverage your natural conversation rhythms for better intimacy

*This analysis is based on 194 conversation chunks from your relationship history.*`;
}