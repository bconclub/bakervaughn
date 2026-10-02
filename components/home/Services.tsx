import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";
import EnquiryButton from "@/components/enquiry/EnquiryButton";
import { ServiceMark, serviceColor } from "@/components/Logos";

// Menu board: every service is a row with its own brand panel.
export default function Services() {
  return (
    <section id="services" className="py-20 md:py-28" aria-labelledby="services-title">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 id="services-title" className="display max-w-[14ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
            Five services. One brain behind them.
          </h2>
          <p className="max-w-[38ch] text-lg leading-relaxed text-text-2" data-reveal>
            Each is sold separately. Use one, or join them up. Together they share the same data, so nothing gets
            re-typed.
          </p>
        </div>

        <ul className="mt-14 border-t border-line">
          {services.map((s, i) => (
            <li key={s.slug} data-reveal className="border-b border-line">
              <a
                href="#services"
                className="group grid gap-4 py-7 md:grid-cols-[220px_1fr_1.3fr_auto] md:items-center md:gap-10 md:py-8"
              >
                <div
                  className="relative hidden aspect-[16/10] place-items-center overflow-hidden rounded-2xl border border-white/10 md:grid"
                  style={{
                    background: `radial-gradient(120% 90% at 50% 110%, ${serviceColor[s.slug]}40, transparent 60%), oklch(19% 0.008 60)`,
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 [mask-image:radial-gradient(closest-side,black,transparent)] [background-image:linear-gradient(to_right,oklch(100%_0_0/0.06)_1px,transparent_1px),linear-gradient(to_bottom,oklch(100%_0_0/0.06)_1px,transparent_1px)] [background-size:22px_22px]"
                  />
                  <span
                    className="relative grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
                    style={{ color: serviceColor[s.slug], boxShadow: `0 0 40px -6px ${serviceColor[s.slug]}80` }}
                  >
                    <ServiceMark slug={s.slug} className="size-7" />
                  </span>
                  <span className="absolute top-3 left-3 font-mono text-[11px] text-text-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center gap-4 md:block">
                  {/* phones: compact mark beside the name instead of the panel */}
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 md:hidden"
                    style={{ color: serviceColor[s.slug], background: `${serviceColor[s.slug]}1f` }}
                  >
                    <ServiceMark slug={s.slug} className="size-6" />
                  </span>
                  <div>
                    <span className="text-sm text-text-3">
                      <span className="font-mono text-xs md:hidden">{String(i + 1).padStart(2, "0")} · </span>
                      {s.kind}
                    </span>
                    <h3 className="display mt-1 text-[clamp(1.9rem,3.2vw,2.9rem)] transition-colors group-hover:text-lamp">
                      {s.name}
                    </h3>
                  </div>
                </div>
                <div>
                  <p className="max-w-[52ch] text-base leading-relaxed text-text-2">{s.line}</p>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.06em] text-text-3">{s.handles}</p>
                </div>
                <ArrowUpRight
                  size={26}
                  className="hidden text-text-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-lamp md:block"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4 text-text-2">
          <span>Not sure where to start?</span>
          <EnquiryButton source="services-help" service="Help me choose" variant="quiet" className="text-text">
            Help me choose
          </EnquiryButton>
        </div>
      </div>
    </section>
  );
}
