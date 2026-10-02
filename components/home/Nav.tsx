"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import EnquiryButton from "@/components/enquiry/EnquiryButton";
import { LogoLockup } from "@/components/BrandLogo";
import { useReady } from "@/components/useReady";

const links = [
  { href: "#services", label: "Services" },
  { href: "#connect", label: "How it connects" },
  { href: "#work", label: "Work" },
  { href: "#operators", label: "About" },
  { href: "#labs", label: "Labs" },
];

export function Wordmark({
  tagline = false,
  intro = false,
  className = "h-9 w-auto",
}: {
  tagline?: boolean;
  intro?: boolean;
  className?: string;
}) {
  return <LogoLockup tagline={tagline} intro={intro} className={className} />;
}

export default function Nav() {
  const ready = useReady();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line-soft bg-ground/92 backdrop-blur-sm" : "border-b border-transparent"
      }`}
    >
      <nav className="wrap flex h-[72px] items-center justify-between" aria-label="Main">
        <a href="#top" aria-label="Bakervaughn home">
          <Wordmark intro={ready} />
        </a>
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[0.95rem] text-text-2 transition-colors hover:text-text">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden lg:block">
          <EnquiryButton source="nav" className="!h-11 !px-5 text-[0.95rem]">
            Book a free consultation
          </EnquiryButton>
        </div>
        <button
          className="grid size-11 place-items-center lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="wrap pb-6 lg:hidden">
          <ul className="border-t border-line-soft">
            {links.map((l) => (
              <li key={l.href} className="border-b border-line-soft">
                <a href={l.href} onClick={() => setOpen(false)} className="block py-4 text-lg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <EnquiryButton source="nav-mobile" className="mt-6 w-full justify-center">
            Book a free consultation
          </EnquiryButton>
        </div>
      )}
    </header>
  );
}
