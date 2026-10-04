// Small, dependency-free charts for the admin dashboard (server-rendered SVG/CSS).

export const PIPELINE = [
  { key: "new", label: "New", color: "var(--lamp)" },
  { key: "contacted", label: "Contacted", color: "#60a5fa" },
  { key: "won", label: "Won", color: "#4ade80" },
  { key: "lost", label: "Lost", color: "#78716c" },
] as const;

// Enquiries per day. Bars carry a title for hover and an sr-only table for screen readers.
export function DailyBars({ days }: { days: { date: string; label: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  // Top, middle (only when it is a whole, distinct number) and zero.
  const ticks = max >= 2 && max % 2 === 0 ? [max, max / 2, 0] : [max, 0];
  return (
    <figure>
      <div className="flex gap-3">
        <div className="flex h-40 flex-col justify-between py-0.5 text-right font-mono text-[10px] text-text-3" aria-hidden>
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        <div className="relative flex h-40 flex-1 items-end gap-[3px]" aria-hidden>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {ticks.map((_, i) => (
              <span key={i} className="border-t border-dashed border-line-soft" />
            ))}
          </div>
          {days.map((d) => (
            <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.label}: ${d.count} enquir${d.count === 1 ? "y" : "ies"}`}>
              <div
                className={`w-full rounded-t-[3px] transition-colors ${d.count ? "bg-lamp/70 group-hover:bg-lamp" : "bg-line-soft"}`}
                style={{ height: d.count ? `${Math.max(6, (d.count / max) * 100)}%` : "2px" }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 ml-7 flex justify-between font-mono text-[10px] text-text-3" aria-hidden>
        <span>{days[0]?.label}</span>
        <span>{days[Math.floor(days.length / 2)]?.label}</span>
        <span>{days.at(-1)?.label}</span>
      </div>
      <table className="sr-only">
        <caption>Enquiries per day</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th>{d.label}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// Stacked bar of enquiry statuses with a labelled legend (never colour alone).
export function PipelineBar({ counts }: { counts: Record<string, number> }) {
  const total = PIPELINE.reduce((n, p) => n + (counts[p.key] ?? 0), 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-line-soft" role="img" aria-label={PIPELINE.map((p) => `${p.label} ${counts[p.key] ?? 0}`).join(", ")}>
        {total > 0 &&
          PIPELINE.map((p) =>
            counts[p.key] ? <span key={p.key} style={{ width: `${(counts[p.key] / total) * 100}%`, background: p.color }} /> : null,
          )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {PIPELINE.map((p) => (
          <li key={p.key}>
            <p className="flex items-center gap-2 text-sm text-text-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
              {p.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.02em]">{counts[p.key] ?? 0}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
