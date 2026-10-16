# GameClub Astro frontend handoff

This folder contains only the Astro website frontend. It does not include the FastAPI backend or Flutter client.

## Run locally

Requires Node.js and npm.

```sh
npm ci
npm run dev
```

The development server proxies `/api`, `/media`, and RSS requests to `http://127.0.0.1:8000` by default. Set `GAMECLUB_BACKEND_URL` to a different backend URL when needed.

## Production SSR

```sh
npm ci
npm run build
npm start
```

Set `GAMECLUB_BACKEND_URL` to the reachable FastAPI service address for server-side API, media, and RSS proxy routes. Astro uses the Node standalone adapter.
