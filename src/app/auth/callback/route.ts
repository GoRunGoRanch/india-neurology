import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Magic-link landing: exchange the one-time code for a session cookie, then go back to the queue.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/en/review";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/en/review";
  if (code) await supabaseServer().auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
