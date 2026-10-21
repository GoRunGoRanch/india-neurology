// "Neurology & neurointerventional care" page — DRAFT CONTENT, NOT YET CLINICALLY REVIEWED.
// Same sign-off rule as conditions.ts: the page shows a draft banner until reviewStatus is
// "reviewed" with a named reviewer and date. English only for now.

export interface CareTeam {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

export interface Procedure {
  id: string;
  name: string;
  what: string;
  usedFor: string;
  service: string | null; // SERVICES code, links to the directory filter
}

export const CARE_CONTENT = {
  intro:
    "Brain and nerve care in India is delivered by teams. Neurologists diagnose and manage conditions of the brain, spinal cord, nerves and muscles. Neurointerventional specialists treat diseases of the brain's blood vessels from inside the vessels, through a thin tube (catheter) usually passed from the wrist or groin. In stroke, both work together, and minutes matter.",
  teams: [
    {
      id: "neurology",
      title: "Neurology",
      summary:
        "A neurologist is a doctor who specialises in the brain, spinal cord, nerves and muscles. In India this usually means a DM or DNB in Neurology after an MD in Medicine.",
      points: [
        "Diagnoses the cause of symptoms such as weakness, seizures, headache, memory loss, tremor or numbness",
        "Leads emergency stroke care in many hospitals, including deciding on clot-busting medicine",
        "Manages long-term conditions such as epilepsy, Parkinson disease, multiple sclerosis and dementia",
        "Works with rehabilitation teams on recovery",
      ],
    },
    {
      id: "vascular-neurology",
      title: "Vascular neurology (stroke neurology)",
      summary:
        "Vascular neurologists focus on stroke and diseases of the brain's blood vessels: emergency treatment, finding the cause, and preventing another stroke.",
      points: [
        "Runs the stroke pathway from arrival to discharge",
        "Looks for causes such as narrowed arteries, heart rhythm problems or clotting disorders",
        "Sets up prevention: blood pressure, diabetes, cholesterol, lifestyle and medicines",
      ],
    },
    {
      id: "neurointervention",
      title: "Neurointerventional care",
      summary:
        "Neurointerventional specialists (also called interventional neuroradiologists or endovascular neurosurgeons) treat blood-vessel problems of the brain and spine using catheters and X-ray guidance, without open surgery.",
      points: [
        "Removes large clots in stroke (mechanical thrombectomy)",
        "Treats brain aneurysms and abnormal vessel connections from inside the vessel",
        "Opens narrowed arteries in the neck or brain when appropriate",
        "Needs a hospital with a catheter lab (cath lab), anaesthesia and intensive care, available around the clock for stroke",
      ],
    },
  ] satisfies CareTeam[],
  procedures: [
    {
      id: "thrombectomy",
      name: "Mechanical thrombectomy",
      what: "A catheter is guided to the blocked brain artery and the clot is pulled out or suctioned away.",
      usedFor: "Ischaemic stroke caused by a blockage in a large brain artery. Brain scans help decide who can benefit; earlier treatment generally gives better results.",
      service: "thrombectomy",
    },
    {
      id: "angiography",
      name: "Cerebral angiography",
      what: "Dye is injected into the brain's arteries through a catheter to take detailed X-ray pictures of the blood vessels.",
      usedFor: "Finding aneurysms, abnormal vessel connections, narrowings or the source of bleeding, and planning treatment.",
      service: "cerebral_angiography",
    },
    {
      id: "aneurysm",
      name: "Aneurysm coiling and flow diversion",
      what: "Soft metal coils or a special mesh tube (flow diverter) are placed through a catheter to seal off a weak, ballooning artery.",
      usedFor: "Brain aneurysms, including after bleeding (subarachnoid haemorrhage) or when found by chance.",
      service: "aneurysm_treatment",
    },
    {
      id: "avm",
      name: "Embolisation of AVMs and fistulas",
      what: "Abnormal tangles of vessels are closed off from inside with special glue-like agents or coils.",
      usedFor: "Arteriovenous malformations (AVMs) and dural arteriovenous fistulas, sometimes combined with surgery or radiation.",
      service: null,
    },
    {
      id: "stenting",
      name: "Carotid and intracranial stenting",
      what: "A small mesh tube (stent) is placed to hold open a narrowed artery.",
      usedFor: "Selected people with a narrowed artery in the neck or brain, to lower the risk of stroke. Surgery or medicines alone may be better for others.",
      service: "carotid_stenting",
    },
  ] satisfies Procedure[],
  whenTitle: "When is neurointerventional care needed?",
  when: [
    "Suspected stroke with signs of a large-vessel blockage — the stroke team decides, often after a CT or MRI with vessel imaging",
    "Sudden 'worst ever' headache from a bleeding aneurysm",
    "An aneurysm or AVM found on a scan",
    "A tightly narrowed neck artery after a stroke or mini-stroke (TIA)",
  ],
  pathwayTitle: "How stroke care fits together",
  pathway: [
    { step: "Recognise", body: "Spot the signs with the KneeTie… Go Run Go test and call 112." },
    { step: "Scan", body: "At hospital, an urgent CT or MRI shows whether it is a clot or a bleed." },
    { step: "Treat", body: "Clot-busting medicine and, for some patients, thrombectomy." },
    { step: "Transfer", body: "If the first hospital has no cath lab, some patients are moved to one that does." },
    { step: "Recover", body: "Prevention of another stroke and rehabilitation." },
  ],
  askTitle: "Questions to ask a hospital",
  ask: [
    "Do you treat stroke 24 hours a day, including weekends?",
    "Can you give clot-busting medicine? Can you do thrombectomy on site?",
    "If not, where do you transfer patients, and how quickly?",
    "Is a neurologist available for emergencies?",
  ],
  reviewStatus: "draft" as "draft" | "in_review" | "reviewed",
  reviewer: null as string | null,
  reviewedAt: null as string | null,
};
