"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { conform } from "@/lib/cms/conform";
import { findSection } from "@/lib/cms/registry";
import { CMS_TAG } from "@/lib/cms/read";
import { requireAdmin } from "@/lib/cms/admin";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export type LoginState = { error?: string };
export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function signIn(_: LoginState, form: FormData): Promise<LoginState> {
  if (!supabaseConfigured) return { error: "Supabase is not configured on this site yet." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email or password is incorrect." };

  const { data: isAdmin } = await supabase.rpc("is_cms_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "This account is not on the admin list. Ask an owner to add your email to cms_admins." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function publish(path: string) {
  updateTag(CMS_TAG);
  revalidatePath(path);
}

export async function saveSection(project: string, page: string, section: string, json: string): Promise<SaveResult> {
  const { supabase, user } = await requireAdmin();
  const def = findSection(project, page, section);
  if (!def.section || !def.page) return { ok: false, error: "Unknown section." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "The content could not be read. Reload and try again." };
  }
  const content = conform(parsed, def.section.defaults);
  const savedAt = new Date().toISOString();
  const { error } = await supabase
    .from("cms_sections")
    .upsert({ project, page, section, content, updated_at: savedAt, updated_by: user.email ?? null });
  if (error) return { ok: false, error: error.message };

  publish(def.page.path);
  return { ok: true, savedAt };
}

export async function resetSection(project: string, page: string, section: string): Promise<SaveResult> {
  const { supabase } = await requireAdmin();
  const def = findSection(project, page, section);
  if (!def.section || !def.page) return { ok: false, error: "Unknown section." };

  const { error } = await supabase.from("cms_sections").delete().match({ project, page, section });
  if (error) return { ok: false, error: error.message };

  publish(def.page.path);
  return { ok: true, savedAt: new Date().toISOString() };
}
