"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Plus, Trash2 } from "lucide-react";
import { resetSection, saveSection } from "@/app/admin/actions";
import { blank } from "@/lib/cms/conform";

type Path = (string | number)[];
type Change = (path: Path, value: unknown) => void;
type Ctx = { onChange: Change; hints: Record<string, string> };

const LABELS: Record<string, string> = {
  ctaLabel: "Button label",
  secondaryLabel: "Secondary link label",
  helpLabel: "Help button label",
  helpPrompt: "Help prompt",
  linkLabel: "Link label",
  trustedLabel: "Trusted by label",
  headlineAccent: "Headline (amber part)",
  highlight: "Highlighted words",
  advisorsLabel: "Advisory board label",
  officesLabel: "Offices label",
  companyNumber: "Company number",
  n: "Numeral",
  did: "What we did",
  alt: "Image description (alt text)",
  tz: "Time zone",
  slug: "Icon key",
  kind: "Type",
  line: "Description",
  handles: "Handles",
  key: "Id",
};

const SINGULAR: Record<string, string> = {
  clients: "client",
  problems: "problem",
  items: "item",
  steps: "step",
  projects: "project",
  paragraphs: "paragraph",
  leadership: "person",
  advisors: "advisor",
  stages: "stage",
  offices: "office",
};

const LONG = new Set(["intro", "body", "line", "caption", "note", "challenge", "did", "outcome", "subtitle", "closing", "paragraphs"]);

const humanize = (k: string) =>
  LABELS[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function setIn(target: unknown, path: Path, value: unknown): unknown {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(target)) {
    const copy = [...target];
    copy[head as number] = setIn(copy[head as number], rest, value);
    return copy;
  }
  const obj = isRecord(target) ? target : {};
  return { ...obj, [head]: setIn(obj[head as string], rest, value) };
}

const hintFor = (hints: Record<string, string>, path: Path) =>
  hints[path.filter((p) => typeof p === "string").join(".")];

const field =
  "w-full rounded-[2px] border border-line bg-ground px-3 py-2 text-[15px] text-text outline-none placeholder:text-text-3 focus:border-lamp";
const iconBtn =
  "grid size-8 place-items-center rounded-[2px] text-text-3 transition-colors hover:bg-surface hover:text-text disabled:pointer-events-none disabled:opacity-30";

function Text({ name, path, value, template, ctx, label }: { name: string; path: Path; value: string; template: string; ctx: Ctx; label?: string }) {
  const long = LONG.has(name) || template.length > 80 || value.length > 80;
  const hint = hintFor(ctx.hints, path);
  const id = `f-${path.join("-")}`;
  const placeholder = value.startsWith("[ADD") || value.startsWith("[");
  return (
    <div>
      {label !== "" && (
        <label htmlFor={id} className="mb-1.5 block text-sm text-text-2">
          {label ?? humanize(name)}
        </label>
      )}
      {long ? (
        <textarea
          id={id}
          value={value}
          rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))}
          onChange={(e) => ctx.onChange(path, e.target.value)}
          className={`${field} resize-y leading-relaxed [field-sizing:content]`}
        />
      ) : (
        <input id={id} value={value} onChange={(e) => ctx.onChange(path, e.target.value)} className={field} />
      )}
      {(hint || placeholder) && (
        <p className="mt-1 text-xs text-text-3">
          {hint ?? "Placeholder text: replace it with the real details when you have them."}
        </p>
      )}
    </div>
  );
}

function Controls({ i, n, onMove, onRemove, what }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void; what: string }) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={iconBtn} disabled={i === 0} onClick={() => onMove(-1)} aria-label={`Move ${what} up`}>
        <ArrowUp size={16} />
      </button>
      <button type="button" className={iconBtn} disabled={i === n - 1} onClick={() => onMove(1)} aria-label={`Move ${what} down`}>
        <ArrowDown size={16} />
      </button>
      <button
        type="button"
        className={`${iconBtn} hover:text-[oklch(72%_0.15_29)]`}
        onClick={onRemove}
        aria-label={`Remove ${what}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function itemTitle(item: unknown, fallback: string) {
  if (!isRecord(item)) return fallback;
  for (const k of ["name", "title", "label", "city", "key"]) {
    const v = item[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return fallback;
}

function ListField({ name, path, value, template, ctx }: { name: string; path: Path; value: unknown[]; template: unknown[]; ctx: Ctx }) {
  const one = SINGULAR[name] ?? "item";
  const itemTemplate = template[0];
  const [open, setOpen] = useState<Set<number>>(new Set());
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    ctx.onChange(path, next);
    setOpen(new Set());
  };
  const remove = (i: number) => {
    ctx.onChange(path, value.filter((_, j) => j !== i));
    setOpen(new Set());
  };
  const add = () => {
    ctx.onChange(path, [...value, blank(itemTemplate)]);
    setOpen(new Set([value.length]));
  };
  const hint = hintFor(ctx.hints, path);

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm text-text-2">
        {humanize(name)} <span className="text-text-3">({value.length})</span>
      </legend>
      {hint && <p className="-mt-0.5 mb-2 text-xs text-text-3">{hint}</p>}
      <div className="space-y-2">
        {value.map((item, i) =>
          typeof itemTemplate === "string" ? (
            <div key={i} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Text name={name} path={[...path, i]} value={String(item ?? "")} template={itemTemplate} ctx={ctx} label="" />
              </div>
              <Controls i={i} n={value.length} onMove={(d) => move(i, d)} onRemove={() => remove(i)} what={one} />
            </div>
          ) : (
            <div key={i} className="rounded-[4px] border border-line-soft bg-ground">
              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  aria-expanded={open.has(i)}
                  onClick={() =>
                    setOpen((s) => {
                      const n = new Set(s);
                      if (n.has(i)) n.delete(i);
                      else n.add(i);
                      return n;
                    })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
                >
                  <ChevronDown size={16} className={`shrink-0 text-text-3 transition-transform ${open.has(i) ? "" : "-rotate-90"}`} />
                  <span className="font-mono text-xs text-text-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate font-semibold">{itemTitle(item, `New ${one}`)}</span>
                </button>
                <Controls i={i} n={value.length} onMove={(d) => move(i, d)} onRemove={() => remove(i)} what={one} />
              </div>
              {open.has(i) && (
                <div className="space-y-4 border-t border-line-soft px-4 py-4">
                  <Fields template={itemTemplate} value={item} path={[...path, i]} ctx={ctx} />
                </div>
              )}
            </div>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1.5 text-sm text-text-2 hover:bg-surface hover:text-text"
      >
        <Plus size={16} /> Add {one}
      </button>
    </fieldset>
  );
}

function Fields({ template, value, path, ctx }: { template: unknown; value: unknown; path: Path; ctx: Ctx }) {
  if (!isRecord(template)) return null;
  const v = isRecord(value) ? value : {};
  return (
    <>
      {Object.entries(template).map(([k, t]) => {
        const p = [...path, k];
        if (typeof t === "string") return <Text key={k} name={k} path={p} value={String(v[k] ?? "")} template={t} ctx={ctx} />;
        if (Array.isArray(t)) return <ListField key={k} name={k} path={p} value={Array.isArray(v[k]) ? (v[k] as unknown[]) : []} template={t} ctx={ctx} />;
        if (isRecord(t))
          return (
            <fieldset key={k} className="space-y-4 rounded-[4px] border border-line-soft p-4">
              <legend className="px-1 text-sm text-text-2">{humanize(k)}</legend>
              <Fields template={t} value={v[k]} path={p} ctx={ctx} />
            </fieldset>
          );
        return null;
      })}
    </>
  );
}

type Props = {
  ids: { project: string; page: string; section: string };
  defaults: Record<string, unknown>;
  initial: Record<string, unknown>;
  hints: Record<string, string>;
  saved: { at: string; by: string | null } | null;
  previewHref: string;
};

export default function SectionEditor({ ids, defaults, initial, hints, saved: savedInit, previewHref }: Props) {
  const [value, setValue] = useState<unknown>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saved, setSaved] = useState(savedInit);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(value) !== baseline;

  const onChange = useCallback<Change>((path, v) => {
    setValue((cur: unknown) => setIn(cur, path, v));
    setMessage(null);
  }, []);

  const save = useCallback(() => {
    if (pending) return;
    const json = JSON.stringify(value);
    start(async () => {
      const res = await saveSection(ids.project, ids.page, ids.section, json);
      if (res.ok) {
        setBaseline(json);
        setSaved({ at: res.savedAt, by: null });
        setMessage({ kind: "ok", text: "Saved and published." });
      } else setMessage({ kind: "error", text: res.error });
    });
  }, [ids, pending, value]);

  const reset = () => {
    if (!confirm("Reset this section to the site defaults? Your edits to it will be removed.")) return;
    start(async () => {
      const res = await resetSection(ids.project, ids.page, ids.section);
      if (res.ok) {
        setValue(defaults);
        setBaseline(JSON.stringify(defaults));
        setSaved(null);
        setMessage({ kind: "ok", text: "Reset to the site defaults." });
      } else setMessage({ kind: "error", text: res.error });
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty, save]);

  const status = dirty
    ? "Unsaved changes"
    : saved
      ? `Published ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(saved.at))}${saved.by ? ` by ${saved.by}` : ""}`
      : "Showing the site defaults";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="space-y-6">
        <Fields template={defaults} value={value} path={[]} ctx={{ onChange, hints }} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-soft bg-ground-deep/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p role="status" className={`text-sm ${message?.kind === "error" ? "text-[oklch(72%_0.15_29)]" : dirty ? "text-lamp" : "text-text-3"}`}>
            {message?.text ?? status}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={previewHref}
              target="_blank"
              rel="noopener"
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-text-2 hover:text-text"
            >
              View on site <ExternalLink size={14} />
            </a>
            {saved && (
              <button type="button" onClick={reset} disabled={pending} className="h-10 rounded-full px-3 text-sm text-text-2 hover:text-text disabled:opacity-50">
                Reset to default
              </button>
            )}
            <button
              type="submit"
              disabled={!dirty || pending}
              className="h-10 rounded-full bg-lamp px-5 text-sm font-semibold text-ink transition-colors hover:bg-[oklch(84%_0.14_70)] disabled:opacity-40"
            >
              {pending ? "Saving…" : "Save & publish"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
