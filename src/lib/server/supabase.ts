import { createAdminClient } from '@supabase/server/core';
import { env } from '$env/dynamic/private';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';

export function adminClient() {
 return createAdminClient({ env: { url: env.SUPABASE_URL, secretKeys: { default: env.SUPABASE_SECRET_KEY || '' }, publishableKeys: env.SUPABASE_PUBLISHABLE_KEY ? { default: env.SUPABASE_PUBLISHABLE_KEY } : {}, jwks: env.SUPABASE_JWKS_URL ? new URL(env.SUPABASE_JWKS_URL) : null } });
}
export function configured() { return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY); }
export async function supabase(path: string, options: RequestInit = {}) {
 if (!configured()) throw error(503, 'Supabase is not configured.');
 const response = await fetch(`${env.SUPABASE_URL!.replace(/\/$/, '')}${path}`, {
  ...options, signal: AbortSignal.timeout(15000), headers: { apikey: env.SUPABASE_SECRET_KEY!, 'Content-Type': 'application/json', ...options.headers }
 });
 if (!response.ok) {
  const details = await response.json().catch(() => ({}));
  if (details.code === '23505') throw error(409, 'That date is already confirmed or blocked. Choose another date or release the existing reservation.');
  console.error('Supabase request failed', response.status, details.code || '');
  throw error(503, 'The database could not complete this request. Check configuration and migrations.');
 }
 return response;
}
export function adminAllowed(email?: string) { return Boolean(email && (env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean).includes(email.toLowerCase())); }
export function saveSession(event: RequestEvent, session: { access_token: string; refresh_token: string; expires_in: number }) {
 const options = { path: '/admin', httpOnly: true, sameSite: 'strict' as const, secure: event.url.protocol === 'https:' };
 event.cookies.set('admin_access', session.access_token, { ...options, maxAge: Math.min(session.expires_in || 3600, 3600) });
 event.cookies.set('admin_refresh', session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 7 });
}
export function clearSession(event: RequestEvent) { for (const name of ['admin_access', 'admin_refresh']) event.cookies.delete(name, { path: '/admin' }); }
export async function requireAdmin(event: RequestEvent) {
 if (!configured()) throw redirect(303, '/admin/login');
 let access = event.cookies.get('admin_access');
 const user = async () => {
  if (!access) return null;
  const { data, error: authError } = await adminClient().auth.getUser(access);
  return authError ? null : data.user;
 };
 let profile;
 try {
  profile = await user();
  if (!profile && event.cookies.get('admin_refresh')) {
   const { data, error: refreshError } = await adminClient().auth.refreshSession({ refresh_token: event.cookies.get('admin_refresh')! });
   if (!refreshError && data.session) { saveSession(event, data.session); access = data.session.access_token; profile = await user(); }
  }
 } catch { throw error(503, 'Authentication is temporarily unavailable. Please retry.'); }
 if (!profile || !adminAllowed(profile.email)) { clearSession(event); throw redirect(303, '/admin/login'); }
 return profile as { id: string; email: string };
}
export function sameOrigin(event: RequestEvent) { if (event.request.headers.get('origin') !== event.url.origin) throw error(403, 'Access denied'); }
