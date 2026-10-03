import { CardLink, Crumbs, List, PageTitle } from "@/components/admin/ui";
import { projects } from "@/lib/cms/registry";

export default function ProjectsPage() {
  return (
    <>
      <Crumbs items={[{ label: "Projects" }]} />
      <PageTitle title="Projects" intro="Choose a project, then a page, then the section you want to edit." />
      <List>
        {Object.entries(projects).map(([key, p]) => {
          const pages = Object.keys(p.pages).length;
          return (
            <CardLink
              key={key}
              href={`/admin/${key}`}
              title={p.name}
              body={p.description}
              meta={`${pages} page${pages === 1 ? "" : "s"}`}
            />
          );
        })}
      </List>
    </>
  );
}
