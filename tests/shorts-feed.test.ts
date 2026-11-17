import { describe, expect, it } from "vitest";
import { SHORTS_FEED_URL, parseShortsFeed } from "@/lib/content/shorts-feed";

const entry = (id: string, title: string, published: string) =>
  `<entry><id>yt:video:${id}</id><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${published}</published></entry>`;

describe("Shorts feed", () => {
  it("uses the channel's Shorts playlist", () => {
    expect(SHORTS_FEED_URL).toBe("https://www.youtube.com/feeds/videos.xml?playlist_id=UUSHykhnKilQVya5QDObJ21kaA");
  });
  it("parses entries newest first and decodes titles", () => {
    const xml = `<feed><title>Short videos</title>${entry("aaaaaaaaaaa", "Old", "2026-11-01T00:00:00+00:00")}${entry("bbbbbbbbbbb", "Stroke &amp; you: &quot;act&quot;", "2026-11-16T07:28:42+00:00")}${entry("bad", "No id", "2026-11-17T00:00:00+00:00")}</feed>`;
    expect(parseShortsFeed(xml)).toEqual([
      { id: "bbbbbbbbbbb", title: 'Stroke & you: "act"', published: "2026-11-16T07:28:42+00:00" },
      { id: "aaaaaaaaaaa", title: "Old", published: "2026-11-01T00:00:00+00:00" },
    ]);
  });
});
