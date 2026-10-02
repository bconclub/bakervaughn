"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { SERVICE_HINTS, SERVICE_OPTIONS, TIMING_OPTIONS } from "@/lib/enquiry-schema";

export type Draft = {
  requestId: string;
  step: number;
  service: string;
  challenge: string;
  timing: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  consent: boolean;
  website: string;
};

export const emptyDraft: Draft = {
  requestId: "",
  step: 0,
  service: "",
  challenge: "",
  timing: "",
  name: "",
  email: "",
  company: "",
  phone: "",
  consent: false,
  website: "",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
};

const STEPS = ["Area", "Your challenge", "Your details"];
type Errors = Partial<Record<keyof Draft, string>>;

function validate(step: number, d: Draft): Errors {
  const e: Errors = {};
  if (step === 0 && !d.service) e.service = "Choose an area, or pick “Help me choose”.";
  if (step === 1) {
    if (d.challenge.trim().length < 10) e.challenge = "Tell us a little more (at least 10 characters).";
    if (!d.timing) e.timing = "Choose a timing.";
  }
  if (step === 2) {
    if (d.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(d.email.trim())) e.email = "Enter a valid email address.";
    if (d.company.trim().length < 2) e.company = "Enter your business name.";
    if (!d.consent) e.consent = "Tick to let us contact you about this enquiry.";
  }
  return e;
}

export default function EnquiryDialog({ isOpen, onClose, source, draft, setDraft }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) {
      el.showModal();
      document.documentElement.classList.add("lenis-stopped");
    }
    if (!isOpen && el.open) el.close();
    if (!isOpen) document.documentElement.classList.remove("lenis-stopped");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !draft.requestId) setDraft((d) => ({ ...d, requestId: crypto.randomUUID() }));
  }, [isOpen, draft.requestId, setDraft]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const next = async () => {
    const e = validate(draft.step, draft);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = ref.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    if (draft.step < 2) return set("step", draft.step + 1);
    await submit();
  };

  const submit = async () => {
    if (status === "sending") return;
    setStatus("sending");
    setServerError("");
    let landing = { landingPage: "", referrer: "", utm: {} };
    try {
      landing = JSON.parse(sessionStorage.getItem("bv-landing") || "null") ?? landing;
    } catch {}
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: draft.requestId,
          service: draft.service,
          challenge: draft.challenge,
          timing: draft.timing,
          name: draft.name,
          email: draft.email,
          company: draft.company,
          phone: draft.phone,
          consent: draft.consent,
          website: draft.website,
          attribution: { ctaSource: source, entryPage: location.href, ...landing },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const reset = () => {
    setDraft({ ...emptyDraft });
    setStatus("idle");
    onClose();
  };

  const field =
    "mt-2 w-full rounded-[2px] border border-line bg-ground-deep px-4 py-3 text-base text-text placeholder:text-text-3 focus:border-lamp focus:outline-none aria-[invalid=true]:border-docket";
  const err = (k: keyof Draft) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-2 text-sm text-[oklch(72%_0.15_35)]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="enq-title"
      className="m-auto max-h-[min(92dvh,760px)] w-[min(100vw-24px,640px)] overflow-hidden rounded-[4px] border border-line bg-surface p-0 text-text backdrop:bg-[oklch(8%_0.005_60/0.78)]"
    >
      <div className="flex max-h-[min(92dvh,760px)] flex-col">
        <header className="flex items-center justify-between border-b border-line px-5 py-4 md:px-8">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-text-2">
            {status === "done" ? "Enquiry received" : `Step ${draft.step + 1} of 3 · ${STEPS[draft.step]}`}
          </div>
          <button
            onClick={onClose}
            className="-mr-2 grid size-11 place-items-center rounded-[2px] text-text-2 hover:text-text"
            aria-label="Close enquiry"
          >
            <X size={20} />
          </button>
        </header>

        {status !== "done" && (
          <div className="grid grid-cols-3 gap-1 px-5 pt-4 md:px-8" aria-hidden>
            {STEPS.map((s, i) => (
              <span key={s} className={`h-[3px] ${i <= draft.step ? "bg-lamp" : "bg-line"}`} />
            ))}
          </div>
        )}

        <div className="overflow-y-auto px-5 py-6 md:px-8">
          {status === "done" ? (
            <div className="py-6">
              <div className="grid size-12 place-items-center rounded-full bg-lamp text-ink">
                <Check size={22} />
              </div>
              <h2 id="enq-title" className="display mt-6 text-4xl">
                Thanks, {draft.name.split(" ")[0]}.
              </h2>
              <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-text-2">
                Your enquiry about <strong className="text-text">{draft.service}</strong> has reached us.
              </p>
              <button
                onClick={reset}
                className="mt-8 h-14 rounded-full border border-line px-7 text-base hover:border-text-2"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 id="enq-title" className="display text-3xl md:text-4xl">
                {draft.step === 0 && "Which part of your business do you want to fix?"}
                {draft.step === 1 && "What's costing you most?"}
                {draft.step === 2 && "Where do we reach you?"}
              </h2>

              {draft.step === 0 && (
                <fieldset className="mt-6">
                  <legend className="sr-only">Business area</legend>
                  <div className="grid gap-2">
                    {SERVICE_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className={`flex min-h-14 cursor-pointer items-center justify-between rounded-[2px] border px-4 text-base transition-colors ${
                          draft.service === opt ? "border-lamp bg-ground-deep" : "border-line hover:border-text-3"
                        }`}
                      >
                        <span>
                          {opt}
                          {SERVICE_HINTS[opt] && <span className="ml-2 text-sm text-text-3">{SERVICE_HINTS[opt]}</span>}
                        </span>
                        <input
                          type="radio"
                          name="service"
                          value={opt}
                          checked={draft.service === opt}
                          onChange={() => set("service", opt)}
                          aria-invalid={!!errors.service}
                          className="size-4 accent-[var(--lamp)]"
                        />
                      </label>
                    ))}
                  </div>
                  {err("service")}
                </fieldset>
              )}

              {draft.step === 1 && (
                <div className="mt-6 grid gap-6">
                  <label className="block text-sm text-text-2">
                    Describe the challenge
                    <textarea
                      rows={5}
                      value={draft.challenge}
                      onChange={(e) => set("challenge", e.target.value)}
                      aria-invalid={!!errors.challenge}
                      aria-describedby={errors.challenge ? "challenge-err" : undefined}
                      className={field}
                      placeholder="e.g. We miss calls during the Friday rush and DMs go unanswered."
                    />
                    {err("challenge")}
                  </label>
                  <fieldset>
                    <legend className="text-sm text-text-2">Preferred timing</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TIMING_OPTIONS.map((t) => (
                        <label
                          key={t}
                          className={`flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm ${
                            draft.timing === t ? "border-lamp text-text" : "border-line text-text-2 hover:border-text-3"
                          }`}
                        >
                          <input
                            type="radio"
                            name="timing"
                            className="sr-only"
                            checked={draft.timing === t}
                            onChange={() => set("timing", t)}
                            aria-invalid={!!errors.timing}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                    {err("timing")}
                  </fieldset>
                </div>
              )}

              {draft.step === 2 && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {(
                    [
                      ["name", "Name", "text", "name"],
                      ["email", "Email", "email", "email"],
                      ["company", "Business", "text", "organization"],
                      ["phone", "Phone (optional)", "tel", "tel"],
                    ] as const
                  ).map(([k, label, type, ac]) => (
                    <label key={k} className="block text-sm text-text-2">
                      {label}
                      <input
                        type={type}
                        autoComplete={ac}
                        value={draft[k]}
                        onChange={(e) => set(k, e.target.value)}
                        aria-invalid={!!errors[k]}
                        aria-describedby={errors[k] ? `${k}-err` : undefined}
                        className={field}
                      />
                      {err(k)}
                    </label>
                  ))}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={draft.website}
                    onChange={(e) => set("website", e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden
                  />
                  <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-text-2 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={draft.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                      aria-invalid={!!errors.consent}
                      className="mt-1 size-5 shrink-0 accent-[var(--lamp)]"
                    />
                    <span>
                      Bakervaughn may contact me about this enquiry. See our{" "}
                      <a href="#" className="underline underline-offset-2">privacy policy</a> [ADD LINK].
                      {err("consent")}
                    </span>
                  </label>
                </div>
              )}

              {status === "error" && (
                <p role="alert" className="mt-6 border border-docket px-4 py-3 text-sm">
                  {serverError} Please try again, or email us at [EMAIL ADDRESS].
                </p>
              )}
            </>
          )}
        </div>

        {status !== "done" && (
          <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 md:px-8">
            {draft.step > 0 ? (
              <button
                onClick={() => set("step", draft.step - 1)}
                className="flex h-11 items-center gap-2 px-2 text-base text-text-2 hover:text-text"
              >
                <ArrowLeft size={18} /> Back
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={next}
              disabled={status === "sending"}
              className="group flex h-14 items-center gap-3 rounded-full bg-lamp px-7 text-base font-semibold text-ink transition-colors hover:bg-[oklch(84%_0.14_70)] disabled:opacity-60"
            >
              {draft.step < 2 ? "Continue" : status === "sending" ? "Sending…" : "Send enquiry"}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </footer>
        )}
      </div>
    </dialog>
  );
}
