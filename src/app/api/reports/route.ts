import { NextResponse } from "next/server";

const KINDS = new Set(["correction", "claim_profile", "takedown", "new_listing"]);

// Stores claims/corrections in Supabase `claims` (insert allowed by RLS with consent).
// Until Supabase is configured, returns 503 and the form tells the visitor submissions open at pilot.
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "submissions_not_open" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const kind = String(body?.kind ?? "");
  const message = String(body?.message ?? "").trim().slice(0, 2000);
  const contact = String(body?.contact ?? "").trim().slice(0, 160);
  if (!KINDS.has(kind) || !message || !contact || body?.consent !== "yes") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const listing = String(body?.listing ?? "").slice(0, 200);
  const res = await fetch(`${url}/rest/v1/claims`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({
      kind,
      message: listing ? `[${listing}] ${message}` : message,
      submitter_name: String(body?.name ?? "").slice(0, 120) || null,
      submitter_contact: contact,
      consent_given: true,
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "store_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
