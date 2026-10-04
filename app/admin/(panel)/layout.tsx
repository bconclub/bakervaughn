import Link from "next/link";
import { requireAdmin } from "@/lib/cms/admin";
import { collections } from "@/lib/collections/config";
import { signOut } from "../actions";
import { version } from "@/lib/version";

// Always per-request: every admin page depends on the signed-in session.
export const dynamic = "force-dynamic";

const nav = [
  ...Object.entries(collections).map(([key, c]) => ({ href: `/admin/${key}`, label: c.label })),
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { data: username } = await supabase.rpc("cms_my_username");
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line-soft bg-ground-deep/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-mono text-xs uppercase tracking-[0.08em] text-lamp">
            Bakervaughn admin <span className="text-text-3">v{version}</span>
          </Link>
          <div className="flex min-w-0 items-center gap-4 text-sm text-text-3">
            <a href="/" target="_blank" className="hidden hover:text-text sm:inline">
              View site
            </a>
            <span className="hidden truncate sm:inline">{typeof username === "string" ? username : user.email}</span>
            <form action={signOut}>
              <button className="text-text-2 hover:text-text">Sign out</button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin" className="mx-auto max-w-5xl overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2 text-sm whitespace-nowrap">
            <li>
              <Link href="/admin" className="block rounded-full px-3 py-1.5 text-text-2 hover:bg-surface hover:text-text">
                Dashboard
              </Link>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded-full px-3 py-1.5 text-text-2 hover:bg-surface hover:text-text">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-32">{children}</main>
    </>
  );
}
