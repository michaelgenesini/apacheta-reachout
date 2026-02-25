# ReachOut — Phase 1 Product Spec
**Apacheta Studio** · Early Access MVP

---

## What it is

ReachOut is a hosted contact form for freelancers and independents who want to be reachable — without surveillance, dark patterns, or unnecessary complexity. Submissions go straight to your inbox. Nothing is stored. No dashboards. Just contact.

---

## Phase 1 Scope

Hosted form page only (`reachout.apachetastudio.org/to/username`). No embeds, no custom HTML forms yet.

---

## User Flow

1. Sign up → configure your form (5 fields, 2 minutes)
2. Get a public URL: `reachout.apachetastudio.org/to/username`
3. Share the link — in your email footer, portfolio, bio
4. Submissions arrive in your inbox via Resend

---

## Form Configuration

| Field | Type | Notes |
|---|---|---|
| Form title | Text | e.g. "Get in touch with Marco" |
| Intro message | Text (optional) | Short welcome line |
| Submit button label | Text | Default: "Send message" |
| Thank-you message | Text | Shown after submission |
| Destination email | Email | Can differ from login email |
| Privacy policy URL | URL | **Required** before form goes live |

---

## Visitor Form (Fixed Fields)

Three fields, always the same:

1. **Name** — text, required
2. **Email** — email, required
3. **Message** — textarea, required

Plus a **privacy consent checkbox**: "I have read and accept the [privacy policy]" — links to the URL configured by the user. Form cannot be submitted without it.

Spam protection: honeypot field + rate limiting. No reCAPTCHA, no third-party scripts.

---

## Privacy & Data Model

| Layer | Role | Responsibility |
|---|---|---|
| Apacheta | Data Processor | Delivers email, tracks counts only |
| Freelancer | Data Controller | Owns visitor data, must have privacy policy |
| Visitor | Data Subject | Consents via checkbox before submitting |

**What Apacheta stores:**
- User account (email, username, config)
- Submission count per form (increment only, no payload)
- Emails sent count per user/month

**What Apacheta never stores:**
- Submission content
- Visitor names, emails, messages
- IP addresses or fingerprints

EU infrastructure (Supabase EU region). GDPR-compliant by design.

---

## Limits & Market Validation

**Free tier: 100 submissions/month**

| Event | Action |
|---|---|
| 80% limit reached | Email to user: "You're almost at your limit — what would you pay for more?" |
| 100% limit reached | Form shows soft block. Personal email from Mikee to user. |

No pricing page. No fake tiers. The limit is the signal.

**Four metrics tracked:**
1. Signups
2. Forms created (activation)
3. Submissions received (engagement)
4. Limit hits (willingness to pay)

---

## Landing Page Copy

**Headline**
A contact form that respects everyone involved.

**Subheadline**
For freelancers and independents who want to be reachable — without surveillance, dark patterns, or unnecessary complexity.

**The honest paragraph**
Most contact form tools track your visitors, store their data, and monetize the gap between what they promise and what they do. ReachOut doesn't. Submissions go straight to your inbox. Nothing is stored. No cookies. No dashboards. Just contact.

**How it works**
- Create your form in two minutes
- Share your link
- Submissions arrive in your inbox

**Early access banner**
*ReachOut is in early access. It's free while we figure out what it should cost. If you use it and have thoughts, we want to hear them.*

**Values line**
Built by Apacheta — a studio that believes small software can do big things without leaving a mess behind.

**CTA**
Get your form →

---

## Tech Stack

| Component | Tool |
|---|---|
| Framework | Next.js |
| Database | Supabase (EU region) |
| Email delivery | Resend |
| Auth | Supabase Auth |
| Hosting | European infrastructure |
| Spam protection | Honeypot + rate limiting |

---

## Build Milestones

| Milestone | Scope | Est. Time |
|---|---|---|
| M1 — Engine | Auth, form config, endpoint generation, Resend delivery | 1 week |
| M2 — Hosted page | Public `/to/username` page, consent checkbox, thank-you state | 1 week |
| M3 — Limits | Submission counting, 80%/100% email triggers | 2–3 days |
| M4 — Polish | Landing page, one-page docs, early access banner | 2–3 days |

**Total: ~3 weeks at 5–10h/week**

---

## What's Deliberately Excluded (v1)

- Dashboard / submission history
- Custom fields
- File uploads
- Integrations / webhooks
- Embed script (Phase 3)
- Custom endpoint / own HTML form (Phase 2)

---

## Future Phases

**Phase 2 — Endpoint (A)**
Same form config generates an endpoint URL. User points their own `<form>` at it. One-page docs, copy-paste example.

**Phase 3 — Embed (B)**
Script tag renders the hosted form inline on any page via shadow DOM.

---

*ReachOut is part of the Apacheta flywheel: paid tools for independents fund free tools for Italian nonprofits, which create real internship opportunities through Powercoders Italia.*
