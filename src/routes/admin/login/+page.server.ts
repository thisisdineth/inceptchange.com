import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import { adminClient, adminAllowed, configured, saveSession, sameOrigin } from '$lib/server/supabase';
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
  const { data, error: authError } = await adminClient().auth.signInWithPassword({ email, password });
  if (authError || !data.session) return fail(400, { message: 'Email or password is incorrect.' });
  const session = data.session;
  if (!adminAllowed(session.user?.email)) return fail(403, { message: 'This account does not have admin access.' });
  saveSession(event, session); attempts.delete(ip);
 } catch { return fail(503, { message: 'Sign-in is temporarily unavailable. Please retry.' }); }
 throw redirect(303, '/admin');
} };
