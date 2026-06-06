# OwlOps Inventory Control — Live (self-contained proxy)

A live inventory dashboard for the **OwlOps Public API**. It includes a tiny Node
proxy that holds your API key **server-side** and adds CORS, so the browser can
load real data. The key is never exposed to the client, and there is no demo mode.

```
GET /v1/inventory          → list (paginated, filters: assetType, stockState, page, pageSize)
GET /v1/inventory/{id}      → single item detail
Auth:  X-Api-Key: owlk_…    (injected by the proxy, not the browser)
```

---

## Run locally (30 seconds)

Requires Node 18+.

```bash
npm start
# open http://localhost:8080
```

Use a different key without editing files:

```bash
API_KEY=owlk_yourkey npm start
```

You should see the status badge turn **🟢 LIVE · OWLOPS** with real items.

---

## Deploy publicly (so anyone can open it) — pick one

### A) Render (free, recommended)
1. Push this folder to a GitHub repo (or use Render's "Deploy from a Git repo").
2. On https://render.com → **New → Web Service** → pick the repo.
3. Render auto-detects `render.yaml` (Node, `npm start`, health check `/healthz`, and
   the `API_KEY` env var). Click **Create Web Service**.
4. You get a public URL like `https://owlops-inventory-control.onrender.com` — open it.
   It serves the app **and** the live API proxy together. No 403, real data for everyone.

> The API key is set as an environment variable in `render.yaml`. For best security,
> remove it from the file and set it in the Render dashboard (Environment tab) instead.

### B) Railway
1. https://railway.app → **New Project → Deploy from GitHub repo**.
2. Railway runs `npm start` and assigns `PORT` automatically.
3. Add an env var `API_KEY=owlk_…` in the project settings. Done.

### C) Fly.io / any Docker host
A `Dockerfile` is included:
```bash
fly launch        # or: docker build -t owlops . && docker run -p 8080:8080 owlops
```

### D) Vercel / Netlify
These are primarily static hosts. Deploy `server.js` as a serverless function
(rename to `/api/[...path].js` for Vercel) or use one of the Node hosts above —
the included `server.js` is simplest on Render/Railway/Fly.

---

## How it works (no CORS headaches)

```
Browser ──fetch /api/v1/inventory──▶  server.js  ──X-Api-Key──▶  OwlOps API
        ◀──── JSON + CORS ──────────             ◀──── JSON ────
```

The OwlOps API sends no `Access-Control-Allow-Origin`, so browsers block direct
calls. Routing through this same-origin proxy fixes that and keeps the key secret.

## Files
- `index.html` — the app (calls same-origin `/api`; override with `?api=https://your-proxy`)
- `server.js`  — proxy + static server (reads `PORT`, `API_KEY`, `UPSTREAM` from env)
- `package.json`, `render.yaml`, `Dockerfile` — deploy configs
