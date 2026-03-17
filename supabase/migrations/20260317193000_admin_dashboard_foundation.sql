-- Fase 1: base de datos y seguridad para dashboard admin profesional.

-- 1) Extensión incremental de leads existentes (sin duplicar tablas).
alter table public.contact_leads
  add column if not exists phone text,
  add column if not exists page_url text,
  add column if not exists source text not null default 'web',
  add column if not exists referrer text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists assigned_to uuid references public.admin_profiles(id),
  add column if not exists sent_to_email text,
  add column if not exists email_notification_status text not null default 'pendiente',
  add column if not exists email_notification_provider_id text,
  add column if not exists ip_hash text,
  add column if not exists user_agent text,
  add column if not exists notes text not null default '';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'contact_leads_status_check'
      and conrelid = 'public.contact_leads'::regclass
  ) then
    alter table public.contact_leads drop constraint contact_leads_status_check;
  end if;
end $$;

alter table public.contact_leads
  add constraint contact_leads_status_check
  check (status in ('nuevo', 'leido', 'respondido', 'resuelto', 'archivado', 'spam'));

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'contact_leads_email_notification_status_check'
      and conrelid = 'public.contact_leads'::regclass
  ) then
    alter table public.contact_leads drop constraint contact_leads_email_notification_status_check;
  end if;
end $$;

alter table public.contact_leads
  add constraint contact_leads_email_notification_status_check
  check (email_notification_status in ('pendiente', 'enviado', 'error', 'omitido'));

create index if not exists contact_leads_email_notification_status_idx
  on public.contact_leads(email_notification_status);

create index if not exists contact_leads_source_idx
  on public.contact_leads(source);

-- Vista de compatibilidad semántica: "contact_messages" mapea a leads.
create or replace view public.contact_messages as
select
  id,
  created_at,
  updated_at,
  name,
  email,
  phone,
  company,
  subject,
  message,
  page_url,
  source,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  status,
  assigned_to,
  sent_to_email,
  email_notification_status,
  email_notification_provider_id,
  ip_hash,
  user_agent,
  notes
from public.contact_leads;

-- 2) Eventos de analytics propios.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  visitor_id text not null,
  event_type text not null check (
    event_type in ('page_view', 'project_view', 'cta_click', 'contact_form_view', 'contact_form_submit')
  ),
  path text not null,
  page_title text,
  referrer text,
  device_type text,
  country text,
  browser text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  value_json jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events(created_at desc);

create index if not exists analytics_events_type_created_idx
  on public.analytics_events(event_type, created_at desc);

create index if not exists analytics_events_path_created_idx
  on public.analytics_events(path, created_at desc);

create index if not exists analytics_events_session_idx
  on public.analytics_events(session_id);

alter table public.analytics_events enable row level security;

drop policy if exists analytics_events_read_admin on public.analytics_events;
create policy analytics_events_read_admin
on public.analytics_events
for select
to authenticated
using (public.is_admin_user());

drop policy if exists analytics_events_write_admin on public.analytics_events;
create policy analytics_events_write_admin
on public.analytics_events
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

-- 3) Agregados diarios para dashboard.
create table if not exists public.analytics_daily_rollups (
  date date primary key,
  page_views integer not null default 0,
  unique_visitors integer not null default 0,
  sessions integer not null default 0,
  contacts integer not null default 0,
  cta_clicks integer not null default 0,
  conversion_rate numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.analytics_daily_rollups enable row level security;

drop policy if exists analytics_daily_rollups_read_admin on public.analytics_daily_rollups;
create policy analytics_daily_rollups_read_admin
on public.analytics_daily_rollups
for select
to authenticated
using (public.is_admin_user());

drop policy if exists analytics_daily_rollups_write_admin on public.analytics_daily_rollups;
create policy analytics_daily_rollups_write_admin
on public.analytics_daily_rollups
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

-- 4) Snapshots de consumo por plataforma.
create table if not exists public.platform_usage_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  platform text not null check (platform in ('vercel', 'supabase', 'cloudflare_r2', 'email')),
  metric_key text not null,
  metric_value numeric not null default 0,
  metric_unit text not null,
  period_start timestamptz,
  period_end timestamptz,
  bucket_or_project text,
  source text not null default 'manual',
  meta_json jsonb not null default '{}'::jsonb
);

create index if not exists platform_usage_snapshots_platform_created_idx
  on public.platform_usage_snapshots(platform, created_at desc);

create index if not exists platform_usage_snapshots_metric_created_idx
  on public.platform_usage_snapshots(metric_key, created_at desc);

alter table public.platform_usage_snapshots enable row level security;

drop policy if exists platform_usage_snapshots_read_admin on public.platform_usage_snapshots;
create policy platform_usage_snapshots_read_admin
on public.platform_usage_snapshots
for select
to authenticated
using (public.is_admin_user());

drop policy if exists platform_usage_snapshots_write_admin on public.platform_usage_snapshots;
create policy platform_usage_snapshots_write_admin
on public.platform_usage_snapshots
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

-- 5) Alertas de consumo/plataformas.
create table if not exists public.platform_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  platform text not null check (platform in ('vercel', 'supabase', 'cloudflare_r2', 'email')),
  metric_key text not null,
  severity text not null check (severity in ('verde', 'amarillo', 'naranja', 'rojo')),
  threshold_percent numeric not null,
  current_percent numeric not null,
  status text not null default 'abierta' check (status in ('abierta', 'resuelta')),
  message text not null,
  help_copy text not null
);

create index if not exists platform_alerts_platform_created_idx
  on public.platform_alerts(platform, created_at desc);

create index if not exists platform_alerts_status_idx
  on public.platform_alerts(status);

alter table public.platform_alerts enable row level security;

drop policy if exists platform_alerts_read_admin on public.platform_alerts;
create policy platform_alerts_read_admin
on public.platform_alerts
for select
to authenticated
using (public.is_admin_user());

drop policy if exists platform_alerts_write_admin on public.platform_alerts;
create policy platform_alerts_write_admin
on public.platform_alerts
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

-- 6) Ajustes operativos del panel (mantenemos modelo key-value existente).
insert into public.site_settings (key, value_json, updated_by)
values (
  'admin_panel',
  jsonb_build_object(
    'contact_notification_email', 'ignaciomasgomis@gmail.com',
    'contact_notifications_enabled', true,
    'contact_auto_reply_enabled', false,
    'contact_auto_reply_subject', 'Gracias por escribir a Nacho Mas Design',
    'contact_auto_reply_body', 'Hemos recibido tu mensaje y te responderemos lo antes posible.',
    'alerts_enabled', true,
    'vercel_plan', 'sin definir',
    'supabase_plan', 'sin definir',
    'r2_plan_mode', 'sin definir',
    'email_provider', 'resend',
    'usage_warning_threshold', 70,
    'usage_danger_threshold', 85,
    'email_daily_limit', null,
    'email_monthly_limit', null
  ),
  null
)
on conflict (key) do nothing;

-- 7) Seguridad reforzada: leads y ajustes solo admin.
drop policy if exists contact_leads_read_editor on public.contact_leads;
drop policy if exists contact_leads_update_editor on public.contact_leads;
drop policy if exists contact_leads_delete_admin on public.contact_leads;

drop policy if exists contact_leads_read_admin on public.contact_leads;
create policy contact_leads_read_admin
on public.contact_leads
for select
to authenticated
using (public.is_admin_user());

drop policy if exists contact_leads_write_admin on public.contact_leads;
create policy contact_leads_write_admin
on public.contact_leads
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists site_settings_read_editor on public.site_settings;
drop policy if exists site_settings_write_admin on public.site_settings;

drop policy if exists site_settings_read_admin on public.site_settings;
create policy site_settings_read_admin
on public.site_settings
for select
to authenticated
using (public.is_admin_user());

drop policy if exists site_settings_write_admin on public.site_settings;
create policy site_settings_write_admin
on public.site_settings
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());
