import Dashboard from "@/components/admin/Dashboard";
import { requireAdmin } from "@/lib/cms/admin";

export default async function DashboardPage() {
  const { supabase, user } = await requireAdmin();
  return <Dashboard supabase={supabase} email={user.email ?? ""} />;
}
