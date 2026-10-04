-- Admin collections: brands, testimonials, work, people (team + advisors) and the
-- enquiries inbox, plus a public "media" bucket for uploaded images.
-- Run once in Supabase (SQL editor), after the cms migrations. Safe to re-run.
-- Relies on public.is_cms_admin() from 20261003120000_cms.sql.

-- Shared shape: status, featured, sort_order, timestamps -------------------------

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  industry text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'text' check (kind in ('text', 'video')),
  quote text,
  author_name text not null,
  author_role text,
  company text,
  rating integer check (rating between 1 and 5),
  photo_url text,
  video_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text,
  category text,
  headline text,
  challenge text,
  what_we_did text,
  outcome text,
  image_url text,
  image_alt text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  photo_url text,
  linkedin_url text,
  team text not null default 'leadership' check (team in ('leadership', 'advisor')),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique,
  area text,
  challenge text,
  timing text,
  name text not null,
  email text not null,
  company text,
  phone text,
  attribution jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost', 'spam')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row-level security ------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['brands', 'testimonials', 'work', 'people'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%s public read" on public.%I', t, t);
    execute format('create policy "%s public read" on public.%I for select to anon, authenticated using (status = ''published'' or (select public.is_cms_admin()))', t, t);

    execute format('drop policy if exists "%s admin write" on public.%I', t, t);
    execute format('create policy "%s admin write" on public.%I for all to authenticated using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()))', t, t);

    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- Enquiries: the site's form may add new ones; only admins can read or change them.
alter table public.enquiries enable row level security;

drop policy if exists "enquiries public insert" on public.enquiries;
create policy "enquiries public insert" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'new' and notes is null and length(name) <= 200 and length(email) <= 320);

drop policy if exists "enquiries admin read" on public.enquiries;
create policy "enquiries admin read" on public.enquiries
  for select to authenticated using ((select public.is_cms_admin()));

drop policy if exists "enquiries admin update" on public.enquiries;
create policy "enquiries admin update" on public.enquiries
  for update to authenticated using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));

drop policy if exists "enquiries admin delete" on public.enquiries;
create policy "enquiries admin delete" on public.enquiries
  for delete to authenticated using ((select public.is_cms_admin()));

grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;

-- Media bucket: public to read, admins upload -----------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif'])
on conflict (id) do update set public = true;

drop policy if exists "media admin upload" on storage.objects;
create policy "media admin upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_cms_admin()));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_cms_admin()));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_cms_admin()));

-- Starting content: what the site shows today, only added to empty tables -------

insert into public.brands (name, sort_order)
select name, ord * 10
from (values ('Charcoal Shack', 1), ('Arabian Grill', 2), ('Khaleej Mandi House', 3),
             ('Harlequin Care Limited', 4), ('1 Key Solution', 5)) v(name, ord)
where not exists (select 1 from public.brands);

insert into public.work (name, client, category, headline, challenge, what_we_did, outcome, image_url, image_alt, sort_order)
select * from (values
  ('Souq Al Samak', 'Seafood restaurant', 'Software', 'A project hub for a busy restaurant team',
   'One place to plan, assign and track restaurant projects, shared across everyone''s devices.',
   'A custom project-management web app with real-time sync, PIN-based login for each team member and a maritime look matched to the restaurant.',
   null, '/unsplash/souq-NVU_Vaha.webp', 'Whole roasted fish with lemon and grilled vegetables', 10),
  ('KLUCK', 'The Super Chicken', 'Brand', 'A fried-chicken brand built for UK high streets',
   'Turning a QSR idea into a brand and menu that could stand out, price right for the UK and scale beyond one shop.',
   'Naming, identity and full menu architecture: three heat levels, a kids menu and six signature dips.',
   null, '/unsplash/kluck-NbXjZomy.webp', 'Fried chicken served on brown paper', 20),
  ('Norwood survey', 'Norwood community, Sheffield', 'Research & data', 'Asking a neighbourhood what it actually wants',
   'Finding out what residents really want from a local takeaway, from the community itself, not guesswork.',
   'Designed and printed the survey, then turned a stack of paper responses into a clean, verified dataset.',
   null, '/unsplash/norwood-khVRKwFw.webp', 'A row of English terraced houses with coloured doors', 30)
) v(name, client, category, headline, challenge, what_we_did, outcome, image_url, image_alt, sort_order)
where not exists (select 1 from public.work);

insert into public.people (name, role, bio, team, sort_order)
select * from (values
  ('Austin Walter', 'Managing Director', null, 'leadership', 10),
  ('Ninil Shyam', 'Head of Development', null, 'leadership', 20),
  ('Nishaf Musthafa', 'IT Manager', 'Leads ERPNext and AI deployments for client businesses.', 'leadership', 30),
  ('Bridgeway Investments', 'Growth', null, 'advisor', 40),
  ('Abhilash Kollat', 'Strategy & analytics', null, 'advisor', 50),
  ('Thanzeel Ashruf', 'Creative', null, 'advisor', 60),
  ('Aslej Salem', 'Operations', null, 'advisor', 70)
) v(name, role, bio, team, sort_order)
where not exists (select 1 from public.people);
