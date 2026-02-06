# FieldOps Tracker

FieldOps Tracker is a mobile-first internal operations platform designed to improve accountability and transparency in field-based work environments, especially in rural and low-connectivity regions.

## Problem Statement
Field officers often rely on informal tools like WhatsApp, phone calls, and manual notes to report attendance, travel, and work activities. This leads to poor accountability, inconsistent records, and lack of auditability.

## Solution
FieldOps Tracker replaces informal reporting with a structured, verifiable system that records:
- Daily work sessions (clock-in / clock-out)
- Odometer-based travel verification with photo proof
- Persistent activity history for audit and review

The system is designed for low digital literacy users and unreliable internet conditions.

## Overview
- Frontend app built with Vite, React, and TypeScript
- Field and admin experiences organized by route
- Supabase integration for data and auth
- Tailwind CSS and shadcn/ui component library

## Features
- Auth flows: login and signup
- Field officer module: dashboard, meetings, distribution, sales, profile, odometer logs
- Admin dashboard
- Maps and geolocation utilities
- Charts and analytics components
- Supabase-backed data layer

## Tech Stack
- Vite
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- Supabase JS
- Vitest + Testing Library

## Getting Started
1. Install dependencies.

```sh
npm install
```

2. Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-or-publishable-key>"
VITE_SUPABASE_PROJECT_ID="<project-ref>"
```

3. Start the dev server.

```sh
npm run dev
```

## Scripts
- `npm run dev` Start the Vite dev server
- `npm run build` Build for production
- `npm run build:dev` Build with development mode
- `npm run preview` Preview the production build locally
- `npm run lint` Run ESLint
- `npm run test` Run tests once with Vitest
- `npm run test:watch` Run tests in watch mode

## Project Structure
```text
.
|-- .env
|-- .gitignore
|-- bun.lockb
|-- components.json
|-- dist/
|-- eslint.config.js
|-- index.html
|-- node_modules/
|-- package-lock.json
|-- package.json
|-- postcss.config.js
|-- public/
|   |-- favicon.ico
|   |-- placeholder.svg
|   |-- robots.txt
|-- src/
|   |-- App.tsx
|   |-- index.css
|   |-- main.tsx
|   |-- vite-env.d.ts
|   |-- components/
|   |   |-- NavLink.tsx
|   |   |-- auth/
|   |   |   |-- AuthStateHandler.tsx
|   |   |-- layout/
|   |   |   |-- FieldLayout.tsx
|   |   |   |-- FieldNavigation.tsx
|   |   |-- maps/
|   |   |   |-- ActivityMap.tsx
|   |   |-- ui/
|   |   |   |-- accordion.tsx
|   |   |   |-- alert-dialog.tsx
|   |   |   |-- alert.tsx
|   |   |   |-- aspect-ratio.tsx
|   |   |   |-- avatar.tsx
|   |   |   |-- badge.tsx
|   |   |   |-- breadcrumb.tsx
|   |   |   |-- button.tsx
|   |   |   |-- calendar.tsx
|   |   |   |-- card.tsx
|   |   |   |-- carousel.tsx
|   |   |   |-- chart.tsx
|   |   |   |-- checkbox.tsx
|   |   |   |-- collapsible.tsx
|   |   |   |-- command.tsx
|   |   |   |-- context-menu.tsx
|   |   |   |-- dialog.tsx
|   |   |   |-- drawer.tsx
|   |   |   |-- dropdown-menu.tsx
|   |   |   |-- FieldButton.tsx
|   |   |   |-- form.tsx
|   |   |   |-- hover-card.tsx
|   |   |   |-- input-otp.tsx
|   |   |   |-- input.tsx
|   |   |   |-- label.tsx
|   |   |   |-- menubar.tsx
|   |   |   |-- navigation-menu.tsx
|   |   |   |-- pagination.tsx
|   |   |   |-- popover.tsx
|   |   |   |-- progress.tsx
|   |   |   |-- radio-group.tsx
|   |   |   |-- resizable.tsx
|   |   |   |-- scroll-area.tsx
|   |   |   |-- select.tsx
|   |   |   |-- separator.tsx
|   |   |   |-- sheet.tsx
|   |   |   |-- sidebar.tsx
|   |   |   |-- skeleton.tsx
|   |   |   |-- slider.tsx
|   |   |   |-- sonner.tsx
|   |   |   |-- switch.tsx
|   |   |   |-- table.tsx
|   |   |   |-- tabs.tsx
|   |   |   |-- textarea.tsx
|   |   |   |-- toast.tsx
|   |   |   |-- toaster.tsx
|   |   |   |-- toggle-group.tsx
|   |   |   |-- toggle.tsx
|   |   |   |-- tooltip.tsx
|   |   |   |-- use-toast.ts
|   |-- contexts/
|   |   |-- AuthContext.tsx
|   |-- hooks/
|   |   |-- use-mobile.tsx
|   |   |-- use-toast.ts
|   |   |-- useAuth.ts
|   |   |-- useGeolocation.ts
|   |-- integrations/
|   |   |-- supabase/
|   |   |   |-- client.ts
|   |   |   |-- types.ts
|   |-- lib/
|   |   |-- utils.ts
|   |-- pages/
|   |   |-- NotFound.tsx
|   |   |-- admin/
|   |   |   |-- AdminDashboard.tsx
|   |   |-- auth/
|   |   |   |-- Login.tsx
|   |   |   |-- Signup.tsx
|   |   |-- field/
|   |   |   |-- DistributionPage.tsx
|   |   |   |-- FieldDashboard.tsx
|   |   |   |-- MeetingsList.tsx
|   |   |   |-- NewMeeting.tsx
|   |   |   |-- OdometerPage.tsx
|   |   |   |-- ProfilePage.tsx
|   |   |   |-- SalesPage.tsx
|   |-- test/
|   |   |-- example.test.ts
|   |   |-- setup.ts
|   |-- types/
|   |   |-- database.ts
|-- supabase/
|   |-- config.toml
|   |-- migrations/
|   |   |-- 20260205113141_5d2ca40c-7236-4194-92b6-cfb55774d328.sql
|   |   |-- 20260206120000_add_work_sessions.sql
|   |   |-- 20260206133000_add_odometer_logs.sql
|-- tailwind.config.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vite.config.ts
|-- vitest.config.ts
```

## Routes
- `/login` Login page
- `/signup` Signup page
- `/field` Field dashboard
- `/field/meetings` Meetings list
- `/field/meetings/new` New meeting
- `/field/distribution` Distribution page
- `/field/sales` Sales page
- `/field/profile` Profile page
- `/field/odometer` Odometer page
- `/admin` Admin dashboard

## Notes
- Path alias `@/` maps to `src/` (see `tsconfig.app.json`).
- Supabase client lives in `src/integrations/supabase/client.ts`.
- Database types are in `src/integrations/supabase/types.ts` and `src/types/database.ts`.

## Build and Deploy
- Build: `npm run build`
- Preview build locally: `npm run preview`
- Deploy the contents of `dist/` to your hosting provider of choice.
