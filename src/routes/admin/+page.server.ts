import { fail, redirect, isHttpError } from '@sveltejs/kit';
import { clearSession, requireAdmin, sameOrigin, supabase } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';
const statuses = ['requested', 'confirmed', 'blocked', 'cancelled'];
export const load: PageServerLoad = async event => {
 const admin = await requireAdmin(event);
 const colombo = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit' }).format(new Date());
 const current = /^\d{4}-\d{2}$/.test(colombo) ? colombo : new Date().toISOString().slice(0,7);
 const month = /^\d{4}-\d{2}$/.test(event.url.searchParams.get('month') || '') ? event.url.searchParams.get('month')! : current;
 const [year, number] = month.split('-').map(Number);
 if (number < 1 || number > 12 || year < 2020 || year > 2100) return { admin: admin.email, month: current, bookings: [], stats: null, issue: 'Choose a valid month.' };
 const start = `${month}-01`; const end = new Date(Date.UTC(year, number, 1)).toISOString().slice(0,10);
 try {
  const [bookings, stats] = await Promise.all([
   supabase(`/rest/v1/studio_bookings?select=*&booking_date=gte.${start}&booking_date=lt.${end}&order=booking_date.asc,created_at.asc`).then(r=>r.json()),
   supabase('/rest/v1/rpc/admin_monthly_stats', { method: 'POST', body: JSON.stringify({ month_start: start }) }).then(r=>r.json())
  ]);
  return { admin: admin.email, month, bookings: bookings as Booking[], stats: stats as Stats, issue: '' };
 } catch { return { admin: admin.email, month, bookings: [] as Booking[], stats: null, issue: 'The database is unavailable. Confirm the Supabase settings and run the migration.' }; }
};
export type Booking = { id: string; booking_date: string; name: string; email: string; service: string; start_time: string | null; duration: string; notes: string; status: string };
export type Stats = { visits: number; pageviews: number; daily: { day: string; visits: number; pageviews: number }[]; pages: { path: string; views: number }[] };
export const actions: Actions = {
 logout: async event => { sameOrigin(event); clearSession(event); throw redirect(303, '/admin/login'); },
 save: async event => {
  sameOrigin(event); await requireAdmin(event);
  const form = await event.request.formData();
  const text = (key: string) => String(form.get(key) || '').trim();
  const id = text('id'); const date = text('booking_date'); const status = text('status'); const email = text('email'); const time = text('start_time');
  if ((id && !/^[0-9a-f-]{36}$/i.test(id)) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || !statuses.includes(status) || !text('name') || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return fail(400, { message: 'Enter a valid date, name, status and contact details.' });
  const booking = { booking_date: date, name: text('name').slice(0,150), email: email.slice(0,254), service: text('service').slice(0,1000), start_time: time || null, duration: text('duration').slice(0,100), notes: text('notes').slice(0,5000), status };
  try { await supabase(`/rest/v1/studio_bookings${id ? `?id=eq.${id}` : ''}`, { method: id ? 'PATCH' : 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(booking) }); }
  catch (e) { return fail(isHttpError(e) ? e.status : 503, { message: isHttpError(e) ? e.body.message : 'Unable to save this booking.' }); }
  return { message: 'Calendar entry saved.' };
 }
};
