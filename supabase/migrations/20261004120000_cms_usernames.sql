-- Admin usernames: sign in with a username instead of the full email.
-- Run once in Supabase (SQL editor), after 20261003120000_cms.sql.

alter table public.cms_admins
  add column if not exists username text unique
  check (username is null or username ~ '^[a-z0-9._-]{3,32}$');

-- Login lookup: the email for an admin username, or null.
-- Callable before sign-in, so it only ever answers for usernames on the admin list.
create or replace function public.cms_admin_email(p_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email from public.cms_admins where username = lower(trim(p_username)) limit 1;
$$;

revoke all on function public.cms_admin_email(text) from public;
grant execute on function public.cms_admin_email(text) to anon, authenticated;

-- The signed-in admin's own username, for the panel header.
create or replace function public.cms_my_username()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select username from public.cms_admins
  where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

revoke all on function public.cms_my_username() from public, anon;
grant execute on function public.cms_my_username() to authenticated;

-- Give an admin a username (lower-case letters, numbers, dot, dash, underscore; 3 to 32):
-- update public.cms_admins set username = 'nishaf' where email = 'nishaf@bvcl.com';
