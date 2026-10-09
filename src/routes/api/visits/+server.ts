import { json } from '@sveltejs/kit';
import { configured, supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
const rate = new Map<string, { count: number; expires: number }>();
export const POST: RequestHandler = async ({ request, url, cookies, getClientAddress }) => {
 if (request.headers.get('origin') !== url.origin) return json({}, { status: 403 });
 if (!configured() || /bot|crawl|spider|preview|headless/i.test(request.headers.get('user-agent') || '')) return new Response(null, { status: 204 });
 if (Number(request.headers.get('content-length') || 0) > 2048) return json({}, { status: 413 });
 const nowMs=Date.now();const ip=getClientAddress();const recent=rate.get(ip);
 if(recent&&recent.expires>nowMs&&recent.count>=240)return new Response(null,{status:429});
 rate.set(ip,{count:recent&&recent.expires>nowMs?recent.count+1:1,expires:recent&&recent.expires>nowMs?recent.expires:nowMs+60000});
 for(const [key,value] of rate)if(value.expires<=nowMs)rate.delete(key);
 let path: string;
 try { const body=await request.text();if(body.length>2048)return json({},{status:413});path = JSON.parse(body).path; } catch { return json({}, { status: 400 }); }
 if (typeof path !== 'string' || !/^\/(?:contact|works(?:\/[a-z0-9-]+)?|services\/[a-z0-9-]+)?$/.test(path) || path.length > 150) return json({}, { status: 400 });
 let session = cookies.get('visit_session');
 if (!session || !/^[0-9a-f-]{36}$/i.test(session)) session = crypto.randomUUID();
 cookies.set('visit_session', session, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 1800 });
 const last = cookies.get('visit_last'); const now = Math.floor(Date.now()/1000);
 if (last && now - Number(last) < 3) return new Response(null, { status: 204 });
 cookies.set('visit_last', String(now), { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 1800 });
 try { await supabase('/rest/v1/site_visits', { method: 'POST', body: JSON.stringify({ session_id: session, path }) }); } catch { /* Analytics must never break the public site. */ }
 return new Response(null, { status: 204 });
};
