-- Make every Supabase login an admin, with a username and display name.
-- Run in Supabase (SQL editor) after the two earlier cms migrations. Safe to re-run.

-- Allow short usernames (1 to 32 chars), e.g. "z".
alter table public.cms_admins drop constraint if exists cms_admins_username_check;
alter table public.cms_admins add constraint cms_admins_username_check
  check (username is null or username ~ '^[a-z0-9._-]{1,32}$');

-- Drop admin entries that have no login account behind them.
delete from public.cms_admins a
where not exists (select 1 from auth.users u where lower(u.email) = a.email);

-- Every login account is an admin; username = the part of the email before @.
insert into public.cms_admins (email, username)
select lower(u.email), regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9._-]', '', 'g')
from auth.users u
where u.email is not null
on conflict (email) do update set username = coalesce(public.cms_admins.username, excluded.username);

-- Display names shown in Supabase Authentication -> Users (e.g. "Nishaf").
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('display_name', initcap(replace(split_part(email, '@', 1), '.', ' ')))
where email is not null and coalesce(raw_user_meta_data->>'display_name', '') = '';

-- Check: who can sign in, and with which username.
select a.email, a.username, u.raw_user_meta_data->>'display_name' as display_name,
       public.cms_admin_email(a.username) as username_signs_in_as
from public.cms_admins a join auth.users u on lower(u.email) = a.email
order by a.email;
