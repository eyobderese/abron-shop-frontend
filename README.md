# Abron Shop Frontend

Standalone React/Vite storefront for Abron Shop. The backend is maintained and deployed from a separate repository.

## Requirements

- Node.js 22+
- npm
- A running Abron Shop API

## Local development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The example environment targets `http://localhost:3000/api/v1`. Vite also proxies `/api` and `/uploads` to port 3000 during local development.

## Environment

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full public API base URL, including `/api/v1` |
| `VITE_SITE_URL` | Canonical public storefront origin, without a trailing slash |
| `API_ORIGIN` | Runtime API origin used by Caddy to proxy `/sitemap.xml` |

`VITE_API_URL` is embedded at build time. Set it in the frontend deployment platform and rebuild whenever the API URL changes.

## Validation

```bash
npm run lint
npm run build
```

## Docker

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production up -d --build
```

The container serves the single-page application on `http://localhost:8080` by default. The backend is not bundled or proxied by this container.

## Deployment

Static hosts such as Vercel, Cloudflare Pages, or Netlify can deploy this repository independently:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-api.example.com/api/v1`

The API must allow the deployed frontend origin through its `FRONTEND_ORIGIN` setting.

## SEO foundation

- Public home, category, and product routes publish unique titles, descriptions, canonical URLs, social metadata, and JSON-LD.
- Product JSON-LD reflects the visible USD price and stock status.
- Search, administration, and not-found views are marked `noindex`.
- `robots.txt` references `https://abronshop.online/sitemap.xml`.
- Caddy proxies that URL to the live database-driven sitemap from the backend.

After deployment, add `abronshop.online` as a Domain property in Google Search Console, verify it with the DNS TXT record Google provides, submit `/sitemap.xml`, and inspect the homepage, one category, and one product URL.

This remains a client-rendered SPA. Metadata becomes available after JavaScript executes, and the static fallback can still return HTTP 200 for an unknown path. Server rendering or build-time pre-rendering of public catalog routes should be a later SEO phase if indexing reports show rendering or soft-404 problems.
