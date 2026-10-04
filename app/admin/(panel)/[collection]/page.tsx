import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Star } from "lucide-react";
import { Crumbs, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/admin";
import { getCollection, type Row } from "@/lib/collections/config";
import { moveItem } from "../../actions";

const statusStyle: Record<string, string> = {
  published: "bg-[#4ade80]/15 text-[#4ade80]",
  draft: "bg-white/10 text-text-2",
  archived: "bg-white/5 text-text-3",
};

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { collection } = await params;
  const { saved } = await searchParams;
  const def = getCollection(collection);
  if (!def) notFound();

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from(def.table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as Row[];

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/admin" }, { label: def.label }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle title={def.label} intro={def.intro} />
        <Link
          href={`/admin/${collection}/new`}
          className="mb-8 inline-flex h-11 items-center gap-2 rounded-full bg-lamp px-5 font-semibold text-ink hover:bg-[oklch(84%_0.14_70)]"
        >
          <Plus size={18} /> Add {def.singular}
        </Link>
      </div>

      {saved && <p className="mb-4 text-sm text-[#4ade80]">Saved. The site is updated.</p>}
      {error && (
        <p className="mb-4 rounded-[4px] border border-line bg-surface p-4 text-sm text-text-2">
          Couldn&apos;t load {def.label.toLowerCase()}: {error.message}. Has the collections migration been run in Supabase?
        </p>
      )}

      {rows.length === 0 && !error ? (
        <p className="rounded-[4px] border border-dashed border-line p-8 text-center text-text-3">
          Nothing here yet. Add your first {def.singular}.
        </p>
      ) : (
        <ol className="overflow-hidden rounded-[4px] border border-line-soft">
          {rows.map((r, i) => {
            const img = def.imageField ? (r[def.imageField] as string | null) : null;
            return (
              <li key={r.id} className="flex items-center gap-4 border-b border-line-soft bg-ground px-4 py-3 last:border-b-0">
                <div className="flex flex-col">
                  <form action={moveItem.bind(null, collection, r.id, -1)}>
                    <button disabled={i === 0} aria-label="Move up" className="grid size-7 place-items-center text-text-3 hover:text-text disabled:opacity-20">
                      <ArrowUp size={15} />
                    </button>
                  </form>
                  <form action={moveItem.bind(null, collection, r.id, 1)}>
                    <button
                      disabled={i === rows.length - 1}
                      aria-label="Move down"
                      className="grid size-7 place-items-center text-text-3 hover:text-text disabled:opacity-20"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </form>
                </div>
                <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[4px] bg-surface">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-text-3">{String(r[def.titleField] ?? "?").slice(0, 2)}</span>
                  )}
                </div>
                <Link href={`/admin/${collection}/${r.id}`} className="group min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-semibold group-hover:text-lamp">
                    {String(r[def.titleField] ?? "Untitled")}
                    {r.featured && <Star size={14} className="shrink-0 fill-lamp text-lamp" aria-label="Featured" />}
                  </p>
                  <p className="truncate text-sm text-text-3">{def.subtitle(r)}</p>
                </Link>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status] ?? ""}`}>
                  {r.status}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
