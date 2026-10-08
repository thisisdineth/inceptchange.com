import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, fetch, getClientAddress, url }) => {
 if (!['question', 'submit'].includes(params.action)) return json({ error: 'Unknown action' }, { status: 404 });
 if (request.headers.get('origin') !== url.origin) return json({ error: 'Access denied' }, { status: 403 });
 if (!env.ENQUIRY_PROXY_SECRET) return json({ error: 'Enquiries are temporarily unavailable. Please email inceptchange@gmail.com.' }, { status: 503 });
 const body = await request.text();
 if (body.length > 16000) return json({ error: 'Your message is too long.' }, { status: 413 });
 try {
  const response = await fetch(`${env.ENQUIRY_BACKEND_URL || 'http://127.0.0.1:8080'}/api/enquiry/${params.action}`, {
   method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Enquiry-Secret': env.ENQUIRY_PROXY_SECRET, 'X-Enquiry-IP': getClientAddress() }, body, signal: AbortSignal.timeout(65000)
  });
  return new Response(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } });
 } catch { return json({ error: 'We could not connect. Please retry or email inceptchange@gmail.com.' }, { status: 503 }); }
};
