import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {
 const response = await resolve(event);
 if (event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.headers.set('Cache-Control', 'private, no-store');
 }
 return response;
};
