-- Website CMS: editable page sections and the admins allowed to edit them.
-- Run once in Supabase (SQL editor, or `supabase db push`).

create table if not exists public.cms_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create table if not exists public.cms_sections (
  project text not null,
  page text not null,
  section text not null,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text,
  primary key (project, page, section)
);

alter table public.cms_admins enable row level security;
alter table public.cms_sections enable row level security;

-- True when the signed-in user's email is on the admin list.
create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cms_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_cms_admin() from public, anon;
grant execute on function public.is_cms_admin() to authenticated;

-- The public site reads published sections.
drop policy if exists "cms_sections public read" on public.cms_sections;
create policy "cms_sections public read" on public.cms_sections
  for select to anon, authenticated using (true);

-- Only listed admins can create, change or reset sections.
drop policy if exists "cms_sections admin insert" on public.cms_sections;
create policy "cms_sections admin insert" on public.cms_sections
  for insert to authenticated with check ((select public.is_cms_admin()));

drop policy if exists "cms_sections admin update" on public.cms_sections;
create policy "cms_sections admin update" on public.cms_sections
  for update to authenticated using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));

drop policy if exists "cms_sections admin delete" on public.cms_sections;
create policy "cms_sections admin delete" on public.cms_sections
  for delete to authenticated using ((select public.is_cms_admin()));

-- cms_admins has no policies: it is managed from the Supabase dashboard only.

grant select on public.cms_sections to anon, authenticated;
grant insert, update, delete on public.cms_sections to authenticated;

-- Add your admins (lower-case), after creating them under Authentication -> Users:
-- insert into public.cms_admins (email) values ('you@example.com');
