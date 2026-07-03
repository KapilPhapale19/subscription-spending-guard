# Subscription Spending Guard

A full-stack web app that helps users track recurring subscriptions and get AI-powered insights into their spending habits — built for the House of Edtech Full Stack Developer assignment.

**Live App:** https://subscription-spending-guard.vercel.app
**GitHub:** https://github.com/KapilPhapale19/subscription-spending-guard

## Problem Statement

People lose track of recurring subscription costs across multiple services, leading to unnoticed overspending. This app gives users a single place to log subscriptions, see their true monthly/yearly spend, and get AI-generated insights on where they might be overspending.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Prisma 7 (with driver adapters)
- **Authentication:** NextAuth v5 (Credentials provider, JWT sessions)
- **AI:** Groq (Llama 3.3 70B) via `groq-sdk`
- **Validation:** Zod
- **Deployment:** Vercel

## Features

- Secure signup/login with hashed passwords (bcrypt)
- JWT-based session management
- Protected routes via middleware (unauthenticated users redirected to login)
- Full CRUD for subscriptions (create, read, delete)
- Real-time monthly/yearly spend calculation
- AI-powered spending analysis using Groq — flags potentially wasteful subscriptions in plain language
- Responsive, accessible UI

## Architecture

- **Frontend & Backend:** Unified in Next.js using the App Router — pages in `src/app`, API routes in `src/app/api`
- **Authentication flow:** Credentials provider validates email/password against hashed values in PostgreSQL → issues a signed JWT stored in an HTTP-only cookie → middleware verifies this token on every request to `/dashboard`
- **Authorization:** Every subscription API route checks that the authenticated user's ID matches the resource's `userId` before allowing access — prevents users from viewing/deleting others' data (IDOR protection)
- **AI integration:** User's subscription data is fetched server-side, formatted into a plain-text summary, and sent to Groq's API — the AI never has direct database access

## Database Schema

**User**
- id, name, email (unique), password (hashed), createdAt

**Subscription**
- id, name, cost, billingCycle, renewalDate, category, userId (foreign key → User), createdAt

One-to-many relationship: one User has many Subscriptions, with cascade delete.

## Security & Real-World Considerations

- **Password security:** Passwords are hashed with bcrypt (10 salt rounds) before storage — plain text passwords are never stored or logged
- **Authentication:** JWT-based sessions via NextAuth, stored in HTTP-only, secure cookies (not accessible via JavaScript, mitigating XSS-based token theft)
- **Authorization (IDOR prevention):** All subscription routes verify resource ownership server-side before returning or modifying data
- **Input validation:** All API inputs are validated with Zod schemas before touching the database, preventing malformed or malicious data
- **SQL injection prevention:** Prisma's parameterized queries prevent raw SQL injection by design — no raw SQL is used anywhere in this project
- **Environment variables:** All secrets (database URL, auth secret, AI API key) are stored in environment variables, never committed to source control
- **Enumeration prevention:** Login intentionally returns identical errors for "user not found" and "wrong password," preventing attackers from discovering which emails are registered
- **Known limitation:** Rate limiting is not yet implemented on auth or AI endpoints — a production deployment would add rate limiting (e.g., via Upstash Redis) to prevent brute-force login attempts and AI API abuse

## Future Scope

- Bank/SMS statement auto-import for automatic subscription detection
- Email/push reminders before renewal dates
- Spending trend charts over time
- Rate limiting on auth and AI endpoints
- Unit and integration test coverage
- Multi-currency support


## Local Setup

1. Clone the repo:https://github.com/KapilPhapale19/subscription-spending-guard.git

2. Install dependencies: npm install

3. Push the database schema:npx prisma db push

4. Run the development server: npm run dev

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on Vercel with CI/CD — every push to `main` automatically triggers a new production build and deployment.

---

Built by Kapil Phapale
[GitHub](https://github.com/KapilPhapale19) · [LinkedIn](https://www.linkedin.com/in/kapil-phapale-33449b31a)