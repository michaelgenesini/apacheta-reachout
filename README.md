# ReachOut

A hosted contact form for freelancers and independents. Submissions go straight to your inbox. Nothing is stored. No dashboards. Just contact.

Built by [Apacheta Studio](https://apachetastudio.org).

---

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** (local CLI for dev, EU West Frankfurt for production) — auth + database
- **Resend** — email delivery
- **Tailwind CSS v4**

---

## Local development

### Prerequisites

- Node.js 18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Rancher Desktop](https://rancherdesktop.io/) — required by the Supabase CLI to run the local stack
- A [Resend](https://resend.com) account (free tier) — only needed to test actual email delivery; the local stack has an email catcher at `http://localhost:54324`

### 1. Install dependencies

```bash
npm install
```

This also installs the Supabase CLI as a local devDependency (`node_modules/.bin/supabase`).

### 2. Start the local Supabase stack

```bash
npm run db:start
```

This runs `supabase start`, which spins up a local Postgres + Auth + Studio via Docker. First run downloads images and takes a minute.

When it's ready you'll see output like:

```
API URL: http://127.0.0.1:54321
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
anon key: eyJhbGci...
service_role key: eyJhbGci...
```

The migration in `supabase/migrations/` runs automatically on first start.

### 3. Load seed data

```bash
npm run db:reset
```

`db reset` re-applies all migrations and then runs `supabase/seed.sql` automatically. This creates a seed user (`test@example.com` / `devpassword123`) and a live test form at `/to/testuser`.

> After this you can visit `http://localhost:3000/to/testuser` immediately — no signup needed.

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

The example file already has the correct local Supabase URL and well-known anon/service keys filled in — they're the same for every local instance. You only need to fill in `RESEND_API_KEY` if you want to test real email delivery (otherwise emails are captured by Inbucket at `http://localhost:54324`).

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local services at a glance

| Service | URL |
|---|---|
| Next.js app | http://localhost:3000 |
| Supabase API | http://127.0.0.1:54321 |
| Supabase Studio | http://127.0.0.1:54323 |
| Email catcher (Inbucket) | http://127.0.0.1:54324 |
| Postgres (direct) | `postgresql://postgres:postgres@localhost:54322/postgres` |

### Testing the full flow locally

1. Go to `http://localhost:3000/auth` → sign up with any email
2. Check Inbucket at `http://localhost:54324` for the confirmation email → click the link
3. Fill in your form settings — **add any URL as privacy policy** to go live
4. Open `/to/your-username` in a new tab → submit the form
5. Check Inbucket again for the forwarded submission email

Or skip signup entirely and use the seed form directly at `/to/testuser`.

### Useful dev commands

```bash
npm run db:start    # start local Supabase stack
npm run db:stop     # stop it (keeps data)
npm run db:reset    # wipe + re-migrate + re-seed (clean slate)
npm run db:status   # show running services and connection strings
```

---

## Project structure

```
app/
  page.tsx                  Landing page
  layout.tsx                Root layout
  not-found.tsx             404
  auth/
    page.tsx                Sign up / sign in (combined)
    confirm/route.ts        Email confirmation handler
  dashboard/
    page.tsx                Server component — auth guard + data fetch
    DashboardClient.tsx     Form config UI + usage meter
  to/[username]/
    page.tsx                Public form — server: loads profile, checks limits
    PublicFormClient.tsx    Form UI with honeypot + consent checkbox
  api/
    submit/route.ts         POST — sends email via Resend, increments count

lib/
  types.ts                  Profile type, MONTHLY_LIMIT = 100
  email.ts                  Resend helpers (submission, 80% warning, 100% hit)
  supabase/
    client.ts               Browser Supabase client
    server.ts               Server Supabase client
    middleware.ts           Session refresh + route protection

middleware.ts               Protects /dashboard, redirects authed users from /auth

supabase/
  config.toml               Local Supabase configuration
  migrations/
    20260224000000_init.sql Full schema — profiles table, RLS, functions
  seed.sql                  Dev seed — testuser profile (auto-runs on db:reset)

.env.local.example          Env vars template (local keys pre-filled)
```

---

## Data model

One table: `profiles`. One row per user.

| Column | Notes |
|---|---|
| `id` | FK to `auth.users` — auto-created on signup via trigger |
| `username` | Derived from email on signup (e.g. `marco` from `marco@example.com`). Unique. |
| `form_title` | Shown at the top of the public form |
| `intro_message` | Optional subtitle |
| `submit_label` | Button text (default: "Send message") |
| `thankyou_message` | Shown after submission |
| `destination_email` | Where submissions are emailed |
| `privacy_url` | **Required** to go live. Linked in the consent checkbox. |
| `submission_count` | All-time total (increment only) |
| `monthly_submission_count` | Resets each calendar month |
| `is_live` | `true` once `privacy_url` is set |

**Nothing else is stored.** Submission content (name, email, message) is emailed and immediately discarded.

---

## Spam protection

- **Honeypot field** — hidden `_hp` input. If filled, the request is silently accepted but not processed.
- **Rate limiting** — 5 submissions per IP per hour, in-memory. Sufficient for MVP; swap for Redis/Upstash before high-traffic use.
- No reCAPTCHA, no third-party scripts.

---

## Submission limits

Free tier: **100 submissions/month**.

| Event | Action |
|---|---|
| 80 submissions | Warning email to form owner: "What would you pay for more?" |
| 100 submissions | Form shows soft block. Personal email from Mikee to owner + internal alert. |

No pricing page. The limit is the market signal.

---

## Production deployment

### Hosting: Vercel (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all env vars (see checklist below) in Vercel project settings
4. Deploy

> For EU data residency: Vercel project settings → Functions → set **Serverless Function Region** to `fra1` (Frankfurt).

### Supabase: production project

Create a **separate** Supabase project for production — never use your local instance.

1. [supabase.com](https://supabase.com) → New project → **EU West (Frankfurt)**
2. Link the project locally (optional, for running migrations via CLI):
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
   Or paste `supabase/migrations/20260224000000_init.sql` manually into the SQL Editor.
3. **Do not run `seed.sql`** in production.
4. In Authentication → URL Configuration set:
   - Site URL: `https://reachout.apachetastudio.org`
   - Redirect URLs: `https://reachout.apachetastudio.org/auth/confirm`

### Resend: domain verification

1. [resend.com](https://resend.com) → Domains → Add domain
2. Add `apachetastudio.org` (or a subdomain)
3. Add the DNS records Resend provides
4. Once verified, `noreply@reachout.apachetastudio.org` will deliver

### Production env vars checklist

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key   # keep secret
RESEND_API_KEY=re_your_production_api_key
EMAIL_FROM=ReachOut <noreply@reachout.apachetastudio.org>
MIKEE_EMAIL=mikee@apachetastudio.org
```

### DNS

Point `reachout.apachetastudio.org` → Vercel (CNAME to `cname.vercel-dns.com`, or use Vercel nameservers on the root domain).

---

## What's deliberately not in v1

- Submission history / inbox
- Custom form fields
- File uploads
- Webhooks / integrations
- Embed script (Phase 3)
- Custom endpoint for your own HTML form (Phase 2)

---

*ReachOut is part of the Apacheta flywheel: paid tools for independents fund free tools for Italian nonprofits, which create real pathways into tech through Powercoders Italia.*
