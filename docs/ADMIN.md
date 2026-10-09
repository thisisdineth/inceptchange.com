# Private studio admin and Supabase setup

Admin URL: `/admin`. Sign-in: `/admin/login`. Neither is linked from the public website or included in the sitemap. Pages include noindex/nofollow/noarchive metadata and HTTP X-Robots-Tag headers. robots.txt excludes /admin and /api. Search exclusions are requests to crawlers; authentication is the actual privacy boundary.

## Connect your Supabase project

1. Create a Supabase project. In its SQL editor, run `supabase/migrations/20261009_admin.sql`, then `supabase/migrations/20261009_all_bookings.sql`. It creates studio_bookings, site_visits, indexes, full-day reservation conflict protection and the monthly statistics function. Run on a new project or review for conflicts with existing objects.
2. Find the project URL and secret API key in the project settings. Add these private settings to the local root `.env`:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=YOUR_PRIVATE_SECRET_KEY
ADMIN_EMAILS=inceptchange@gmail.com
```

Also set SUPABASE_PUBLISHABLE_KEY and SUPABASE_JWKS_URL using the project settings. Replace the email with the account you actually want to use. Multiple authorised emails can be comma-separated. Never use a PUBLIC_ prefix for these settings; never commit the key.

3. In Supabase Authentication → Users, create the admin user with that exact email and a strong password. Confirm its email through the dashboard. This app does not offer public account registration, invitations or password reset. Manage account creation/password recovery in Supabase. Disable public signups in Supabase Auth settings if they are not needed.
4. Restart the local Vite server and open `/admin/login`. Sign in with the Supabase user's email/password. The server uses @supabase/server/core admin clients and verifies the signed-in user against Supabase on each admin load or save and checks ADMIN_EMAILS. Session tokens are stored in HttpOnly cookies; production cookies require HTTPS. The refresh cookie lasts up to seven days. Sign-out removes local cookies. Supabase tokens can remain valid until expiry; use Supabase account controls when revoking access.
5. For production, add the same three variables to `/etc/inceptchange/site.env` using sudoedit, deploy the latest website build, and restart `inceptchange-site`. The Go email service does not need Supabase credentials. SvelteKit handles private authentication/database calls; Go continues to handle Gemini and Resend.

Until configured, the admin login shows an explicit setup message, private data is inaccessible, and the public booking calendar continues to accept enquiries without claiming live availability. No mock records or synthetic analytics are shown as real data.

## Studio calendar

- **Requested:** customer enquiry or tentative calendar entry. Does not reserve availability.
- **Confirmed:** full-day studio reservation, hidden from selectable dates on the public calendar.
- **Blocked:** full-day closure or hold, also unavailable publicly.
- **Cancelled:** retains the entry for reference and releases the date.

Select a date to add a booking or block. Select Edit beside an entry to update it. The database allows only one confirmed/blocked reservation per date, including concurrent saves. Multiple requests on the same date are allowed. Start time and duration are planning notes; this version reserves whole days rather than overlapping hourly slots. Status changes do not automatically send confirmation emails.

Customers entering from the public IdeaBay calendar carry a studio flag and ISO booking date into the contact flow. Once the existing Go email endpoint accepts the enquiry, the private SvelteKit proxy saves a requested booking. A browser-generated request ID prevents duplicate calendar records on retries. Email itself is not deduplicated. If the database is unavailable after email acceptance, the email remains successful but no calendar record is inserted; the server logs the failure. Check the inbox and add the request manually. General photography/video enquiries are not studio reservations.

## Monthly visits

Visits are distinct anonymous browser sessions, with a cookie extended on activity and a 30-minute inactivity window. Page views count recognised public route navigations. Admin routes and common bot user agents are excluded. No IP addresses, referrer URLs, emails or query parameters are stored in the analytics table. The latest recorded timestamp determines the selected month's counts in **Asia/Colombo** time.

Counts start after configuration and the migration; there is no historical backfill. Browser restrictions, scripted traffic and multiple devices affect accuracy. This is basic first-party analytics, not an audited measure of unique people. Login attempts are rate limited per server process; analytics has a short duplicate-event guard. Review privacy requirements for anonymous analytics cookies before publishing in additional jurisdictions.

Data is retained until you delete it. To retain only the last 12 months, periodically run in the Supabase SQL editor:

```sql
delete from public.site_visits where created_at < now() - interval '12 months';
```

## Security and verification

Both tables have row-level security enabled and no public/authenticated table grants. Only the private server service-role connection reads or writes data. The monthly statistics RPC is restricted to service_role. The public availability endpoint returns dates only, never customer names, emails or notes. Supabase service-role keys bypass RLS, so protect the server settings and limit project access.

Before going live, test unauthenticated /admin redirects, an unauthorised email, the authorised login, a confirmed booking appearing unavailable publicly, conflicting confirmations, release/cancellation, a studio enquiry appearing in requests, traffic counts and logout. Run `npm run check`, `npm run build`, and `python3 scripts/test_admin.py`. The latter uses a local mock Supabase service to check authentication boundaries, search exclusions, public date-only data and logout without real credentials. Database migration and real login cannot be verified until a Supabase project is supplied.

## All-project bookings update

Run `supabase/migrations/20261009_all_bookings.sql` after the initial migration. Every enquiry is recorded before email delivery when Supabase is configured. If recording fails, submission stops and keeps the visitor’s answers for retry. Free-text or undecided dates are stored verbatim with a nullable calendar date; admins can assign an actual date later. Records include studio/project type, location and email acceptance status. The admin list shows the bookings across dates in pages of 100, while the calendar focuses on the selected month. Only studio confirmations/blocks restrict public studio availability. Mark done changes status to completed; Delete removes the record permanently after a browser confirmation. Completion and deletion do not send a customer email. Existing studio records keep their studio classification. Emails are still not deduplicated on retries.
