# ResumeTeX — an Overleaf-style LaTeX resume builder

Full-stack app: pick a template or build your resume with a form, edit the generated LaTeX
directly like in Overleaf, and compile it to a real PDF on the server.

**Stack:** React + TypeScript + Zustand (client) · Express + TypeScript (server) · a LaTeX
engine of your choice compiles the `.tex` source to PDF.

```
resume-builder/
├── client/     React + Vite + TypeScript + Zustand frontend
└── server/     Express + TypeScript backend + LaTeX compiler
```

## How it works

1. The **form editor** edits structured resume data (contact info, experience, education,
   projects, skills) in the Zustand store.
2. Every change debounces a call to `POST /api/templates/:templateId/generate`, which turns
   that structured data into LaTeX source using one of three templates (`classic`, `modern`,
   `compact`).
3. You can switch to the **LaTeX editor** (Monaco, the same editor VS Code uses) and hand-edit
   the `.tex` source directly — exactly like Overleaf. Once you do, the app stops
   auto-regenerating LaTeX from the form (a banner lets you snap back if you want).
4. Hitting **Compile ▶** sends the LaTeX to `POST /api/compile`, which shells out to a LaTeX
   engine on the server and streams back a PDF, or structured error messages (with line
   numbers where available) if compilation fails.

## Prerequisites

- Node.js 18+
- **A LaTeX engine on the server machine.** The compiler in `server/src/utils/latexCompiler.ts`
  shells out to a binary — it does not implement LaTeX itself. Two options:

  - **Tectonic (recommended)** — a single self-contained binary that auto-fetches whatever
    packages your `.tex` file needs, no multi-GB TeX Live install required.
    ```bash
    # macOS
    brew install tectonic
    # Linux (see https://tectonic-typesetting.github.io/en-US/install.html for other options)
    curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh
    ```
  - **TeX Live / pdflatex** — the traditional full install (`sudo apt install texlive-full` on
    Debian/Ubuntu, or MacTeX on macOS). Set `LATEX_ENGINE=pdflatex` in `server/.env` if you use
    this route.

  The server defaults to `tectonic`; override with the `LATEX_ENGINE` env var.

## Setup

```bash
# 1. Backend
cd server
npm install
cp .env.example .env   # optional — defaults work for local dev
npm run dev             # http://localhost:4000

# 2. Frontend (separate terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173 — a sample resume is pre-loaded. Vite proxies `/api/*` requests to
the Express server, so no CORS configuration is needed in dev.

## Run with Docker Compose (all installs baked in)

No local Node.js or LaTeX install needed — everything (Node, Tectonic, nginx) is built into
the images.

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API (optional direct access): http://localhost:4000/api/health

What each service does:

- **`server`** — builds on `node:20-bookworm-slim`, installs [Tectonic](https://tectonic-typesetting.github.io)
  (a self-contained LaTeX engine — no multi-GB TeX Live layer), compiles the TypeScript, and
  runs `node dist/index.js`. A healthcheck hits `/api/health` so `client` waits for it to be
  ready.
- **`client`** — multi-stage build: compiles the Vite app, then serves the static output with
  nginx. `client/nginx.conf` proxies `/api/*` to the `server` container over the internal
  Docker network, so the browser only ever talks to one origin (`:8080`) and CORS never comes
  into play in this setup.

Stop everything with `docker compose down`. Add `-v` if you later add volumes you want wiped.

To use full TeX Live instead of Tectonic (e.g. you need a package Tectonic can't fetch), edit
`server/Dockerfile` to install `texlive-full` via apt instead of the Tectonic curl step, and
set `LATEX_ENGINE: pdflatex` in `docker-compose.yml`. Expect a much larger image and slower
build.

## Building for production (without Docker)

```bash
cd server && npm run build && npm start   # compiles to dist/, serves on $PORT (default 4000)
cd client && npm run build                # outputs static assets to client/dist — serve with
                                           # any static host (nginx, Vercel, S3+CloudFront…)
```

Set `CLIENT_ORIGIN` on the server to your deployed frontend URL so CORS allows it.

## API reference

| Method | Route                              | Description                                      |
|--------|-------------------------------------|---------------------------------------------------|
| GET    | `/api/templates`                    | List available templates                          |
| GET    | `/api/templates/sample-data`        | Fetch example resume data                          |
| POST   | `/api/templates/:templateId/generate` | Generate LaTeX from structured `ResumeData`      |
| GET    | `/api/resumes`                      | List saved resumes (metadata only)                 |
| GET    | `/api/resumes/:id`                  | Fetch a full resume incl. LaTeX source              |
| POST   | `/api/resumes`                      | Create a new resume                                 |
| PUT    | `/api/resumes/:id`                  | Update a resume                                     |
| DELETE | `/api/resumes/:id`                  | Delete a resume                                     |
| POST   | `/api/compile`                      | `{ latex: string }` → PDF bytes or `{ errors }`     |

## Persistence

Resumes are currently stored in an in-memory `Map` (`server/src/routes/resumes.ts`) — they
reset when the server restarts. Swap in a real database by replacing the `Map` operations with
calls to Postgres/MongoDB/etc.; the route signatures don't need to change.

## Extending

- **New template:** add a `server/src/templates/<name>.ts` generator function following the
  same shape as `classic.ts`, register it in `server/src/templates/index.ts`, and add it to
  `TEMPLATE_OPTIONS` in `client/src/components/Toolbar.tsx`.
- **Auth / multi-user:** add an auth middleware in `server/src/index.ts` and scope the
  `resumes` map (or DB table) by user id.
- **Autosave to backend:** call `updateResume(id, patch)` from `client/src/api/client.ts` on
  store changes (currently the store is client-only per session).
