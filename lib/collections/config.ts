// Admin-managed collections. One definition drives the admin list, the edit form
// and what the public site reads. Tables live in supabase/migrations/*_collections.sql.

export type FieldType = "text" | "textarea" | "url" | "image" | "select" | "rating";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
};

export type CollectionDef = {
  table: string;
  label: string; // plural, for menus and titles
  singular: string;
  intro: string;
  titleField: string;
  subtitle: (row: Row) => string;
  imageField?: string;
  fields: Field[];
};

export type Row = Record<string, unknown> & {
  id: string;
  status: Status;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Status = "draft" | "published" | "archived";

export const STATUSES: { value: Status; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const s = (v: unknown) => (typeof v === "string" ? v : "");

export const collections = {
  testimonials: {
    table: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    intro: "Client quotes and video reviews. Published ones appear in the Testimonials section on the home page.",
    titleField: "author_name",
    subtitle: (r) => [s(r.author_role), s(r.company)].filter(Boolean).join(", ") || (r.kind === "video" ? "Video" : "Quote"),
    imageField: "photo_url",
    fields: [
      {
        key: "kind",
        label: "Type",
        type: "select",
        options: [
          { value: "text", label: "Written quote" },
          { value: "video", label: "Video (YouTube)" },
        ],
      },
      { key: "quote", label: "Quote", type: "textarea", help: "Needed for a written quote. Keep it to two or three sentences." },
      { key: "video_url", label: "YouTube link", type: "url", help: "Needed for a video testimonial.", placeholder: "https://youtu.be/…" },
      { key: "author_name", label: "Name", type: "text", required: true },
      { key: "author_role", label: "Role", type: "text", placeholder: "Owner" },
      { key: "company", label: "Company", type: "text" },
      { key: "rating", label: "Rating", type: "rating" },
      { key: "photo_url", label: "Photo", type: "image" },
    ],
  },
  brands: {
    table: "brands",
    label: "Brands",
    singular: "brand",
    intro: "Businesses you've worked with. Published ones scroll in the Trusted by strip under the hero, with their logo when you add one.",
    titleField: "name",
    subtitle: (r) => s(r.industry) || s(r.website_url),
    imageField: "logo_url",
    fields: [
      { key: "name", label: "Brand name", type: "text", required: true },
      { key: "logo_url", label: "Logo", type: "image", help: "A transparent PNG or SVG works best. Shown in white on the dark strip." },
      { key: "website_url", label: "Website", type: "url", placeholder: "https://" },
      { key: "industry", label: "Industry", type: "text", placeholder: "Hospitality" },
    ],
  },
  work: {
    table: "work",
    label: "Work",
    singular: "project",
    intro: "Case studies shown in the Work section: the challenge, what you did and the outcome.",
    titleField: "name",
    subtitle: (r) => [s(r.client), s(r.category)].filter(Boolean).join(" · "),
    imageField: "image_url",
    fields: [
      { key: "name", label: "Project name", type: "text", required: true },
      { key: "client", label: "Client", type: "text" },
      { key: "category", label: "Category", type: "text", placeholder: "Software, Brand, Research & data" },
      { key: "headline", label: "Headline", type: "text", help: "One line on what the project was." },
      { key: "challenge", label: "The challenge", type: "textarea" },
      { key: "what_we_did", label: "What we did", type: "textarea" },
      { key: "outcome", label: "The outcome", type: "textarea", help: "A result with a number lands best." },
      { key: "image_url", label: "Cover image", type: "image" },
      { key: "image_alt", label: "Image description", type: "text", help: "Describe the photo for screen readers." },
    ],
  },
  people: {
    table: "people",
    label: "Team",
    singular: "person",
    intro: "The leadership team and the advisory board in the Built by operators section.",
    titleField: "name",
    subtitle: (r) => [r.team === "advisor" ? "Advisor" : "Leadership", s(r.role)].filter(Boolean).join(" · "),
    imageField: "photo_url",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Role", type: "text" },
      {
        key: "team",
        label: "Group",
        type: "select",
        options: [
          { value: "leadership", label: "Leadership team" },
          { value: "advisor", label: "Advisory board" },
        ],
      },
      { key: "bio", label: "One-line bio", type: "textarea", help: "Shown for the leadership team." },
      { key: "photo_url", label: "Headshot", type: "image" },
      { key: "linkedin_url", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/in/…" },
    ],
  },
} satisfies Record<string, CollectionDef>;

export type CollectionKey = keyof typeof collections;

export function getCollection(key: string): CollectionDef | undefined {
  return Object.hasOwn(collections, key) ? (collections as Record<string, CollectionDef>)[key] : undefined;
}

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "spam", label: "Spam" },
] as const;
