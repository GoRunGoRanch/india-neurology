"use server";

import { parseAnswers } from "@/lib/attestation";
import { repository } from "@/lib/data/repository";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/config";

export type SubmitState = { status: "sent" | "missing" | "error" | "unavailable" } | null;

const text = (form: FormData, name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);

/**
 * Stores a hospital director's answers as a pending request. RLS only lets the public insert
 * unreviewed rows; a reviewer confirms with the hospital before anything is published.
 */
export async function submitAttestation(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  // Honeypot: real people never see or fill this field.
  if (text(form, "website", 200)) return { status: "sent" };
  if (!supabaseConfigured) return { status: "unavailable" };

  const hospitalId = text(form, "hospitalId", 120);
  const facility = await repository.facility(hospitalId);
  const answers = parseAnswers(form);
  const name = text(form, "name", 120);
  const designation = text(form, "designation", 120);
  const email = text(form, "email", 200);
  const phone = text(form, "phone", 30);
  const valid =
    facility && !facility.isDemo && answers && name.length >= 2 && designation.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.replace(/\D/g, "").length >= 6 && form.get("declaration") === "yes";
  if (!valid) return { status: "missing" };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/hospital_attestations`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify({
        hospital_id: facility.id,
        answers,
        submitter_name: name,
        submitter_designation: designation,
        submitter_email: email,
        submitter_phone: phone,
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return { status: "sent" };
  } catch (err) {
    console.error("Attestation not saved", err);
    return { status: "error" };
  }
}
