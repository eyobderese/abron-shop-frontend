# Frontend deployment

This repository is deployment-independent from the API.

1. Deploy the backend first and note its public URL.
2. Set `VITE_API_URL` to the backend URL with `/api/v1` appended.
3. Set `VITE_SITE_URL` to the canonical storefront origin and `API_ORIGIN` to the backend origin.
4. Run `npm run build`, or let the hosting provider run it.
5. Publish `dist`.
6. Add this frontend origin to the backend's `FRONTEND_ORIGIN` value and use the same value for its `PUBLIC_SITE_URL`.

For Docker, use `docker compose --env-file .env.production up -d --build`.

For production at `abronshop.online`, use:

```env
VITE_API_URL=https://api.abronshop.online/api/v1
VITE_SITE_URL=https://abronshop.online
API_ORIGIN=https://api.abronshop.online
```

Point both apex and `www` DNS records at the frontend proxy and ensure its TLS certificate covers both names. Caddy permanently redirects `www.abronshop.online` and the legacy category URLs to their canonical equivalents. The outer Hostinger proxy must redirect HTTP to HTTPS.

After deployment, verify:

```bash
curl -I https://www.abronshop.online/
curl -I https://abronshop.online/admin
curl -fsS https://abronshop.online/robots.txt
curl -fsS https://abronshop.online/sitemap.xml
```

The first response should redirect to the apex domain, the admin response should contain `X-Robots-Tag: noindex, follow`, and both SEO files should be available publicly.
