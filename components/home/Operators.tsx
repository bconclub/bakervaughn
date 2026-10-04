import type { HomeContent } from "@/lib/cms/home";

type Leader = { name: string; role: string; note: string; photo?: string | null };

export default function Operators({ c }: { c: Omit<HomeContent["operators"], "leadership"> & { leadership: Leader[] } }) {
  return (
    <section id="operators" className="py-20 md:py-28" aria-labelledby="ops-title">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-[0.95rem] text-text-2" data-reveal>
              {c.eyebrow}
            </p>
            <h2 id="ops-title" className="display mt-4 max-w-[12ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
              {c.title}
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-text-2 lg:pt-12" data-reveal>
            {c.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {c.note && <p className="font-mono text-sm text-text-3">{c.note}</p>}
          </div>
        </div>

        <ul className="mt-16 grid gap-px bg-line md:grid-cols-3">
          {c.leadership.map((p, i) => (
            <li key={i} className="bg-ground" data-reveal>
              <div className="relative grid aspect-[5/4] place-items-center overflow-hidden border-b border-line bg-surface">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- headshots uploaded from /admin
                  <img src={p.photo} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <>
                    <span className="display text-[5rem] text-line" aria-hidden data-parallax="24">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <span className="absolute bottom-3 left-3 font-mono text-[11px] text-text-3">[ADD HEADSHOT]</span>
                  </>
                )}
              </div>
              <div className="p-6">
                <p className="text-sm text-text-3">{p.role}</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.02em]">{p.name}</p>
                {p.note && (
                  <p className={`mt-3 leading-relaxed ${p.note.startsWith("[ADD") ? "font-mono text-sm text-text-3" : "text-text-2"}`}>
                    {p.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-[0.6fr_1.4fr]" data-reveal>
          <p className="text-text-2">{c.advisorsLabel}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
            {c.advisors.map((a, i) => (
              <li key={i}>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-text-3">{a.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
