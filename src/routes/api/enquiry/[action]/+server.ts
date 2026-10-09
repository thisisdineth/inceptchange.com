import { enquiryQuestions } from '$lib/enquiry';
import { configured, supabase } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, fetch, getClientAddress, url }) => {
 if (!['question', 'submit'].includes(params.action)) return json({ error: 'Unknown action' }, { status: 404 });
 if (request.headers.get('origin') !== url.origin) return json({ error: 'Access denied' }, { status: 403 });
 if (!env.ENQUIRY_PROXY_SECRET) return json({ error: 'Enquiries are temporarily unavailable. Please email inceptchange@gmail.com.' }, { status: 503 });
 const body = await request.text();
 const fallback = () => {
  let step = '';
  try { step = JSON.parse(body).step; } catch { return json({ error: 'Invalid request' }, { status: 400 }); }
  if (!enquiryQuestions[step]) return json({ error: 'Unknown step' }, { status: 400 });
  return new Response(`data: ${JSON.stringify({ text: enquiryQuestions[step], fallback: true })}\n\ndata: {"done":true}\n\n`, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } });
 };
 if (body.length > 16000) return json({ error: 'Your message is too long.' }, { status: 413 });
 try {
  const response = await fetch(`${env.ENQUIRY_BACKEND_URL || 'http://127.0.0.1:8080'}/api/enquiry/${params.action}`, {
   method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Enquiry-Secret': env.ENQUIRY_PROXY_SECRET, 'X-Enquiry-IP': getClientAddress() }, body, signal: AbortSignal.timeout(65000)
  });
  if (params.action === 'submit' && response.ok) {
   const result = await response.json();
   const input = JSON.parse(body);
   if (result.sent && input.brief?.studio && configured()) {
    const b = input.brief;
    if (/^[0-9a-f-]{36}$/i.test(input.requestId || '') && /^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) {
     try {
      await supabase('/rest/v1/studio_bookings?on_conflict=request_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ request_id: input.requestId, booking_date: b.date, name: b.name, email: b.email, service: b.service, notes: `Preferred time: ${b.time}\n${b.touches}`, status: 'requested' }) });
      result.bookingSaved = true;
     } catch { result.bookingSaved = false; console.error('Studio request email accepted but calendar insert failed'); }
    }
   }
   return json(result);
  }
  if (params.action === 'question' && !response.ok && response.status !== 400 && response.status !== 429) return fallback();
  return new Response(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } });
 } catch { if (params.action === 'question') return fallback(); return json({ error: 'We could not connect. Please retry or email inceptchange@gmail.com.' }, { status: 503 }); }
};
