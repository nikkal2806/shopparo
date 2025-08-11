export const config = { runtime: "edge" };

// Simple in-memory cache for Edge (per region). For production scale, use KV (Upstash/Cloudflare) or Vercel Blob.
let cache: { data?: string; ts?: number; contentTs?: number } = {};

async function fetchFeed(src: string): Promise<string> {
  const res = await fetch(src, { headers: { "user-agent": "shopparo-bot/1.0" } });
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
  return await res.text();
}

function shouldRefresh(ts: number | undefined, ttl: number) {
  if (!ts) return true;
  return Date.now() - ts > ttl * 1000;
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "proxy";
  const src = url.searchParams.get("src") || process.env.FEED_URL;
  if (!src) return new Response("Missing src", { status: 400 });

  const INVENTORY_TTL = Number(process.env.CACHE_TTL_INVENTORY || 900);
  const CONTENT_TTL = Number(process.env.CACHE_TTL_CONTENT || 86400);

  try {
    if (mode === "refresh-inventory") {
      if (shouldRefresh(cache.ts, INVENTORY_TTL)) {
        cache.data = await fetchFeed(src);
        cache.ts = Date.now();
      }
      return new Response("ok", { status: 200 });
    }

    if (mode === "refresh-content") {
      if (shouldRefresh(cache.contentTs, CONTENT_TTL)) {
        cache.data = await fetchFeed(src);
        cache.ts = Date.now();
        cache.contentTs = Date.now();
      }
      return new Response("ok", { status: 200 });
    }

    // default: proxy, with on-demand refresh if stale
    if (!cache.data || shouldRefresh(cache.ts, INVENTORY_TTL)) {
      cache.data = await fetchFeed(src);
      cache.ts = Date.now();
    }
    // Return XML by default; the front-end parser expects XML text
    return new Response(cache.data, { status: 200, headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=60" } });
  } catch (e: any) {
    return new Response(`feed error: ${e?.message || e}`, { status: 500 });
  }
}
