// Cloudflare Pages Function for CSV import
// This replaces the Next.js API route when deployed to Cloudflare Pages

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Forward to the worker
    const workerUrl = env.CSV_WORKER_URL || 'https://csv-import-worker.megan-d14.workers.dev';
    
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      body: formData,
    });
    
    const data = await workerResponse.json();
    
    return new Response(JSON.stringify(data), {
      status: workerResponse.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('CSV import error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process CSV file' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}