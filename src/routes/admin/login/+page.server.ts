import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import { adminAllowed, configured, saveSession, sameOrigin } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';
const attempts = new Map<string, { count: number; expires: number }>();
export const load: PageServerLoad = () => ({ configured: configured() && Boolean(env.ADMIN_EMAILS) });
export const actions: Actions = { default: async event => {
 sameOrigin(event);
 if (!configured()) return fail(503, { message: 'Admin access is not configured yet.' });
 const ip = event.getClientAddress(); const now = Date.now(); const recent = attempts.get(ip);
 if (recent && recent.expires > now && recent.count >= 8) return fail(429, { message: 'Too many sign-in attempts. Try again in 15 minutes.' });
 attempts.set(ip, { count: recent && recent.expires > now ? recent.count + 1 : 1, expires: recent && recent.expires > now ? recent.expires : now + 900000 });
 for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
 const form = await event.request.formData(); const email = String(form.get('email') || '').trim(); const password = String(form.get('password') || '');
 if (!adminAllowed(email) || !password || password.length > 256) return fail(400, { message: 'Email or password is incorrect.' });
 try {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY!, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000) });
  if (!response.ok) return fail(400, { message: 'Email or password is incorrect.' });
  const session = await response.json();
  if (!adminAllowed(session.user?.email)) return fail(403, { message: 'This account does not have admin access.' });
  saveSession(event, session); attempts.delete(ip);
 } catch { return fail(503, { message: 'Sign-in is temporarily unavailable. Please retry.' }); }
 throw redirect(303, '/admin');
} };
