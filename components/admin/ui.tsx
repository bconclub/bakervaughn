import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-text-3">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} aria-hidden />}
          {it.href ? (
            <Link href={it.href} className="hover:text-text">
              {it.label}
            </Link>
          ) : (
            <span className="text-text-2" aria-current="page">
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mt-4 mb-8">
      <h1 className="text-3xl font-bold tracking-[-0.02em] md:text-4xl">{title}</h1>
      {intro && <p className="mt-2 max-w-[60ch] text-text-2">{intro}</p>}
    </div>
  );
}

export function CardLink({ href, title, meta, body }: { href: string; title: string; meta?: React.ReactNode; body?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 border-b border-line-soft bg-ground px-5 py-4 transition-colors last:border-b-0 hover:bg-surface"
    >
      <div className="min-w-0">
        <p className="font-semibold group-hover:text-lamp">{title}</p>
        {body && <p className="mt-0.5 text-sm text-text-3">{body}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm text-text-3">
        {meta}
        <ChevronRight size={18} aria-hidden />
      </div>
    </Link>
  );
}

export function List({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[4px] border border-line-soft">{children}</div>;
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(iso));
}
