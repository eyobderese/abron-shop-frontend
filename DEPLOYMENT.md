# Frontend deployment

This repository is deployment-independent from the API.

1. Deploy the backend first and note its public URL.
2. Set `VITE_API_URL` to the backend URL with `/api/v1` appended.
3. Run `npm run build`, or let the hosting provider run it.
4. Publish `dist`.
5. Add this frontend origin to the backend's `FRONTEND_ORIGIN` value.

For Docker, use `docker compose --env-file .env.production up -d --build`.
