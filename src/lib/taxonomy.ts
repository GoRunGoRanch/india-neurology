import type { Locale } from "./i18n/config";

type Label = Record<Locale, string>;

export interface ConditionDef {
  slug: string;
  name: Label;
  icd10: string;
}

// MVP condition list from the brief, in the brief's order.
export const CONDITIONS: ConditionDef[] = [
  { slug: "stroke", name: { en: "Stroke", hi: "स्ट्रोक (लकवा)" }, icd10: "I60–I69" },
  { slug: "epilepsy", name: { en: "Epilepsy & seizures", hi: "मिर्गी और दौरे" }, icd10: "G40–G41" },
  { slug: "headache-migraine", name: { en: "Headache & migraine", hi: "सिरदर्द और माइग्रेन" }, icd10: "G43–G44" },
  { slug: "parkinsons", name: { en: "Parkinson disease", hi: "पार्किंसन रोग" }, icd10: "G20" },
  { slug: "dementia", name: { en: "Dementia & memory loss", hi: "डिमेंशिया और याददाश्त की कमी" }, icd10: "F00–F03, G30" },
  { slug: "multiple-sclerosis", name: { en: "Multiple sclerosis", hi: "मल्टीपल स्क्लेरोसिस" }, icd10: "G35" },
  { slug: "neuropathy", name: { en: "Neuropathy", hi: "न्यूरोपैथी (नसों की बीमारी)" }, icd10: "G60–G64" },
  { slug: "pediatric-neurology", name: { en: "Children's neurology", hi: "बच्चों की न्यूरोलॉजी" }, icd10: "—" },
  { slug: "neuromuscular", name: { en: "Neuromuscular disorders", hi: "न्यूरोमस्कुलर रोग" }, icd10: "G70–G73" },
  { slug: "neurorehabilitation", name: { en: "Neurorehabilitation", hi: "न्यूरो-पुनर्वास" }, icd10: "—" },
];

export const SERVICES: { code: string; name: Label }[] = [
  { code: "thrombolysis", name: { en: "Clot-busting treatment (thrombolysis)", hi: "थ्रोम्बोलिसिस (थक्का घोलने का इलाज)" } },
  { code: "thrombectomy", name: { en: "Clot removal (thrombectomy)", hi: "थ्रोम्बेक्टॉमी" } },
  { code: "stroke_unit", name: { en: "Stroke unit", hi: "स्ट्रोक यूनिट" } },
  { code: "stroke_24x7", name: { en: "24×7 stroke team", hi: "24×7 स्ट्रोक टीम" } },
  { code: "neurointerventional", name: { en: "Neurointervention", hi: "न्यूरो-इंटरवेंशन" } },
  { code: "cerebral_angiography", name: { en: "Cerebral angiography", hi: "सेरेब्रल एंजियोग्राफ़ी" } },
  { code: "aneurysm_treatment", name: { en: "Aneurysm coiling / flow diversion", hi: "एन्यूरिज़्म कॉइलिंग / फ़्लो डायवर्शन" } },
  { code: "carotid_stenting", name: { en: "Carotid / intracranial stenting", hi: "कैरोटिड / इंट्राक्रेनियल स्टेंटिंग" } },
  { code: "ct", name: { en: "CT scan", hi: "सीटी स्कैन" } },
  { code: "mri", name: { en: "MRI", hi: "एमआरआई" } },
  { code: "eeg", name: { en: "EEG", hi: "ईईजी" } },
  { code: "emg_ncs", name: { en: "EMG / nerve conduction", hi: "ईएमजी / नर्व कंडक्शन" } },
  { code: "neuro_icu", name: { en: "Neuro ICU", hi: "न्यूरो आईसीयू" } },
  { code: "physiotherapy", name: { en: "Physiotherapy", hi: "फिजियोथेरेपी" } },
  { code: "stroke_rehab", name: { en: "Stroke rehabilitation", hi: "स्ट्रोक पुनर्वास" } },
  { code: "speech_therapy", name: { en: "Speech therapy", hi: "स्पीच थेरेपी" } },
  { code: "telemedicine", name: { en: "Teleconsultation", hi: "टेली-परामर्श" } },
];

export const SPECIALTIES: { code: string; name: Label }[] = [
  { code: "neurology", name: { en: "Neurologist", hi: "न्यूरोलॉजिस्ट" } },
  { code: "stroke_neurology", name: { en: "Stroke neurologist", hi: "स्ट्रोक न्यूरोलॉजिस्ट" } },
  { code: "neurointervention", name: { en: "Neurointerventionalist", hi: "न्यूरो-इंटरवेंशनिस्ट" } },
  { code: "interventional_neuroradiology", name: { en: "Interventional neuroradiologist", hi: "इंटरवेंशनल न्यूरोरेडियोलॉजिस्ट" } },
  { code: "endovascular_neurosurgery", name: { en: "Endovascular neurosurgeon", hi: "एंडोवैस्कुलर न्यूरोसर्जन" } },
  { code: "paediatric_neurology", name: { en: "Children's neurologist", hi: "बच्चों के न्यूरोलॉजिस्ट" } },
  { code: "neurorehabilitation", name: { en: "Neurorehabilitation specialist", hi: "न्यूरो-पुनर्वास विशेषज्ञ" } },
];

export const FACILITY_TYPES: { code: string; name: Label }[] = [
  { code: "hospital", name: { en: "Hospital", hi: "अस्पताल" } },
  { code: "clinic", name: { en: "Clinic", hi: "क्लिनिक" } },
  { code: "stroke_centre", name: { en: "Stroke centre", hi: "स्ट्रोक सेंटर" } },
  { code: "rehab_centre", name: { en: "Rehabilitation centre", hi: "पुनर्वास केंद्र" } },
  { code: "diagnostic_centre", name: { en: "Diagnostic centre", hi: "जाँच केंद्र" } },
  { code: "telehealth", name: { en: "Telehealth", hi: "टेलीहेल्थ" } },
];

export const LANGUAGES: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "bn", name: "বাংলা" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "or", name: "ଓଡ଼ିଆ" },
];

export interface CityDef {
  slug: string;
  name: Label;
  lat: number;
  lng: number;
}
export interface StateDef {
  code: string;
  name: Label;
  cities: CityDef[];
}

// Starter list. City coordinates are approximate city centres, used only to place
// demo markers; real records carry their own geocoded coordinates.
export const STATES: StateDef[] = [
  { code: "DL", name: { en: "Delhi", hi: "दिल्ली" }, cities: [
    { slug: "new-delhi", name: { en: "New Delhi", hi: "नई दिल्ली" }, lat: 28.61, lng: 77.21 },
  ] },
  { code: "MH", name: { en: "Maharashtra", hi: "महाराष्ट्र" }, cities: [
    { slug: "mumbai", name: { en: "Mumbai", hi: "मुंबई" }, lat: 19.08, lng: 72.88 },
    { slug: "pune", name: { en: "Pune", hi: "पुणे" }, lat: 18.52, lng: 73.86 },
    { slug: "nagpur", name: { en: "Nagpur", hi: "नागपुर" }, lat: 21.15, lng: 79.09 },
  ] },
  { code: "KA", name: { en: "Karnataka", hi: "कर्नाटक" }, cities: [
    { slug: "bengaluru", name: { en: "Bengaluru", hi: "बेंगलुरु" }, lat: 12.97, lng: 77.59 },
    { slug: "mysuru", name: { en: "Mysuru", hi: "मैसूरु" }, lat: 12.30, lng: 76.64 },
  ] },
  { code: "TN", name: { en: "Tamil Nadu", hi: "तमिलनाडु" }, cities: [
    { slug: "chennai", name: { en: "Chennai", hi: "चेन्नई" }, lat: 13.08, lng: 80.27 },
    { slug: "coimbatore", name: { en: "Coimbatore", hi: "कोयंबटूर" }, lat: 11.02, lng: 76.96 },
  ] },
  { code: "KL", name: { en: "Kerala", hi: "केरल" }, cities: [
    { slug: "kochi", name: { en: "Kochi", hi: "कोच्चि" }, lat: 9.93, lng: 76.27 },
    { slug: "thiruvananthapuram", name: { en: "Thiruvananthapuram", hi: "तिरुवनंतपुरम" }, lat: 8.52, lng: 76.94 },
  ] },
  { code: "WB", name: { en: "West Bengal", hi: "पश्चिम बंगाल" }, cities: [
    { slug: "kolkata", name: { en: "Kolkata", hi: "कोलकाता" }, lat: 22.57, lng: 88.36 },
  ] },
  { code: "TG", name: { en: "Telangana", hi: "तेलंगाना" }, cities: [
    { slug: "hyderabad", name: { en: "Hyderabad", hi: "हैदराबाद" }, lat: 17.39, lng: 78.49 },
  ] },
  { code: "GJ", name: { en: "Gujarat", hi: "गुजरात" }, cities: [
    { slug: "ahmedabad", name: { en: "Ahmedabad", hi: "अहमदाबाद" }, lat: 23.02, lng: 72.57 },
  ] },
  { code: "UP", name: { en: "Uttar Pradesh", hi: "उत्तर प्रदेश" }, cities: [
    { slug: "lucknow", name: { en: "Lucknow", hi: "लखनऊ" }, lat: 26.85, lng: 80.95 },
    { slug: "varanasi", name: { en: "Varanasi", hi: "वाराणसी" }, lat: 25.32, lng: 82.97 },
  ] },
  { code: "RJ", name: { en: "Rajasthan", hi: "राजस्थान" }, cities: [
    { slug: "jaipur", name: { en: "Jaipur", hi: "जयपुर" }, lat: 26.91, lng: 75.79 },
  ] },
  { code: "PB", name: { en: "Punjab", hi: "पंजाब" }, cities: [
    { slug: "ludhiana", name: { en: "Ludhiana", hi: "लुधियाना" }, lat: 30.90, lng: 75.86 },
  ] },
  { code: "OD", name: { en: "Odisha", hi: "ओडिशा" }, cities: [
    { slug: "bhubaneswar", name: { en: "Bhubaneswar", hi: "भुवनेश्वर" }, lat: 20.30, lng: 85.82 },
  ] },
];

export function findState(code: string | undefined) {
  return STATES.find((s) => s.code === code);
}
export function findCity(stateCode: string | undefined, slug: string | undefined) {
  return findState(stateCode)?.cities.find((c) => c.slug === slug);
}
export function conditionBySlug(slug: string) {
  return CONDITIONS.find((c) => c.slug === slug);
}
export function serviceName(code: string, locale: Locale) {
  return SERVICES.find((s) => s.code === code)?.name[locale] ?? code;
}
export function specialtyName(code: string, locale: Locale) {
  return SPECIALTIES.find((s) => s.code === code)?.name[locale] ?? code;
}
export function facilityTypeName(code: string, locale: Locale) {
  return FACILITY_TYPES.find((s) => s.code === code)?.name[locale] ?? code;
}
export function languageName(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
