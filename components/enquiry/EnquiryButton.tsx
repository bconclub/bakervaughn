"use client";

import { ArrowRight } from "lucide-react";
import { useEnquiry } from "./EnquiryProvider";

type Props = {
  source: string;
  service?: string;
  variant?: "primary" | "ink" | "quiet";
  children: React.ReactNode;
  className?: string;
};

// Real link to the contact section as a fallback; opens the dialog when JS runs.
export default function EnquiryButton({ source, service, variant = "primary", children, className = "" }: Props) {
  const { open } = useEnquiry();
  const styles = {
    primary: "h-14 bg-lamp px-7 text-ink hover:bg-[oklch(84%_0.14_70)] font-semibold",
    ink: "h-14 bg-ink px-7 text-paper hover:bg-[oklch(28%_0.01_60)] font-semibold",
    quiet: "h-11 px-1 text-text-2 hover:text-text underline-offset-4 hover:underline",
  }[variant];

  return (
    <a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        open(source, service);
      }}
      className={`group inline-flex items-center gap-3 rounded-full text-base transition-colors ${styles} ${className}`}
    >
      {children}
      <ArrowRight size={18} className="transition-transform duration-150 group-hover:translate-x-1" />
    </a>
  );
}
