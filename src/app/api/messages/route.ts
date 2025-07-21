export const runtime = 'edge';

interface Message {
  id: number;
  date_time: string;
  date: string;
  time: string;
  type: string;
  sender: string;
  message: string;
  attachment: string;
  tag: string;
  sentiment: string;
  category: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const useSampleData = url.searchParams.get('sample') === 'true';
    
    // For local development, return sample data only if explicitly requested
    if (process.env.NODE_ENV === 'development' && useSampleData) {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';
      
      // Sample data for development
      const sampleMessages: Message[] = [
        {
          id: 1,
          date_time: '2022-12-24 13:07:09',
          date: '12/24/22',
          time: '13:07:09',
          type: 'Incoming',
          sender: 'Brandon Clymer',
          message: 'Got ya.',
          attachment: '',
          tag: '',
          sentiment: '',
          category: ''
        },
        {
          id: 2,
          date_time: '2022-12-24 13:08:33',
          date: '12/24/22',
          time: '13:08:33',
          type: 'Incoming',
          sender: 'Brandon Clymer',
          message: 'This is a sample multiline message.\n\nIt has paragraph breaks and shows how the table displays longer content.',
          attachment: 'IMG_1675.mov',
          tag: '',
          sentiment: 'Neutral',
          category: ''
        },
        {
          id: 3,
          date_time: '2022-12-24 19:55:25',
          date: '12/24/22',
          time: '19:55:25',
          type: 'Outgoing',
          sender: '',
          message: 'Lol… presents and money drive happiness 😂',
          attachment: '',
          tag: '',
          sentiment: 'Positive',
          category: ''
        }
      ];
      
      // Filter by search if provided
      let filteredMessages = sampleMessages;
      if (search) {
        filteredMessages = sampleMessages.filter(msg => 
          msg.message.toLowerCase().includes(search.toLowerCase()) ||
          msg.sender.toLowerCase().includes(search.toLowerCase()) ||
          msg.type.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const totalItems = filteredMessages.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const messages = filteredMessages.slice(startIndex, endIndex);
      
      return Response.json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    }
    
    // Try to use Cloudflare D1, fall back to sample data if not available
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const { env } = getRequestContext();
    
      // Get pagination parameters
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';
      const offset = (page - 1) * limit;
      
      // Build query with search functionality
      let query = `SELECT * FROM "texts-bc"`;
      let countQuery = `SELECT COUNT(*) as total FROM "texts-bc"`;
      const params: string[] = [];
      
      if (search) {
        const searchCondition = ` WHERE message LIKE ? OR sender LIKE ? OR type LIKE ?`;
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      // Add ordering and pagination
      query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
      params.push(limit.toString(), offset.toString());
      
      // Execute queries
      const [messagesResult, countResult] = await Promise.all([
        env.DB.prepare(query).bind(...params).all(),
        env.DB.prepare(countQuery).bind(...params.slice(0, search ? 3 : 0)).first()
      ]);
      
      const messages = messagesResult.results as Message[];
      const total = (countResult as any)?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      return Response.json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
      
    } catch (cloudflareError) {
      console.warn('Cloudflare D1 not available, using sample data:', cloudflareError);
      
      // Fallback to sample data
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';
      
      // Sample data for development
      const sampleMessages: Message[] = [
        {
          id: 1,
          date_time: '2022-12-24 13:07:09',
          date: '12/24/22',
          time: '13:07:09',
          type: 'Incoming',
          sender: 'Brandon Clymer',
          message: 'Got ya.',
          attachment: '',
          tag: '',
          sentiment: '',
          category: ''
        },
        {
          id: 2,
          date_time: '2022-12-24 13:08:33',
          date: '12/24/22',
          time: '13:08:33',
          type: 'Incoming',
          sender: 'Brandon Clymer',
          message: 'This is a sample multiline message.\n\nIt has paragraph breaks and shows how the table displays longer content.',
          attachment: 'IMG_1675.mov',
          tag: '',
          sentiment: 'Neutral',
          category: ''
        },
        {
          id: 3,
          date_time: '2022-12-24 19:55:25',
          date: '12/24/22',
          time: '19:55:25',
          type: 'Outgoing',
          sender: '',
          message: 'Lol… presents and money drive happiness 😂',
          attachment: '',
          tag: '',
          sentiment: 'Positive',
          category: ''
        }
      ];
      
      // Filter by search if provided
      let filteredMessages = sampleMessages;
      if (search) {
        filteredMessages = sampleMessages.filter(msg => 
          msg.message.toLowerCase().includes(search.toLowerCase()) ||
          msg.sender.toLowerCase().includes(search.toLowerCase()) ||
          msg.type.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const totalItems = filteredMessages.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const messages = filteredMessages.slice(startIndex, endIndex);
      
      return Response.json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        note: 'Using sample data - Cloudflare D1 not available in this environment'
      });
    }
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}