import { notFound } from "next/navigation";
import { Crumbs, PageTitle } from "@/components/admin/ui";
import SectionEditor from "@/components/admin/SectionEditor";
import { requireAdmin } from "@/lib/cms/admin";
import { conform } from "@/lib/cms/conform";
import { findSection } from "@/lib/cms/registry";

type Row = { content: unknown; updated_at: string; updated_by: string | null };

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ project: string; page: string; section: string }>;
}) {
  const { project: pk, page: pgk, section: sk } = await params;
  const { project, page, section } = findSection(pk, pgk, sk);
  if (!project || !page || !section) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("cms_sections")
    .select("content, updated_at, updated_by")
    .match({ project: pk, page: pgk, section: sk })
    .maybeSingle<Row>();

  const value = data ? conform(data.content, section.defaults) : section.defaults;
  const hints = Object.fromEntries(
    Object.entries(page.hints)
      .filter(([k]) => k.startsWith(`${sk}.`))
      .map(([k, v]) => [k.slice(sk.length + 1), v]),
  );

  return (
    <>
      <Crumbs
        items={[
          { label: "Projects", href: "/admin" },
          { label: project.name, href: `/admin/${pk}` },
          { label: page.label, href: `/admin/${pk}/${pgk}` },
          { label: section.label },
        ]}
      />
      <PageTitle title={section.label} intro={section.description} />
      <SectionEditor
        ids={{ project: pk, page: pgk, section: sk }}
        defaults={section.defaults}
        initial={value}
        hints={hints}
        saved={data ? { at: data.updated_at, by: data.updated_by } : null}
        previewHref={`${page.path}#${section.anchor}`}
      />
    </>
  );
}
