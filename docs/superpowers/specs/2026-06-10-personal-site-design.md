# Personal site for Anton Gavrilov — design spec

Date: 2026-06-10
Status: approved-pending-review

## 1. Goal and audience

A bilingual (EN/RU) personal website that gets Anton Gavrilov hired as a senior
developer in EU/UK/USA/UAE/Cyprus, polished enough to show FAANG recruiters
within 6–12 months.

Positioning (from his real CV, June 2026): **Senior Frontend / Product
Engineer — React, TypeScript, BDUI / Server-Driven UI**, with backend range
(Go, Python/Flask, PostgreSQL) and daily AI-tooled workflows. Currently at
Avito (BDUI platform); previously Yandex Market (ads & monetization), LifeIT,
Movicom Electric. Based in Bali, open to relocation/remote.

Two audiences, two reading depths:

- **Recruiter (30 seconds):** who is this, what's his level, is he available,
  how do I contact him / get his CV.
- **Engineer/interviewer (10 minutes):** can he think — case studies with
  architecture and trade-offs, interactive DSA demos, blog posts, and the
  site's own repo as a work sample.

## 2. Decisions log

| Decision | Choice |
|---|---|
| Stack | Next.js 15 + TypeScript (strict) + Tailwind v4 |
| i18n | next-intl, routed locales `/en/...` and `/ru/...`, hreflang |
| Content | File-based (MDX/YAML in repo), managed via **Keystatic** admin panel |
| Editing | `/keystatic` admin UI — local mode first, GitHub mode in production |
| Blog | Yes — infrastructure from day one; nav link appears when ≥2 posts |
| Hosting | Vercel + custom domain (e.g. antongavrilov.dev, to be purchased) |
| Design | "Terminal minimal" — near-black `#0b0e11` base, emerald accent, JetBrains Mono accents, grotesk body; light theme included, dark default |
| CV facts | Provided (CV v2, June 2026): Avito · Yandex · LifeIT · Movicom Electric; Bauman MSTU |
| Responsive | Mobile-first, fully adaptive — phone / tablet / desktop. Recruiters open links on phones; every page (including playground demos) must work touch-first on ~375px screens |
| Privacy | Public site/repo shows email + LinkedIn + GitHub only. Phone number stays out of the public site, repo, and downloadable PDF; it remains in privately-sent CV versions |

## 3. Site map

Every route exists under both `/en` and `/ru`. Root `/` redirects by
`Accept-Language` with a manual switcher in the header.

- `/` — hero (`$ whoami` terminal motif), availability badge, short about,
  3 featured projects, skills overview, latest posts (when blog is live),
  contact strip.
- `/projects` — full editable project list, ordered by a `priority` field.
- `/projects/[slug]` — case study: problem → architecture diagram → key
  decisions and trade-offs → outcome/metrics → stack tags, links.
- `/playground` and `/playground/[slug]` — interactive DSA / system-design
  visualizers with short write-ups. Launch set: 2 demos (sorting race;
  consistent hashing or rate-limiter simulator).
- `/blog` and `/blog/[slug]` — MDX posts, code highlighting, per-post EN/RU.
- `/cv` — HTML CV page + downloadable ATS-friendly PDF, per locale.
- `/keystatic` — admin panel (not indexed, not in nav).
- Localized 404.

Launch case studies (4–5), all editable/replaceable via admin:

- **Server-Driven UI at marketplace scale** (Avito/Yandex experience, written
  at CV level of detail — no proprietary internals): BDUI renderer
  architecture, typed UI contracts, cross-platform sync. His strongest
  differentiator for senior frontend roles.
- **jobhunt** — AI job-hunt platform (React + FastAPI + Claude agents, SSE).
- **agVPN / vpn-backend** — Go + WireGuard + Terraform personal infra.
- **Browsec extension** — commercial cross-browser VPN extension (side work).
- Optionally **easybook** or **invest-dashboard**.

Work-experience case studies stay at the public-CV level of detail (no
employer code, no internal metrics beyond what the CV already states).

## 4. Architecture

- **Rendering:** SSG for all public pages (`generateStaticParams` over locales
  × content). The only dynamic surface is Keystatic's admin/API routes.
- **Content model (Keystatic collections/singletons):**
  - `projects` collection — slug, EN+RU localized fields (title, summary,
    case-study body as MDX), stack tags, priority, featured flag, links
    (repo/live), cover image, architecture diagram (image or mermaid source).
  - `posts` collection — slug, per-locale title/body, date, tags, draft flag.
  - `cv` singleton — structured career data (positions, dates, achievements,
    education, skills) in both locales; renders the `/cv` page and feeds the
    PDF.
  - `site` singleton — strings like availability status, location/relocation
    line, contact links, booking-call URL (optional).
  - One entry holds both EN and RU fields, so locales cannot drift apart;
    Keystatic schema is the validation layer (build fails on missing required
    fields).
- **UI strings** (nav, buttons, labels) live in next-intl message catalogs,
  not in the CMS.
- **Playground:** each demo = pure, unit-tested TypeScript algorithm module +
  a lazy-loaded client component for rendering/controls. Same use-case/view
  separation Anton uses in interviews.
- **Styling:** Tailwind v4 design tokens; fonts self-hosted via `next/font`
  (grotesk body + JetBrains Mono accents).

## 5. Job-search boosters (added on Anton's carte blanche)

1. **Availability badge** on the hero: "Open to senior roles — EU · UAE ·
   Cyprus · remote", editable via the `site` singleton. Recruiters must not
   have to guess work authorization/relocation intent.
2. **ATS-friendly PDF CV** — single-column, machine-parseable, generated from
   the same `cv` data as the HTML page, one per locale. Recruiters' tooling
   parses it; the pretty version lives on the site.
3. **OG images** per page (generated) — LinkedIn/Telegram link previews look
   deliberate when the URL is shared.
4. **SEO:** sitemap, robots, canonical + hreflang, JSON-LD `Person` schema —
   owning the "Anton Gavrilov developer" search results.
5. **Optional "book a call" link** in contact (Calendly or similar) — config
   only; renders when the URL is set.
6. **Vercel Analytics** — see whether recruiters actually visit and what they
   read.
7. **Quality gates in CI:** lint, typecheck, Vitest, build, plus Lighthouse CI
   budget (performance/a11y/SEO ≥ 95). The repo is public and is itself a
   work sample: conventional commits, README with architecture notes.
8. **Companion task (outside this repo, roadmap):** tidy the GitHub profile —
   pin the site repo + flagship projects, add a profile README that links to
   the site.

## 6. Error handling

- Build-time: Keystatic schema validation; missing required localized fields
  or broken frontmatter fail the build — broken content cannot deploy.
- Runtime: localized `not-found` pages; playground components wrapped in
  error boundaries so a demo crash never takes down the page.
- External links (repos, live demos) checked by a CI link-checker (warning,
  not blocking).

## 7. Testing

- **Unit (Vitest + Testing Library):** algorithm modules (high coverage —
  they're a showcase), content-reading helpers, i18n routing helpers,
  key components (header/locale switch, project card).
- **Build as a test:** SSG over all locales × all content catches most
  content errors.
- **CI:** GitHub Actions — lint → typecheck → test → build → Lighthouse CI.

## 8. Phasing

- **v1 (ship first):** scaffold + design system + home, projects, CV page,
  Keystatic local admin, EN content complete, RU mirrored, CI, deployed to
  Vercel with domain.
- **v1.1:** playground with 2 visualizers; Keystatic GitHub mode (edit from
  production).
- **v1.2:** blog public with first 2–3 posts; OG image generation polish.

## 9. Open items

- Domain purchase + Vercel project (needs Anton's accounts).
- GitHub repo creation (Anton authorized use of his GitHub).
- Keystatic GitHub-mode app setup (v1.1, needs GitHub app credentials).
