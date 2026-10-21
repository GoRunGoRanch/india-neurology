// Condition pages — DRAFT CONTENT, NOT YET CLINICALLY REVIEWED.
// Every entry is reviewStatus "draft" with no reviewer. Pages show a draft banner until a
// medical reviewer signs off (set reviewStatus "reviewed", reviewer and reviewedAt).
// Content is English only for now; Hindi pages show it with a "translation pending" note.

export interface ConditionContent {
  slug: string;
  overview: string;
  symptoms: string[];
  redFlags: string[];
  evaluation: string[];
  treatment: string[];
  faqs: { q: string; a: string }[];
  reviewStatus: "draft" | "in_review" | "reviewed";
  reviewer: string | null;
  reviewedAt: string | null;
}

const draft = { reviewStatus: "draft" as const, reviewer: null, reviewedAt: null };

export const CONDITION_CONTENT: ConditionContent[] = [
  {
    slug: "stroke",
    overview:
      "A stroke happens when blood flow to part of the brain is blocked or a blood vessel in the brain bursts. Brain cells start to be damaged within minutes, so a stroke is always a medical emergency.",
    symptoms: [
      "Sudden drooping or numbness of one side of the face",
      "Sudden weakness or numbness of an arm or leg, usually on one side",
      "Sudden slurred speech or difficulty understanding speech",
      "Sudden loss of vision, dizziness, or loss of balance",
    ],
    redFlags: [
      "Any of the symptoms above, even if they go away — call 112 immediately",
      "A sudden, severe headache unlike any before",
    ],
    evaluation: [
      "An urgent brain scan (CT or MRI) to see whether the stroke is caused by a clot or bleeding",
      "Blood tests, heart rhythm monitoring and blood-vessel imaging",
    ],
    treatment: [
      "For some clot-related strokes, clot-busting medicine or clot removal — these work best when given as early as possible",
      "Treatment of the cause and prevention of another stroke",
      "Rehabilitation: physiotherapy, speech therapy and occupational therapy",
    ],
    faqs: [
      { q: "Can young people and children have a stroke?", a: "Yes. Stroke is more common in older adults, but it can happen at any age, including in children." },
      { q: "What if the symptoms went away?", a: "Symptoms that go away can be a warning stroke (TIA). It still needs urgent medical assessment." },
    ],
    ...draft,
  },
  {
    slug: "epilepsy",
    overview:
      "Epilepsy is a condition in which a person has repeated seizures. A seizure is a sudden burst of abnormal electrical activity in the brain that can change movement, awareness, feelings or behaviour.",
    symptoms: ["Shaking or stiffening of the body", "Staring spells or brief loss of awareness", "Sudden confusion, unusual sensations or behaviour"],
    redFlags: [
      "A seizure lasting more than 5 minutes, or seizures one after another — call 112",
      "A first-ever seizure, injury during a seizure, or difficulty breathing afterwards",
    ],
    evaluation: ["A detailed description of the events, ideally with a video", "EEG and brain imaging (MRI or CT)", "Blood tests"],
    treatment: ["Anti-seizure medicines, taken regularly", "For some people, surgery, special diets or devices", "Safety planning for school, work and travel"],
    faqs: [
      { q: "Should I put something in the person's mouth during a seizure?", a: "No. Turn them onto their side, protect their head, and time the seizure." },
      { q: "Can people with epilepsy live normal lives?", a: "Many people with epilepsy control their seizures with treatment and study, work and marry like anyone else." },
    ],
    ...draft,
  },
  {
    slug: "headache-migraine",
    overview:
      "Headaches are very common, and most are not dangerous. Migraine is a common type of recurring headache that can come with nausea, sensitivity to light or sound, or visual changes.",
    symptoms: ["Throbbing headache, often on one side", "Nausea or vomiting", "Sensitivity to light, sound or smell", "Visual changes (aura) before the headache"],
    redFlags: [
      "A sudden, severe 'worst ever' headache",
      "Headache with fever and stiff neck, confusion, weakness, or loss of vision",
      "A new headache after a head injury, or a new headache pattern after age 50",
    ],
    evaluation: ["A careful history and examination", "Scans or other tests only when warning features are present"],
    treatment: ["Identifying and managing triggers", "Medicines to treat attacks, and preventive medicines for frequent attacks", "Avoiding overuse of painkillers, which can worsen headaches"],
    faqs: [{ q: "Do I need a scan for every headache?", a: "Usually not. A doctor will advise a scan if there are warning signs." }],
    ...draft,
  },
  {
    slug: "parkinsons",
    overview:
      "Parkinson disease is a long-term condition that affects movement. It develops slowly and is caused by the loss of certain brain cells that help control movement.",
    symptoms: ["Shaking (tremor), often starting in one hand", "Slowness of movement", "Stiffness of muscles", "Changes in walking and balance"],
    redFlags: ["Frequent falls", "Sudden worsening, confusion, or difficulty swallowing"],
    evaluation: ["Diagnosis is mainly based on examination by a neurologist", "Tests may be used to rule out other causes"],
    treatment: ["Medicines that improve movement symptoms", "Physiotherapy, exercise and speech therapy", "For some people, advanced treatments such as deep brain stimulation"],
    faqs: [{ q: "Is every tremor Parkinson disease?", a: "No. There are many causes of tremor. A neurologist can help tell them apart." }],
    ...draft,
  },
  {
    slug: "dementia",
    overview:
      "Dementia is a group of conditions in which memory, thinking and daily functioning decline more than expected with normal ageing. Alzheimer disease is the most common cause.",
    symptoms: ["Forgetting recent events or repeating questions", "Getting lost in familiar places", "Difficulty with planning, money or daily tasks", "Changes in mood or behaviour"],
    redFlags: ["Sudden confusion over hours or days — this needs urgent medical review", "Memory changes with weakness, falls or seizures"],
    evaluation: ["Memory and thinking tests", "Blood tests to look for treatable causes", "Brain imaging"],
    treatment: ["Treating reversible causes where found", "Medicines that may help some symptoms", "Support for the person and their caregivers"],
    faqs: [{ q: "Is memory loss a normal part of ageing?", a: "Mild forgetfulness can be normal. Memory loss that affects daily life should be checked by a doctor." }],
    ...draft,
  },
  {
    slug: "multiple-sclerosis",
    overview:
      "Multiple sclerosis (MS) is a condition in which the immune system attacks the protective covering of nerves in the brain and spinal cord.",
    symptoms: ["Blurred or painful vision in one eye", "Numbness or tingling", "Weakness, stiffness or balance problems", "Tiredness and bladder problems"],
    redFlags: ["New or rapidly worsening weakness, vision loss or difficulty walking"],
    evaluation: ["MRI of the brain and spinal cord", "Sometimes a lumbar puncture and other tests"],
    treatment: ["Treatment for relapses", "Long-term disease-modifying medicines", "Rehabilitation and symptom management"],
    faqs: [{ q: "Does MS occur in India?", a: "Yes. MS occurs in India, and early diagnosis helps people access treatment sooner." }],
    ...draft,
  },
  {
    slug: "neuropathy",
    overview:
      "Neuropathy means damage to the nerves outside the brain and spinal cord. Diabetes is a common cause, but there are many others.",
    symptoms: ["Tingling, burning or numbness, often in the feet first", "Weakness in the hands or feet", "Loss of balance"],
    redFlags: ["Weakness that spreads quickly over days, especially with difficulty breathing or swallowing — seek urgent care"],
    evaluation: ["Examination of nerves and reflexes", "Blood tests", "Nerve conduction studies and EMG"],
    treatment: ["Treating the cause, such as controlling blood sugar", "Medicines for nerve pain", "Foot care and physiotherapy"],
    faqs: [{ q: "Why is foot care important?", a: "Numb feet can be injured without noticing. Check your feet daily if you have neuropathy." }],
    ...draft,
  },
  {
    slug: "pediatric-neurology",
    overview:
      "Children's neurology covers conditions of the brain, spinal cord, nerves and muscles in babies, children and teenagers, including seizures, developmental concerns and headaches.",
    symptoms: ["Seizures or unusual movements", "Delay in reaching milestones", "Frequent headaches", "Weakness or changes in walking"],
    redFlags: [
      "A seizure lasting more than 5 minutes, or a child who does not wake up normally afterwards",
      "Sudden weakness, trouble speaking, or a severe headache — children can have strokes too",
    ],
    evaluation: ["History and examination by a paediatric neurologist", "EEG, imaging or other tests when needed"],
    treatment: ["Depends on the condition", "Therapies such as physiotherapy, speech and occupational therapy", "Support at school"],
    faqs: [{ q: "Can children have strokes?", a: "Yes. Stroke in children is less common but real, and fast action matters just as much." }],
    ...draft,
  },
  {
    slug: "neuromuscular",
    overview:
      "Neuromuscular disorders affect the nerves that control muscles, the junction between nerve and muscle, or the muscles themselves.",
    symptoms: ["Muscle weakness that may worsen over time", "Drooping eyelids or double vision", "Muscle cramps or wasting", "Difficulty climbing stairs or lifting"],
    redFlags: ["Difficulty breathing or swallowing — seek urgent care"],
    evaluation: ["EMG and nerve conduction studies", "Blood tests", "Sometimes muscle biopsy or genetic tests"],
    treatment: ["Treatment depends on the cause", "Physiotherapy and supportive care"],
    faqs: [{ q: "Are neuromuscular disorders inherited?", a: "Some are inherited and some are not. A neurologist can advise on testing." }],
    ...draft,
  },
  {
    slug: "neurorehabilitation",
    overview:
      "Neurorehabilitation helps people recover function and independence after stroke, brain or spinal injury, and in long-term neurological conditions.",
    symptoms: ["Used after: stroke, head injury, spinal cord injury, Parkinson disease, MS and more"],
    redFlags: ["New weakness, speech change or confusion during rehabilitation — call 112, it may be a new stroke"],
    evaluation: ["Assessment of movement, speech, swallowing, thinking and daily activities"],
    treatment: ["Physiotherapy", "Speech and swallowing therapy", "Occupational therapy", "Caregiver training and home adaptations"],
    faqs: [{ q: "When should rehabilitation start after a stroke?", a: "Your care team will advise. Rehabilitation usually starts in hospital once the person is stable." }],
    ...draft,
  },
];

export function conditionContent(slug: string) {
  return CONDITION_CONTENT.find((c) => c.slug === slug);
}
