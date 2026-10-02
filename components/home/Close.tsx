import EnquiryButton from "@/components/enquiry/EnquiryButton";
import OfficeBoard from "./OfficeBoard";
import { Wordmark } from "./Nav";
import { services } from "@/lib/content";
import { version } from "@/lib/version";

export function Close() {
  return (
    <section id="contact" className="bg-lamp py-20 text-ink md:py-28" aria-labelledby="close-title">
      <div className="wrap grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <h2 id="close-title" className="display max-w-[14ch] text-[clamp(2.6rem,6.4vw,6rem)]">
          Tell us the one thing costing you most.
        </h2>
        <div>
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink/80">
            A free consultation, no obligation. Tell us how your business runs today and we'll show you where one
            connected system saves the most time.
          </p>
          <EnquiryButton source="close" variant="ink" className="mt-8">
            Book a free consultation
          </EnquiryButton>
        </div>
      </div>
    </section>
  );
}

const company = [
  ["About", "#operators"],
  ["Work & case studies", "#work"],
  ["Stories", "#"],
  ["Labs", "#labs"],
  ["Internships", "#"],
];

export function Footer() {
  return (
    <footer className="bg-ground-deep pt-16 pb-10 md:pt-20">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr_1.4fr]">
          <div className="text-center sm:text-left">
            <Wordmark tagline className="h-14 w-auto" />
            <p className="mx-auto mt-4 max-w-[30ch] leading-relaxed text-text-2 sm:mx-0">
              AI and business systems, built by operators.
            </p>
            <ul className="mt-6 space-y-1 font-mono text-sm text-text-3">
              <li>[EMAIL ADDRESS]</li>
              <li>[PHONE NUMBER]</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <nav aria-label="Services">
              <p className="text-sm text-text-3">Services</p>
              <ul className="mt-4 space-y-3">
                {services.map((s) => (
                  <li key={s.slug}>
                    <a href="#services" className="text-text-2 hover:text-text">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Company">
              <p className="text-sm text-text-3">Company</p>
              <ul className="mt-4 space-y-3">
                {company.map(([l, h]) => (
                  <li key={l}>
                    <a href={h} className="text-text-2 hover:text-text">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div>
            <p className="text-sm text-text-3">Offices · local time</p>
            <div className="mt-4">
              <OfficeBoard />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-3 border-t border-line-soft pt-6 text-center text-sm text-text-3">
          <p>© 2026 Bakervaughn · Company no. [NUMBER] · v{version}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-text">Privacy policy</a>
            <span>
              Built with <span aria-label="love">♥</span> at{" "}
              <a
                href="https://bconclub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-2 underline-offset-4 hover:text-lamp hover:underline"
              >
                BCON
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
