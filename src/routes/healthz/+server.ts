export function GET() {
 return new Response('{"status":"ok"}', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
