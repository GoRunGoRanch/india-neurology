import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { site } from "@/lib/site";
import { CONDITIONS } from "@/lib/taxonomy";

// Demo listings are deliberately excluded (they are also noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/find", "/conditions", "/stroke", "/emergency", "/learn", "/about", "/for-providers", ...CONDITIONS.map((c) => `/conditions/${c.slug}`)];
  return paths.flatMap((p) => locales.map((l) => ({ url: `${site.url}/${l}${p}`, alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${site.url}/${x}${p}`])) } })));
}
