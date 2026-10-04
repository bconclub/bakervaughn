import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/cms/admin";
import { version } from "@/lib/version";

// Always per-request: every admin page depends on the signed-in session.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const [{ data: username }, { count }] = await Promise.all([
    supabase.rpc("cms_my_username"),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const email = user.email ?? "";
  return (
    <AdminShell
      user={typeof username === "string" ? username : email.split("@")[0]}
      email={email}
      version={version}
      newEnquiries={count ?? 0}
    >
      {children}
    </AdminShell>
  );
}
