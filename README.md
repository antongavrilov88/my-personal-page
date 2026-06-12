# antongavrilov.dev

Personal site of Anton Gavrilov — Senior Frontend / Product Engineer.
Bilingual (EN/RU), fully static, content-managed, built as a work sample.

## Stack & architecture

- **Next.js 15** (App Router) — every public page is statically generated:
  `[locale]` segment × file-based content.
- **next-intl** — routed locales (`/en`, `/ru`) with hreflang alternates;
  message catalogs are parity-tested so locales cannot drift.
- **Keystatic** — git-backed CMS: the `/keystatic` admin edits MDX/YAML files
  in `content/`. No database; content history is git history. The admin is
  local-dev only until GitHub mode lands (v1.1).
- **Tailwind v4** — terminal-minimal design system via CSS tokens, dark
  default + light theme, mobile-first.
- **MDX** case studies with rehype-pretty-code (shiki) dual-theme highlighting.
- **CV pipeline** — one structured `content/cv/*.yaml` source renders the
  `/cv` page and the downloadable ATS-friendly PDFs (headless Chrome prints
  the page's print stylesheet).

## Development

    npm install
    npm run dev          # site on :3000, admin on /keystatic
    npm test             # vitest: message parity + content integrity
    npm run build:cv-pdf # regenerate public/cv/*.pdf (needs running dev server + Chrome)

## Quality gates

CI runs lint, typecheck, tests, and a full build on every push. Content
integrity tests fail the build when EN/RU project slugs diverge or required
contact/CV fields go missing — invalid content cannot deploy.
