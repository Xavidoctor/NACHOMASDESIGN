create table if not exists public.cms_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  kind text not null check (kind in ('image', 'video')),
  storage_key text not null unique,
  public_url text not null unique,
  content_type text not null,
  file_size bigint,
  width integer,
  height integer,
  duration_seconds numeric,
  alt_text text,
  tags text[] not null default '{}',
  created_by uuid references public.admin_profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists cms_assets_kind_created_at_idx
  on public.cms_assets(kind, created_at desc);

create index if not exists cms_assets_created_at_desc_idx
  on public.cms_assets(created_at desc);

create index if not exists cms_assets_filename_idx
  on public.cms_assets(filename);

alter table public.cms_assets enable row level security;

drop policy if exists cms_assets_read_editor on public.cms_assets;
create policy cms_assets_read_editor
on public.cms_assets
for select
to authenticated
using (public.is_editor_user());

drop policy if exists cms_assets_insert_editor on public.cms_assets;
create policy cms_assets_insert_editor
on public.cms_assets
for insert
to authenticated
with check (public.is_editor_user());

drop policy if exists cms_assets_update_editor on public.cms_assets;
create policy cms_assets_update_editor
on public.cms_assets
for update
to authenticated
using (public.is_editor_user())
with check (public.is_editor_user());

drop policy if exists cms_assets_delete_admin on public.cms_assets;
create policy cms_assets_delete_admin
on public.cms_assets
for delete
to authenticated
using (public.is_admin_user());
