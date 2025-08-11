# shopparo (Vercel)

Marketplace UI + Edge feed proxy.

## Deploy (Quick)
1. Create a new repo and add files from the Deploy Pack.
2. Push to GitHub, then **Import Project** in Vercel.
3. Add env vars (FEED_URL, CACHE_TTL_INVENTORY, CACHE_TTL_CONTENT).
4. Deploy. Visit `/` for the UI and `/api/feed` for proxied XML.

## Scheduling
- **Inventory/Price**: Every 15 minutes (Vercel Cron: `*/15 * * * *`).
- **Content**: Daily at 04:00 UTC (editable in `vercel.json`).

## Domain (GoDaddy)
- A `@` → `76.76.21.21`
- CNAME `www` → `cname.vercel-dns.com`
- In Vercel → Domains: add `shopparo.com` and `www.shopparo.com`.
- Set redirect `shopparo.com` → `www.shopparo.com`.
- Enable HTTPS, then enable **HSTS**.

## Front-end
- Fixed tabs: Women | Men | Kids | Beauty | Home
- Filters: Brand, Price Slider, Availability; Sort: Newest/Price↑/Price↓/Biggest Discount
- Auto-refresh UI shows current interval; server-side cache handles freshness.

## Notes
- If your feed is CORS-restricted, always call `/api/feed` from the client.
- For >250k products, convert to **server indexing** and serve paginated JSON to the UI.
