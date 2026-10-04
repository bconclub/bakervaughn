# Admin panel

`/admin` lets signed-in admins edit every section of the site without a code change.
Projects → pages → sections → a form for that section's text and lists. Saving publishes
straight away; an unedited section shows the content in `lib/cms/home.ts`.

## One-time setup

1. **Database.** In Supabase → SQL editor, run `supabase/migrations/20261003120000_cms.sql`.
   It creates `cms_sections` (saved content) and `cms_admins` (who may edit), with
   row-level security: anyone can read published sections, only listed admins can write.
2. **Admin users.** Supabase → Authentication → Users → *Add user* (email + password, auto-confirm).
   Then add each admin's email, lower-case, to the list:
   ```sql
   insert into public.cms_admins (email) values ('you@example.com');
   ```
   **Usernames (optional).** Run `supabase/migrations/20261004120000_cms_usernames.sql` once, then give
   an admin a username so they can sign in with it instead of their email:
   ```sql
   update public.cms_admins set username = 'nishaf' where email = 'nishaf@bvcl.com';
   ```
3. **Environment variables** (hosting dashboard, e.g. Vercel, then redeploy):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key |

   The app never needs the `service_role` key: writes run as the signed-in admin and are
   checked by the database policies. Don't add it to the site's environment.

4. Sign in at `/admin`.

Without the variables the site still works and shows the default content; `/admin` explains
what is missing.

**Every login an admin (optional).** `supabase/migrations/20261004130000_cms_admin_accounts.sql` makes each
Supabase login an admin, with the part of its email before the @ as the username and a display name.

## Versioning

`lib/version.ts` counts shipped batches (`CHANGE_COUNTER`); the version shows in the site footer, on the
admin login page and in the admin header. Bump it once per shipped batch, keep `package.json` in step,
and tag the release (`git tag vX.Y.Z`).

## How it fits together

- `lib/cms/home.ts`: the Home page sections, their defaults and editor hints.
- `lib/cms/registry.ts`: projects → pages → sections listed in `/admin`.
- `lib/cms/read.ts`: loads saved sections for the site (cached, refreshed on save).
- `lib/cms/conform.ts`: coerces saved or submitted content into each section's shape.
- `app/admin/*`: login, the panel and the save/reset server actions.
- `proxy.ts`: keeps the admin session fresh and sends signed-out visitors to the login page.

To make a new page or section editable, add its defaults to a sections file like
`lib/cms/home.ts`, register the page in `lib/cms/registry.ts`, and have its components take
their copy from `getPageContent()` instead of hard-coded text.

The sample tickets in the "Why we exist" demo stay in `lib/content.ts`, because they are
linked to each other by id.
