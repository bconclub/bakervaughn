import Link from "next/link";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Inbox,
  Layers,
  Plus,
  Quote,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DailyBars, PipelineBar } from "@/components/admin/charts";
import type { SupabaseClient } from "@supabase/supabase-js";

type Enquiry = { id: string; name: string; company: string | null; area: string | null; status: string; created_at: string };
type Item = Record<string, unknown> & { id: string; status: string; updated_at: string };

const TZ = "Europe/London";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD
const DAY = 86_400_000;

function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));
}

const statusChip: Record<string, string> = {
  new: "bg-lamp text-ink",
  contacted: "bg-[#60a5fa]/15 text-[#60a5fa]",
  won: "bg-[#4ade80]/15 text-[#4ade80]",
  lost: "bg-white/10 text-text-3",
  spam: "bg-white/5 text-text-3",
};

function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line-soft bg-ground p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  trend?: number | null;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-lamp/40 bg-lamp/[0.07]" : "border-line-soft bg-ground"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-2">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${accent ? "bg-lamp text-ink" : "bg-surface text-text-2"}`}>
          <Icon size={17} aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-[2.1rem] leading-none font-bold tracking-[-0.03em]">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-text-3">
        {trend != null && trend !== 0 && (
          <span className={`inline-flex items-center font-medium ${trend > 0 ? "text-[#4ade80]" : "text-[oklch(72%_0.15_29)]"}`}>
            {trend > 0 ? <ArrowUpRight size={14} aria-hidden /> : <ArrowDownRight size={14} aria-hidden />}
            {Math.abs(trend)}%
          </span>
        )}
        {hint}
      </p>
    </div>
  );
}

// Takes the data client as a prop so it can be rendered with sample data locally.
export default async function Dashboard({ supabase, email }: { supabase: SupabaseClient; email: string }) {

  const [enq, brands, testimonials, work, people, me] = await Promise.all([
    supabase.from("enquiries").select("id,name,company,area,status,created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("brands").select("id,status,updated_at,name,logo_url"),
    supabase.from("testimonials").select("id,status,updated_at,author_name,rating"),
    supabase.from("work").select("id,status,updated_at,name,image_url,outcome"),
    supabase.from("people").select("id,status,updated_at,name,photo_url,team"),
    supabase.rpc("cms_my_username"),
  ]);
  const enquiries = (enq.data ?? []) as Enquiry[];
  const col = {
    brands: (brands.data ?? []) as Item[],
    testimonials: (testimonials.data ?? []) as Item[],
    work: (work.data ?? []) as Item[],
    people: (people.data ?? []) as Item[],
  };
  const setupMissing = Boolean(enq.error || brands.error);

  // Enquiry numbers ------------------------------------------------------------
  // Request-time server render (the panel is force-dynamic), so reading the clock here is intended.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const inLast = (e: Enquiry, from: number, to = 0) => {
    const t = now - new Date(e.created_at).getTime();
    return t >= to * DAY && t < from * DAY;
  };
  const last30 = enquiries.filter((e) => inLast(e, 30)).length;
  const prev30 = enquiries.filter((e) => inLast(e, 60, 30)).length;
  const trend30 = prev30 ? Math.round(((last30 - prev30) / prev30) * 100) : null;
  const counts: Record<string, number> = {};
  enquiries.forEach((e) => (counts[e.status] = (counts[e.status] ?? 0) + 1));
  const newThisWeek = enquiries.filter((e) => e.status === "new" && inLast(e, 7)).length;
  const decided = (counts.won ?? 0) + (counts.lost ?? 0);
  const winRate = decided ? `${Math.round(((counts.won ?? 0) / decided) * 100)}%` : "—";

  const perDay = new Map<string, number>();
  enquiries.forEach((e) => {
    const k = dayKey(new Date(e.created_at));
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  });
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * DAY);
    const key = dayKey(d);
    return {
      date: key,
      label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ }).format(d),
      count: perDay.get(key) ?? 0,
    };
  });

  // Content ----------------------------------------------------------------------
  const live = (rows: Item[]) => rows.filter((r) => r.status === "published").length;
  const totalLive = Object.values(col).reduce((n, rows) => n + live(rows), 0);
  const drafts = Object.values(col).reduce((n, rows) => n + rows.filter((r) => r.status === "draft").length, 0);

  const health: { key: string; label: string; icon: LucideIcon; rows: Item[]; issues: string[] }[] = [
    {
      key: "testimonials",
      label: "Testimonials",
      icon: Quote,
      rows: col.testimonials,
      issues: live(col.testimonials) === 0 ? ["None published yet, so the section is hidden on the site"] : [],
    },
    {
      key: "brands",
      label: "Brands",
      icon: Building2,
      rows: col.brands,
      issues: (() => {
        const n = col.brands.filter((b) => b.status === "published" && !b.logo_url).length;
        return n ? [`${n} without a logo, shown as text`] : [];
      })(),
    },
    {
      key: "work",
      label: "Work",
      icon: Briefcase,
      rows: col.work,
      issues: [
        (() => {
          const n = col.work.filter((w) => !w.image_url || String(w.image_url).startsWith("/unsplash/")).length;
          return n ? `${n} using a stock photo` : "";
        })(),
        (() => {
          const n = col.work.filter((w) => !w.outcome).length;
          return n ? `${n} missing an outcome` : "";
        })(),
      ].filter(Boolean),
    },
    {
      key: "people",
      label: "Team",
      icon: Users,
      rows: col.people,
      issues: (() => {
        const n = col.people.filter((p) => p.team === "leadership" && !p.photo_url).length;
        return n ? [`${n} leader${n > 1 ? "s" : ""} without a headshot`] : [];
      })(),
    },
  ];

  const titleOf: Record<string, string> = { brands: "name", testimonials: "author_name", work: "name", people: "name" };
  const labelOf: Record<string, string> = { brands: "Brand", testimonials: "Testimonial", work: "Work", people: "Team" };
  const recentEdits = Object.entries(col)
    .flatMap(([k, rows]) => rows.map((r) => ({ k, r })))
    .sort((a, b) => b.r.updated_at.localeCompare(a.r.updated_at))
    .slice(0, 6);

  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = typeof me.data === "string" ? me.data : email.split("@")[0];
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date());

  const quick = [
    { href: "/admin/testimonials/new", label: "Testimonial", icon: Quote },
    { href: "/admin/brands/new", label: "Brand", icon: Building2 },
    { href: "/admin/work/new", label: "Project", icon: Briefcase },
    { href: "/admin/people/new", label: "Team member", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-text-3">{today}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
            {greeting}, <span className="capitalize">{name}</span>.
          </h1>
          <p className="mt-2 text-text-2">
            {counts.new ? (
              <>
                You have <span className="font-semibold text-lamp">{counts.new} new enquir{counts.new === 1 ? "y" : "ies"}</span> waiting.
              </>
            ) : (
              "No new enquiries. You're all caught up."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-text-2 transition-colors hover:border-lamp hover:text-text"
            >
              <Plus size={15} className="text-lamp" aria-hidden />
              {q.label}
            </Link>
          ))}
        </div>
      </header>

      {setupMissing && (
        <p className="flex items-start gap-3 rounded-2xl border border-lamp/40 bg-lamp/[0.07] p-4 text-sm text-text-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-lamp" aria-hidden />
          Some data couldn&apos;t load. Run supabase/migrations/20261005120000_collections.sql in Supabase, then refresh.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Inbox} label="New enquiries" value={counts.new ?? 0} hint={`${newThisWeek} this week`} accent={(counts.new ?? 0) > 0} />
        <Stat icon={Layers} label="Enquiries, 30 days" value={last30} hint={prev30 ? "vs previous 30" : "last 30 days"} trend={trend30} />
        <Stat icon={Trophy} label="Win rate" value={winRate} hint={decided ? `${counts.won ?? 0} won of ${decided} decided` : "Mark enquiries won or lost"} />
        <Stat
          icon={CheckCircle2}
          label="Live on the site"
          value={totalLive}
          hint={drafts ? `${drafts} draft${drafts > 1 ? "s" : ""} waiting` : "items across all content"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card
          title="Enquiries, last 30 days"
          action={<span className="font-mono text-xs text-text-3">{last30} total</span>}
        >
          <DailyBars days={days} />
        </Card>
        <Card
          title="Pipeline"
          action={
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-sm text-text-3 hover:text-text">
              Open inbox <ArrowRight size={14} />
            </Link>
          }
        >
          <PipelineBar counts={counts} />
          <p className="mt-5 border-t border-line-soft pt-4 text-sm text-text-3">
            Win rate <span className="font-semibold text-text">{winRate}</span>
            {counts.spam ? ` · ${counts.spam} marked spam` : ""}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card
          title="Latest enquiries"
          action={
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-sm text-text-3 hover:text-text">
              View all <ArrowRight size={14} />
            </Link>
          }
        >
          {enquiries.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-line py-10 text-center">
              <Inbox size={22} className="text-text-3" aria-hidden />
              <p className="mt-3 font-semibold">No enquiries yet</p>
              <p className="mt-1 max-w-[36ch] text-sm text-text-3">
                Every Book a free consultation request from the site will land here.
              </p>
            </div>
          ) : (
            <ul className="-mx-2">
              {enquiries.slice(0, 6).map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold uppercase">
                      {e.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {e.name}
                        {e.company && <span className="font-normal text-text-3"> · {e.company}</span>}
                      </span>
                      <span className="block truncate text-sm text-text-3">{e.area ?? "General enquiry"}</span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-text-3 sm:block">{ago(e.created_at)}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusChip[e.status] ?? ""}`}>
                      {e.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recently edited">
          {recentEdits.length === 0 ? (
            <p className="text-sm text-text-3">Nothing edited yet.</p>
          ) : (
            <ul className="-mx-2">
              {recentEdits.map(({ k, r }) => (
                <li key={`${k}-${r.id}`}>
                  <Link href={`/admin/${k}/${r.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-surface">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{String(r[titleOf[k]] ?? "Untitled")}</span>
                      <span className="block text-xs text-text-3">
                        {labelOf[k]} · {r.status}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-text-3">{ago(r.updated_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Content health">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {health.map((h) => (
            <li key={h.key}>
              <Link
                href={`/admin/${h.key}`}
                className="group flex h-full flex-col rounded-xl border border-line-soft p-4 transition-colors hover:border-line hover:bg-surface/50"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <h.icon size={16} className="text-lamp" aria-hidden />
                    {h.label}
                  </span>
                  <ArrowRight size={15} className="text-text-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </div>
                <p className="mt-3 text-2xl font-bold tracking-[-0.02em]">
                  {live(h.rows)}
                  <span className="ml-1 text-sm font-normal text-text-3">live of {h.rows.length}</span>
                </p>
                <div className="mt-3 space-y-1.5 text-sm">
                  {h.issues.length ? (
                    h.issues.map((i) => (
                      <p key={i} className="flex items-start gap-2 text-text-2">
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-lamp" aria-hidden />
                        {i}
                      </p>
                    ))
                  ) : (
                    <p className="flex items-center gap-2 text-[#4ade80]">
                      <CheckCircle2 size={14} aria-hidden /> All set
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
