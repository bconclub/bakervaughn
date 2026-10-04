"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/admin";
import { getCollection, ENQUIRY_STATUSES, STATUSES, type Status } from "@/lib/collections/config";
import { COLLECTIONS_TAG } from "@/lib/collections/read";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export type LoginState = { error?: string };
export type FormState = { error?: string; ok?: boolean };

export async function signIn(_: LoginState, form: FormData): Promise<LoginState> {
  if (!supabaseConfigured) return { error: "Supabase is not configured on this site yet." };
  const login = String(form.get("login") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!login || !password) return { error: "Enter your username or email, and your password." };

  const supabase = await createClient();
  // A username (no "@") is swapped for its admin email before signing in.
  let email = login;
  if (!login.includes("@")) {
    const { data } = await supabase.rpc("cms_admin_email", { p_username: login });
    if (typeof data !== "string") return { error: "Username or password is incorrect." };
    email = data;
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Username or password is incorrect." };

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

// Refresh the public site and the admin list after any change.
function publish(collection: string) {
  updateTag(COLLECTIONS_TAG);
  revalidatePath("/");
  revalidatePath(`/admin/${collection}`);
  revalidatePath("/admin");
}

const text = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

export async function saveItem(collection: string, id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const def = getCollection(collection);
  if (!def) return { error: "Unknown collection." };

  const row: Record<string, unknown> = {};
  for (const f of def.fields) {
    const v = text(form.get(f.key));
    if (f.required && !v) return { error: `${f.label} is required.` };
    if (f.type === "rating") row[f.key] = v ? Math.min(5, Math.max(1, Number(v))) : null;
    else if (f.type === "select") row[f.key] = v ?? f.options?.[0]?.value ?? null;
    else row[f.key] = v;
  }

  if (collection === "testimonials") {
    if (row.kind === "video" && !row.video_url) return { error: "A video testimonial needs a YouTube link." };
    if (row.kind !== "video" && !row.quote) return { error: "A written testimonial needs a quote." };
  }

  const status = text(form.get("status")) as Status | null;
  row.status = STATUSES.some((s) => s.value === status) ? status : "published";
  row.featured = form.get("featured") === "on";
  row.updated_at = new Date().toISOString();

  if (id) {
    const { error } = await supabase.from(def.table).update(row).eq("id", id);
    if (error) return { error: error.message };
    publish(collection);
    return { ok: true };
  }

  // New items go to the end of the list.
  const { data: last } = await supabase
    .from(def.table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  row.sort_order = (typeof last?.sort_order === "number" ? last.sort_order : 0) + 10;

  const { error } = await supabase.from(def.table).insert(row);
  if (error) return { error: error.message };
  publish(collection);
  redirect(`/admin/${collection}?saved=1`);
}

export async function deleteItem(collection: string, id: string) {
  const { supabase } = await requireAdmin();
  const def = getCollection(collection);
  if (!def) return;
  await supabase.from(def.table).delete().eq("id", id);
  publish(collection);
  redirect(`/admin/${collection}`);
}

// Move one item up or down: renumber the list in its current order, then swap.
export async function moveItem(collection: string, id: string, dir: -1 | 1) {
  const { supabase } = await requireAdmin();
  const def = getCollection(collection);
  if (!def) return;
  const { data } = await supabase
    .from(def.table)
    .select("id")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((rowId, n) => supabase.from(def.table).update({ sort_order: (n + 1) * 10 }).eq("id", rowId)));
  publish(collection);
}

export async function toggleStatus(collection: string, id: string, status: Status) {
  const { supabase } = await requireAdmin();
  const def = getCollection(collection);
  if (!def) return;
  await supabase.from(def.table).update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  publish(collection);
}

export async function updateEnquiry(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const status = text(form.get("status"));
  if (!ENQUIRY_STATUSES.some((s) => s.value === status)) return { error: "Choose a status." };
  const { error } = await supabase
    .from("enquiries")
    .update({ status, notes: text(form.get("notes")), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteEnquiry(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("enquiries").delete().eq("id", id);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  redirect("/admin/enquiries");
}
