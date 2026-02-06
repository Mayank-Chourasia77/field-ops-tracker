# FieldOps Tracker

FieldOps Tracker is a mobile-first internal operations application built to improve accountability, transparency, and reporting accuracy in field-based work environments, especially in rural and low-connectivity regions.

## Problem Statement
Field officers often report attendance, travel, meetings, and sales using informal tools such as WhatsApp messages, phone calls, or handwritten notes. This leads to unreliable reporting, lack of verification, poor accountability, and no proper audit trail for management.

## Solution Overview
FieldOps Tracker replaces informal reporting with a structured, verifiable, and auditable system for managing field operations.

The system enables organizations to:
- Track verified daily work sessions using Clock In and Clock Out
- Record meetings, sample distribution, and sales activities
- Verify travel using odometer readings with photo proof
- Maintain complete historical records for audit and review

The application is designed to be mobile-first, simple to use, and suitable for users with low digital literacy.

## Key Features
Field Officer Module:
- Email/password authentication
- Daily Clock In and Clock Out
- Today's Work Session overview
- Login and logout history
- Meetings logging
- Sample distribution tracking
- Sales entry (B2B and B2C)
- Odometer verification with photo upload
- Profile management

Admin Module:
- Admin dashboard
- Overview of field activity
- Analytics and charts
- Historical audit-ready data

## System Architecture
- Frontend: React + TypeScript (Vite)
- Backend: Supabase (Authentication, Database, Storage)
- Styling: Tailwind CSS with shadcn/ui
- Routing: React Router with role-based access
- Data Layer: Supabase with Row Level Security (RLS)

## Implementation Methodology
1. Authentication handled using Supabase Auth
2. Daily work sessions recorded using clock-in and clock-out events
3. Meetings, sales, and sample distribution logged via structured forms
4. Odometer readings stored with photo proof for travel verification
5. Persistent storage ensures historical audit trail
6. Role-based access enforced using Supabase RLS policies

## Technology Stack
Frontend: Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
Backend: Supabase Auth, Supabase Database, Supabase Storage
Testing: Vitest, Testing Library

## Dependencies
Main Dependencies: react, react-dom, react-router-dom, @tanstack/react-query, @supabase/supabase-js, tailwindcss, shadcn/ui, clsx, lucide-react
Dev Dependencies: typescript, vite, eslint, vitest, postcss, autoprefixer

## Setup and Usage Instructions
Prerequisites:
- Node.js (v18 or higher)
- npm

Steps to run locally:
1. Clone the repository and move into the project folder.

```sh
git clone <repository-url>
cd field-ops-tracker
```

2. Install dependencies.

```sh
npm install
```

3. Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase-anon-key>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

4. Start the development server.

```sh
npm run dev
```

## Application Routes
| Route | Description |
| --- | --- |
| `/login` | Login page |
| `/signup` | Signup page |
| `/field` | Field dashboard |
| `/field/meetings` | Meetings list |
| `/field/meetings/new` | New meeting |
| `/field/distribution` | Sample distribution |
| `/field/sales` | Sales page |
| `/field/profile` | Profile page |
| `/field/odometer` | Odometer verification |
| `/admin` | Admin dashboard |

## Project Structure (High Level)
- `/src/pages` -> Application pages
- `/src/components` -> Reusable UI components
- `/src/integrations/supabase` -> Supabase client and types
- `/src/contexts` -> Authentication context
- `/src/hooks` -> Custom hooks
- `/supabase/migrations` -> Database schema and migrations

## Build Instructions
```sh
npm run build
npm run preview
```

## Hosted URL
This project is a mobile-first web application.
Live URL: https://field-ops-tracker.vercel.app/

Demo Video: https://drive.google.com/file/d/1xnS6HHoQdtQfsxboqnnvVNk6UA1HaG9-/view?usp=sharing

## Summary
FieldOps Tracker provides a practical, real-world solution for managing field operations by replacing informal reporting methods with a verified, auditable, and easy-to-use system. The application improves transparency, accountability, and trust between field officers and management.
