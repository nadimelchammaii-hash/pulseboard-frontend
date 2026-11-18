# PulseBoard Web App

The web app of **PulseBoard**, a real-time project management app for small teams:
workspaces, Kanban boards, comments, an activity feed and live notifications.

**Live app:** https://pulseboardapp.org. Click **Try the demo** on the sign-in page and
you land on a sample Kanban board, with fictional teammates, in a few seconds. No sign-up
is needed, and the demo is deleted after 24 hours.

The API (Laravel 13) is in
[pulseboard-backend](https://github.com/nadimelchammaii-hash/pulseboard-backend).

## Features

- **Kanban board:** drag tasks between To Do, In Progress, Review and Done. Changes made
  by teammates appear without reloading.
- **Task details:** description, status, priority, assignee, due date, and comments with
  @mentions.
- **Workspaces and roles:** create workspaces, invite people, give them the Owner, Admin
  or Member role, and choose who belongs to each project.
- **Activity feed:** a timeline of everything that happened in a workspace, updated live.
- **Notifications:** a bell with an unread count for invitations, assignments and
  mentions, pushed in real time.
- **Accounts:** sign-up, sign-in, password reset, and a one-click demo.
- **Readable errors:** permission refusals and limits show the server's own message
  instead of a generic failure.

## Tech stack

- Vue 3 with TypeScript, built with Vite
- Vuetify 4 (Material Design components) with a custom dark theme
- Pinia for state, Vue Router for pages
- Axios for the API, using Laravel Sanctum cookie sessions (no tokens in the browser)
- Laravel Echo + Pusher protocol, connected to Laravel Reverb for real-time updates
- ESLint, `vue-tsc` type checking, GitHub Actions CI

The screens follow a design system made in Google Stitch, kept in
[`design/stitch/`](design/stitch/).

## Project structure

```
src/
├── api/          # one module per API area (auth, workspaces, projects, tasks, ...)
├── stores/       # Pinia stores: data, loading state and live updates
├── pages/        # one component per screen (board, task, members, activity, ...)
├── components/   # app shell (sidebar, top bar, demo banner) and auth layout
├── plugins/      # Vuetify theme, Echo (real-time), i18n
├── router/       # routes and the signed-in / guest guards
└── styles/
```

Pages call stores, and stores call the `api/` modules. Real-time events arrive through
the stores too, so a page shows the same data whether it came from a request or from a
teammate's change.

## Running it locally

You need Node.js 22+ and the [API](https://github.com/nadimelchammaii-hash/pulseboard-backend)
running.

```bash
npm install
cp .env.example .env
```

In `.env`, point the app at the API and at Reverb, the WebSocket server that comes with
the API:

```env
VITE_API_URL=http://localhost:8000
VITE_REVERB_APP_KEY=<the REVERB_APP_KEY from the API's .env>
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

Then:

```bash
npm run dev
```

The app runs on http://localhost:3000. The API must accept that address: in the API's
`.env`, set `FRONTEND_URL=http://localhost:3000` and
`SANCTUM_STATEFUL_DOMAINS=localhost:3000`. If you use a different port, change it on
both sides, or sign-in won't stick.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (`npm run lint:fix` to fix what it can) |

CI runs the lint and the build, and builds and smoke-tests the development and
production Docker images, on every push.

## Deployment

`Dockerfile.prod` builds the app once and serves the static files with nginx. The API
and WebSocket addresses are passed in at build time, so the image is built for one
domain. In production, the app and the API share a domain behind Caddy, so the sign-in
cookie works without any cross-site setup.
