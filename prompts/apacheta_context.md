# 🪨 Apacheta Studio — Agent Context

> This document gives you the big picture. Read it before building anything.

---

## What is Apacheta?

Apacheta is a small, independent ethical-tech studio. The name comes from Andean stone cairns — small stones placed with intention to mark a path for those who come after. That's the philosophy: build quietly, deliberately, and in service of something larger than the software itself.

This is not a startup optimizing for growth. It is a studio optimizing for purpose.

---

## The Flywheel

Apacheta operates a circular model:

1. **Paid tools for independents** (freelancers, consultants, small teams globally) generate revenue.
2. That revenue funds **free tools for Italian nonprofits** — built to their specific compliance needs.
3. Both tracks feed **Powercoders Italia**, a coding academy that creates pathways into tech for people who need them.

Every tool you build is a stone in this path. It matters that it's placed well.

---

## Principles you must carry into your work

- **Small by design.** Each tool does one thing well. No feature sprawl, no monoliths.
- **Privacy first.** No surveillance, no unnecessary data collection, no dark patterns. Ever.
- **Italian compliance is real.** The nonprofit tools are built for the Italian Third Sector (Codice del Terzo Settore, 2017). RUNTS, ODV, APS, ETS — these are not edge cases, they are the product.
- **Calm technology.** Low footprint, efficient design, no engagement tricks.
- **Ethical to the core.** No manipulative patterns. No hidden costs. No lock-in.

---

## The Tool Ecosystem

Each tool lives at its own subdomain under `apachetastudio.org`. They are independent but share a common starter template (Next.js + Supabase EU + Resend).

**For Italian nonprofits (free):**

| Tool | Purpose | Status |
|---|---|---|
| **Tessera** | Member & volunteer registry, QR cards, compliance exports | In development |
| **Verbale** | Meeting minutes management | Roadmap |
| **Cassa** | Nonprofit accounting | Roadmap |

**For independents (paid):**

| Tool | Purpose | Status |
|---|---|---|
| **Letter** | Email-to-newsletter for freelancers | Roadmap |
| **ReachOut** | Minimal contact forms | Roadmap |
| **Whistle** | Privacy-first analytics | Roadmap |

---

## What you're building right now

You are building **Tessera** — the first tool in the ecosystem and the proof of concept for the whole model. Its spec is in `tessera_spec.md`.

Get it right. Not perfect — right. One stone at a time.

---

## Technical constraints

- **Stack**: Next.js 14 (App Router) · Supabase (EU West — Frankfurt) · Resend
- **Data sovereignty**: EU hosting only. No US data residency.
- **Shared base**: Use the Apacheta starter template. Don't rebuild boilerplate.
- **Open source**: Tools will be open-sourced. Write code you'd be comfortable publishing.
- **Time constraint**: This studio runs on 5–10 hours/week. Efficiency and simplicity are not optional.

---

## Tone of the product

The UI is in Italian. The code is in English. The spirit is calm, honest, and human. No jargon. No corporate voice. These tools are used by people who give their time to causes they believe in — treat them accordingly.

---

*🪨 Small software. Big purpose.*
