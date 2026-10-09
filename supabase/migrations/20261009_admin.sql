-- Run once in your Supabase SQL editor. All access is through the private server.
create table if not exists public.site_visits (
 id bigint generated always as identity primary key,
 session_id uuid not null,
 path text not null check (length(path) <= 150),
 created_at timestamptz not null default now()
);
create index if not exists site_visits_created_at_idx on public.site_visits(created_at);
create table if not exists public.studio_bookings (
 id uuid primary key default gen_random_uuid(),
 request_id uuid unique,
 booking_date date not null,
 name text not null check (length(name) between 1 and 150),
 email text not null default '',
 service text not null default '',
 start_time time,
 duration text not null default '',
 notes text not null default '',
 status text not null default 'requested' check (status in ('requested','confirmed','blocked','cancelled')),
 created_at timestamptz not null default now()
);
create unique index if not exists studio_reserved_date_idx on public.studio_bookings(booking_date) where status in ('confirmed','blocked');
create index if not exists studio_bookings_date_idx on public.studio_bookings(booking_date);
alter table public.site_visits enable row level security;
alter table public.studio_bookings enable row level security;
revoke all on public.site_visits, public.studio_bookings from anon, authenticated;
grant all on public.site_visits, public.studio_bookings to service_role;
grant usage, select on sequence public.site_visits_id_seq to service_role;

create or replace function public.admin_monthly_stats(month_start date)
returns jsonb language sql stable set search_path = public as $$
 with bounds as (
  select date_trunc('month',month_start::timestamp) at time zone 'Asia/Colombo' as starts,
   (date_trunc('month',month_start::timestamp) + interval '1 month') at time zone 'Asia/Colombo' as ends
 ), records as (
  select v.* from site_visits v, bounds b where v.created_at >= b.starts and v.created_at < b.ends
 ), daily as (
  select (created_at at time zone 'Asia/Colombo')::date as day, count(distinct session_id) as visits, count(*) as pageviews from records group by 1 order by 1
 ), pages as (
  select path, count(*) as views from records group by path order by views desc limit 10
 )
 select jsonb_build_object('visits',(select count(distinct session_id) from records),'pageviews',(select count(*) from records),
  'daily',coalesce((select jsonb_agg(to_jsonb(daily)) from daily),'[]'::jsonb),
  'pages',coalesce((select jsonb_agg(to_jsonb(pages)) from pages),'[]'::jsonb));
$$;
revoke all on function public.admin_monthly_stats(date) from public, anon, authenticated;
grant execute on function public.admin_monthly_stats(date) to service_role;
