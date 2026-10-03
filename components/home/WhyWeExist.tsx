import type { HomeContent } from "@/lib/cms/home";
import TicketRail from "./TicketRail";

// Paper section: the problem, with the system already working across
// different kinds of business.
export default function WhyWeExist({ c }: { c: HomeContent["why"] }) {
  return (
    <section className="bg-paper py-20 text-ink md:py-28" aria-labelledby="why-title">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id="why-title" className="display text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
            {c.title}
          </h2>
          <p className="max-w-[40ch] text-xl leading-relaxed text-ink-2 md:text-2xl lg:justify-self-end" data-reveal>
            {c.subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[4px] bg-ground lg:min-h-[720px]" data-reveal>
            <div
              aria-hidden
              data-parallax="80"
              className="absolute -inset-y-24 inset-x-0 bg-[radial-gradient(90%_70%_at_50%_0%,oklch(79%_0.155_68/0.22),transparent_70%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 [mask-image:radial-gradient(closest-side,black,transparent)] [background-image:linear-gradient(to_right,oklch(100%_0_0/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(100%_0_0/0.05)_1px,transparent_1px)] [background-size:32px_32px]"
            />
            <div className="relative p-4 pt-10 text-text sm:p-8 sm:pt-14 lg:mx-auto lg:max-w-[480px] lg:pt-16">
              <TicketRail />
            </div>
          </div>

          <div className="flex flex-col">
            <ol className="border-t border-ink/15">
              {c.problems.map((p, i) => (
                <li key={i} data-reveal className="grid grid-cols-[3rem_1fr] border-b border-ink/15 py-8">
                  <span className="font-mono text-sm text-ink-2">{p.n}</span>
                  <div>
                    <h3 className="text-2xl font-bold tracking-[-0.02em] [font-stretch:108%]">{p.title}</h3>
                    <p className="mt-2 max-w-[38ch] text-base leading-relaxed text-ink-2">{p.body}</p>
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
