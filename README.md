# NyayaAI — Frontend (Landing Page)

React 19 + Vite + TypeScript + Tailwind + Framer Motion. This phase covers
the public landing page only. Login, dashboard, chat, upload, and admin
views are built in the next phases and will slot into the same `App.tsx`
router.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Design reference: myScheme.gov.in

The information architecture and user-journey pattern take inspiration from
[myScheme](https://www.myscheme.gov.in) — specifically:

- A **plain, numbered 3-step journey** stated up front (their "Enter Details
  → Search → Select & Apply" becomes our "Upload → Ask → Get a cited
  answer" in `HowItWorks.tsx`)
- **Facet-based discovery** instead of one long list (their
  Category/State/Ministry tabs become "By document type / By life event /
  By department" in `Categories.tsx`)
- Accessibility treated as a first-class nav item, not an afterthought
  (`Footer.tsx` surfaces an accessibility statement link the way myScheme
  does)

The visual design itself — glass panels, neon-blue/violet on a deep indigo
base, animated gradient mesh, the live-typing citation demo — is original
and does not reuse any myScheme layout, markup, or styling.

## Design tokens (`tailwind.config.js`)

| Token | Value | Use |
|---|---|---|
| `void` | `#070B18` | Base background |
| `neon` | `#4DA3FF` | Primary AI accent, links, active states |
| `violet` | `#8B7CFF` | Citation/AI-voice accent |
| `amber` | `#F5A623` | Primary CTA only — the one warm accent |
| Display font | Space Grotesk | Headings only, used sparingly |
| Body font | Inter | All body copy |
| Mono font | IBM Plex Mono | Citations, clause references, counters |

## Signature element

`components/CitationDemo.tsx` — a looping, typed legal question that
resolves into a plain-language answer with a citation chip animating in.
It's the one deliberately "showy" element on the page; everything else
stays quiet so it reads as the moment worth remembering.

## Accessibility notes

- FAQ uses native `<details>/<summary>` — keyboard and screen-reader support
  come for free, no custom JS accordion logic to get wrong.
- All ambient animation (floating icons, gradient shift, glow pulse) is
  disabled under `prefers-reduced-motion: reduce` (see `index.css`).
- Focus rings are visible (`:focus-visible` in `index.css`) rather than
  suppressed.

## What's next (Phase 4)

Login/register pages (split layout, animated illustration + glass form,
password strength meter) and the authenticated dashboard shell, wired up
to the Phase 1 auth API.
