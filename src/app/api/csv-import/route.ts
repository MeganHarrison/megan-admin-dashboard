import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface Env {
  DB: D1Database;
}

async function parseCSV(text: string): Promise<any[]> {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read the file content
    const text = await file.text();
    const rows = await parseCSV(text);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }
    
    // For local development, we'll simulate the database operation
    // In production with Cloudflare Workers, you would access the D1 database directly
    // through the env.DB binding
    
    // Note: In a real Cloudflare Workers environment, you would:
    // 1. Access the D1 database through env.DB
    // 2. Create the table if it doesn't exist
    // 3. Insert the rows
    
    // For now, we'll return a success response with the parsed data
    // You'll need to deploy this as a Cloudflare Worker to actually interact with D1
    
    return NextResponse.json({
      success: true,
      rowsImported: rows.length,
      message: `Successfully parsed ${rows.length} rows. Note: To actually insert into D1 database, this needs to be deployed as a Cloudflare Worker.`,
      // For debugging, you can see the first few rows
      sampleData: rows.slice(0, 3)
    });
    
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}