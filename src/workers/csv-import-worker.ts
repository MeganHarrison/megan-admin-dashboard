// This is a Cloudflare Worker script for CSV import to D1
// Deploy this as a separate Worker that can access your D1 database

export interface Env {
  DB: D1Database;
}

interface CSVRow {
  [key: string]: string;
}

async function parseCSV(text: string): Promise<CSVRow[]> {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Parse headers - handle quoted values
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export default {
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
      
      // Get column names from the first row
      const columns = Object.keys(rows[0]);
      
      // Create table if it doesn't exist
      // Assuming all columns are TEXT for simplicity
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS "text-bc" (
          ${columns.map(col => `"${col}" TEXT`).join(',\n          ')}
        )
      `;
      
      await env.DB.prepare(createTableQuery).run();
      
      // Insert rows in batches
      const batchSize = 100;
      let totalInserted = 0;
      
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        // Build insert query
        const placeholders = batch.map(() => 
          `(${columns.map(() => '?').join(', ')})`
        ).join(', ');
        
        const insertQuery = `
          INSERT INTO "text-bc" (${columns.map(col => `"${col}"`).join(', ')})
          VALUES ${placeholders}
        `;
        
        // Flatten values for the query
        const values: string[] = [];
        batch.forEach(row => {
          columns.forEach(col => {
            values.push(row[col] || '');
          });
        });
        
        await env.DB.prepare(insertQuery).bind(...values).run();
        totalInserted += batch.length;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          rowsImported: totalInserted,
          message: `Successfully imported ${totalInserted} rows to text-bc table`
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