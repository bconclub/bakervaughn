import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/server";

export const COLLECTIONS_TAG = "collections";

export type Brand = { id: string; name: string; logo_url: string | null; website_url: string | null };
export type Testimonial = {
  id: string;
  kind: "text" | "video";
  quote: string | null;
  author_name: string;
  author_role: string | null;
  company: string | null;
  rating: number | null;
  photo_url: string | null;
  video_url: string | null;
};
export type WorkItem = {
  id: string;
  name: string;
  client: string | null;
  category: string | null;
  headline: string | null;
  challenge: string | null;
  what_we_did: string | null;
  outcome: string | null;
  image_url: string | null;
  image_alt: string | null;
};
export type Person = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  team: "leadership" | "advisor";
};

// Published rows of one collection, featured first then in the admin's order.
// null means "couldn't read" (not configured, table missing, network), so callers
// fall back to the content in code; [] means "read fine, nothing published".
async function published<T>(table: string, select: string): Promise<T[] | null> {
  if (!supabaseConfigured) return null;
  try {
    const q = new URLSearchParams({
      select,
      status: "eq.published",
      order: "featured.desc,sort_order.asc,created_at.asc",
    });
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${q}`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      next: { tags: [COLLECTIONS_TAG], revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[collections] ${table} read failed`, res.status, await res.text());
      return null;
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`[collections] ${table} read failed`, err);
    return null;
  }
}

export async function getSiteCollections() {
  const [brands, testimonials, work, people] = await Promise.all([
    published<Brand>("brands", "id,name,logo_url,website_url"),
    published<Testimonial>("testimonials", "id,kind,quote,author_name,author_role,company,rating,photo_url,video_url"),
    published<WorkItem>("work", "id,name,client,category,headline,challenge,what_we_did,outcome,image_url,image_alt"),
    published<Person>("people", "id,name,role,bio,photo_url,linkedin_url,team"),
  ]);
  return { brands, testimonials, work, people };
}
