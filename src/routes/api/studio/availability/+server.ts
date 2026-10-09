import { json } from '@sveltejs/kit';
import { configured, supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ url }) => {
 const month = url.searchParams.get('month') || '';
 if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return json({ error: 'Invalid month' }, { status: 400 });
 if (!configured()) return json({ dates: [], available: false }, { headers: { 'Cache-Control': 'no-store' } });
 const [year, number] = month.split('-').map(Number); const end = new Date(Date.UTC(year, number,1)).toISOString().slice(0,10);
 try {
  const response = await supabase(`/rest/v1/studio_bookings?select=booking_date&booking_date=gte.${month}-01&booking_date=lt.${end}&is_studio=eq.true&status=in.(confirmed,blocked)`);
  const entries = await response.json();
  return json({ dates: entries.map((b: { booking_date: string }) => b.booking_date), available: true }, { headers: { 'Cache-Control': 'no-store' } });
 } catch { return json({ dates: [], available: false }, { headers: { 'Cache-Control': 'no-store' } }); }
};
