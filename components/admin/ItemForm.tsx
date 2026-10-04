"use client";

import { useActionState, useId, useRef, useState } from "react";
import { ImageUp, Loader2, Star, X } from "lucide-react";
import { saveItem, type FormState } from "@/app/admin/actions";
import { STATUSES, type Field } from "@/lib/collections/config";
import { browserClient } from "@/lib/supabase/browser";

export const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-line bg-ground px-3 py-2.5 text-text outline-none placeholder:text-text-3 focus:border-lamp";

type Values = Record<string, unknown>;

function ImageField({ field, value }: { field: Field; value: string }) {
  const [url, setUrl] = useState(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const upload = async (f: File) => {
    setErr(null);
    if (f.size > 5 * 1024 * 1024) return setErr("Images must be 5 MB or smaller.");
    setBusy(true);
    const ext = f.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${field.key}/${crypto.randomUUID()}.${ext}`;
    const sb = browserClient();
    const { error } = await sb.storage.from("media").upload(path, f, { contentType: f.type, upsert: false });
    setBusy(false);
    if (error) return setErr(error.message);
    setUrl(sb.storage.from("media").getPublicUrl(path).data.publicUrl);
  };

  return (
    <div>
      <input type="hidden" name={field.key} value={url} />
      <div className="mt-1.5 flex items-center gap-4">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-[4px] border border-line bg-ground">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded or pasted image
            <img src={url} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageUp size={22} className="text-text-3" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => file.current?.click()}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm hover:border-text-3 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ImageUp size={16} />}
            {url ? "Replace" : "Upload"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-text-3 hover:text-text"
            >
              <X size={15} /> Remove
            </button>
          )}
        </div>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>
      {err && <p className="mt-2 text-sm text-[oklch(72%_0.15_29)]">{err}</p>}
    </div>
  );
}

function RatingField({ field, value }: { field: Field; value: number | null }) {
  const [n, setN] = useState(value ?? 0);
  return (
    <div className="mt-1.5 flex items-center gap-1">
      <input type="hidden" name={field.key} value={n || ""} />
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => setN(n === i ? 0 : i)}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          aria-pressed={i <= n}
          className="grid size-9 place-items-center text-lamp"
        >
          <Star size={20} className={i <= n ? "fill-current" : "opacity-30"} />
        </button>
      ))}
      {n > 0 && <span className="ml-2 text-sm text-text-3">{n} / 5</span>}
    </div>
  );
}

function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const id = useId();
  const str = typeof value === "string" ? value : value == null ? "" : String(value);
  const label = (
    <span className="text-sm text-text-2">
      {field.label}
      {field.required && <span className="text-lamp"> *</span>}
    </span>
  );
  const help = field.help && <span className="mt-1 block text-xs text-text-3">{field.help}</span>;

  if (field.type === "image")
    return (
      <div>
        {label}
        <ImageField field={field} value={str} />
        {help}
      </div>
    );
  if (field.type === "rating")
    return (
      <div>
        {label}
        <RatingField field={field} value={typeof value === "number" ? value : null} />
        {help}
      </div>
    );
  return (
    <label htmlFor={id} className="block">
      {label}
      {field.type === "textarea" ? (
        <textarea id={id} name={field.key} defaultValue={str} rows={4} placeholder={field.placeholder} className={inputClass} />
      ) : field.type === "select" ? (
        <select id={id} name={field.key} defaultValue={str || field.options?.[0]?.value} className={inputClass}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={field.key}
          type={field.type === "url" ? "url" : "text"}
          defaultValue={str}
          required={field.required}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
      {help}
    </label>
  );
}

export default function ItemForm({
  collection,
  id,
  fields,
  values,
}: {
  collection: string;
  id: string | null;
  fields: Field[];
  values: Values;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveItem.bind(null, collection, id), {});
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <div className="space-y-6">
        {fields.map((f) => (
          <FieldInput key={f.key} field={f} value={values[f.key]} />
        ))}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[4px] border border-line-soft bg-ground p-5">
          <label className="block">
            <span className="text-sm text-text-2">Status</span>
            <select name="status" defaultValue={(values.status as string) || "published"} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-text-2">
            <input type="checkbox" name="featured" defaultChecked={values.featured === true} className="size-4 accent-[var(--lamp)]" />
            Featured (shown first)
          </label>
          <button
            disabled={pending}
            className="mt-5 h-11 w-full rounded-full bg-lamp font-semibold text-ink transition-colors hover:bg-[oklch(84%_0.14_70)] disabled:opacity-60"
          >
            {pending ? "Saving…" : id ? "Save changes" : "Save"}
          </button>
          {state.error && (
            <p role="alert" className="mt-3 text-sm text-[oklch(72%_0.15_29)]">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p role="status" className="mt-3 text-sm text-[#4ade80]">
              Saved. The site is updated.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
