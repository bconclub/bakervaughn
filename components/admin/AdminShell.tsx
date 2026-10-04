"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Quote,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/BrandLogo";
import { signOut } from "@/app/admin/actions";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

export default function AdminShell({
  user,
  email,
  version,
  newEnquiries,
  children,
}: {
  user: string;
  email: string;
  version: string;
  newEnquiries: number;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const groups: { label?: string; items: NavItem[] }[] = [
    {
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: newEnquiries },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
        { href: "/admin/brands", label: "Brands", icon: Building2 },
        { href: "/admin/work", label: "Work", icon: Briefcase },
        { href: "/admin/people", label: "Team", icon: Users },
      ],
    },
  ];
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 pt-6 pb-8">
        <span className="grid size-9 place-items-center rounded-xl bg-text text-ink">
          <LogoMark className="h-3.5 w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block font-bold tracking-[-0.01em]">Baker Vaughn</span>
          <span className="block text-xs text-text-3">Admin · v{version}</span>
        </span>
      </Link>

      <nav aria-label="Admin" className="flex-1 space-y-6 px-3">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.label && <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[0.95rem] transition-colors ${
                        active ? "bg-surface text-text" : "text-text-2 hover:bg-surface/60 hover:text-text"
                      }`}
                    >
                      <it.icon size={18} className={active ? "text-lamp" : "text-text-3 group-hover:text-text-2"} aria-hidden />
                      <span className="flex-1">{it.label}</span>
                      {it.badge ? (
                        <span className="min-w-6 rounded-full bg-lamp px-1.5 py-0.5 text-center text-xs font-semibold text-ink">
                          {it.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line-soft p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-text-2 hover:bg-surface/60 hover:text-text"
        >
          <ExternalLink size={16} className="text-text-3" aria-hidden />
          View live site
        </a>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold uppercase">
            {user.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold">{user}</span>
            <span className="block truncate text-xs text-text-3">{email}</span>
          </span>
          <form action={signOut}>
            <button aria-label="Sign out" title="Sign out" className="grid size-9 place-items-center rounded-lg text-text-3 hover:bg-surface hover:text-text">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-svh border-r border-line-soft bg-ground lg:block">{sidebar}</aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-soft bg-ground/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <LogoMark className="h-3 w-auto" /> Admin
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="relative grid size-11 place-items-center rounded-lg hover:bg-surface"
        >
          <Menu size={20} />
          {newEnquiries > 0 && <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-lamp" aria-hidden />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line-soft bg-ground">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-5 right-3 grid size-10 place-items-center rounded-lg text-text-3 hover:bg-surface hover:text-text"
            >
              <X size={18} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 pt-6 pb-24 sm:px-6 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
