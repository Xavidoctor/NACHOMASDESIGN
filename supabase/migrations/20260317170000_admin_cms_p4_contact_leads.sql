create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  subject text not null,
  message text not null,
  status text not null default 'nuevo' check (status in ('nuevo', 'leido', 'resuelto', 'archivado')),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_leads_created_at_desc_idx
  on public.contact_leads(created_at desc);

create index if not exists contact_leads_status_idx
  on public.contact_leads(status);

create index if not exists contact_leads_is_read_idx
  on public.contact_leads(is_read);

drop trigger if exists set_updated_at_on_contact_leads on public.contact_leads;
create trigger set_updated_at_on_contact_leads
before update on public.contact_leads
for each row execute function public.set_updated_at();

alter table public.contact_leads enable row level security;

drop policy if exists contact_leads_read_editor on public.contact_leads;
create policy contact_leads_read_editor
on public.contact_leads
for select
to authenticated
using (public.is_editor_user());

drop policy if exists contact_leads_update_editor on public.contact_leads;
create policy contact_leads_update_editor
on public.contact_leads
for update
to authenticated
using (public.is_editor_user())
with check (public.is_editor_user());

drop policy if exists contact_leads_delete_admin on public.contact_leads;
create policy contact_leads_delete_admin
on public.contact_leads
for delete
to authenticated
using (public.is_admin_user());
