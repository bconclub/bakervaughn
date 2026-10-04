import { supabaseConfigured } from "@/lib/supabase/server";
import { signOut } from "../actions";
import LoginForm from "./LoginForm";
import { version } from "@/lib/version";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  return (
    <main className="grid min-h-svh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-lamp">Bakervaughn admin</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em]">Sign in</h1>

        {!supabaseConfigured ? (
          <p className="mt-6 rounded-[4px] border border-line bg-surface p-4 text-sm leading-relaxed text-text-2">
            Supabase is not configured. Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in the hosting environment, then redeploy.
          </p>
        ) : denied ? (
          <div className="mt-6 rounded-[4px] border border-docket/60 bg-surface p-4 text-sm leading-relaxed text-text-2">
            <p>You&apos;re signed in, but this account is not on the admin list.</p>
            <form action={signOut} className="mt-3">
              <button className="font-semibold text-text underline underline-offset-4 hover:text-lamp">Sign out</button>
            </form>
          </div>
        ) : (
          <LoginForm />
        )}
        <p className="mt-10 font-mono text-[11px] text-text-3">v{version}</p>
      </div>
    </main>
  );
}
