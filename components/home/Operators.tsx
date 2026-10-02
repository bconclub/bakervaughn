import { advisors, leadership } from "@/lib/content";

export default function Operators() {
  return (
    <section id="operators" className="py-20 md:py-28" aria-labelledby="ops-title">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-[0.95rem] text-text-2" data-reveal>
              Built by operators
            </p>
            <h2 id="ops-title" className="display mt-4 max-w-[12ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
              Built from the shop floor up.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-text-2 lg:pt-12" data-reveal>
            <p>
              Our leadership has spent more than 15 years in UK food, retail and hospitality. We know what a Friday-night
              rush, a supplier shortfall and a Home Office audit feel like, because we've lived them.
            </p>
            <p>
              We rolled out ERPNext across our own businesses first. Then came the problems ERP couldn't solve: missed
              calls, slow replies and sponsor-licence paperwork. So we built PROXe, the AI receptionist and VisorFlow.
            </p>
            <p className="font-mono text-sm text-text-3">[ADD: founding year and team size]</p>
          </div>
        </div>

        <ul className="mt-16 grid gap-px bg-line md:grid-cols-3">
          {leadership.map((p) => (
            <li key={p.name} className="bg-ground" data-reveal>
              <div className="relative grid aspect-[5/4] place-items-center overflow-hidden border-b border-line bg-surface">
                <span className="display text-[5rem] text-line" aria-hidden data-parallax="24">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="absolute bottom-3 left-3 font-mono text-[11px] text-text-3">[ADD HEADSHOT]</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-3">{p.role}</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.02em]">{p.name}</p>
                <p className={`mt-3 leading-relaxed ${p.note.startsWith("[ADD") ? "font-mono text-sm text-text-3" : "text-text-2"}`}>
                  {p.note}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-[0.6fr_1.4fr]" data-reveal>
          <p className="text-text-2">Advisory board</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {advisors.map((a) => (
              <li key={a.name}>
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
