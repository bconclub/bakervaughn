import { notFound } from "next/navigation";
import { CardLink, Crumbs, List, PageTitle } from "@/components/admin/ui";
import { findSection } from "@/lib/cms/registry";

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: key } = await params;
  const project = findSection(key, "").project;
  if (!project) notFound();

  return (
    <>
      <Crumbs items={[{ label: "Projects", href: "/admin" }, { label: project.name }]} />
      <PageTitle title={project.name} intro="Pages in this project." />
      <List>
        {Object.entries(project.pages).map(([pk, pg]) => {
          const n = Object.keys(pg.sections).length;
          return <CardLink key={pk} href={`/admin/${key}/${pk}`} title={pg.label} body={pg.path} meta={`${n} sections`} />;
        })}
      </List>
    </>
  );
}
