import Link from "next/link";
import { Crumbs, PageTitle, formatWhen } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/admin";
import { ENQUIRY_STATUSES } from "@/lib/collections/config";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  area: string | null;
  status: string;
  created_at: string;
};

const statusStyle: Record<string, string> = {
  new: "bg-lamp text-ink",
  contacted: "bg-[#60a5fa]/15 text-[#60a5fa]",
  won: "bg-[#4ade80]/15 text-[#4ade80]",
  lost: "bg-white/10 text-text-3",
  spam: "bg-white/5 text-text-3",
};

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  let q = supabase
    .from("enquiries")
    .select("id,name,email,company,area,status,created_at")
    .order("created_at", { ascending: false });
  if (status && ENQUIRY_STATUSES.some((s) => s.value === status)) q = q.eq("status", status);
  const { data, error } = await q;
  const rows = (data ?? []) as Enquiry[];

  const filters = [{ value: "", label: "All" }, ...ENQUIRY_STATUSES];
  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries" }]} />
      <PageTitle title="Enquiries" intro="Every Book a free consultation request from the site, newest first." />

      <ul className="mb-6 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => {
          const active = (status ?? "") === f.value;
          return (
            <li key={f.value}>
              <Link
                href={f.value ? `/admin/enquiries?status=${f.value}` : "/admin/enquiries"}
                className={`block rounded-full border px-3 py-1.5 ${active ? "border-lamp text-text" : "border-line text-text-2 hover:text-text"}`}
              >
                {f.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="mb-4 rounded-[4px] border border-line bg-surface p-4 text-sm text-text-2">
          Couldn&apos;t load enquiries: {error.message}. Has the collections migration been run in Supabase?
        </p>
      )}

      {rows.length === 0 && !error ? (
        <p className="rounded-[4px] border border-dashed border-line p-8 text-center text-text-3">No enquiries here yet.</p>
      ) : (
        <ol className="overflow-hidden rounded-[4px] border border-line-soft">
          {rows.map((r) => (
            <li key={r.id} className="border-b border-line-soft last:border-b-0">
              <Link href={`/admin/enquiries/${r.id}`} className="flex items-center gap-4 bg-ground px-5 py-4 hover:bg-surface">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {r.name}
                    {r.company && <span className="font-normal text-text-3"> · {r.company}</span>}
                  </p>
                  <p className="truncate text-sm text-text-3">{[r.area, r.email].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="hidden shrink-0 text-sm text-text-3 sm:block">{formatWhen(r.created_at)}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status] ?? ""}`}>
                  {r.status}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
