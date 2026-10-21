// DEMONSTRATION DATA ONLY.
// None of these records describe a real hospital or clinician. Names start with "Demo",
// phone numbers are null, and every record has isDemo = true. tests/demo-data.test.ts
// enforces these rules so demo data can never pass as real listings.

import { findCity } from "../../taxonomy";
import type { Facility, Provider } from "../types";

const DEMO_SOURCE = "Demonstration record — not a real listing";
const UPDATED = "2026-10-21";

function cityGeo(state: string, city: string, jitter: number) {
  const c = findCity(state, city);
  if (!c) throw new Error(`Unknown demo city ${state}/${city}`);
  // Small offset so markers in one city don't overlap. Not a real location.
  return { lat: c.lat + jitter * 0.01, lng: c.lng - jitter * 0.01, verified: false };
}

function facility(
  n: number,
  state: string,
  city: string,
  type: string,
  services: string[],
  conditions: string[],
  languages: string[],
  status: Facility["verificationStatus"] = "unverified",
): Facility {
  return {
    kind: "hospital",
    id: `demo-facility-${n}`,
    name: `Demo ${type === "rehab_centre" ? "Neuro Rehab Centre" : type === "clinic" ? "Neurology Clinic" : "Neuro Hospital"} ${n}`,
    type,
    stateCode: state,
    citySlug: city,
    address: null,
    geo: cityGeo(state, city, n % 5),
    phone: null,
    website: null,
    services: services.map((code) => ({ code, available24x7: null, verified: false })),
    conditions,
    languages,
    accessibility: {},
    isDemo: true,
    verificationStatus: status,
    lastVerifiedAt: null,
    sourceTitle: DEMO_SOURCE,
    updatedAt: UPDATED,
  };
}

function provider(
  n: number,
  state: string,
  city: string,
  specialty: string,
  facilityIds: string[],
  conditions: string[],
  languages: string[],
  teleconsult: boolean | null,
  status: Provider["verificationStatus"] = "unverified",
): Provider {
  return {
    kind: "neurologist",
    id: `demo-neurologist-${n}`,
    name: `Demo Neurologist ${String.fromCharCode(64 + n)}`,
    specialty,
    stateCode: state,
    citySlug: city,
    facilityIds,
    qualifications: [
      { degree: "Qualification not yet verified", institution: null, year: null, registrationCouncil: null, registrationNumber: null, verified: false },
    ],
    conditions,
    languages,
    phone: null,
    website: null,
    teleconsult,
    geo: cityGeo(state, city, n % 5),
    isDemo: true,
    verificationStatus: status,
    lastVerifiedAt: null,
    sourceTitle: DEMO_SOURCE,
    updatedAt: UPDATED,
  };
}

const STROKE = ["stroke", "neurorehabilitation"];

export const DEMO_FACILITIES: Facility[] = [
  facility(1, "DL", "new-delhi", "stroke_centre", ["thrombolysis", "thrombectomy", "cerebral_angiography", "aneurysm_treatment", "carotid_stenting", "ct", "mri", "neuro_icu"], STROKE, ["hi", "en"], "pending"),
  facility(2, "MH", "mumbai", "hospital", ["thrombolysis", "ct", "mri", "eeg", "neuro_icu"], ["stroke", "epilepsy", "headache-migraine"], ["mr", "hi", "en"]),
  facility(3, "MH", "pune", "rehab_centre", ["physiotherapy", "speech_therapy"], ["neurorehabilitation", "stroke", "parkinsons"], ["mr", "en"]),
  facility(4, "KA", "bengaluru", "hospital", ["thrombolysis", "ct", "mri", "eeg", "emg_ncs"], ["stroke", "epilepsy", "multiple-sclerosis", "neuropathy"], ["kn", "en", "hi"]),
  facility(5, "TN", "chennai", "stroke_centre", ["thrombolysis", "thrombectomy", "cerebral_angiography", "aneurysm_treatment", "ct", "mri"], STROKE, ["ta", "en"]),
  facility(6, "KL", "kochi", "hospital", ["ct", "mri", "eeg", "telemedicine"], ["epilepsy", "pediatric-neurology", "dementia"], ["ml", "en"]),
  facility(7, "WB", "kolkata", "clinic", ["eeg", "emg_ncs", "telemedicine"], ["headache-migraine", "neuropathy", "neuromuscular"], ["bn", "hi", "en"]),
  facility(8, "TG", "hyderabad", "hospital", ["thrombolysis", "ct", "mri", "neuro_icu"], ["stroke", "parkinsons", "dementia"], ["te", "hi", "en"]),
  facility(9, "UP", "lucknow", "hospital", ["thrombolysis", "ct"], ["stroke", "epilepsy"], ["hi", "en"]),
  facility(10, "OD", "bhubaneswar", "diagnostic_centre", ["ct", "mri", "eeg"], ["epilepsy", "headache-migraine"], ["or", "hi", "en"]),
  facility(11, "RJ", "jaipur", "rehab_centre", ["physiotherapy", "speech_therapy", "telemedicine"], ["neurorehabilitation", "pediatric-neurology"], ["hi", "en"]),
  facility(12, "GJ", "ahmedabad", "clinic", ["eeg", "telemedicine"], ["epilepsy", "pediatric-neurology"], ["gu", "hi", "en"]),
];

export const DEMO_PROVIDERS: Provider[] = [
  provider(1, "DL", "new-delhi", "neurology", ["demo-facility-1"], ["stroke"], ["hi", "en"], true, "pending"),
  provider(2, "MH", "mumbai", "neurology", ["demo-facility-2"], ["epilepsy", "headache-migraine"], ["mr", "hi", "en"], false),
  provider(3, "MH", "pune", "neurorehabilitation", ["demo-facility-3"], ["neurorehabilitation", "parkinsons"], ["mr", "en"], null),
  provider(4, "KA", "bengaluru", "neurology", ["demo-facility-4"], ["multiple-sclerosis", "neuropathy"], ["kn", "en"], true),
  provider(5, "TN", "chennai", "neurology", ["demo-facility-5"], ["stroke"], ["ta", "en"], null),
  provider(6, "KL", "kochi", "paediatric_neurology", ["demo-facility-6"], ["pediatric-neurology", "epilepsy"], ["ml", "en"], true),
  provider(7, "WB", "kolkata", "neurology", ["demo-facility-7"], ["neuromuscular", "neuropathy"], ["bn", "en"], true),
  provider(8, "TG", "hyderabad", "neurology", ["demo-facility-8"], ["parkinsons", "dementia"], ["te", "hi", "en"], false),
  provider(9, "UP", "varanasi", "neurology", [], ["headache-migraine", "epilepsy"], ["hi"], null),
  provider(10, "PB", "ludhiana", "neurology", [], ["stroke", "neuropathy"], ["pa", "hi", "en"], true),
  provider(11, "KA", "mysuru", "paediatric_neurology", [], ["pediatric-neurology"], ["kn", "en"], null),
  provider(12, "TN", "coimbatore", "neurology", [], ["dementia", "parkinsons"], ["ta", "en"], false),
];
