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
