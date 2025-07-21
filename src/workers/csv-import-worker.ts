// This is a Cloudflare Worker script for CSV import to D1
// Deploy this as a separate Worker that can access your D1 database

export interface Env {
  DB: D1Database;
}

interface CSVRow {
  [key: string]: string;
}

async function parseCSV(text: string): Promise<CSVRow[]> {
  const rows: CSVRow[] = [];
  let i = 0;
  
  // Parse headers first
  const headerResult = parseCSVRecord(text, i);
  const headers = headerResult.values;
  i = headerResult.nextIndex;
  
  // Parse data rows
  while (i < text.length) {
    const rowResult = parseCSVRecord(text, i);
    if (rowResult.values.length === 0) break;
    
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = rowResult.values[index] || '';
    });
    
    rows.push(row);
    i = rowResult.nextIndex;
  }
  
  return rows;
}

function parseCSVRecord(text: string, startIndex: number): { values: string[], nextIndex: number } {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = startIndex;
  
  // Skip any leading whitespace/newlines
  while (i < text.length && (text[i] === '\n' || text[i] === '\r')) {
    i++;
  }
  
  while (i < text.length) {
    const char = text[i];
    
    if (char === '"') {
      // Handle escaped quotes (double quotes)
      if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of record
      values.push(current);
      // Skip any trailing \r\n
      while (i + 1 < text.length && (text[i + 1] === '\n' || text[i + 1] === '\r')) {
        i++;
      }
      return { values, nextIndex: i + 1 };
    } else {
      current += char;
    }
    
    i++;
  }
  
  // Handle end of file
  if (current.length > 0 || values.length > 0) {
    values.push(current);
  }
  
  return { values, nextIndex: i };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const text = await file.text();
      const rows = await parseCSV(text);
      
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'CSV file is empty' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Create texts-bc table if it doesn't exist with the correct schema
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS "texts-bc" (
          "id" integer PRIMARY KEY,
          "date" text,
          "type" text,
          "sender" text,
          "message" text,
          "attachment" text,
          "time" text,
          "date_time" text,
          "sentiment" TEXT,
          "category" TEXT,
          "tag" TEXT
        )
      `;
      
      await env.DB.prepare(createTableQuery).run();
      
      // Use D1 batch API for better performance with large datasets
      let totalInserted = 0;
      const batchSize = 100;
      
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        // Prepare statements for batch execution
        const statements = batch.map(row => {
          return env.DB.prepare(`
            INSERT INTO "texts-bc" ("date", "type", "sender", "message", "attachment", "time", "date_time", "sentiment", "category", "tag")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            row.date || '',
            row.type || '',
            row.sender || '',
            row.message || '',
            row.attachment || '',
            row.time || '',
            row.date_time || '',
            row.sentiment || '',
            row.category || '',
            row.tag || ''
          );
        });
        
        // Execute batch
        await env.DB.batch(statements);
        totalInserted += batch.length;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          rowsImported: totalInserted,
          message: `Successfully imported ${totalInserted} rows to texts-bc table`
        }),
        {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process CSV file', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

export default worker;