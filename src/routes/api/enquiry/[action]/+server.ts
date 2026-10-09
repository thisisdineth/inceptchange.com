import { enquiryQuestions } from '$lib/enquiry';
import { configured, supabase } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const submissions=new Map<string,{count:number;expires:number}>();
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
 if(params.action==='submit'){
  const now=Date.now(),ip=getClientAddress(),recent=submissions.get(ip);
  if(recent&&recent.expires>now&&recent.count>=40)return json({error:'Too many enquiries. Please try again later.'},{status:429});
  submissions.set(ip,{count:recent&&recent.expires>now?recent.count+1:1,expires:recent&&recent.expires>now?recent.expires:now+3600000});
  for(const [key,value] of submissions)if(value.expires<=now)submissions.delete(key);
 }
 let recordedId = '';
 if (params.action === 'submit' && configured()) {
  let input;
  try { input=JSON.parse(body); } catch { return json({error:'Invalid request'},{status:400}); }
  const b=input.brief;
  if (!/^[0-9a-f-]{36}$/i.test(input.requestId||'') || !b || ['name','email','service','date','time'].some(k=>typeof b[k]!=='string'||!b[k].trim()||b[k].length>3000) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) || b.name.length>150 || typeof b.touches!=='string' || b.touches.length>3000 || (!b.studio&&(typeof b.location!=='string'||!b.location.trim()))) return json({error:'Please complete your booking details.'},{status:400});
  const isoDate=/^\d{4}-\d{2}-\d{2}$/.test(b.date)&&Number.isFinite(Date.parse(b.date))&&new Date(b.date).toISOString().slice(0,10)===b.date?b.date:null;
  if(b.studio&&!isoDate)return json({error:'Choose a valid studio date.'},{status:400});
  try {
   await supabase('/rest/v1/studio_bookings?on_conflict=request_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({request_id:input.requestId,booking_date:isoDate,date_description:b.date,is_studio:!!b.studio,location:b.studio?'IdeaBay — InceptChange studio':b.location,name:b.name,email:b.email,service:b.service,notes:`Preferred time: ${b.time}\n${b.touches}`,status:'requested',email_status:'pending'})});
   recordedId=input.requestId;
  } catch { return json({error:'We could not record your booking. Your details are still here; please retry.'},{status:503}); }
 }
 try {
  const response = await fetch(`${env.ENQUIRY_BACKEND_URL || 'http://127.0.0.1:8080'}/api/enquiry/${params.action}`, {
   method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Enquiry-Secret': env.ENQUIRY_PROXY_SECRET, 'X-Enquiry-IP': getClientAddress() }, body, signal: AbortSignal.timeout(65000)
  });
  if (params.action === 'submit' && response.ok) {
   const result = await response.json();
   result.bookingSaved=!!recordedId;
   if(result.sent&&recordedId){
    try {await supabase(`/rest/v1/studio_bookings?request_id=eq.${recordedId}`,{method:'PATCH',body:JSON.stringify({email_status:'sent'})});}catch{console.error('Booking saved and email accepted; email status update failed');}
   }
   return json(result);
  }
  if (params.action === 'question' && !response.ok && response.status !== 400 && response.status !== 429) return fallback();
  return new Response(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } });
 } catch { if (params.action === 'question') return fallback(); return json({ error: 'We could not connect. Please retry or email inceptchange@gmail.com.' }, { status: 503 }); }
};
