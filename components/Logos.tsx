// Placeholder service marks. Swap for the real service logos when supplied.

type MarkProps = { slug: string; className?: string };

export const serviceColor: Record<string, string> = {
  proxe: "#a78bfa",
  "ai-receptionist": "#2dd4bf",
  visorflow: "#60a5fa",
  "faircode-erpnext": "#4ade80",
  marketing: "#fb7185",
};

export function ServiceMark({ slug, className = "size-6" }: MarkProps) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {(slug === "proxe" || slug === "acquisition") && (
        <>
          <path {...p} d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z" />
          <circle cx="9" cy="10.5" r="1.1" fill="currentColor" />
          <circle cx="12" cy="10.5" r="1.1" fill="currentColor" />
          <circle cx="15" cy="10.5" r="1.1" fill="currentColor" />
        </>
      )}
      {slug === "ai-receptionist" && (
        <>
          <path {...p} d="M6.5 4h3l1.5 4-2 1.3a9 9 0 0 0 4.7 4.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6a2 2 0 0 1 2-2z" />
          <path {...p} d="M15 3.5a5.5 5.5 0 0 1 5.5 5.5M15 7a2 2 0 0 1 2 2" />
        </>
      )}
      {slug === "visorflow" && (
        <>
          <path {...p} d="M3 8c3-3 15-3 18 0l-2.5 6h-13z" />
          <path {...p} d="M6 18.5c2-1.5 4-1.5 6 0s4 1.5 6 0" />
        </>
      )}
      {(slug === "faircode-erpnext" || slug === "erp") && (
        <>
          <path {...p} d="M12 3l8 4.5-8 4.5-8-4.5z" />
          <path {...p} d="M4 12l8 4.5 8-4.5M4 16.5L12 21l8-4.5" />
        </>
      )}
      {slug === "hr" && (
        <>
          <rect {...p} x="4" y="4" width="16" height="16" rx="2.5" />
          <circle {...p} cx="12" cy="10" r="2.5" />
          <path {...p} d="M7.5 17c1-2.2 2.6-3.2 4.5-3.2s3.5 1 4.5 3.2" />
        </>
      )}
      {slug === "data" && (
        <>
          <path {...p} d="M4 20h16" />
          <path {...p} d="M7 16v-4M12 16V7M17 16v-6" />
        </>
      )}
      {slug === "marketing" && (
        <>
          <path {...p} d="M4 10v4h3l7 4V6L7 10z" />
          <path {...p} d="M17.5 9a4 4 0 0 1 0 6M7 14l1.5 5h2.5l-1-4.5" />
        </>
      )}
    </svg>
  );
}

// Client names, shown as plain wordmarks until their real logos are supplied.
const clients = ["Charcoal Shack", "Arabian Grill", "Khaleej Mandi House", "Harlequin Care Limited", "1 Key Solution"];

export function ClientLogos() {
  return (
    <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
    <ul className="marquee flex w-max items-center gap-12">
      {[...clients, ...clients].map((name, i) => (
        <li key={i} aria-hidden={i >= clients.length} className="text-text-3 transition-colors hover:text-text-2">
          <span className="text-[1.05rem] font-semibold whitespace-nowrap">{name}</span>
        </li>
      ))}
    </ul>
    </div>
  );
}
