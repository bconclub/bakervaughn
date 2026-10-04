import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/server";

// Valid enquiries are stored in Supabase (the admin's Enquiries inbox) and logged.
// PENDING: delivery (email / CRM / PROXe) is not implemented.
const seen = new Map<string, number>(); // requestId -> timestamp (idempotency, per instance)

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled: accept silently, store nothing.
  if (typeof body === "object" && body && "website" in body && (body as { website?: string }).website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Some details need fixing.", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { requestId } = parsed.data;
  if (seen.has(requestId)) return NextResponse.json({ ok: true, duplicate: true });

  const e = parsed.data;
  console.info("[enquiry]", JSON.stringify({ ...e, receivedAt: new Date().toISOString() }));

  // Store in the admin's Enquiries inbox. The anon key may only insert new enquiries
  // (row-level security); it can't read them back.
  if (supabaseConfigured) {
    const res = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        request_id: e.requestId,
        area: e.service,
        challenge: e.challenge,
        timing: e.timing,
        name: e.name,
        email: e.email,
        company: e.company,
        phone: e.phone || null,
        attribution: e.attribution,
      }),
    }).catch((err: unknown) => {
      console.error("[enquiry] store failed", err);
      return null;
    });
    // 409 = this request id was already stored (a retry), which is fine.
    if (!res || (!res.ok && res.status !== 409)) {
      if (res) console.error("[enquiry] store failed", res.status, await res.text());
      return NextResponse.json(
        { ok: false, error: "We couldn't send that just now. Please try again in a minute." },
        { status: 502 },
      );
    }
  }

  seen.set(requestId, Date.now());
  return NextResponse.json({ ok: true });
}
