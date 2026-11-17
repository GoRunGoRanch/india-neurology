// Every brand, domain and outreach link lives here so a rename is a one-file change.
// KneeTie India (kneetie.in) is the India stroke-centre finder and neurology directory inside the
// KneeTie framework, alongside StrokeGuide (kneetie.mobi) and the @kneetiegorungo channel.

export const site = {
  name: { en: "KneeTie India", hi: "KneeTie इंडिया" },
  shortName: "KneeTie",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  educationPartner: "KneeTie GoRunGo",
  youtubeChannelUrl: "https://www.youtube.com/c/kneetiegorungo",
  youtubeShortsUrl: "https://www.youtube.com/c/kneetiegorungo/shorts",
  founder: {
    name: "Dr. Vivek Baluja",
    linkedinUrl: "https://www.linkedin.com/in/viveckbaluja",
  },
  // Optional: set a YouTube video ID to embed a featured lesson on Home and Learn.
  featuredVideoId: "" as string,
  // KneeTie GoRunGo stroke app for India (families and children).
  // On 2026-10-26 kneetie.in showed the app builder's "Upgrade Required" page instead of the
  // app, so links stay off. Set live: true once the domain serves the app again.
  strokeApp: { url: "https://kneetie.in", live: false },
  // StrokeGuide: clinician decision-support tool for the 2026 AHA/ASA AIS guideline
  // (separate project, ~/strokeguide). Embedded on /[lang]/stroke-tool.
  strokeToolUrl: "https://kneetie.mobi",
  // Paste the published Roblox experience URL here; the button hides while this is empty.
  robloxGameUrl: "" as string,
  contactEmail: "" as string,
  emergency: {
    national: "112",
    // 108 is the ambulance number in most states; 102 is used for some state services.
    // Shown as guidance only — regional arrangements must be verified before launch.
    ambulanceCommon: "108",
  },
} as const;
