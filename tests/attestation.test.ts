import { describe, expect, it } from "vitest";
import { CAPABILITIES, confirms, latestByHospital, parseAnswers, type PublicAttestation } from "@/lib/attestation";
import en from "@/lib/i18n/en";
import hi from "@/lib/i18n/hi";

function form(entries: [string, string][]) {
  const f = new FormData();
  for (const [k, v] of entries) f.append(k, v);
  return f;
}
const all = (a: string) => CAPABILITIES.map((c) => [`cap_${c}`, a] as [string, string]);

describe("hospital attestation", () => {
  it("needs an answer for all six capabilities", () => {
    expect(parseAnswers(form(all("yes_24x7").slice(0, 5)))).toBeNull();
    expect(parseAnswers(form([...all("yes_24x7").slice(1), ["cap_ct_noncontrast", "maybe"]]))).toBeNull();
  });

  it("keeps medicines and transfer details only when offered", () => {
    const extras: [string, string][] = [["agent", "tenecteplase"], ["agent", "streptokinase"], ["transfer", "air"], ["referralCentre", " AIIMS "]];
    const yes = parseAnswers(form([...all("yes_limited"), ...extras]))!;
    expect(yes.agents).toEqual(["tenecteplase"]);
    expect(yes.transferModes).toEqual(["air"]);
    expect(yes.referralCentre).toBe("AIIMS");
    const no = parseAnswers(form([...all("no"), ...extras]))!;
    expect(no.agents).toEqual([]);
    expect(no.transferModes).toEqual([]);
    expect(no.referralCentre).toBeNull();
  });

  it("uses the latest approval per hospital and treats 'no' as not offered", () => {
    const mk = (id: string, at: string, evt: "yes_24x7" | "no"): PublicAttestation => ({
      id, hospital_id: "mum-kem", submitter_designation: "Dean", reviewed_at: at,
      answers: { capabilities: { ...Object.fromEntries(CAPABILITIES.map((c) => [c, "yes_24x7"])), thrombectomy: evt } as never, agents: [], transferModes: [], referralCentre: null },
    });
    const latest = latestByHospital([mk("a", "2026-01-01", "yes_24x7"), mk("b", "2026-06-01", "no")]).get("mum-kem");
    expect(latest?.id).toBe("b");
    expect(confirms(latest, "thrombectomy")).toBe(false);
    expect(confirms(latest, "ct_perfusion")).toBe(true);
    expect(confirms(undefined, "ct_perfusion")).toBeNull();
  });

  it("labels every capability in English and Hindi", () => {
    for (const c of CAPABILITIES) {
      expect(en.verify.capabilities[c]).toBeTruthy();
      expect(hi.verify.capabilities[c]).toBeTruthy();
    }
  });
});
