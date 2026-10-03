import { conform } from "./conform";
import { findSection } from "./registry";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/server";
import type { HomeContent } from "./home";

export const CMS_TAG = "cms";

type Row = { section: string; content: unknown };

// Content for every section of a page: saved rows from Supabase over the code defaults.
// Any failure falls back to the defaults so the public site never breaks on the CMS.
export async function getPageContent(project: "bakervaughn", page: "home"): Promise<HomeContent> {
  const def = findSection(project, page).page!;
  let rows: Row[] = [];
  if (supabaseConfigured) {
    try {
      const q = new URLSearchParams({ select: "section,content", project: `eq.${project}`, page: `eq.${page}` });
      const res = await fetch(`${supabaseUrl}/rest/v1/cms_sections?${q}`, {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { tags: [CMS_TAG], revalidate: 300 },
      });
      if (res.ok) rows = await res.json();
      else console.error("[cms] read failed", res.status, await res.text());
    } catch (err) {
      console.error("[cms] read failed", err);
    }
  }
  const saved = new Map(rows.map((r) => [r.section, r.content]));
  return Object.fromEntries(
    Object.entries(def.sections).map(([key, s]) => [key, saved.has(key) ? conform(saved.get(key), s.defaults) : s.defaults]),
  ) as HomeContent;
}
