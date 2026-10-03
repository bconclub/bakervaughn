// Coerces stored or submitted content into the shape of a section's defaults, so a bad
// row or a tampered form can never hand a component the wrong type.

const MAX_TEXT = 10_000;
const MAX_ITEMS = 100;

// An empty value of the same shape, used for newly added list items.
export function blank(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (typeof template === "number") return 0;
  if (typeof template === "boolean") return false;
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    return Object.fromEntries(Object.entries(template).map(([k, v]) => [k, blank(v)]));
  }
  return template;
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

// Missing keys take the template's value when `fill` is true (section level, so new
// fields fall back to the site defaults) and a blank value inside list items.
export function conform<T>(value: unknown, template: T, fill = true): T {
  if (typeof template === "string") return (typeof value === "string" ? value.slice(0, MAX_TEXT) : template) as T;
  if (typeof template === "number") return (typeof value === "number" && Number.isFinite(value) ? value : template) as T;
  if (typeof template === "boolean") return (typeof value === "boolean" ? value : template) as T;
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template;
    const item = template[0];
    if (item === undefined) return [] as T;
    return value.slice(0, MAX_ITEMS).map((v) => conform(v, item, false)) as T;
  }
  if (isRecord(template)) {
    const src = isRecord(value) ? value : {};
    const out: Record<string, unknown> = {};
    for (const [k, t] of Object.entries(template)) {
      out[k] = Object.hasOwn(src, k) ? conform(src[k], t, false) : fill ? t : blank(t);
    }
    return out as T;
  }
  return template;
}
