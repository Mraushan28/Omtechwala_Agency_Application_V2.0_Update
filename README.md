# Om Techwala

**B2B Tech Talent Network & IT Outsourcing Platform**

Om Techwala bridges global client enterprises with pre-vetted contractors across Web Development, AI/ML Solutions, AI Training, UI/UX, and Graphic Design. It operates two distinct workspaces (Client & Contractor) plus a Super Admin Panel.

Inspired by the delivery models of Turing and Toptal — escrow-backed milestones, NDA protection, and a top-1% talent acceptance standard.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 3 + Lucide React icons
- **ORM & Database:** Prisma ORM + PostgreSQL
- **Auth:** NextAuth.js / Auth.js v5 (beta) with Credentials provider + JWT sessions
- **RBAC:** `ADMIN`, `CLIENT`, `CONTRACTOR` enforced via edge middleware and server-side guards
- **State:** TanStack Query (React Query) + Zustand

## Project Structure

```
.
├── app/
│   ├── (auth)/                    # Auth route group (signin, signup)
│   │   ├── layout.tsx
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/               # Authenticated workspaces (Navbar + Footer shell)
│   │   ├── layout.tsx
│   │   ├── client/                # Client workspace
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── projects/          # Project list / create / detail
│   │   │   ├── applications/      # Incoming proposals
│   │   │   ├── contracts/         # Contracts & escrow milestones
│   │   │   └── settings/
│   │   ├── contractor/            # Contractor workspace
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── find-work/         # Browse open projects
│   │   │   ├── applications/      # My applications
│   │   │   ├── earnings/          # Payout tracking
│   │   │   ├── projects/[id]/     # Project detail + apply
│   │   │   └── settings/
│   │   └── admin/                 # Super Admin Panel
│   │       ├── page.tsx           # Platform metrics
│   │       ├── users/
│   │       ├── verifications/
│   │       ├── projects/
│   │       └── settings/
│   ├── (marketing)/               # Public marketing site (landing page)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handlers
│   │   ├── register/              # User registration
│   │   ├── profile/               # Role-specific profile updates
│   │   ├── projects/              # CRUD for projects
│   │   ├── applications/          # Apply / manage applications
│   │   └── milestones/            # Escrow milestone lifecycle
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── dashboard/                 # StatCard, ProjectCard, MilestoneRow, DashboardShell
│   ├── layout/                    # Navbar, Footer
│   ├── sections/                  # Hero, ServicesMatrix, WorkspaceSelector, HowItWorks, Stats, CTA
│   └── ui/                        # Button, Badge, Container, Input, Avatar, SectionHeading
├── constants/                     # Navigation + services data
├── lib/                           # auth, prisma singleton, rbac, utils, validations
├── providers/                     # TanStack Query + Session providers
├── stores/                        # Zustand stores (auth mirror, UI state)
├── types/                         # next-auth module augmentation
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema
│   └── seed.ts                    # Demo data seed
├── middleware.ts                  # Edge RBAC protection
└── package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/om_techwala?schema=public"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_TRUST_HOST="true"
AUTH_URL="http://localhost:3000"
```

### 3. Generate Prisma client & create the database

```bash
npx prisma generate
npx prisma db push      # or: npx prisma migrate dev --name init
```

### 4. Seed demo data

```bash
npm run db:seed
```

Demo credentials (password for all: `Password123!`):

| Role       | Email                      |
| ---------- | -------------------------- |
| Admin      | admin@omtechwala.com       |
| Client     | client@omtechwala.com      |
| Contractor | contractor@omtechwala.com  |

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## RBAC Route Map

| Prefix        | Allowed Roles                     |
| ------------- | --------------------------------- |
| `/admin`      | `ADMIN`                           |
| `/client`     | `CLIENT`, `ADMIN`                 |
| `/contractor` | `CONTRACTOR`, `ADMIN`             |
| `/signin`     | Public                            |
| `/signup`     | Public                            |
| `/`           | Public (marketing landing page)   |

## Core Workflows

**Client**
1. Register / sign in → Client workspace.
2. Post a project (DRAFT) → publish to BIDDING.
3. Review applications → shortlist → accept a contractor (assigns contractor, project moves to IN_PROGRESS).
4. Define escrow milestones with 12% platform commission.
5. Approve milestone delivery → funds released to contractor net of commission.

**Contractor**
1. Register / sign in → Contractor workspace.
2. Complete profile → request verification (admin reviews).
3. Browse BIDDING projects → apply with cover letter + proposed rate.
4. On acceptance, submit milestone work (PENDING → IN_REVIEW).
5. Track earnings & payouts in the Earnings view.

**Admin**
- Platform-wide KPIs (users, projects, active escrow, verification queue).
- Manage users, review contractor verifications, view all projects and contracts.

## Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start dev server                     |
| `npm run build`          | Production build                     |
| `npm run start`          | Start production server              |
| `npm run lint`           | ESLint                               |
| `npm run typecheck`      | TypeScript no-emit check             |
| `npm run prisma:studio`  | Open Prisma Studio                   |
| `npm run db:seed`        | Seed demo data                       |

## Notes

- Auth uses JWT sessions with a Credentials provider. OAuth providers can be added in `lib/auth.ts`.
- The escrow model is simulated at the application layer — a real payment gateway (Stripe, Wise, or similar) would replace the `PAID` transitions in `app/api/milestones/[id]/route.ts`.
- All icons come from Lucide React. No emoji or visual glyphs are used in text.

