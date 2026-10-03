import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

// Signed-in user who is on the cms_admins list, or a redirect to the login page.
export const requireAdmin = cache(async () => {
  if (!supabaseConfigured) redirect("/admin/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_cms_admin");
  if (isAdmin !== true) redirect("/admin/login?denied=1");
  return { supabase, user };
});
