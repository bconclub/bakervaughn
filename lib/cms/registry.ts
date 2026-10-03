import { homeHints, homeSections } from "./home";

export type SectionDef = {
  label: string;
  anchor: string;
  description: string;
  defaults: Record<string, unknown>;
};

export type PageDef = {
  label: string;
  path: string;
  sections: Record<string, SectionDef>;
  hints: Record<string, string>;
};

export type ProjectDef = {
  name: string;
  description: string;
  pages: Record<string, PageDef>;
};

// Projects -> pages -> sections shown in /admin. Add a page here once its
// components read from the CMS.
export const projects: Record<string, ProjectDef> = {
  bakervaughn: {
    name: "Bakervaughn website",
    description: "The public marketing site.",
    pages: {
      home: { label: "Home", path: "/", sections: homeSections, hints: homeHints },
    },
  },
};

export function findSection(project: string, page: string, section?: string) {
  const p = Object.hasOwn(projects, project) ? projects[project] : undefined;
  const pg = p && Object.hasOwn(p.pages, page) ? p.pages[page] : undefined;
  const s = pg && section && Object.hasOwn(pg.sections, section) ? pg.sections[section] : undefined;
  return { project: p, page: pg, section: s };
}
