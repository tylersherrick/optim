<img width="1200" height="260" alt="banner-frontend" src="https://github.com/user-attachments/assets/3832fa1b-d9a9-47c0-b9e9-50b2deb2f840" />

<div align="center">

<br/>

![React](https://img.shields.io/badge/React-19-8fb87a?style=for-the-badge&labelColor=504d63)

![Vite](https://img.shields.io/badge/Vite-SWC-93c591?style=for-the-badge&labelColor=504d63)

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

This repository contains the **React + Vite frontend** for Optim.

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

Planned shots: landing page, sign-in, workspace dashboard, kanban board, task detail view.

<!-- ![Workspace dashboard](./screenshots/workspace-dashboard.png) -->
<!-- ![Kanban board](./screenshots/kanban-board.png) -->
<!-- ![Sign in](./screenshots/sign-in.png) -->

<br/>

## Core Features

<table>
<tr><td>⚡</td><td><b>One-click quick-assign</b></td><td>The differentiator this project is built around — assigning or reassigning a task happens directly from the card, no modal chain required.</td></tr>
<tr><td>🗂️</td><td><b>Real hierarchy</b></td><td>Workspaces → Projects → Boards → Columns → Tasks, not a flat list. Each project's board ships with default columns (To Do, In Progress, In Review, Done).</td></tr>
<tr><td>🔐</td><td><b>Account authentication</b></td><td>Users can register with a username, email, and password and securely sign in using their username or email.</td></tr>
<tr><td>🛡️</td><td><b>Role-aware UI</b></td><td>Workspace and project roles shape what each person can see and do.</td></tr>
<tr><td>🔑</td><td><b>Human-readable project keys</b></td><td>Tasks can be referenced with project-specific identifiers instead of raw database IDs.</td></tr>
<tr><td>🕓</td><td><b>Labels, comments & activity feed</b></td><td>Status changes, assignments, and comments can be tracked for a clear project history.</td></tr>
</table>

<br/>

## Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React%2019-UI%20library-8fb87a?style=flat-square&labelColor=504d63)

![Vite](https://img.shields.io/badge/Vite-build%20%26%20dev%20server-93c591?style=flat-square&labelColor=504d63)

![CSS](https://img.shields.io/badge/CSS-stylesheets-8fb87a?style=flat-square&labelColor=504d63)

![ESLint](https://img.shields.io/badge/ESLint-linting-93c591?style=flat-square&labelColor=504d63)

</div>

| Tool | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** (`@vitejs/plugin-react-swc`) | Build tool & dev server |
| **React Router** | Client-side routing |
| **CSS** | Styling |
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

<br/>

## Architecture

### Folder Structure
