import { notFound } from "next/navigation";
import { CardLink, Crumbs, List, PageTitle, formatWhen } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/admin";
import { findSection } from "@/lib/cms/registry";

type Saved = { section: string; updated_at: string; updated_by: string | null };

export default async function SectionsPage({ params }: { params: Promise<{ project: string; page: string }> }) {
  const { project: pk, page: key } = await params;
  const { project, page } = findSection(pk, key);
  if (!project || !page) notFound();

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("cms_sections")
    .select("section, updated_at, updated_by")
    .match({ project: pk, page: key });
  const saved = new Map(((data ?? []) as Saved[]).map((r) => [r.section, r]));

  return (
    <>
      <Crumbs
        items={[
          { label: "Projects", href: "/admin" },
          { label: project.name, href: `/admin/${pk}` },
          { label: page.label },
        ]}
      />
      <PageTitle title={`${page.label} page`} intro="Sections appear in the same order as on the site." />
      {error && (
        <p role="alert" className="mb-6 rounded-[4px] border border-docket/60 bg-surface p-4 text-sm text-text-2">
          Couldn&apos;t load edit history: {error.message}. Has the CMS migration been run in Supabase?
        </p>
      )}
      <List>
        {Object.entries(page.sections).map(([sk, s], i) => {
          const row = saved.get(sk);
          return (
            <CardLink
              key={sk}
              href={`/admin/${pk}/${key}/${sk}`}
              title={`${String(i + 1).padStart(2, "0")} · ${s.label}`}
              body={s.description}
              meta={
                row ? (
                  <span className="text-right">
                    <span className="block text-lamp">Edited</span>
                    <span className="block text-xs">{formatWhen(row.updated_at)}</span>
                  </span>
                ) : (
                  <span>Default</span>
                )
              }
            />
          );
        })}
      </List>
    </>
  );
}
