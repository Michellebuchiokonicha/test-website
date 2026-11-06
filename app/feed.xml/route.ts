import { listPublishedPosts } from "../lib/store";
import { site } from "../content";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const base = site.url.replace(/\/$/, "");
  const posts = (await listPublishedPosts()).slice(0, 30);

  const items = posts
    .map((p) => {
      const url = `${base}/writing/${p.slug}`;
      const html = p.html.replace(/\]\]>/g, "]]&gt;");
      return `<item>
<title>${esc(p.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${new Date(p.publishedAt ?? p.updatedAt).toUTCString()}</pubDate>
<description>${esc(p.summary)}</description>
${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
<content:encoded><![CDATA[${html}]]></content:encoded>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(site.name)}</title>
<link>${base}/writing</link>
<description>${esc(site.tagline)}</description>
<language>en-gb</language>
<atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
