// app/api/proxy-eva/route.js
export async function POST(request: Request) {
    try {
      const preparedData = await request.json();
  
      const response = await fetch('http://10.9.4.164:55322/eva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData)
      });
  
      if (!response.ok) {
        return new Response('Flask server error', { status: 500 });
      }
  
      const data = await response.json();
      return Response.json(data); // 直接返回 JSON
    } catch (error) {
      console.error(error);
      return new Response('Proxy server error', { status: 500 });
    }
  }
  