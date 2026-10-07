import { ArrowRight } from "lucide-react";
import type { HomeContent } from "@/lib/cms/home";
import TicketRail from "./TicketRail";

// The problem, with the system already working across different kinds of business.
export default function WhyWeExist({ c }: { c: HomeContent["why"] }) {
  return (
    <section className="border-y border-line-soft bg-ground-deep py-20 md:py-28" aria-labelledby="why-title">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id="why-title" className="display text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
            {c.title}
          </h2>
          <p className="max-w-[40ch] text-xl leading-relaxed text-text-2 md:text-2xl lg:justify-self-end" data-reveal>
            {c.subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[4px] border border-line bg-ground lg:min-h-[720px]" data-reveal>
            <div
              aria-hidden
              data-parallax="80"
              className="absolute -inset-y-24 inset-x-0 bg-[radial-gradient(90%_70%_at_50%_0%,oklch(79%_0.155_68/0.18),transparent_70%)]"
            />
            <div className="relative p-4 pt-8 sm:p-8 sm:pt-12 lg:mx-auto lg:max-w-[480px] lg:pt-14">
              <TicketRail />
            </div>
          </div>

          <div className="flex flex-col">
            <ol className="space-y-3">
              {c.problems.map((p, i) => (
                <li
                  key={i}
                  data-reveal
                  className="group rounded-[4px] border border-line bg-ground p-6 transition-colors hover:border-lamp/60 md:p-7"
                >
                  <div className="flex items-start gap-5">
                    <span className="display text-[2.5rem] leading-none text-lamp">{p.n}</span>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold tracking-[-0.02em] [font-stretch:108%]">{p.title}</h3>
                      <p className="mt-2 max-w-[40ch] text-base leading-relaxed text-text-2">{p.body}</p>
                      {p.fixedBy && (
                        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-lamp">
                          <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                          Fixed by {p.fixedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-10 max-w-[36ch] text-2xl leading-snug font-semibold tracking-[-0.015em]" data-reveal>
              {c.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
