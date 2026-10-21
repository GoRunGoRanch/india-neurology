// Every brand, domain and outreach link lives here so a rename is a one-file change.
// Domain and trademark are still to be chosen (docs/ARCHITECTURE.md, "Open decisions").

export const site = {
  name: { en: "India Neurology Directory", hi: "इंडिया न्यूरोलॉजी डायरेक्टरी" },
  shortName: "IND",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  educationPartner: "KneeTie GoRunGo",
  youtubeChannelUrl: "https://www.youtube.com/c/kneetiegorungo",
  // Optional: set a YouTube video ID to embed a featured lesson on Home and Learn.
  featuredVideoId: "" as string,
  kneetieSiteUrl: "https://kneetie.in",
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
