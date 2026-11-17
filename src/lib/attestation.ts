import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "./supabase/config";

/**
 * Stroke readiness a hospital director can confirm for their own campus. A submission is only a
 * request: it is published after a KneeTie reviewer confirms it with the hospital (see
 * supabase/migrations/0003_hospital_attestations.sql).
 */
export const CAPABILITIES = ["ct_noncontrast", "cta_head_neck", "ct_perfusion", "thrombolysis", "thrombectomy", "evt_referral"] as const;
export type Capability = (typeof CAPABILITIES)[number];

export const ANSWERS = ["yes_24x7", "yes_limited", "no"] as const;
export type Answer = (typeof ANSWERS)[number];

export const AGENTS = ["tenecteplase", "alteplase"] as const;
export const TRANSFER_MODES = ["road", "air"] as const;

export interface AttestationAnswers {
  capabilities: Record<Capability, Answer>;
  /** Clot-busting medicines used, when thrombolysis is offered. */
  agents: (typeof AGENTS)[number][];
  /** How patients needing thrombectomy are transferred out, when referral is offered. */
  transferModes: (typeof TRANSFER_MODES)[number][];
  /** Usual receiving thrombectomy centre, free text. */
  referralCentre: string | null;
}

/** What the public site sees: approved attestations only, no submitter contact details. */
export interface PublicAttestation {
  id: string;
  hospital_id: string;
  answers: AttestationAnswers;
  submitter_designation: string;
  reviewed_at: string;
}

export const ATTESTATIONS_TAG = "hospital-attestations";

export function parseAnswers(form: FormData): AttestationAnswers | null {
  const capabilities = {} as Record<Capability, Answer>;
  for (const c of CAPABILITIES) {
    const v = String(form.get(`cap_${c}`) ?? "");
    if (!(ANSWERS as readonly string[]).includes(v)) return null;
    capabilities[c] = v as Answer;
  }
  const pick = <T extends string>(name: string, allowed: readonly T[]) =>
    form.getAll(name).map(String).filter((v): v is T => (allowed as readonly string[]).includes(v));
  const offers = (c: Capability) => capabilities[c] !== "no";
  return {
    capabilities,
    agents: offers("thrombolysis") ? pick("agent", AGENTS) : [],
    transferModes: offers("evt_referral") ? pick("transfer", TRANSFER_MODES) : [],
    referralCentre: offers("evt_referral") ? String(form.get("referralCentre") ?? "").trim().slice(0, 200) || null : null,
  };
}

/** Approved attestations, newest first. Fails closed: on error nothing is shown as hospital-confirmed. */
export async function fetchApprovedAttestations(): Promise<PublicAttestation[]> {
  if (!supabaseConfigured) return [];
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/public_hospital_attestations?select=*&order=reviewed_at.desc`, {
      headers: { apikey: supabaseAnonKey, authorization: `Bearer ${supabaseAnonKey}` },
      next: { revalidate: 60, tags: [ATTESTATIONS_TAG] },
    });
    if (!res.ok) throw new Error(`public_hospital_attestations ${res.status}`);
    return (await res.json()) as PublicAttestation[];
  } catch (err) {
    console.error("Could not load hospital attestations", err);
    return [];
  }
}

/** The latest approved attestation per hospital id. */
export function latestByHospital(list: PublicAttestation[]): Map<string, PublicAttestation> {
  const out = new Map<string, PublicAttestation>();
  for (const a of [...list].sort((x, y) => y.reviewed_at.localeCompare(x.reviewed_at))) {
    if (!out.has(a.hospital_id)) out.set(a.hospital_id, a);
  }
  return out;
}

/** Hospital-confirmed status of a treatment: true/false when the hospital answered, null if not. */
export function confirms(a: PublicAttestation | undefined, c: Capability): boolean | null {
  if (!a) return null;
  return a.answers.capabilities[c] !== "no";
}
