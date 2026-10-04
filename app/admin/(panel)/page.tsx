import { CardLink, List, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/admin";
import { collections } from "@/lib/collections/config";

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count } = await q;
    return count ?? 0;
  };

  const [rows, newEnquiries, allEnquiries] = await Promise.all([
    Promise.all(
      Object.entries(collections).map(async ([key, c]) => ({
        key,
        c,
        total: await count(c.table),
        live: await count(c.table, ["status", "published"]),
      })),
    ),
    count("enquiries", ["status", "new"]),
    count("enquiries"),
  ]);

  return (
    <>
      <PageTitle title="Dashboard" intro="Add and edit what the site shows. Changes go live as soon as you save." />
      <List>
        <CardLink
          href="/admin/enquiries"
          title="Enquiries"
          body="Consultation requests from the site."
          meta={
            newEnquiries > 0 ? (
              <span className="rounded-full bg-lamp px-2 py-0.5 text-xs font-semibold text-ink">{newEnquiries} new</span>
            ) : (
              `${allEnquiries} total`
            )
          }
        />
        {rows.map(({ key, c, total, live }) => (
          <CardLink key={key} href={`/admin/${key}`} title={c.label} body={c.intro} meta={`${live} live · ${total} total`} />
        ))}
      </List>
    </>
  );
}
