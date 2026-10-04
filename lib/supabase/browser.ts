"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client for the admin's image uploads. It uses the signed-in admin's
// session cookie, so Storage's policies decide what may be uploaded.
let client: ReturnType<typeof createBrowserClient> | null = null;

export function browserClient() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return client;
}
