# Deploying Climate Globe to GitHub and Hosting

This guide covers pushing the project to GitHub and hosting the **Next.js frontend** and **FastAPI backend** separately (recommended for free tiers and simple config).

---

## 1. Push to GitHub

### One repo (monorepo) — recommended

Your app is already one folder with `app/`, `components/`, `lib/` (frontend) and `backend/` (API). Push it as a single repo.

**If you don’t have a repo yet:**

```bash
cd /Users/zed/Documents/climate-globe

# Ignore build artifacts and secrets (already in .gitignore)
# Add Python cache if not already ignored
echo "/backend/__pycache__/" >> .gitignore

# Init git (if not already)
git init
git add .
git commit -m "Initial commit: Climate Globe frontend + backend"

# Create a new repo on GitHub (github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/climate-globe.git
git branch -M main
git push -u origin main
```

**If the project is already a git repo:** ensure `.env`, `.env.local`, and `node_modules` are not tracked, then push to your existing remote or add a new one.

---

## 2. Host the backend (FastAPI)

Host the **backend** first so you have a public API URL for the frontend.

### Option A: Render (free tier)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New → Web Service**.
3. Connect the `climate-globe` repo.
4. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment:**
   - `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app` (use your real Vercel URL after you deploy the frontend; you can add it later).
6. Deploy. Note the URL, e.g. `https://climate-globe-api.onrender.com`.

Render free tier spins down after inactivity; first request after a while can be slow.

### Option B: Railway

1. Go to [railway.app](https://railway.app) and connect GitHub.
2. **New Project → Deploy from GitHub** → select `climate-globe`.
3. Set **Root Directory** to `backend` (in project settings).
4. Railway detects Python and runs the app; ensure start is: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. **Variables:** add `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app`.
6. Deploy and copy the public URL (e.g. `https://xxx.up.railway.app`).

### Backend CORS

The backend reads `ALLOWED_ORIGINS` (comma-separated). Include your **production frontend URL** (and keep localhost for local dev if you want):

- Example: `https://climate-globe.vercel.app,http://localhost:3000`

Update this in the hosting dashboard after you know the frontend URL.

---

## 3. Host the frontend (Next.js)

### Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New → Project** and import the `climate-globe` repo.
3. **Root Directory:** leave as `.` (repo root).
4. **Framework Preset:** Next.js (auto-detected).
5. **Environment variables:**
   - Name: `NEXT_PUBLIC_API_URL`  
   - Value: your **backend URL** from step 2 (e.g. `https://climate-globe-api.onrender.com`).  
   No trailing slash.
6. Deploy. Vercel will build (`npm run build`) and give you a URL like `https://climate-globe-xxx.vercel.app`.

After the first deploy, go back to your **backend** hosting (Render/Railway) and set:

- `ALLOWED_ORIGINS` = `https://climate-globe-xxx.vercel.app`  
(and any other origins you need, e.g. a custom domain).

---

## 4. Summary checklist

| Step | Where | What |
|------|--------|------|
| 1 | GitHub | Push repo (frontend + backend in one repo). |
| 2 | Render or Railway | Deploy `backend/`; set start to `uvicorn main:app --host 0.0.0.0 --port $PORT`; set `ALLOWED_ORIGINS` to your frontend URL (or add it after step 3). |
| 3 | Vercel | Deploy repo root; set `NEXT_PUBLIC_API_URL` to your backend URL. |
| 4 | Backend | Update `ALLOWED_ORIGINS` with the final Vercel (or custom) frontend URL. |

---

## 5. Local vs production

- **Local:**  
  - Frontend: `npm run dev` → `http://localhost:3000`  
  - Backend: `cd backend && python main.py` or `uvicorn main:app --reload` → `http://localhost:8000`  
  - `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000`  
  - Backend: `ALLOWED_ORIGINS` can include `http://localhost:3000`.

- **Production:**  
  - Frontend uses `NEXT_PUBLIC_API_URL` (set in Vercel).  
  - Backend uses `ALLOWED_ORIGINS` (set in Render/Railway) so the browser allows requests from your Vercel URL.

---

## 6. Optional: custom domains

- **Vercel:** Project → Settings → Domains → add your domain.
- **Render/Railway:** Service → Settings → add custom domain.
- After adding domains, update `ALLOWED_ORIGINS` and `NEXT_PUBLIC_API_URL` to use the new URLs if needed.
