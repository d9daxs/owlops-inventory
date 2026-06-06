# Deploy to GitHub → Render (step by step)

This gets your OwlOps Inventory app live on a **public URL anyone can open**, with the
API key kept safely on the server. Total time: ~5–10 minutes. No coding required.

You will do two things:
1. Put the `owlops-deploy` folder into a **GitHub repository**.
2. Connect that repo to **Render**, which runs it and gives you a public URL.

---

## PART 1 — Put the code on GitHub

### Option 1A: Using the GitHub website (easiest, no command line)

1. Go to https://github.com and sign in (create a free account if needed).
2. Click the **+** (top-right) → **New repository**.
   - **Repository name:** `owlops-inventory` (anything works)
   - **Visibility:** Private is fine (Render can still read it).
   - Do **not** add a README/.gitignore (we already have them).
   - Click **Create repository**.
3. On the new empty repo page, click **“uploading an existing file”** (a link in the
   “Quick setup” box), or go to **Add file → Upload files**.
4. Drag in the **contents of the `owlops-deploy` folder** — i.e. these files:
   ```
   index.html
   server.js
   package.json
   render.yaml
   Dockerfile
   .gitignore
   README.md
   ```
   > Important: upload the *files themselves*, not the `owlops-deploy` folder wrapper,
   > so that `package.json` and `server.js` sit at the **repo root**.
5. Click **Commit changes**. Done — your code is on GitHub.

### Option 1B: Using Git on your computer (command line)

```bash
# from inside the owlops-deploy folder
git init
git add .
git commit -m "OwlOps inventory app + proxy"
git branch -M main

# create the repo on github.com first, then copy its URL and run:
git remote add origin https://github.com/YOUR-USERNAME/owlops-inventory.git
git push -u origin main
```

---

## PART 2 — Deploy on Render

1. Go to https://render.com and **sign up / log in** (you can sign in *with GitHub*,
   which makes the next step automatic).
2. Click **New +** (top-right) → **Web Service**.
3. **Connect your repository:**
   - If you signed in with GitHub, pick `owlops-inventory` from the list.
   - Otherwise click **Connect GitHub**, authorize Render, then select the repo.
4. Render reads the included **`render.yaml`** and pre-fills everything:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check:** `/healthz`
   - **Plan:** Free
   - **Env var:** `API_KEY` is already set.
   Just confirm and click **Create Web Service**.
   > If Render asks instead of auto-filling (older UI), enter:
   > Build = `npm install`, Start = `npm start`, and add the env vars from PART 3.
5. Watch the log. When it says **“Live”** (1–2 min), click the URL at the top, e.g.
   **`https://owlops-inventory.onrender.com`**.
   You'll see the dashboard with the status badge **🟢 LIVE · OWLOPS** and real data.
   Share that URL with anyone — no 403.

---

## PART 3 — (Recommended) Keep the API key out of the repo

The `render.yaml` includes the key for convenience. For better security, store it only
in Render instead of in your GitHub repo:

1. **Edit `render.yaml`** before pushing (or in GitHub) and delete the value, leaving:
   ```yaml
   envVars:
     - key: API_KEY
       sync: false        # tells Render to ask for it in the dashboard
     - key: UPSTREAM
       value: https://api-owlops-public-bugrb4gxeqcghqh5.eastus2-01.azurewebsites.net
   ```
2. In Render → your service → **Environment** tab → **Add Environment Variable**:
   - Key: `API_KEY`
   - Value: `owlk_6oQwhlI8gzw9_8y4RD7V8acEcz-JIOrPyBigAgFuYkE`
   - Save. Render redeploys automatically.

Now the secret lives only in Render, never in your code.

---

## Updating later
Push any change to GitHub (upload a new file or `git push`). Render **auto-redeploys**
on every push to the `main` branch.

## Troubleshooting
- **Build fails:** make sure `package.json` and `server.js` are at the **repo root**
  (not inside an extra `owlops-deploy/` folder).
- **App loads but no data / "Connection error":** check the `API_KEY` env var in Render
  is exactly `owlk_6oQwhlI8gzw9_8y4RD7V8acEcz-JIOrPyBigAgFuYkE` (no spaces).
- **Free plan sleeps:** Render's free web services sleep after ~15 min idle and take a few
  seconds to wake on the next visit. Upgrade to a paid instance to keep it always-on.
- **Health check:** visit `https://your-app.onrender.com/healthz` — it should say `ok`.
- **Verify the proxy:** `https://your-app.onrender.com/api/v1/inventory?page=1&pageSize=1`
  should return JSON with `"totalCount": 266`.
