import { site } from "../site";
import type { Short } from "./shorts";

export interface FeedShort extends Short {
  published: string;
}

/** The channel's own Shorts playlist, as YouTube's public RSS feed (newest 15, no API key). */
export const SHORTS_FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=UUSH${site.youtubeChannelId.replace(/^UC/, "")}`;

const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

export function parseShortsFeed(xml: string): FeedShort[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, e]) => ({
      id: e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "",
      title: decode(e.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim(),
      published: e.match(/<published>([^<]+)<\/published>/)?.[1] ?? "",
    }))
    .filter((s) => /^[\w-]{11}$/.test(s.id) && s.title)
    .sort((a, b) => b.published.localeCompare(a.published));
}

/**
 * The newest Shorts on the KneeTie GoRunGo channel, refreshed hourly. On any error it returns an
 * empty list and the page simply leaves the section out.
 */
export async function fetchLatestShorts(limit = 10): Promise<FeedShort[]> {
  try {
    const res = await fetch(SHORTS_FEED_URL, { next: { revalidate: 3600, tags: ["youtube-shorts"] } });
    if (!res.ok) throw new Error(`Shorts feed ${res.status}`);
    return parseShortsFeed(await res.text()).slice(0, limit);
  } catch (err) {
    console.error("Could not load the Shorts feed", err);
    return [];
  }
}
