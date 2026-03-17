-- Fase avanzada: rollups, funciones de uso Supabase y agregados mensuales.

create table if not exists public.analytics_monthly_rollups (
  month date primary key,
  page_views integer not null default 0,
  unique_visitors integer not null default 0,
  sessions integer not null default 0,
  contacts integer not null default 0,
  cta_clicks integer not null default 0,
  conversion_rate numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.analytics_monthly_rollups enable row level security;

drop policy if exists analytics_monthly_rollups_read_admin on public.analytics_monthly_rollups;
create policy analytics_monthly_rollups_read_admin
on public.analytics_monthly_rollups
for select
to authenticated
using (public.is_admin_user());

drop policy if exists analytics_monthly_rollups_write_admin on public.analytics_monthly_rollups;
create policy analytics_monthly_rollups_write_admin
on public.analytics_monthly_rollups
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

create or replace function public.refresh_analytics_rollups(
  p_from date default (current_date - interval '400 day')::date
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_from date;
begin
  if not (public.is_admin_user() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  v_from := coalesce(p_from, (current_date - interval '400 day')::date);

  delete from public.analytics_daily_rollups where date >= v_from;

  insert into public.analytics_daily_rollups (
    date,
    page_views,
    unique_visitors,
    sessions,
    contacts,
    cta_clicks,
    conversion_rate,
    updated_at
  )
  with days as (
    select generate_series(v_from, current_date, interval '1 day')::date as d
  ),
  event_daily as (
    select
      (created_at at time zone 'utc')::date as d,
      count(*) filter (where event_type = 'page_view')::int as page_views,
      count(distinct visitor_id)::int as unique_visitors,
      count(distinct session_id)::int as sessions,
      count(*) filter (where event_type = 'cta_click')::int as cta_clicks
    from public.analytics_events
    where (created_at at time zone 'utc')::date >= v_from
    group by 1
  ),
  lead_daily as (
    select
      (created_at at time zone 'utc')::date as d,
      count(*)::int as contacts
    from public.contact_leads
    where (created_at at time zone 'utc')::date >= v_from
    group by 1
  )
  select
    days.d as date,
    coalesce(event_daily.page_views, 0),
    coalesce(event_daily.unique_visitors, 0),
    coalesce(event_daily.sessions, 0),
    coalesce(lead_daily.contacts, 0),
    coalesce(event_daily.cta_clicks, 0),
    case
      when coalesce(event_daily.unique_visitors, 0) > 0
        then round((coalesce(lead_daily.contacts, 0)::numeric / event_daily.unique_visitors::numeric) * 100, 4)
      else 0
    end as conversion_rate,
    now()
  from days
  left join event_daily on event_daily.d = days.d
  left join lead_daily on lead_daily.d = days.d;

  delete from public.analytics_monthly_rollups
  where month >= date_trunc('month', v_from)::date;

  insert into public.analytics_monthly_rollups (
    month,
    page_views,
    unique_visitors,
    sessions,
    contacts,
    cta_clicks,
    conversion_rate,
    updated_at
  )
  select
    date_trunc('month', d.date)::date as month,
    sum(d.page_views)::int,
    sum(d.unique_visitors)::int,
    sum(d.sessions)::int,
    sum(d.contacts)::int,
    sum(d.cta_clicks)::int,
    case
      when sum(d.unique_visitors) > 0
        then round((sum(d.contacts)::numeric / sum(d.unique_visitors)::numeric) * 100, 4)
      else 0
    end as conversion_rate,
    now()
  from public.analytics_daily_rollups d
  where d.date >= v_from
  group by 1;
end;
$$;

create or replace function public.get_database_size_bytes()
returns bigint
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not (public.is_admin_user() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  return pg_database_size(current_database())::bigint;
end;
$$;

create or replace function public.get_storage_usage_summary()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_bytes bigint;
  v_objects bigint;
begin
  if not (public.is_admin_user() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  select
    coalesce(
      sum(
        case
          when (o.metadata ->> 'size') ~ '^[0-9]+$' then (o.metadata ->> 'size')::bigint
          else 0
        end
      ),
      0
    )::bigint,
    count(*)::bigint
  into v_bytes, v_objects
  from storage.objects o;

  return jsonb_build_object(
    'bytes', v_bytes,
    'objects', v_objects
  );
end;
$$;

create or replace function public.get_monthly_active_users_estimate()
returns bigint
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not (public.is_admin_user() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  return (
    select count(*)::bigint
    from auth.users u
    where coalesce(u.last_sign_in_at, u.created_at) >= date_trunc('month', now())
  );
end;
$$;

grant execute on function public.refresh_analytics_rollups(date) to authenticated;
grant execute on function public.get_database_size_bytes() to authenticated;
grant execute on function public.get_storage_usage_summary() to authenticated;
grant execute on function public.get_monthly_active_users_estimate() to authenticated;
