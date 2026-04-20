# Adruva Resto — AI-Powered Restaurant Stack

Welcome to the Adruva Resto Monorepo. This repository contains the complete ecosystem for the Adruva Resto SaaS platform, designed for high-volume single outlets and global restaurant chains.

## Ecosystem Architecture

The platform is divided into four main pillars:

1. **`api/` (Core Backend)**
   - Node.js / Express / TypeScript
   - PostgreSQL (Supabase) + Redis (Session/Cache)
   - Multi-tenant architecture with Row-Level Security (RLS)
   - Real-time WebSockets via `socket.io`

2. **`outlet-app/` (Operational POS & Management)**
   - Next.js 15 / Tailwind CSS / Shadcn UI
   - Touch-optimized Point of Sale (POS)
   - Real-time Kitchen Display System (KDS)
   - Inventory, Staff, and CRM modules

3. **`chain-app/` (Multi-Unit Command Center)**
   - Next.js 15
   - Consolidated revenue reporting across outlets
   - Master Menu synchronization

4. **`superadmin-app/` (SaaS HQ)**
   - Next.js 15
   - Global subscription management and health monitoring

5. **`customer-app/` (Digital Menu & Ordering)**
   - Next.js 15 / Framer Motion
   - Mobile-first digital menu for guests
   - QR-code based ordering and loyalty tracking

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database
- Redis Server

### 1. Database Setup
Execute the SQL migrations found in `api/migrations/` in the following order:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_plans.sql`
4. `004_performance_indexes.sql`
5. `005_sequences.sql`

### 2. API Setup
```bash
cd api
cp .env.example .env
# Fill in your .env variables
npm install
npm run build
npm start
```

### 3. Frontend Setup
```bash
cd outlet-app
cp .env.example .env.local
npm install
npm run dev
```

## Security & Tenancy
Adruva Resto enforces strict data isolation using PostgreSQL Row-Level Security (RLS). All queries must run within a context setting `app.current_outlet_id`, ensuring no data leakage between restaurant chains.

## License
Proprietary software. All rights reserved.
