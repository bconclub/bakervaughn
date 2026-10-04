import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import EnquiryForm from "@/components/admin/EnquiryForm";
import { Crumbs, PageTitle, formatWhen } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/admin";
import { deleteEnquiry } from "../../../actions";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: e } = await supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();

  const attribution = (e.attribution ?? {}) as Record<string, unknown>;
  const utm = (attribution.utm ?? {}) as Record<string, string>;
  const details: [string, string | null | undefined][] = [
    ["Email", e.email],
    ["Phone", e.phone],
    ["Company", e.company],
    ["Wants help with", e.area],
    ["Timing", e.timing],
    ["Received", formatWhen(e.created_at)],
    ["Came from", (attribution.ctaSource as string) || null],
    ["Referrer", (attribution.referrer as string) || null],
    ["Campaign", Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(", ") || null],
  ];

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries", href: "/admin/enquiries" }, { label: e.name }]} />
      <PageTitle title={e.name} intro={e.company ?? undefined} />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="rounded-[4px] border border-line-soft bg-ground p-5">
            <p className="text-sm text-text-3">What&apos;s costing them most</p>
            <p className="mt-2 text-lg leading-relaxed whitespace-pre-wrap">{e.challenge}</p>
          </div>
          <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {details
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-text-3">{k}</dt>
                  <dd className="mt-0.5 break-words">
                    {k === "Email" || k === "Phone" ? (
                      <a href={`${k === "Email" ? "mailto" : "tel"}:${v}`} className="text-lamp underline-offset-4 hover:underline">
                        {v}
                      </a>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
        <aside>
          <EnquiryForm id={id} status={e.status} notes={e.notes ?? ""} />
          <form action={deleteEnquiry.bind(null, id)} className="mt-6">
            <ConfirmButton
              message="Delete this enquiry? This can't be undone."
              className="text-sm text-[oklch(72%_0.15_29)] underline-offset-4 hover:underline"
            >
              Delete enquiry
            </ConfirmButton>
          </form>
        </aside>
      </div>
    </>
  );
}
