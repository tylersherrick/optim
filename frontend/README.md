<img width="1200" height="260" alt="banner-frontend" src="https://github.com/user-attachments/assets/3832fa1b-d9a9-47c0-b9e9-50b2deb2f840" />

<div align="center">
  
<br/>

![React](https://img.shields.io/badge/React-19-8fb87a?style=for-the-badge&labelColor=504d63)
![Vite](https://img.shields.io/badge/Vite-SWC-93c591?style=for-the-badge&labelColor=504d63)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-819aa3?style=for-the-badge&labelColor=4a5765)
![ESLint](https://img.shields.io/badge/ESLint-linted-8fb87a?style=for-the-badge&labelColor=504d63)
![License](https://img.shields.io/badge/status-in%20development-504d63?style=for-the-badge&labelColor=819aa3)

</div>


## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Known Limitations](#known-limitations--notes-for-contributors)
- [Roadmap](#roadmap)

<br/>

## Overview

**Optim** is a lightweight, fast, focused project management tool — think Jira, Monday.com, or GitHub Projects, rebuilt around one core idea: the everyday actions (assigning a task, moving it across a board, checking who's doing what) should take **one click, not five**.

This repository is the **React + Vite frontend** — the interface teams actually spend their day in.

### Problem Statement

Every working professional consulted before this project started had the same complaint about existing tools: simple actions are buried behind unnecessary steps. Assigning a task in Jira, for example, means opening a dropdown, confirming a selection, and waiting on a save — for something that should be a single click from the board itself.

### Goals

| | |
|---|---|
| 🎯 | Deliver a fully usable MVP interface: accounts, workspaces, projects, a real kanban board, and collaboration tools |
| ⚡ | Keep the interface fast and modern — no unnecessary modals, no multi-step flows for single-step actions |
| 🧩 | Support real team workflows: multiple workspaces per person, multiple projects per workspace |
| 🚀 | Ship a stretch-goal path beyond the MVP: sprints, real-time board updates, notifications, automation, analytics |

### Screenshots

*Coming soon — screenshots will be added here as the UI stabilizes.*

Planned shots: landing page, Google/local sign-in, workspace dashboard, kanban board, task detail view.

<!-- ![Workspace dashboard](./screenshots/workspace-dashboard.png) -->
<!-- ![Kanban board](./screenshots/kanban-board.png) -->
<!-- ![Sign in](./screenshots/sign-in.png) -->

<br/>

## Core Features

<table>
<tr><td>⚡</td><td><b>One-click quick-assign</b></td><td>The differentiator this project is built around — assigning or reassigning a task happens directly from the card, no modal chain required.</td></tr>
<tr><td>🗂️</td><td><b>Real hierarchy</b></td><td>Workspaces → Projects → Boards → Columns → Tasks, not a flat list. Each project's board ships with default columns (To Do, In Progress, In Review, Done).</td></tr>
<tr><td>🔐</td><td><b>Dual authentication</b></td><td>Sign in with Google, or with a traditional username/password — accounts with the same email are linked automatically, never duplicated.</td></tr>
<tr><td>🛡️</td><td><b>Role-aware UI</b></td><td>Workspace roles (admin / member) and project roles (lead / member) shape what each person can see and do.</td></tr>
<tr><td>🔑</td><td><b>Human-readable project keys</b></td><td>Tasks are referenced like <code>ENG-42</code> instead of a raw ID.</td></tr>
<tr><td>🕓</td><td><b>Labels, comments & activity feed</b></td><td>Every status change, assignment, and comment is logged automatically for a clear history.</td></tr>
</table>

<br/>

## Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React%2019-UI%20library-8fb87a?style=flat-square&labelColor=504d63)
![Vite](https://img.shields.io/badge/Vite-build%20%26%20dev%20server-93c591?style=flat-square&labelColor=504d63)
![react-oauth](https://img.shields.io/badge/%40react--oauth%2Fgoogle-Google%20Sign--In-819aa3?style=flat-square&labelColor=4a5765)
![CSS](https://img.shields.io/badge/CSS-Modules-8fb87a?style=flat-square&labelColor=504d63)
![ESLint](https://img.shields.io/badge/ESLint-linting-93c591?style=flat-square&labelColor=504d63)

</div>

| Tool | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** (`@vitejs/plugin-react-swc`) | Build tool & dev server |
| **@react-oauth/google** | Google Sign-In |
| **CSS** (plain stylesheets + CSS Modules) | Styling |
| **ESLint** | Linting |

### Design Language

| Element | Value |
|---|---|
| Heading font | `Space Grotesk` |
| Body font | `Inter` |
| Navy Slate | `#4a5765` |
| Plum Gray | `#504d63` |
| Muted Slate | `#819aa3` |
| Green | `#8fb87a` |
| Light Green | `#93c591` |

### Workflow

Each teammate forks the repo to their own GitHub account, clones their fork, and opens pull requests back into the team lead's repo. Local copies stay in sync with teammates' merged work via a separate `upstream` remote:

```bash
git fetch upstream && git merge upstream/main
```

> Plain `git pull` only syncs a personal fork — it won't pull in teammates' merged changes.

<br/>

## Architecture

### Folder Structure

```
Optim-frontend/
├── src/
│   ├── Components/
│   │   ├── sidebar.jsx        # main navigation
│   │   ├── NavItem.jsx
│   │   ├── Logo.jsx
│   │   ├── icons.jsx
│   │   ├── BoardCard.jsx
│   │   └── NewBoardModal.jsx
│   ├── tabs/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx      # Google + local sign-in/sign-up
│   │   ├── Home.jsx
│   │   ├── Kanban.jsx
│   │   ├── Timeline.jsx
│   │   └── Collaborators.jsx
│   ├── auth/
│   │   └── AuthContext.jsx    # React Context wrapping both auth methods
│   ├── App.jsx                # top-level view switcher
│   ├── main.jsx
│   └── index.css
└── package.json
```

> ⚠️ **Folder casing matters.** `Components/` (capital C) is the real, live folder — keep new component files there, not in a differently-cased `components/`, to avoid import resolution issues on case-sensitive filesystems (Linux CI, some deploy targets).

### System Design

**Request flow:**

```
Browser
  │
  ▼
React app (AuthContext attaches a JWT to every API request)
  │  fetch()
  ▼
Express app.js  →  api/*.routes.js  →  db/queries/*.js  →  PostgreSQL
```

**Authentication flow:**

Optim supports two independent ways to reach the same account:

- **Local** — the frontend posts a username/password to the backend's signup/login endpoints.
- **Google** — the frontend obtains an access token via `useGoogleLogin()`, then sends only that token to the backend, which verifies it server-side against Google's own userinfo endpoint. Client-claimed profile data is never trusted directly.

Either path ends the same way: the backend issues its own JWT, which `AuthContext` stores and attaches to every subsequent request as `Authorization: Bearer <token>`.

<br/>

## Getting Started

```bash
cd Optim-frontend
npm install
cp example.env .env       # set VITE_API_URL to the backend's URL
npm run dev
```

> ⚠️ Run all `npm run` commands from the **project root**, not a subdirectory.

<br/>

## Known Limitations / Notes for Contributors

- **Folder casing matters** — see [Architecture](#architecture) above. Mixing `Components/` and `components/` breaks imports on case-sensitive filesystems.
- The frontend can be built against **mocked data** for an epic while the corresponding backend endpoints are still being implemented — useful for parallelizing frontend and backend work.

<br/>

## Roadmap

Beyond the MVP:

- [ ] Sprints & backlog view
- [ ] Real-time board updates via WebSockets
- [ ] In-app / email notifications
- [ ] @mentions
- [ ] File attachments
- [ ] Automation rules
- [ ] Analytics dashboard
- [ ] GitHub integration
- [ ] Dark mode

<br/>

<div align="center">
<sub>Built by the Optim team — <b>Work, Optimized.</b></sub>
</div>
