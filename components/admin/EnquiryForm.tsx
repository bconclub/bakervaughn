"use client";

import { useActionState } from "react";
import { updateEnquiry, type FormState } from "@/app/admin/actions";
import { ENQUIRY_STATUSES } from "@/lib/collections/config";
import { inputClass } from "./ItemForm";

export default function EnquiryForm({ id, status, notes }: { id: string; status: string; notes: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateEnquiry.bind(null, id), {});
  return (
    <form action={action} className="rounded-[4px] border border-line-soft bg-ground p-5">
      <label className="block">
        <span className="text-sm text-text-2">Status</span>
        <select name="status" defaultValue={status} className={inputClass}>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block">
        <span className="text-sm text-text-2">Notes</span>
        <textarea name="notes" defaultValue={notes} rows={5} placeholder="Called on Monday, sending a quote…" className={inputClass} />
      </label>
      <button
        disabled={pending}
        className="mt-4 h-11 w-full rounded-full bg-lamp font-semibold text-ink hover:bg-[oklch(84%_0.14_70)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state.error && <p className="mt-3 text-sm text-[oklch(72%_0.15_29)]">{state.error}</p>}
      {state.ok && <p className="mt-3 text-sm text-[#4ade80]">Saved.</p>}
    </form>
  );
}
