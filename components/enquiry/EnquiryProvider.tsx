"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import EnquiryDialog, { type Draft, emptyDraft } from "./EnquiryDialog";

type Ctx = { open: (source: string, service?: string) => void };
const EnquiryContext = createContext<Ctx | null>(null);

export const useEnquiry = () => {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be inside EnquiryProvider");
  return ctx;
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export default function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [source, setSource] = useState("unknown");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const opener = useRef<HTMLElement | null>(null);

  // First-touch attribution, kept for the session.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("bv-landing")) {
        const params = new URLSearchParams(location.search);
        const utm: Record<string, string> = {};
        UTM_KEYS.forEach((k) => params.get(k) && (utm[k] = params.get(k)!));
        sessionStorage.setItem(
          "bv-landing",
          JSON.stringify({ landingPage: location.href, referrer: document.referrer, utm }),
        );
      }
    } catch {}
  }, []);

  const open = useCallback((src: string, service?: string) => {
    opener.current = document.activeElement as HTMLElement;
    setSource(src);
    if (service) setDraft((d) => ({ ...d, service }));
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => opener.current?.focus());
  }, []);

  return (
    <EnquiryContext.Provider value={{ open }}>
      {children}
      <EnquiryDialog
        isOpen={isOpen}
        onClose={close}
        source={source}
        draft={draft}
        setDraft={setDraft}
      />
    </EnquiryContext.Provider>
  );
}
