# Taskify — Team Task Manager

Full-stack web app for managing teams, projects, and tasks with role-based access (Admin / Member).

**Stack:** React + Vite (frontend) · Express (backend) · PostgreSQL (database) · Prisma (ORM) · JWT (auth)

---

## Before you start

Make sure you have these installed on your computer:

| Tool | How to check | Download |
|------|--------------|----------|
| **Node.js** (v18+) | Open terminal → `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | `npm -v` | Comes with Node.js |
| **Git** (optional, for GitHub) | `git -v` | [git-scm.com](https://git-scm.com) |

You also need:

- A **Railway** account → [railway.app](https://railway.app) (sign in with GitHub)
- This project folder on your PC, e.g. `C:\Users\beras\OneDrive\Desktop\Taskify`

---

## Project folder layout

After cloning or downloading, your folder should look like this:

```
Taskify/                    ← project root (open this in Cursor)
├── client/                 ← React frontend (runs on port 5173)
│   ├── src/
│   └── package.json
├── server/                 ← Express API (runs on port 5000)
│   ├── src/
│   ├── prisma/             ← database schema lives here
│   ├── .env                ← secrets (database URL, JWT key) — YOU edit this
│   ├── .env.example        ← template copy of .env
│   └── package.json
├── package.json            ← root scripts (optional shortcuts)
└── README.md               ← this file
```

**Important paths on your machine:**

| What | Path |
|------|------|
| Project root | `C:\Users\beras\OneDrive\Desktop\Taskify` |
| Backend folder | `C:\Users\beras\OneDrive\Desktop\Taskify\server` |
| Frontend folder | `C:\Users\beras\OneDrive\Desktop\Taskify\client` |
| Environment file | `C:\Users\beras\OneDrive\Desktop\Taskify\server\.env` |

---

## How to open a terminal (where you run commands)

You will run commands in a **terminal**. In **Cursor** (or VS Code):

1. Menu → **Terminal** → **New Terminal** (or press **Ctrl + `**)
2. The terminal opens at the bottom of the editor
3. Check which folder you are in — the path is shown before the `>` prompt

**Always `cd` into the correct folder before running a command.**

Example — go to the server folder:

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\server
```

Example — go to the project root:

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify
```

> **Tip:** If a command says `npm run dev` for the server, your terminal prompt should show `...\Taskify\server>` before you run it.

---

## Step 0 — Install dependencies (first time only)

Run these **once** after downloading the project.

### 0a. Install server packages

**Where:** Terminal  
**Folder:** `Taskify\server`

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\server
npm install
```

**Success:** No errors; a `node_modules` folder appears inside `server/`.

### 0b. Install client packages

**Where:** Terminal (same or new terminal)  
**Folder:** `Taskify\client`

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\client
npm install
```

**Success:** No errors; a `node_modules` folder appears inside `client/`.

**Alternative (from project root):**

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify
npm run install:all
```

---

## Step 1 — Create a Railway project, then add PostgreSQL

**Where:** Web browser → [railway.app](https://railway.app)  
**You do NOT run terminal commands in this step.**

Railway’s UI changed — you **won’t** see “Provision PostgreSQL” on the first screen anymore. You create an **empty project first**, then add the database inside it.

---

### 1a. Create an empty project

1. Go to [railway.app](https://railway.app) and sign in with **GitHub**.
2. Click **+ New Project** (top right) or **Create a New Project**.
3. On the “Create a New Project” page, choose one of these:
   - **Empty Project** ← easiest for this assignment
   - or **Deploy from GitHub repo** (only if you already pushed Taskify to GitHub)

4. Railway opens your **project canvas** — a dark workspace with a dotted grid. It may look empty at first. That is normal.

**What you should see:** A project name at the top (e.g. “ gracious-compassion ”) and an empty canvas, or a “+ New” button.

---

### 1b. Add PostgreSQL to the project

**Do this on the project canvas** (inside your project, not on the dashboard).

**Method A — + New button (most common)**

1. On the project canvas, click **+ New** (top-right of the canvas area).
2. A menu opens. Click **Database**.
3. Click **PostgreSQL** (elephant icon).
4. Wait ~30 seconds. A new box/card appears labeled **PostgreSQL**.

**Method B — Command palette**

1. On the project canvas, press **Ctrl + K** (Windows) or **Cmd + K** (Mac).
2. Type `PostgreSQL` or look for **Add PostgreSQL**.
3. Select it and wait for deployment.

**Method C — Terminal (if the website is confusing)**

**Where:** Terminal in Cursor  
**Folder:** `Taskify\server`

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\server
npx @railway/cli login
npx @railway/cli init
npx @railway/cli add --database postgres
```

Follow the prompts to create/link a project. Skip this if Method A or B worked.

---

**Success:** Your project canvas shows a **PostgreSQL** service box. Click it — tabs like **Deployments**, **Database**, **Variables**, **Settings** should appear.

**If you still don’t see “Database” in the + New menu:** Make sure you clicked **+ New** on the **project canvas** (inside a project), not on the Railway home dashboard.

---

## Step 2 — Get your database connection URL

**Where:** Railway website → your project → PostgreSQL service  
**You are copying a URL from Railway into a file on your PC.**

### 2a. Open the PostgreSQL service

1. In your Railway project, **click the PostgreSQL card/box**.
2. You should see tabs like: **Deployments**, **Database**, **Backups**, **Variables**, **Metrics**, **Settings**.

### 2b. Enable public access (required for local development)

Railway databases are private by default. Your PC needs a **public** connection to talk to the database while developing locally.

1. Click the **Connect** tab (or look under **Networking** / **TCP Proxy** in **Settings**).
2. Find **Public Network** or **Enable TCP Proxy**.
3. **Turn it ON**.
4. Railway will show a connection string. Copy the full URL.

   It looks like this:

   ```
   postgresql://postgres:SomeLongPassword@shortline.proxy.rlwy.net:12345/railway
   ```

### 2c. Alternative — copy from Variables tab

1. Click the **Variables** tab on the PostgreSQL service.
2. Look for one of these variable names:
   - `DATABASE_PUBLIC_URL` ← **use this for local dev**
   - `DATABASE_URL` ← internal URL (works when app is deployed on Railway, not always from your PC)
3. Click the **copy icon** next to the value.

**How to tell public vs internal:**

| URL contains | Use for |
|--------------|---------|
| `proxy.rlwy.net` | ✅ Local development on your PC |
| `railway.internal` | ❌ Only works inside Railway (not from your PC) |

**Save this URL somewhere temporarily** (Notepad) — you will paste it into `.env` in the next step.

---

## Step 3 — Configure environment variables

**Where:** Cursor / VS Code → edit a file on your PC  
**File to edit:** `server/.env`

### 3a. Create `.env` if it does not exist

**Where:** Terminal  
**Folder:** `Taskify\server`

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\server
copy .env.example .env
```

If `.env` already exists, skip this and open it directly.

### 3b. Open `server/.env` in the editor

In Cursor:

1. Open the file explorer (left sidebar)
2. Expand **server**
3. Click **`.env`** (if hidden, it may be under "excluded" files — you can still open it via **File → Open File**)

### 3c. Fill in each variable

Replace the contents with your real values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/railway?sslmode=require"
JWT_SECRET="4aab7a7918167457a56f0fa7b116525121017e1ac676fda4346206ef44158e74"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

| Variable | Where to get the value | What it does |
|----------|------------------------|--------------|
| `DATABASE_URL` | Railway → PostgreSQL → **Connect** or **Variables** → copy public URL | Tells Prisma how to connect to your database |
| `JWT_SECRET` | Generate yourself (see below) or use the example above | Signs login tokens — keep this secret |
| `PORT` | Leave as `5000` | Port the API runs on locally |
| `CLIENT_URL` | Leave as `http://localhost:5173` | Allows the React app to call the API |

**About `DATABASE_URL`:**

- Paste the **full URL** you copied from Railway.
- If the URL does **not** end with `?sslmode=require`, add it manually:

  ```
  .../railway?sslmode=require
  ```

- Keep the whole value in **double quotes**.

**Generate a new JWT secret (optional):**

**Where:** Terminal (any folder)

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in `.env`.

### 3d. Save the file

Press **Ctrl + S**. The `.env` file is **never** uploaded to GitHub (it is in `.gitignore`).

---

## Step 4 — Create database tables

**Where:** Terminal  
**Folder:** `Taskify\server`  
**What this does:** Sends your Prisma schema (`server/prisma/schema.prisma`) to Railway and creates the User, Team, Project, Task tables.

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\server
npx prisma db push
```

**Success looks like:**

```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "railway" ...
Your database is now in sync with your Prisma schema.
```

**If it fails**, see [Troubleshooting](#troubleshooting) at the bottom.

**Optional — verify in Railway:**

1. Railway → PostgreSQL service → **Database** tab (or **Data**)
2. You may see tables: `User`, `Team`, `TeamMember`, `Project`, `Task`

---

## Step 5 — Run the app locally

You need **two terminals open at the same time** — one for the backend, one for the frontend. Both must stay running while you use the app.

### 5a. Start the backend (API)

**Where:** Terminal 1  
**Folder:** `Taskify\server`

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\server
npm run dev
```

**Success looks like:**

```
Server running on http://localhost:5000
```

**Leave this terminal open.** Do not close it.

**Quick test:** Open a browser and go to [http://localhost:5000/api/health](http://localhost:5000/api/health). You should see:

```json
{"status":"ok","message":"Taskify API is running"}
```

### 5b. Start the frontend (React app)

**Where:** Terminal 2 — click **+** in the terminal panel to open a **new** terminal  
**Folder:** `Taskify\client`

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\client
npm run dev
```

**Success looks like:**

```
  VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

**Leave this terminal open too.**

### 5c. Open the app in your browser

**Where:** Web browser

1. Go to **http://localhost:5173**
2. Click **Sign up**
3. Enter name, email, and password (minimum 6 characters)
4. After signup, you are redirected to the **Dashboard**

**Note:** The **first user** to sign up automatically becomes **ADMIN**. Every user after that is **MEMBER**.

---

## Daily development workflow

Once everything is set up, each time you work on the project:

1. Open Cursor → open the `Taskify` folder
2. **Terminal 1:** `cd server` → `npm run dev`
3. **Terminal 2:** `cd client` → `npm run dev`
4. Browser → **http://localhost:5173**

You only need to run `npx prisma db push` again if the database schema changes.

---

## API endpoints (auth)

Base URL locally: **http://localhost:5000**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | No | Check if API is running |
| POST | `/api/auth/signup` | No | Create account — body: `{ name, email, password }` |
| POST | `/api/auth/login` | No | Log in — body: `{ email, password }` |
| GET | `/api/auth/me` | Yes (Bearer token) | Get current logged-in user |

The frontend talks to `/api/...` through a Vite proxy (`client/vite.config.ts`), so from the browser it uses the same origin as the React app.

---

## Troubleshooting

### `Can't reach database server at ...` (Prisma P1001)

**Cause:** Wrong URL or public networking not enabled.

**Fix:**

1. Railway → PostgreSQL → **Connect** → enable **Public Network**
2. Copy the URL that contains `proxy.rlwy.net`
3. Paste into `server/.env` as `DATABASE_URL`
4. Add `?sslmode=require` at the end
5. Run `npx prisma db push` again from `Taskify\server`

---

### SSL / certificate errors

**Fix:** Make sure `DATABASE_URL` ends with:

```
?sslmode=require
```

---

### `Authentication failed` or wrong password

**Fix:**

1. Railway → PostgreSQL → **Variables**
2. Copy `DATABASE_PUBLIC_URL` again (Railway may rotate credentials)
3. Update `server/.env` and save
4. Retry `npx prisma db push`

---

### Frontend loads but signup/login fails

**Checklist:**

1. Is the server terminal running? (`npm run dev` in `server/`)
2. Does [http://localhost:5000/api/health](http://localhost:5000/api/health) work?
3. Did `npx prisma db push` succeed?
4. Check the **server terminal** for error messages when you click Sign up

---

### Port already in use

**Fix:** Another app is using port 5000 or 5173. Close other dev servers, or change `PORT` in `server/.env`.

---

### `npm` or `node` is not recognized

**Fix:** Install Node.js from [nodejs.org](https://nodejs.org), restart Cursor, and try again.

---

## Deploying to Railway (full guide)

Use this section **after** the app works locally (Steps 0–5 above). Railway requires a **live deployed URL** for your assignment submission.

### What you will deploy

Your Railway project will have **3 services** on the same project canvas:

| Service | What it is | Public URL? |
|---------|------------|-------------|
| **PostgreSQL** | Database (you already created this) | No — internal only |
| **taskify-server** | Express REST API | Yes — e.g. `https://taskify-api.up.railway.app` |
| **taskify-client** | React frontend (Vite build) | Yes — e.g. `https://taskify.up.railway.app` ← **submit this as your live URL** |

**Where things run:**

| Task | Where |
|------|-------|
| Create GitHub repo, push code | Terminal on your PC |
| Connect repo to Railway, set env vars | [railway.app](https://railway.app) in browser |
| Database tables on production | Railway runs `prisma db push` during server deploy |

---

### Deploy Step 1 — Push your code to GitHub

**Where:** Terminal  
**Folder:** `Taskify` (project root)

If you have **not** created a GitHub repo yet:

1. Go to [github.com](https://github.com) → sign in
2. Click **+** (top right) → **New repository**
3. Name it `Taskify` (or any name)
4. Leave it **Public**
5. **Do not** add README, .gitignore, or license (you already have them locally)
6. Click **Create repository**
7. Copy the repo URL — looks like `https://github.com/YOUR_USERNAME/Taskify.git`

**Initialize git and push (first time only):**

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify
git init
git add .
git commit -m "Initial commit: Taskify full-stack app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Taskify.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

**Success:** Refresh your GitHub repo page — you should see `client/`, `server/`, and `README.md`.

> **Note:** `server/.env` is in `.gitignore` and will **not** be pushed (secrets stay on your PC only).

**When you change code later:**

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify
git add .
git commit -m "Describe your change"
git push
```

Railway redeploys automatically after each push (once connected).

---

### Deploy Step 2 — Connect GitHub to your existing Railway project

**Where:** Web browser → [railway.app](https://railway.app)  
**Use the same project** where you already added PostgreSQL (Steps 1–2 above).

1. Open your Railway project (the one with the **PostgreSQL** box).
2. Click **+ New** on the project canvas.
3. Select **GitHub Repo** (or **Deploy from GitHub repo**).
4. If asked, **authorize Railway** to access your GitHub account.
5. Select your **Taskify** repository from the list.
6. Railway creates a new service and starts a first deploy — **it will fail or be wrong** until you configure the root directory. That is normal.

---

### Deploy Step 3 — Configure the server (API) service

**Where:** Railway website → your project → click the **GitHub service** (not PostgreSQL)

Railway may name it after your repo (e.g. `Taskify`). Click that box.

#### 3a. Set the root directory

The API code lives in the `server/` subfolder, not the repo root.

1. Click the **Settings** tab.
2. Find **Root Directory** (under **Source** or **Build**).
3. Set it to:

   ```
   server
   ```

#### How to save in Railway (read this — there is no separate Save button)

Railway **auto-saves** when you change a field. You do **not** need to hunt for a "Save" or "Apply" button.

**What you do after typing `server`:**

1. Click **outside** the text box (anywhere on the page), **or** press **Enter**.
2. Railway saves automatically — you may see a brief "Saved" toast or the field stays filled in.
3. Railway usually **starts a new deploy** on its own after you change settings. If it does not, go to the **Deployments** tab (top of the service, next to **Variables** and **Settings**) and click **Redeploy**.

**Where each setting lives (matches your Railway Settings sidebar):**

When you click your GitHub service box → **Settings** tab, the **left sidebar** shows:

| Sidebar item | What you change there |
|--------------|----------------------|
| **Source** | Root Directory, connected GitHub repo, branch |
| **Build** | Build Command, builder type |
| **Deploy** | Start Command, Pre-deploy Command |
| **Networking** | Public domain (Step 5) |
| **Variables** | Env vars like `JWT_SECRET` (Step 4 — separate tab at top, not in this sidebar) |

#### 3b. Set build and start commands

Still on the **Settings** tab. Use the **left sidebar** — not the top tabs.

**Part 1 — Build Command**

1. In the left sidebar, click **Build**.
2. Find **Build Command** (or **Custom Build Command**).
3. Paste this exactly:

   ```
   npm install && npm run build && npx prisma generate && npx prisma db push
   ```

4. Click outside the box to auto-save.

**Part 2 — Start Command**

1. In the left sidebar, click **Deploy**.
2. Find **Start Command** (or **Custom Start Command**).
3. Paste:

   ```
   npm start
   ```

4. Click outside the box to auto-save.

**Optional — Watch Paths (if you see it under Source or Build):**

```
server/**
```

| Setting | Sidebar location | Value |
|---------|------------------|-------|
| **Root Directory** | **Source** | `server` |
| **Build Command** | **Build** | `npm install && npm run build && npx prisma generate && npx prisma db push` |
| **Start Command** | **Deploy** | `npm start` |

**What each part of the build command does:**

- `npm install` — installs dependencies
- `npm run build` — compiles TypeScript to `dist/`
- `npx prisma generate` — generates the Prisma client
- `npx prisma db push` — creates/updates tables in your Railway PostgreSQL
- `npm start` — runs `node dist/index.js`

**Alternative (cleaner):** Under **Deploy** → **Pre-deploy Command**, set `npx prisma db push`. Under **Build** → **Build Command**, set only `npm install && npm run build`.

**After changing Build / Deploy settings:** Check the **Deployments** tab — a new build should start. If not, open **Deployments** → **Redeploy** (three-dot menu on latest deployment).

#### 3c. Rename the service (optional but clearer)

1. Stay on **Settings**.
2. At the **top** of the page (above the sidebar), find the **service name** (e.g. `Taskify`) — click it or use the pencil icon.
3. Rename to `taskify-server`.
4. Press **Enter** — saves automatically.

---

### Deploy Step 4 — Set server environment variables

**Where:** Railway → click your **server GitHub service** (the one with Root Directory = `server`)

**Important:** Variables are **not** in the Settings sidebar. They use a **top tab**.

#### 4a. Open the Variables tab

1. Click your server service box on the project canvas.
2. At the **top** of the service panel, you see tabs like: **Deployments** · **Variables** · **Metrics** · **Settings**
3. Click **Variables** (not Settings).

#### 4b. Add `JWT_SECRET`

1. Click **+ New Variable** (or **Add Variable**).
2. **Variable name:** `JWT_SECRET`
3. **Value:** copy from your local file `server/.env` on your PC (the long random string).
4. Click **Add** / **Save** (Variables tab **does** have an explicit add button — unlike Settings).

#### 4c. Add `CLIENT_URL` (temporary)

1. Click **+ New Variable** again.
2. **Variable name:** `CLIENT_URL`
3. **Value:** leave as `http://localhost:5173` for now — you will **change this** in Deploy Step 7 after the client has a public URL.
4. Click **Add**.

#### 4d. Link `DATABASE_URL` to PostgreSQL (recommended)

**What this step means (in plain English):**

Your **server** (Express API) needs to know how to connect to your **PostgreSQL** database. Instead of copying a long password URL by hand, you tell Railway:

> “Use whatever database URL the PostgreSQL service already has.”

That is called a **reference variable**. Railway keeps them in sync automatically if the database password changes.

**You are on:** your **GitHub/server service** → **Variables** tab (same place as 4b and 4c).  
**You are NOT on:** the PostgreSQL service — do not open the database box for this step.

---

**On your project canvas you should have two different boxes:**

```
┌─────────────┐     ┌──────────────────┐
│ PostgreSQL  │     │ Taskify (server) │  ← you add DATABASE_URL HERE
│  (database) │     │  GitHub service  │
└─────────────┘     └──────────────────┘
```

---

**Method A — Reference variable (recommended)**

Follow these clicks in order:

1. Make sure you clicked the **server GitHub service** (Root Directory = `server`), then the **Variables** tab at the top.
2. Click **+ New Variable** (purple button, top right of the variables list).
3. A popup / form appears. You may see two modes:
   - **Regular variable** — name + value text boxes
   - **Reference variable** — dropdowns to pick another service

4. Switch to **Reference** if needed:
   - Look for a tab or toggle: **Reference**, **Reference Variable**, or **From service**
   - Or a **{}** icon / **Link** option next to “New Variable”
   - Railway’s UI varies — the goal is to pick a variable **from another service**, not type a URL yourself

5. **First dropdown — Service (or “Reference service”):**
   - Click the dropdown
   - Select **PostgreSQL** or **Postgres** — the **database** box from your canvas
   - **Do NOT** select your GitHub repo service (Taskify / taskify-server)

6. **Second dropdown — Variable (or “Reference variable”):**
   - Click the dropdown
   - Select **`DATABASE_URL`**
   - This is the internal connection string Railway created when you added PostgreSQL

7. **Variable name** at the top should auto-fill as `DATABASE_URL`. If it asks for a name, type exactly:

   ```
   DATABASE_URL
   ```

8. Click **Add**, **Save**, or **Create** to finish.

---

**Success — what you should see in the Variables list:**

A new row appears. The **value** is **not** a normal URL — it looks like a template:

```
DATABASE_URL    ${{Postgres.DATABASE_URL}}
```

or

```
DATABASE_URL    ${{PostgreSQL.DATABASE_URL}}
```

The word `Postgres` / `PostgreSQL` matches whatever your database service is named on the canvas. That is correct.

**How to know it worked:**

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| Value starts with `${{` and ends with `}}` | You pasted `postgresql://postgres:...` manually into the server service |
| Service column or tooltip mentions PostgreSQL | You added `DATABASE_URL` inside the PostgreSQL service itself |
| You have 3 variables on the **server** service | Variable name is misspelled (`DATABASE_URI`, etc.) |

---

**Method B — Manual copy (only if you cannot find “Reference”)**

If Railway does not show a reference option:

1. Click the **PostgreSQL** box on your canvas (the database, not the server).
2. Open the **Variables** tab on PostgreSQL.
3. Find **`DATABASE_URL`** (internal URL — may contain `railway.internal`).
4. Click the **copy** icon next to it.
5. Go back to your **server GitHub service** → **Variables** → **+ New Variable**.
6. **Name:** `DATABASE_URL`
7. **Value:** paste what you copied
8. Click **Add**

> When both server and database run on Railway, prefer **Method A**. Method B works but you must update the URL yourself if Railway rotates credentials.

---

**Why not use `DATABASE_PUBLIC_URL` here?**

- `DATABASE_PUBLIC_URL` is for connecting **from your PC** during local dev.
- On Railway, the server and database are in the **same project** — they talk over Railway’s **private network** using internal `DATABASE_URL`. That is faster and more secure.

> **Do not** add `PORT` — Railway sets it automatically.

#### 4e. Check your Variables list

You should have **3 variables** on the server service:

| Name | Example value |
|------|----------------|
| `JWT_SECRET` | `4aab7a7918167457a56f0fa7b116525121017e1ac676fda4346206ef44158e74` |
| `CLIENT_URL` | `http://localhost:5173` (update later) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference) |

#### 4f. Trigger a redeploy

Variables do **not** always apply until the service rebuilds.

1. Click the **Deployments** tab (top of the same service).
2. Click **Deploy** or the **⋮** three-dot menu on the latest deployment → **Redeploy**.
3. Wait until status shows **Success** or **Active** (green).

**Check logs if deploy fails:**

1. **Deployments** → click the latest deployment → **View logs**
2. Common issues: Root Directory still empty (should be `server` under **Settings → Source**), missing `DATABASE_URL`, Prisma errors

---

### Deploy Step 5 — Generate a public URL for the API

**Where:** Railway → **taskify-server** → **Settings** → **Networking**

1. Find **Public Networking** or **Generate Domain**
2. Click **Generate Domain**
3. Railway gives you a URL like:

   ```
   https://taskify-server-production-xxxx.up.railway.app
   ```

4. **Copy and save this URL** — you need it for the client.

**Test the API:**

Open in your browser:

```
https://YOUR-SERVER-URL.up.railway.app/api/health
```

**Success:**

```json
{"status":"ok","message":"Taskify API is running"}
```

---

### Deploy Step 6 — Deploy the client (React frontend)

**Where:** Railway website → same project canvas

#### 6a. Add a second GitHub service for the client

1. On the project canvas, click **+ New** → **GitHub Repo**
2. Select the **same Taskify repository** again
3. Railway creates a second service

#### 6b. Configure the client service

Click the new service → **Settings**:

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npx serve -s dist -l $PORT` |

Rename the service to `taskify-client` (optional, in Settings).

#### 6c. Set client environment variables

**Variables** tab on **taskify-client**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-SERVER-URL.up.railway.app/api` |

Replace `YOUR-SERVER-URL` with the domain from Deploy Step 5. Include `/api` at the end.

> **Important:** Vite reads `VITE_*` variables **at build time**. After changing `VITE_API_URL`, you must **redeploy** the client service.

#### 6d. Client code — already done (skip editing)

**Good news:** This project **already has** the correct line in `client/src/api/client.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "/api";
```

**You do not need to change any code.** What matters for production:

| Environment | What `API_BASE` uses |
|-------------|----------------------|
| **Local** (`npm run dev`) | `/api` → Vite proxy sends requests to `localhost:5000` |
| **Railway** (after you set `VITE_API_URL` in Step 6c) | Your live server URL, e.g. `https://taskify-server-production-xxxx.up.railway.app/api` |

**Only do this if you have not pushed to GitHub yet:**

Make sure your latest code is on GitHub so Railway can build the client:

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify
git add .
git commit -m "Prepare client for Railway deploy"
git push
```

If your repo is already up to date, **skip straight to 6e** after setting `VITE_API_URL` in Step 6c and redeploying the client.

#### 6e. Generate a public URL for the client

**Where:** Railway → **taskify-client** → **Settings** → **Networking**

1. Click **Generate Domain**
2. Copy the URL, e.g.:

   ```
   https://taskify-client-production-xxxx.up.railway.app
   ```

This is your **live app URL** for submission.

---

### Deploy Step 7 — Connect server and client (CORS)

**Where:** Railway → **taskify-server** → **Variables**

Update `CLIENT_URL` to your **client** public URL (from Step 6e):

```
CLIENT_URL=https://taskify-client-production-xxxx.up.railway.app
```

No trailing slash.

**Redeploy the server** after changing `CLIENT_URL` (Deployments → Redeploy).

**Why:** The server only accepts browser requests from `CLIENT_URL` (CORS). Wrong value = login/signup fails in production.

---

### Deploy Step 8 — Test your live deployment

**Where:** Web browser

1. Open your **client URL** (not the server URL)
2. Click **Sign up** and create an account
3. Confirm you reach the **Dashboard**
4. Log out and **log in** again

**If something fails:**

| Symptom | Likely fix |
|---------|------------|
| Blank page on client URL | Check client deploy logs; verify build succeeded |
| Signup/login error | Check `CLIENT_URL` on server matches client domain exactly |
| Network error / API not found | Check `VITE_API_URL` on client; redeploy client after fixing |
| 500 error on signup | Check server logs; verify `DATABASE_URL` reference is set |
| CORS error in browser console | Update `CLIENT_URL` on server and redeploy |

**Where to see logs:**

Railway → click the service → **Deployments** → latest deployment → **View logs**

---

### Deploy Step 9 — Assignment submission checklist

Submit these three items:

| Deliverable | What to submit |
|-------------|----------------|
| **Live URL** | Your **client** Railway URL, e.g. `https://taskify-client-production-xxxx.up.railway.app` |
| **GitHub repo** | `https://github.com/YOUR_USERNAME/Taskify` |
| **README** | This file (already in the repo) |

**Before submitting, verify:**

- [ ] Live URL loads the login/signup page
- [ ] You can sign up and log in on the live site
- [ ] GitHub repo is **public** (or accessible to your instructor)
- [ ] `server/.env` is **not** in GitHub (secrets only on Railway Variables)
- [ ] README documents how to run locally and deploy

---

### Deploy Step 10 — Updating production after code changes

**Where:** Terminal on your PC

Whenever you change code locally:

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify
git add .
git commit -m "Describe your change"
git push
```

Railway automatically redeploys connected services.

**If you change the database schema** (`server/prisma/schema.prisma`):

- Server build already runs `npx prisma db push`
- Or run manually from your PC against production (not recommended) — prefer redeploying the server

**If you change client API URL or env vars:**

- Update Variables on Railway → **Redeploy** the client service

---

### Deployment architecture diagram

```
User browser
    │
    ▼
https://taskify-client.up.railway.app   (React static site)
    │
    │  API calls to VITE_API_URL
    ▼
https://taskify-server.up.railway.app   (Express API)
    │
    │  DATABASE_URL (private Railway network)
    ▼
PostgreSQL service                      (Railway managed DB)
```

---

### Deployment troubleshooting

#### Server deploy fails at `prisma db push`

**Fix:**

1. Confirm `DATABASE_URL` is a **reference** to the PostgreSQL service
2. PostgreSQL service must be **Active** before server deploys
3. Check server deploy logs for the exact Prisma error

#### Client shows page but API calls go to `localhost`

**Fix:** `VITE_API_URL` was not set before build. Set it in Railway Variables and **redeploy** the client.

#### `npx serve` command not found on client deploy

**Fix:** Add `serve` to client dependencies:

```powershell
cd C:\Users\beras\OneDrive\Desktop\Taskify\client
npm install serve
git add package.json package-lock.json
git commit -m "Add serve for production static hosting"
git push
```

#### Railway build runs out of memory

**Fix:** Ensure **Root Directory** is set (`server` or `client`) so Railway does not build the entire monorepo twice in one service.

#### Two services from one repo — Railway confused

**Fix:** Each service must have its own **Root Directory** (`server` vs `client`). They are two separate boxes on the canvas, both pointing to the same GitHub repo.

---

### Quick reference — Railway settings summary

**taskify-server**

| Setting | Value |
|---------|-------|
| Root Directory | `server` |
| Build Command | `npm install && npm run build && npx prisma generate && npx prisma db push` |
| Start Command | `npm start` |
| Variables | `DATABASE_URL` (ref), `JWT_SECRET`, `CLIENT_URL` |

**taskify-client**

| Setting | Value |
|---------|-------|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Start Command | `npx serve -s dist -l $PORT` |
| Variables | `VITE_API_URL=https://YOUR-SERVER-URL.up.railway.app/api` |

---

## License

ISC
