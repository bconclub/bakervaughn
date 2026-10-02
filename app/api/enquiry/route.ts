import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";

// PENDING: persistence (database) and delivery (email / CRM / PROXe) are not
// implemented. Valid enquiries are only logged on the server for now.
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
  seen.set(requestId, Date.now());

  console.info("[enquiry]", JSON.stringify({ ...parsed.data, receivedAt: new Date().toISOString() }));
  return NextResponse.json({ ok: true });
}
