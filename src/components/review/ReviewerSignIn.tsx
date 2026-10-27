"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Passwordless sign-in. shouldCreateUser=false: only people the owner invited in Supabase can sign in.
export function ReviewerSignIn({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setState("error");
    } else setState("sent");
  }

  if (state === "sent") {
    return <p className="card text-sm">Check your email for a sign-in link. It opens this queue, signed in.</p>;
  }
  return (
    <form onSubmit={submit} className="card max-w-md space-y-3">
      <h2 className="text-lg">Reviewer sign-in</h2>
      <p className="text-sm text-ink-soft">Enter the email address the project owner invited. We email you a one-time link; there is no password.</p>
      <label className="block text-sm font-medium">
        Email
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
      </label>
      <button type="submit" disabled={state === "sending"} className="btn-primary">{state === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
      {state === "error" && <p role="alert" className="text-sm text-alert-700">{error}</p>}
    </form>
  );
}
