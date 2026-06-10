# Personal Site v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 of Anton Gavrilov's bilingual (EN/RU) portfolio site — home, projects with case studies, CV page + PDF, blog infrastructure (gated), Keystatic admin, SEO, CI — per `docs/superpowers/specs/2026-06-10-personal-site-design.md`.

**Architecture:** Next.js 15 App Router, fully static public pages (SSG over `[locale]` × content). Content lives as MDX/YAML files under `content/`, edited via Keystatic admin (`/keystatic`, local mode in v1). Per-locale collections (`projectsEn`/`projectsRu`, `postsEn`/`postsRu`, `cvEn`/`cvRu`) share slugs; a build-time parity test prevents EN/RU drift. Terminal-minimal design: dark `#0b0e11` default, emerald accent, JetBrains Mono accents, mobile-first.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind v4, next-intl v4, @keystatic/core + @keystatic/next, next-mdx-remote-client + rehype-pretty-code, Vitest + Testing Library, GitHub Actions, Vercel.

**Conventions:** npm. Conventional commits. All shell commands run from repo root `/Users/antongavrilov/Desktop/workspace/my-personal-page`. Node 20+.

**Out of scope for v1 (later plans):** playground visualizers (v1.1), Keystatic GitHub mode (v1.1), blog posts content + OG polish (v1.2), Lighthouse CI budget job (v1.1).

---

### Task 1: Scaffold project and tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.prettierrc`, `eslint.config.mjs`, `vitest.config.ts`, `src/test/setup.ts`, `src/app/favicon.ico` (placeholder ok to skip)

- [ ] **Step 1: Write package.json**

```json
{
  "name": "my-personal-page",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install next@^15 react@^19 react-dom@^19 next-intl@^4 @keystatic/core @keystatic/next next-mdx-remote-client rehype-pretty-code shiki @vercel/analytics
npm install -D typescript @types/react @types/react-dom @types/node tailwindcss @tailwindcss/postcss eslint eslint-config-next prettier vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Expected: installs succeed. If a peer-dep conflict appears between React 19 and @keystatic packages, retry the keystatic install with `--legacy-peer-deps` and note it in the commit message.

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write next.config.ts, postcss.config.mjs, eslint.config.mjs, .prettierrc, .gitignore**

`next.config.ts`:
```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({});
```

`postcss.config.mjs`:
```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

`eslint.config.mjs`:
```js
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default [...compat.extends('next/core-web-vitals', 'next/typescript')];
```
(If `@eslint/eslintrc` is missing, `npm install -D @eslint/eslintrc`.)

`.prettierrc`:
```json
{ "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

`.gitignore`:
```
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts
.env*
!.env.example
.DS_Store
coverage/
```

- [ ] **Step 5: Write vitest.config.ts and test setup**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Verify toolchain runs**

Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc passes (no files yet is fine); vitest reports "no test files found" exit 0 — if vitest exits non-zero on empty, add `passWithNoTests: true` to the test config.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold next.js 15 project with typescript, tailwind v4, vitest"
```

---

### Task 2: Design tokens, fonts, root app shell

**Files:**
- Create: `src/styles/globals.css`, `src/lib/fonts.ts` (NO `src/app/layout.tsx` — see Step 3 note: the `[locale]` layout is the root layout)

- [ ] **Step 1: Write src/styles/globals.css with terminal-minimal tokens**

```css
@import 'tailwindcss';

:root {
  --bg: #0b0e11;
  --bg-panel: #11151a;
  --border: #1d242b;
  --border-strong: #2d333b;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: #34d399;
  --accent-contrast: #04342c;
}

[data-theme='light'] {
  --bg: #f6f8f9;
  --bg-panel: #ffffff;
  --border: #d8dee4;
  --border-strong: #b7c0c9;
  --text: #11181f;
  --text-muted: #57606a;
  --accent: #0f8a5f;
  --accent-contrast: #f6f8f9;
}

@theme inline {
  --color-bg: var(--bg);
  --color-panel: var(--bg-panel);
  --color-line: var(--border);
  --color-line-strong: var(--border-strong);
  --color-fg: var(--text);
  --color-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-contrast: var(--accent-contrast);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}

html {
  background: var(--bg);
  color: var(--text);
  scrollbar-gutter: stable;
}

body {
  font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--accent);
  color: var(--accent-contrast);
}
```

- [ ] **Step 2: Write src/lib/fonts.ts**

```ts
import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
});
```

- [ ] **Step 3: Write root layout (locale-agnostic shell; locale layout comes in Task 3)**

`src/app/layout.tsx`:
```tsx
import '@/styles/globals.css';
import { inter, jetbrains } from '@/lib/fonts';

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Note: `lang` is set on the locale layout's `<html>`? No — App Router allows only one root layout with `<html>`. The locale layout (Task 3) will NOT render `<html>`; instead the root layout cannot know the locale. Resolution: move `<html lang>` handling to the root layout via `params` is impossible (root layout has no locale param). Standard next-intl pattern: the `[locale]/layout.tsx` IS the root layout. Therefore: **do not create `src/app/layout.tsx`**; instead this file's content moves to `src/app/[locale]/layout.tsx` in Task 3, and `src/app/keystatic/layout.tsx` gets its own minimal `<html>` (Next.js supports multiple root layouts via route groups). Concretely:
- `src/app/[locale]/layout.tsx` — root layout for the public site (html/body, fonts, theme script, `lang={locale}`).
- `src/app/keystatic/[[...params]]/layout.tsx` — not needed; Keystatic's `makePage` renders inside a minimal root layout at `src/app/keystatic/layout.tsx` (create in Task 4).
Skip creating `src/app/layout.tsx` entirely. Keep the code above — it becomes the basis of Task 3 Step 3.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add design tokens, fonts, theme bootstrap"
```

---

### Task 3: i18n plumbing (next-intl)

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/middleware.ts`, `messages/en.json`, `messages/ru.json`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx` (temporary stub), `src/i18n/messages-parity.test.ts`

- [ ] **Step 1: Write routing, request, navigation**

`src/i18n/routing.ts`:
```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];
```

`src/i18n/request.ts`:
```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

`src/i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

`src/middleware.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|keystatic|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 2: Write message catalogs**

`messages/en.json`:
```json
{
  "nav": { "projects": "projects", "blog": "blog", "cv": "cv" },
  "hero": {
    "whoami": "$ whoami",
    "name": "Anton Gavrilov",
    "tagline": "Senior Frontend / Product Engineer — React, TypeScript, Server-Driven UI. Backend range in Go and Python.",
    "viewProjects": "View projects",
    "downloadCv": "Download CV"
  },
  "home": {
    "aboutTitle": "$ cat about.md",
    "about": "6+ years building large-scale marketplace, advertising, and platform frontends. At Avito I work on BDUI / Server-Driven UI — renderers and typed UI contracts that power a third of the product's surfaces. Before that: Yandex Market ads & monetization, customs software, industrial IoT dashboards. I ship with AI-tooled workflows daily and care about performance, clean contracts, and things that actually reach production.",
    "featuredTitle": "$ ls projects/ --featured",
    "allProjects": "all projects →",
    "skillsTitle": "$ cat skills.txt",
    "contactTitle": "$ ping anton",
    "contactLine": "The fastest way to reach me is email or LinkedIn. I read everything."
  },
  "projects": { "title": "Projects", "role": "role", "stack": "stack", "links": "links", "repo": "source", "live": "live", "back": "← all projects" },
  "blog": { "title": "Blog", "empty": "First posts are being written.", "back": "← all posts" },
  "cv": {
    "title": "Curriculum vitae",
    "download": "Download PDF",
    "experience": "Experience",
    "education": "Education",
    "skills": "Skills",
    "summary": "Summary"
  },
  "footer": { "builtWith": "Built with Next.js, Tailwind, and Keystatic. Source on GitHub." },
  "notFound": { "title": "404 — no such file or directory", "body": "This page does not exist.", "home": "cd ~" }
}
```

`messages/ru.json`:
```json
{
  "nav": { "projects": "проекты", "blog": "блог", "cv": "резюме" },
  "hero": {
    "whoami": "$ whoami",
    "name": "Антон Гаврилов",
    "tagline": "Senior Frontend / Product Engineer — React, TypeScript, Server-Driven UI. Бэкенд-опыт: Go и Python.",
    "viewProjects": "Смотреть проекты",
    "downloadCv": "Скачать резюме"
  },
  "home": {
    "aboutTitle": "$ cat about.md",
    "about": "6+ лет разработки фронтенда для крупных маркетплейсов, рекламных и платформенных продуктов. В Avito занимаюсь BDUI / Server-Driven UI — рендереры и типизированные UI-контракты, на которых работает треть продуктовых поверхностей. До этого: реклама и монетизация в Яндекс Маркете, ПО для таможни, промышленные IoT-дашборды. Ежедневно работаю с AI-инструментами, ценю производительность, чистые контракты и код, который доходит до продакшена.",
    "featuredTitle": "$ ls projects/ --featured",
    "allProjects": "все проекты →",
    "skillsTitle": "$ cat skills.txt",
    "contactTitle": "$ ping anton",
    "contactLine": "Быстрее всего я отвечаю на почту и в LinkedIn. Читаю всё."
  },
  "projects": { "title": "Проекты", "role": "роль", "stack": "стек", "links": "ссылки", "repo": "исходники", "live": "демо", "back": "← все проекты" },
  "blog": { "title": "Блог", "empty": "Первые статьи уже пишутся.", "back": "← все статьи" },
  "cv": {
    "title": "Резюме",
    "download": "Скачать PDF",
    "experience": "Опыт",
    "education": "Образование",
    "skills": "Навыки",
    "summary": "Кратко"
  },
  "footer": { "builtWith": "Сделано на Next.js, Tailwind и Keystatic. Исходники на GitHub." },
  "notFound": { "title": "404 — no such file or directory", "body": "Такой страницы нет.", "home": "cd ~" }
}
```

- [ ] **Step 3: Write the messages parity test (failing first if catalogs diverge)**

`src/i18n/messages-parity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import en from '../../messages/en.json';
import ru from '../../messages/ru.json';

function keysOf(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? keysOf(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('message catalogs', () => {
  it('en and ru have identical key sets', () => {
    expect(keysOf(ru).sort()).toEqual(keysOf(en).sort());
  });
});
```

Run: `npx vitest run src/i18n/messages-parity.test.ts`
Expected: PASS (1 test).

- [ ] **Step 4: Write the locale root layout and a stub home page**

`src/app/[locale]/layout.tsx`:
```tsx
import '@/styles/globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { inter, jetbrains } from '@/lib/fonts';

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-bg text-fg min-h-screen">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`src/app/[locale]/page.tsx` (temporary stub, replaced in Task 8):
```tsx
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { use } from 'react';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('hero');
  return <main className="p-8 font-mono">{t('name')}</main>;
}
```

- [ ] **Step 5: Verify dev server serves both locales**

Run: `npm run dev` (background), then `curl -s http://localhost:3000/en | grep -o 'Anton Gavrilov'` and `curl -s http://localhost:3000/ru | grep -o 'Антон Гаврилов'`
Expected: both greps match. `curl -sI http://localhost:3000/ | head -1` returns a 307 redirect to a locale. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: next-intl i18n routing with en/ru catalogs and parity test"
```

---

### Task 4: Keystatic config, admin routes, reader

**Files:**
- Create: `keystatic.config.ts`, `src/app/keystatic/layout.tsx`, `src/app/keystatic/[[...params]]/page.tsx`, `src/app/api/keystatic/[...params]/route.ts`, `src/lib/reader.ts`

- [ ] **Step 1: Write keystatic.config.ts**

```ts
import { config, collection, singleton, fields } from '@keystatic/core';

const projectSchema = {
  title: fields.text({ label: 'Title', validation: { isRequired: true } }),
  slug: fields.slug({ name: { label: 'Slug' } }),
  summary: fields.text({ label: 'Summary (one card line)', multiline: true, validation: { isRequired: true } }),
  role: fields.text({ label: 'My role' }),
  period: fields.text({ label: 'Period (e.g. 2025 — now)' }),
  stack: fields.array(fields.text({ label: 'Tech' }), {
    label: 'Stack',
    itemLabel: (props) => props.value,
  }),
  priority: fields.integer({ label: 'Priority (lower = higher on the list)', defaultValue: 100 }),
  featured: fields.checkbox({ label: 'Featured on home', defaultValue: false }),
  repoUrl: fields.url({ label: 'Repo URL (optional)' }),
  liveUrl: fields.url({ label: 'Live URL (optional)' }),
  content: fields.mdx({ label: 'Case study' }),
};

const postSchema = {
  title: fields.text({ label: 'Title', validation: { isRequired: true } }),
  slug: fields.slug({ name: { label: 'Slug' } }),
  date: fields.date({ label: 'Date', validation: { isRequired: true } }),
  draft: fields.checkbox({ label: 'Draft', defaultValue: true }),
  tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (p) => p.value }),
  content: fields.mdx({ label: 'Post' }),
};

const cvSchema = {
  fullName: fields.text({ label: 'Full name', validation: { isRequired: true } }),
  title: fields.text({ label: 'Professional title', validation: { isRequired: true } }),
  location: fields.text({ label: 'Location line' }),
  summary: fields.text({ label: 'Summary', multiline: true }),
  skills: fields.array(
    fields.object({
      category: fields.text({ label: 'Category' }),
      items: fields.text({ label: 'Items (comma-separated)', multiline: true }),
    }),
    { label: 'Skill groups', itemLabel: (p) => p.fields.category.value },
  ),
  experience: fields.array(
    fields.object({
      company: fields.text({ label: 'Company' }),
      role: fields.text({ label: 'Role' }),
      period: fields.text({ label: 'Period' }),
      location: fields.text({ label: 'Location' }),
      bullets: fields.array(fields.text({ label: 'Bullet', multiline: true }), {
        label: 'Achievements',
        itemLabel: (p) => p.value.slice(0, 60),
      }),
    }),
    { label: 'Experience', itemLabel: (p) => p.fields.company.value },
  ),
  education: fields.array(
    fields.object({
      school: fields.text({ label: 'School' }),
      degree: fields.text({ label: 'Degree' }),
      period: fields.text({ label: 'Period' }),
    }),
    { label: 'Education', itemLabel: (p) => p.fields.school.value },
  ),
};

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'anton.dev admin' } },
  collections: {
    projectsEn: collection({
      label: 'Projects (EN)',
      path: 'content/projects/en/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: projectSchema,
    }),
    projectsRu: collection({
      label: 'Projects (RU)',
      path: 'content/projects/ru/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: projectSchema,
    }),
    postsEn: collection({
      label: 'Posts (EN)',
      path: 'content/posts/en/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
    postsRu: collection({
      label: 'Posts (RU)',
      path: 'content/posts/ru/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
  },
  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'content/site',
      schema: {
        siteUrl: fields.url({ label: 'Canonical site URL' }),
        email: fields.text({ label: 'Email' }),
        githubUrl: fields.url({ label: 'GitHub URL' }),
        linkedinUrl: fields.url({ label: 'LinkedIn URL' }),
        telegramUrl: fields.url({ label: 'Telegram URL (optional)' }),
        bookingUrl: fields.url({ label: 'Book-a-call URL (optional)' }),
        availabilityEn: fields.text({ label: 'Availability badge (EN)' }),
        availabilityRu: fields.text({ label: 'Availability badge (RU)' }),
      },
    }),
    cvEn: singleton({ label: 'CV (EN)', path: 'content/cv/en', schema: cvSchema }),
    cvRu: singleton({ label: 'CV (RU)', path: 'content/cv/ru', schema: cvSchema }),
  },
});
```

- [ ] **Step 2: Write admin UI page, its root layout, and the API route**

`src/app/keystatic/layout.tsx`:
```tsx
export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/keystatic/[[...params]]/page.tsx`:
```tsx
import { makePage } from '@keystatic/next/ui/app';
import config from '../../../../keystatic.config';

export default makePage(config);
```

`src/app/api/keystatic/[...params]/route.ts`:
```ts
import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

export const { POST, GET } = makeRouteHandler({ config });
```

Note: `makePage` requires a client boundary in some versions — if the build errors with "makePage must be used in a client component", change the page to:
```tsx
'use client';
import { makePage } from '@keystatic/next/ui/app';
import config from '../../../../keystatic.config';
export default makePage(config);
```
Check relative import depth carefully: `keystatic.config.ts` is at repo root.

- [ ] **Step 3: Write src/lib/reader.ts**

```ts
import { cache } from 'react';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

export const getReader = cache(() => createReader(process.cwd(), keystaticConfig));
```

- [ ] **Step 4: Verify admin loads**

Run: `npm run dev` (background), open `http://localhost:3000/keystatic` — expect the Keystatic dashboard listing Projects (EN/RU), Posts (EN/RU), Site settings, CV (EN/RU). `curl -s http://localhost:3000/keystatic | head -c 200` should return HTML, not 404. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: keystatic admin with per-locale collections and cv/site singletons"
```

---

### Task 5: Typed content helpers + tests

**Files:**
- Create: `src/lib/content.ts`, `src/lib/content.test.ts`

- [ ] **Step 1: Write src/lib/content.ts**

```ts
import { getReader } from './reader';
import type { Locale } from '@/i18n/routing';

export type ProjectListItem = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  stack: readonly string[];
  priority: number;
  featured: boolean;
  repoUrl: string | null;
  liveUrl: string | null;
};

export type PostListItem = {
  slug: string;
  title: string;
  date: string;
  tags: readonly string[];
};

function projectCollection(locale: Locale) {
  const reader = getReader();
  return locale === 'en' ? reader.collections.projectsEn : reader.collections.projectsRu;
}

function postCollection(locale: Locale) {
  const reader = getReader();
  return locale === 'en' ? reader.collections.postsEn : reader.collections.postsRu;
}

export async function getProjects(locale: Locale): Promise<ProjectListItem[]> {
  const entries = await projectCollection(locale).all();
  return entries
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      summary: entry.summary,
      role: entry.role,
      period: entry.period,
      stack: entry.stack,
      priority: entry.priority,
      featured: entry.featured,
      repoUrl: entry.repoUrl,
      liveUrl: entry.liveUrl,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export async function getFeaturedProjects(locale: Locale): Promise<ProjectListItem[]> {
  return (await getProjects(locale)).filter((p) => p.featured).slice(0, 3);
}

export async function getProject(locale: Locale, slug: string) {
  const entry = await projectCollection(locale).read(slug, { resolveLinkedFiles: true });
  return entry; // entry.content is the MDX string; null if not found
}

export async function getPosts(locale: Locale): Promise<PostListItem[]> {
  const entries = await postCollection(locale).all();
  return entries
    .filter(({ entry }) => !entry.draft)
    .map(({ slug, entry }) => ({ slug, title: entry.title, date: entry.date ?? '', tags: entry.tags }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(locale: Locale, slug: string) {
  return postCollection(locale).read(slug, { resolveLinkedFiles: true });
}

export function isBlogLive(posts: { slug: string }[]): boolean {
  return posts.length >= 2;
}

export async function getSite() {
  const site = await getReader().singletons.site.read();
  if (!site) throw new Error('content/site.yaml is missing — required for build');
  return site;
}

export async function getCv(locale: Locale) {
  const reader = getReader();
  const cv = await (locale === 'en' ? reader.singletons.cvEn.read() : reader.singletons.cvRu.read());
  if (!cv) throw new Error(`content/cv/${locale}.yaml is missing — required for build`);
  return cv;
}

export async function checkProjectParity(): Promise<{ missingInRu: string[]; missingInEn: string[] }> {
  const reader = getReader();
  const en = new Set(await reader.collections.projectsEn.list());
  const ru = new Set(await reader.collections.projectsRu.list());
  return {
    missingInRu: [...en].filter((s) => !ru.has(s)),
    missingInEn: [...ru].filter((s) => !en.has(s)),
  };
}
```

- [ ] **Step 2: Write failing tests (content not seeded yet)**

`src/lib/content.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getProjects, getFeaturedProjects, getSite, getCv, checkProjectParity, isBlogLive } from './content';

describe('content integrity', () => {
  it('has at least 4 projects in both locales, sorted by priority', async () => {
    for (const locale of ['en', 'ru'] as const) {
      const projects = await getProjects(locale);
      expect(projects.length).toBeGreaterThanOrEqual(4);
      const priorities = projects.map((p) => p.priority);
      expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
    }
  });

  it('has 1-3 featured projects', async () => {
    const featured = await getFeaturedProjects('en');
    expect(featured.length).toBeGreaterThanOrEqual(1);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  it('en and ru project slugs match exactly', async () => {
    const parity = await checkProjectParity();
    expect(parity.missingInRu).toEqual([]);
    expect(parity.missingInEn).toEqual([]);
  });

  it('site singleton has required contact fields', async () => {
    const site = await getSite();
    expect(site.email).toContain('@');
    expect(site.githubUrl).toBeTruthy();
    expect(site.linkedinUrl).toBeTruthy();
    expect(site.availabilityEn).toBeTruthy();
    expect(site.availabilityRu).toBeTruthy();
  });

  it('cv singletons have experience and education in both locales', async () => {
    for (const locale of ['en', 'ru'] as const) {
      const cv = await getCv(locale);
      expect(cv.experience.length).toBeGreaterThanOrEqual(4);
      expect(cv.education.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('isBlogLive', () => {
  it('is false below 2 posts, true at 2', () => {
    expect(isBlogLive([])).toBe(false);
    expect(isBlogLive([{ slug: 'a' }])).toBe(false);
    expect(isBlogLive([{ slug: 'a' }, { slug: 'b' }])).toBe(true);
  });
});
```

Run: `npx vitest run src/lib/content.test.ts`
Expected: FAIL — content files don't exist yet (`isBlogLive` tests pass). This is the TDD gate for Task 6.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: typed content helpers with integrity tests (red until content seeded)"
```

---

### Task 6: Seed real content (site, CV, 4 projects, EN+RU)

**Files:**
- Create: `content/site.yaml`, `content/cv/en.yaml`, `content/cv/ru.yaml`, `content/projects/en/*.mdx` and `content/projects/ru/*.mdx` for slugs: `server-driven-ui`, `jobhunt`, `agvpn`, `browsec-extension`

All career facts come from Anton's CV v2 (June 2026) — do not invent numbers. **Never include the phone number** (privacy decision in spec). Keystatic stores collection entries as `<slug>.mdx` with YAML frontmatter when `format: { contentField: 'content' }` — write the files in exactly that shape so the admin reads them.

- [ ] **Step 1: Write content/site.yaml**

```yaml
siteUrl: https://antongavrilov.dev
email: antongavrilov88@gmail.com
githubUrl: https://github.com/antongavrilov88
linkedinUrl: https://linkedin.com/in/agavrilov88
telegramUrl: ''
bookingUrl: ''
availabilityEn: Open to senior roles — Europe · UK · UAE · remote
availabilityRu: Открыт к senior-позициям — Европа · UK · ОАЭ · удалённо
```
(Verify the real GitHub username with `gh api user -q .login` in Task 15 and fix `githubUrl` if it differs.)

- [ ] **Step 2: Write content/cv/en.yaml**

```yaml
fullName: Anton Gavrilov
title: Senior Frontend / Product Engineer · React, TypeScript, BDUI / Server-Driven UI
location: Bali, Indonesia · Open to Europe / UK / UAE
summary: >-
  Senior Frontend / Product Engineer with 6+ years in large-scale marketplace,
  advertising, and platform environments. Deep in React, TypeScript, and BDUI /
  Server-Driven UI — building renderers, component systems, and backend-driven
  UI contracts that scale across web and mobile. Brings backend context in Go
  and Python/Flask, ships AI-tooled workflows daily, and has consistently owned
  cross-functional feature delivery from architecture through production.
skills:
  - category: Frontend
    items: React, TypeScript, JavaScript, HTML, CSS, browser APIs, frontend architecture, component systems, state management (Redux, Effector)
  - category: Performance & quality
    items: browser profiling, React performance, Core Web Vitals, TBT, LCP, SEO-aware UI, unit/integration testing, production debugging
  - category: Platform & product
    items: BDUI / Server-Driven UI, cross-platform renderer architecture, reusable UI systems, technical decomposition, mentoring, technical interviews
  - category: Backend & data
    items: Go, Python, Flask, PostgreSQL, REST APIs, data processing pipelines
  - category: AI tooling
    items: Cursor, Claude, GitHub Copilot, OpenAI Codex
experience:
  - company: Avito
    role: Software Engineer
    period: Nov 2025 — present
    location: Remote
    bullets:
      - BDUI renderers now power ~27–30% of Avito product surfaces.
      - Translate backend UI schemas into typed React/TypeScript interfaces — explicit loading, error, and edge-state handling baked into every component contract.
      - Move frontend behavior into backend-driven contracts, decoupling feature delivery from mobile release cycles and keeping web and mobile rendering in sync.
      - Coordinate across product, design, backend, web, and mobile to ship platform features end-to-end.
  - company: Yandex
    role: Frontend Web Developer · Market, Advertising & Monetization
    period: Sep 2023 — Oct 2025
    location: Almaty, Kazakhstan
    bullets:
      - Drove ~1–3% CPM lift by shipping video embedding into ad snippets — first video-in-ad surface on the Yandex Market platform.
      - Rebuilt the web ad carousel to accept a new cross-platform image format across 3 product surfaces.
      - Reworked queue dispatcher and snippet renderer to support dynamic UI composition without regressions.
      - Led performance investigation on SEO-sensitive ad surfaces; cut TBT and first-load payload.
      - Ran on-call rotations, conducted technical interviews, mentored junior engineers.
  - company: LifeIT
    role: Frontend Developer → Senior Frontend Developer
    period: Aug 2021 — Aug 2023
    location: Moscow, Russia
    bullets:
      - Reduced initial page load from 7 s to under 1 s by redesigning the map module's data-loading strategy.
      - Led a major customs software project from architecture through delivery; promoted to Senior after 15 months.
      - Built Python/Flask and PostgreSQL services for large-dataset processing feeding a React/Redux frontend.
      - Mentored junior engineers and supervised an intern.
  - company: Movicom Electric
    role: Web Developer
    period: Nov 2019 — Jul 2021
    location: Moscow, Russia
    bullets:
      - Built the React frontend for a cloud platform monitoring warehouse battery performance across distributed sensor networks.
      - Implemented operational dashboards and real-time analytics visualizations.
      - Integrated with a Flask/PostgreSQL backend and maintained an FTP-based raw-data ingestion pipeline.
education:
  - school: Bauman Moscow State Technical University
    degree: Bachelor's, Applied Machines
    period: 2005 — 2011
```

- [ ] **Step 3: Write content/cv/ru.yaml**

Same structure, translated. Key lines (translate the rest faithfully, keep numbers identical):

```yaml
fullName: Антон Гаврилов
title: Senior Frontend / Product Engineer · React, TypeScript, BDUI / Server-Driven UI
location: Бали, Индонезия · Рассматриваю Европу / UK / ОАЭ
summary: >-
  Senior Frontend / Product Engineer с опытом 6+ лет в крупных маркетплейсах,
  рекламных и платформенных продуктах. Глубокая экспертиза в React, TypeScript
  и BDUI / Server-Driven UI — рендереры, компонентные системы и UI-контракты,
  масштабируемые на веб и мобильные платформы. Бэкенд-опыт на Go и Python/Flask,
  ежедневная работа с AI-инструментами, ответственность за фичи от архитектуры
  до продакшена.
skills:
  - category: Фронтенд
    items: React, TypeScript, JavaScript, HTML, CSS, browser APIs, архитектура фронтенда, компонентные системы, state management (Redux, Effector)
  - category: Производительность и качество
    items: профилирование, React performance, Core Web Vitals, TBT, LCP, SEO-чувствительный UI, тестирование, production-отладка
  - category: Платформа и продукт
    items: BDUI / Server-Driven UI, кросс-платформенные рендереры, переиспользуемые UI-системы, техническая декомпозиция, менторинг, собеседования
  - category: Бэкенд и данные
    items: Go, Python, Flask, PostgreSQL, REST API, пайплайны обработки данных
  - category: AI-инструменты
    items: Cursor, Claude, GitHub Copilot, OpenAI Codex
experience:
  - company: Avito
    role: Software Engineer
    period: ноя 2025 — сейчас
    location: удалённо
    bullets:
      - BDUI-рендереры обслуживают ~27–30% продуктовых поверхностей Avito.
      - Транслирую backend-схемы UI в типизированные React/TypeScript-интерфейсы с явной обработкой loading/error/edge-состояний в каждом контракте.
      - Переношу поведение фронтенда в backend-driven контракты — релизы фич не зависят от циклов мобильных релизов, веб и мобайл рендерятся синхронно.
      - Координирую продукт, дизайн, бэкенд, веб и мобайл для end-to-end доставки платформенных фич.
  - company: Яндекс
    role: Frontend-разработчик · Маркет, реклама и монетизация
    period: сен 2023 — окт 2025
    location: Алматы, Казахстан
    bullets:
      - Рост CPM на ~1–3% за счёт видео в рекламных сниппетах — первая видео-реклама на платформе Яндекс Маркета.
      - Переписал веб-карусель рекламы под новый кросс-платформенный формат изображений на 3 продуктовых поверхностях.
      - Переработал диспетчер очереди и рендерер сниппетов для динамической композиции UI без регрессий.
      - Провёл performance-расследование на SEO-чувствительных поверхностях; снизил TBT и вес первой загрузки.
      - Дежурства on-call, технические собеседования, менторинг джуниоров.
  - company: LifeIT
    role: Frontend-разработчик → Senior Frontend-разработчик
    period: авг 2021 — авг 2023
    location: Москва, Россия
    bullets:
      - Сократил первую загрузку с 7 с до менее 1 с, перепроектировав загрузку данных модуля карты.
      - Вёл крупный проект таможенного ПО от архитектуры до поставки; повышен до Senior через 15 месяцев.
      - Писал сервисы на Python/Flask и PostgreSQL для обработки больших датасетов под React/Redux-фронтенд.
      - Менторил джуниоров, курировал стажёра.
  - company: Movicom Electric
    role: Web-разработчик
    period: ноя 2019 — июл 2021
    location: Москва, Россия
    bullets:
      - Разработал React-фронтенд облачной платформы мониторинга аккумуляторов на распределённых сенсорных сетях.
      - Реализовал операционные дашборды и визуализации аналитики в реальном времени.
      - Интегрировал фронтенд с Flask/PostgreSQL-бэкендом, поддерживал FTP-пайплайн сырых данных.
education:
  - school: МГТУ им. Н. Э. Баумана
    degree: Бакалавр, прикладная механика
    period: 2005 — 2011
```

- [ ] **Step 4: Write the 4 project case studies, EN then RU**

`content/projects/en/server-driven-ui.mdx`:
```mdx
---
title: Server-Driven UI at marketplace scale
slug: server-driven-ui
summary: BDUI renderer architecture and typed UI contracts powering ~30% of product surfaces at a top-5 classifieds platform.
role: Software Engineer, BDUI platform team
period: 2025 — now
stack:
  - React
  - TypeScript
  - Server-Driven UI
  - Design systems
priority: 10
featured: true
repoUrl: ''
liveUrl: ''
---

## The problem

Marketplace product teams ship dozens of UI changes weekly across web, iOS, and
Android. Classic frontend delivery couples every change to three release
trains — the slowest one (mobile app review) sets the pace for all.

## The approach

Backend-Driven UI (BDUI): the backend sends a typed UI schema; each platform
runs a renderer that turns the schema into native components.

```text
 product config        backend             clients
┌──────────────┐   ┌──────────────┐   ┌────────────────────┐
│ feature flags │ → │ UI contract  │ → │ web renderer (TS)  │
│ experiments   │   │ (typed JSON) │   │ iOS renderer       │
│ layout rules  │   │ + validation │   │ Android renderer   │
└──────────────┘   └──────────────┘   └────────────────────┘
```

My work lives in the contract and the web renderer:

- **Typed contracts.** Every schema node maps to a TypeScript interface with
  loading, error, and edge states required by the type system — a component
  contract that cannot silently skip its failure modes.
- **Renderer architecture.** Composition over configuration: the renderer
  resolves a node tree, not feature-specific components, so new feature UIs
  ship with zero renderer changes.
- **Cross-platform parity.** Web and mobile interpret one schema; visual or
  behavioral drift is a contract bug, not a per-platform reimplementation.

## Outcome

BDUI surfaces now cover roughly 27–30% of the product. Feature delivery is
decoupled from mobile release cycles — backend config changes reach all
platforms at once.

*This case study describes my work at the public-CV level of detail; no
proprietary internals.*
```

`content/projects/en/jobhunt.mdx`:
```mdx
---
title: Jobhunt — AI-powered job search platform
slug: jobhunt
summary: Kanban-style job application tracker with Claude agents that tailor CVs, write cover letters, and research companies.
role: Solo developer — product, frontend, backend, infra
period: 2026
stack:
  - React
  - TypeScript
  - FastAPI
  - PostgreSQL
  - Anthropic API
  - Docker
priority: 20
featured: true
repoUrl: ''
liveUrl: ''
---

## The problem

A serious job search is a pipeline: dozens of postings, each needing a tailored
CV, a cover letter, and company research. Spreadsheets don't scale and generic
trackers don't do the work.

## What I built

A Trello-style board where each card is an application. Opening a card reveals
a side panel with the job description, a tailored CV, a generated cover
letter, and a chat with an AI agent that has full context of the application.

```text
React + TS (Kanban UI)
   │  REST + SSE streaming
FastAPI (async) ── Claude agents ── CV tailoring / cover letters / research
   │
PostgreSQL + Alembic migrations · Docker Compose
```

Key decisions:

- **SSE over WebSockets** for agent streaming — one-directional token flow
  needs no duplex channel, and SSE survives proxies and reconnects for free.
- **Agent tools, not prompt soup.** Each agent capability (read CV, fetch
  posting, search company) is a typed tool; the model composes them.
- **Async SQLAlchemy 2.0** end-to-end — agent calls are long-lived, the API
  stays responsive.

## Outcome

Production-ready and used daily for my own search. The repo demonstrates
full-stack ownership: typed API client, migrations, Docker deploy, CI.
```

`content/projects/en/agvpn.mdx`:
```mdx
---
title: agVPN — personal VPN service on bare infrastructure
slug: agvpn
summary: WireGuard-based VPN for family use — Go backend, Telegram bot UX, Terraform-provisioned cloud, operational runbooks.
role: Solo developer & operator
period: 2025 — 2026
stack:
  - Go
  - WireGuard
  - Terraform
  - PostgreSQL
  - Telegram Bot API
  - GitHub Actions
priority: 30
featured: true
repoUrl: ''
liveUrl: ''
---

## The problem

Commercial VPNs are a black box; running one for family across several devices
needs provisioning, key lifecycle, and observability — a real systems problem
small enough to own completely.

## What I built

```text
Telegram bot (user UX)
   │
Go service (chi) ── device provisioning · key lifecycle · health checks
   │
PostgreSQL (Goose migrations)        WireGuard peers (cloud VMs)
   │                                     ▲
GitHub Actions ── deploy ── Terraform ───┘  (infrastructure as code)
```

- **Go service** owns device records, WireGuard peer config generation, and
  lifecycle (create / freeze / revoke), exposed to users through a Telegram
  bot — zero custom client apps.
- **Terraform** provisions the cloud VMs; the same code path rebuilds the
  whole stack from nothing, which doubles as the disaster-recovery plan.
- **Operations as artifacts:** runbooks, freeze-state scripts, backup and
  verify jobs — the boring parts that make it production, not a toy.

## Outcome

Runs in production for family devices. The project is my systems-side
counterweight: networking, IaC, migrations, and ops discipline beyond the
frontend.
```

`content/projects/en/browsec-extension.mdx`:
```mdx
---
title: Browsec — commercial VPN browser extension
slug: browsec-extension
summary: Production cross-browser VPN extension (Chrome, Firefox, Opera) shipped to a multi-million user base.
role: Extension developer (contract)
period: side work
stack:
  - TypeScript
  - WebExtensions API
  - Jest
  - Selenium
priority: 40
featured: false
repoUrl: ''
liveUrl: 'https://browsec.com'
---

## The context

Browsec is a commercial VPN with a browser extension as its primary product.
I worked on the extension across Chrome, Firefox, and Opera builds.

## The interesting parts

- **One codebase, three browsers.** Manifest and API differences (MV2/MV3,
  proxy APIs, storage quirks) are isolated behind a small platform layer;
  product code stays browser-agnostic.
- **Release discipline.** A multi-browser build pipeline with Selenium smoke
  tests gates every release — when your users count in millions, a broken
  proxy config is an outage, not a bug report.

## Outcome

Multiple production releases shipped (v3.9x line). Commercial production
experience with the WebExtensions platform at large user scale.
```

`content/projects/ru/server-driven-ui.mdx` (same frontmatter shape; translated values, identical slug/priority/featured/stack):
```mdx
---
title: Server-Driven UI в масштабе маркетплейса
slug: server-driven-ui
summary: Архитектура BDUI-рендереров и типизированные UI-контракты, обслуживающие ~30% продуктовых поверхностей топ-5 классифайда.
role: Software Engineer, платформенная команда BDUI
period: 2025 — сейчас
stack:
  - React
  - TypeScript
  - Server-Driven UI
  - Design systems
priority: 10
featured: true
repoUrl: ''
liveUrl: ''
---

## Задача

Продуктовые команды маркетплейса выкатывают десятки UI-изменений в неделю на
веб, iOS и Android. Классическая фронтенд-разработка привязывает каждое
изменение к трём релизным циклам — темп задаёт самый медленный (ревью
мобильных сторов).

## Подход

Backend-Driven UI (BDUI): бэкенд отдаёт типизированную UI-схему; на каждой
платформе рендерер превращает схему в нативные компоненты.

```text
 продуктовый конфиг     бэкенд              клиенты
┌──────────────┐   ┌──────────────┐   ┌────────────────────┐
│ фичефлаги     │ → │ UI-контракт  │ → │ web-рендерер (TS)  │
│ эксперименты  │   │ (typed JSON) │   │ iOS-рендерер       │
│ правила сетки │   │ + валидация  │   │ Android-рендерер   │
└──────────────┘   └──────────────┘   └────────────────────┘
```

Моя зона — контракт и web-рендерер:

- **Типизированные контракты.** Каждый узел схемы соответствует
  TypeScript-интерфейсу, где состояния loading/error/edge обязательны на
  уровне типов — контракт не может молча пропустить сценарий отказа.
- **Архитектура рендерера.** Композиция вместо конфигурации: рендерер
  разрешает дерево узлов, а не фиче-специфичные компоненты — новые фичи не
  требуют изменений рендерера.
- **Паритет платформ.** Веб и мобайл интерпретируют одну схему; расхождение —
  это баг контракта, а не повторная реализация на каждой платформе.

## Результат

BDUI-поверхности покрывают ~27–30% продукта. Доставка фич отвязана от
мобильных релизов — изменение конфига на бэкенде доезжает до всех платформ
одновременно.

*Кейс описан на уровне публичного резюме, без проприетарных деталей.*
```

`content/projects/ru/jobhunt.mdx`, `content/projects/ru/agvpn.mdx`, `content/projects/ru/browsec-extension.mdx`: translate the EN versions faithfully with the same frontmatter shape, identical `slug`, `priority`, `featured`, `stack`, and the same ASCII diagrams (translate only the labels). Headings: «Задача», «Что я сделал», «Результат» / for Browsec: «Контекст», «Что интересного», «Результат».

- [ ] **Step 5: Run the content tests (now green)**

Run: `npx vitest run`
Expected: ALL PASS, including the Task 5 integrity tests and message parity.

- [ ] **Step 6: Verify content opens in the admin**

Run: `npm run dev` (background), open `http://localhost:3000/keystatic` → Projects (EN) shows 4 entries; Site settings and CV (EN/RU) populated. If Keystatic fails to parse a file, fix the file to match what Keystatic itself writes (create one throwaway entry in the admin and diff). Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: seed real content — site settings, cv en/ru, 4 case studies en/ru"
```

---

### Task 7: Header, footer, theme toggle, locale switcher

**Files:**
- Create: `src/components/theme-toggle.tsx`, `src/components/locale-switcher.tsx`, `src/components/header.tsx`, `src/components/footer.tsx`
- Modify: `src/app/[locale]/layout.tsx` (mount header/footer)

- [ ] **Step 1: Write theme toggle (client)**

`src/components/theme-toggle.tsx`:
```tsx
'use client';

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="font-mono text-xs text-muted hover:text-accent border border-line rounded px-2 py-1 cursor-pointer"
    >
      ☾/☀
    </button>
  );
}
```

- [ ] **Step 2: Write locale switcher (client)**

`src/components/locale-switcher.tsx`:
```tsx
'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <span className="font-mono text-xs border border-line rounded px-2 py-1">
      {routing.locales.map((l, i) => (
        <span key={l}>
          {i > 0 && <span className="text-muted"> / </span>}
          {l === locale ? (
            <span className="text-accent">{l.toUpperCase()}</span>
          ) : (
            <Link href={pathname} locale={l} className="text-muted hover:text-fg">
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 3: Write header (server component, blog gating) and footer**

`src/components/header.tsx`:
```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts, isBlogLive } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  const blogLive = isBlogLive(await getPosts(locale));
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-mono text-sm text-accent">
          ~/anton-gavrilov
        </Link>
        <nav className="flex items-center gap-4 font-mono text-xs sm:gap-6 sm:text-sm">
          <Link href="/projects" className="text-muted hover:text-fg">
            {t('projects')}
          </Link>
          {blogLive && (
            <Link href="/blog" className="text-muted hover:text-fg">
              {t('blog')}
            </Link>
          )}
          <Link href="/cv" className="text-muted hover:text-fg">
            {t('cv')}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

`src/components/footer.tsx`:
```tsx
import { getTranslations } from 'next-intl/server';
import { getSite } from '@/lib/content';

export async function Footer() {
  const t = await getTranslations('footer');
  const site = await getSite();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Anton Gavrilov</span>
        <span className="flex gap-4">
          <a href={`mailto:${site.email}`} className="hover:text-accent">email</a>
          <a href={site.githubUrl ?? '#'} rel="me noopener" className="hover:text-accent">github</a>
          <a href={site.linkedinUrl ?? '#'} rel="me noopener" className="hover:text-accent">linkedin</a>
        </span>
        <span>{t('builtWith')}</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Mount in locale layout**

In `src/app/[locale]/layout.tsx`, wrap children:
```tsx
<NextIntlClientProvider>
  <Header locale={locale as Locale} />
  <main className="mx-auto w-full max-w-4xl flex-1 px-4">{children}</main>
  <Footer />
</NextIntlClientProvider>
```
and add `flex min-h-screen flex-col` to `<body>` className. Import `Header`, `Footer`, and `type Locale`.

- [ ] **Step 5: Verify in browser, then commit**

Run dev server; check `/en` and `/ru`: header shows nav without blog (0 posts), locale switch preserves the current page, theme toggle flips and persists across reload. Check at 375px width (devtools) — nav must not overflow.

```bash
git add -A && git commit -m "feat: header with gated blog nav, locale switcher, theme toggle, footer"
```

---

### Task 8: Home page

**Files:**
- Create: `src/components/project-card.tsx`, `src/components/terminal-section.tsx`
- Modify: `src/app/[locale]/page.tsx` (replace stub)

- [ ] **Step 1: Write shared presentation components**

`src/components/terminal-section.tsx`:
```tsx
export function TerminalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 sm:py-14">
      <h2 className="mb-6 font-mono text-sm text-accent">{title}</h2>
      {children}
    </section>
  );
}
```

`src/components/project-card.tsx`:
```tsx
import { Link } from '@/i18n/navigation';
import type { ProjectListItem } from '@/lib/content';

export function ProjectCard({ project, index }: { project: ProjectListItem; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-line bg-panel p-4 transition-colors hover:border-strong"
    >
      <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, '0')}</span>
      <span className="font-medium text-fg group-hover:text-accent">{project.title}</span>
      <span className="text-sm leading-relaxed text-muted">{project.summary}</span>
      <span className="mt-auto flex flex-wrap gap-2 pt-2">
        {project.stack.slice(0, 4).map((tech) => (
          <span key={tech} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">
            {tech}
          </span>
        ))}
      </span>
    </Link>
  );
}
```
(`border-strong` → if Tailwind doesn't resolve it, use `hover:border-line-strong` matching the `--color-line-strong` token.)

- [ ] **Step 2: Write the home page**

`src/app/[locale]/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeaturedProjects, getSite, getCv } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { ProjectCard } from '@/components/project-card';
import { TerminalSection } from '@/components/terminal-section';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tHome, site, cv, featured] = await Promise.all([
    getTranslations('hero'),
    getTranslations('home'),
    getSite(),
    getCv(locale as Locale),
    getFeaturedProjects(locale as Locale),
  ]);
  const availability = locale === 'ru' ? site.availabilityRu : site.availabilityEn;

  return (
    <>
      <section className="py-16 sm:py-24">
        <p className="mb-3 font-mono text-sm text-accent">{t('whoami')}</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t('name')}</h1>
        <p className="mb-5 max-w-2xl leading-relaxed text-muted">{t('tagline')}</p>
        <p className="mb-8 inline-block rounded border border-line bg-panel px-3 py-1.5 font-mono text-xs text-accent">
          ● {availability}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast hover:opacity-90"
          >
            {t('viewProjects')}
          </Link>
          <Link
            href="/cv"
            className="rounded border border-line px-4 py-2 text-sm text-fg hover:border-line-strong"
          >
            {t('downloadCv')}
          </Link>
        </div>
      </section>

      <TerminalSection title={tHome('aboutTitle')}>
        <p className="max-w-2xl leading-relaxed text-muted">{tHome('about')}</p>
      </TerminalSection>

      <TerminalSection title={tHome('featuredTitle')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
        <p className="mt-4 font-mono text-sm">
          <Link href="/projects" className="text-accent hover:underline">
            {tHome('allProjects')}
          </Link>
        </p>
      </TerminalSection>

      <TerminalSection title={tHome('skillsTitle')}>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {cv.skills.map((group) => (
            <div key={group.category}>
              <dt className="mb-1 font-mono text-xs text-fg">{group.category}</dt>
              <dd className="text-sm leading-relaxed text-muted">{group.items}</dd>
            </div>
          ))}
        </dl>
      </TerminalSection>

      <TerminalSection title={tHome('contactTitle')}>
        <p className="mb-4 max-w-2xl leading-relaxed text-muted">{tHome('contactLine')}</p>
        <div className="flex flex-wrap gap-3 font-mono text-sm">
          <a href={`mailto:${site.email}`} className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">{site.email}</a>
          <a href={site.linkedinUrl ?? '#'} className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">linkedin</a>
          <a href={site.githubUrl ?? '#'} className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">github</a>
          {site.bookingUrl ? (
            <a href={site.bookingUrl} className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">book a call</a>
          ) : null}
        </div>
      </TerminalSection>
    </>
  );
}
```

- [ ] **Step 3: Verify and commit**

Dev server: `/en` and `/ru` render hero, badge, 3 featured cards, skills from CV data, contact strip. Check 375px: cards stack to one column, buttons wrap.

```bash
git add -A && git commit -m "feat: home page — hero, availability badge, featured projects, skills, contact"
```

---

### Task 9: Projects index + case study pages (MDX pipeline)

**Files:**
- Create: `src/components/mdx-content.tsx`, `src/app/[locale]/projects/page.tsx`, `src/app/[locale]/projects/[slug]/page.tsx`

- [ ] **Step 1: Write the MDX renderer**

`src/components/mdx-content.tsx`:
```tsx
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import rehypePrettyCode from 'rehype-pretty-code';

const prettyCodeOptions = { theme: { dark: 'github-dark-dimmed', light: 'github-light' } };

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose-terminal">
      <MDXRemote
        source={source}
        options={{ mdxOptions: { rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]] } }}
      />
    </div>
  );
}
```

Add prose styles to `src/styles/globals.css`:
```css
.prose-terminal {
  max-width: 42rem;
  line-height: 1.75;
}
.prose-terminal h2 {
  font-family: var(--font-jetbrains), monospace;
  color: var(--accent);
  font-size: 0.95rem;
  margin: 2.5rem 0 1rem;
}
.prose-terminal h2::before {
  content: '## ';
  color: var(--text-muted);
}
.prose-terminal p, .prose-terminal li { color: var(--text-muted); margin-bottom: 1rem; }
.prose-terminal strong { color: var(--text); font-weight: 600; }
.prose-terminal ul { list-style: '— ' inside; margin-bottom: 1rem; }
.prose-terminal pre {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
  background: var(--bg-panel) !important;
}
.prose-terminal code { font-family: var(--font-jetbrains), monospace; }
.prose-terminal em { color: var(--text-muted); font-size: 0.9rem; }
```

- [ ] **Step 2: Write projects index**

`src/app/[locale]/projects/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getProjects } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { ProjectCard } from '@/components/project-card';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('projects');
  const projects = await getProjects(locale as Locale);
  return (
    <div className="py-12">
      <h1 className="mb-8 font-mono text-lg text-accent">$ ls projects/</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}
```
(The `t` is used for metadata in Task 12; if unused here, drop it to keep lint green.)

- [ ] **Step 3: Write case study page**

`src/app/[locale]/projects/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProject, getProjects } from '@/lib/content';
import { routing, type Locale } from '@/i18n/routing';
import { MdxContent } from '@/components/mdx-content';

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    const projects = await getProjects(locale);
    params.push(...projects.map((p) => ({ locale, slug: p.slug })));
  }
  return params;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('projects');
  const project = await getProject(locale as Locale, slug);
  if (!project) notFound();

  return (
    <article className="py-12">
      <Link href="/projects" className="font-mono text-sm text-muted hover:text-accent">
        {t('back')}
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
      <p className="mb-6 max-w-2xl text-muted">{project.summary}</p>
      <dl className="mb-10 grid gap-4 rounded-lg border border-line bg-panel p-4 font-mono text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted">{t('role')}</dt>
          <dd className="mt-1 text-fg">{project.role}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('stack')}</dt>
          <dd className="mt-1 text-fg">{project.stack.join(' · ')}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('links')}</dt>
          <dd className="mt-1 flex gap-3">
            {project.repoUrl ? <a href={project.repoUrl} className="text-accent hover:underline">{t('repo')}</a> : null}
            {project.liveUrl ? <a href={project.liveUrl} className="text-accent hover:underline">{t('live')}</a> : null}
            {!project.repoUrl && !project.liveUrl ? <span className="text-muted">—</span> : null}
          </dd>
        </div>
      </dl>
      <MdxContent source={project.content} />
    </article>
  );
}
```

Note: with `resolveLinkedFiles: true`, `project.content` is a string. If TypeScript types it as a function, call `await project.content()` instead — check the inferred type and use whichever compiles.

- [ ] **Step 4: Verify and commit**

Dev server: `/en/projects` lists 4 cards; open each case study — MDX renders with terminal prose styles, ASCII diagrams render in code blocks without horizontal page overflow at 375px (the `pre` scrolls internally). `/ru/projects` mirrors. Nonexistent slug 404s.

```bash
git add -A && git commit -m "feat: projects index and mdx case study pages"
```

---

### Task 10: CV page + PDF generation

**Files:**
- Create: `src/app/[locale]/cv/page.tsx`, `scripts/build-cv-pdf.sh`, `public/cv/` (generated PDFs)
- Modify: `src/styles/globals.css` (print styles)

- [ ] **Step 1: Write the CV page**

`src/app/[locale]/cv/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCv, getSite } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function CvPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cv');
  const [cv, site] = await Promise.all([getCv(locale as Locale), getSite()]);

  return (
    <article id="cv" className="mx-auto max-w-2xl py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <h1 className="font-mono text-lg text-accent">$ cat cv.pdf</h1>
        <a
          href={`/cv/anton-gavrilov-cv-${locale}.pdf`}
          download
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast hover:opacity-90"
        >
          {t('download')}
        </a>
      </div>

      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">{cv.fullName}</h2>
        <p className="mt-1 text-muted">{cv.title}</p>
        <p className="mt-1 font-mono text-xs text-muted">
          {cv.location} · {site.email} · linkedin.com/in/agavrilov88
        </p>
      </header>

      <section className="mb-8">
        <h3 className="mb-2 font-mono text-sm text-accent">{t('summary')}</h3>
        <p className="text-sm leading-relaxed text-muted">{cv.summary}</p>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 font-mono text-sm text-accent">{t('skills')}</h3>
        {cv.skills.map((g) => (
          <p key={g.category} className="mb-1.5 text-sm leading-relaxed">
            <span className="text-fg">{g.category}: </span>
            <span className="text-muted">{g.items}</span>
          </p>
        ))}
      </section>

      <section className="mb-8">
        <h3 className="mb-4 font-mono text-sm text-accent">{t('experience')}</h3>
        {cv.experience.map((job) => (
          <div key={`${job.company}-${job.period}`} className="mb-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-medium text-fg">
                {job.company} · {job.role}
              </p>
              <p className="font-mono text-xs text-muted">
                {job.period} | {job.location}
              </p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {job.bullets.map((b) => (
                <li key={b} className="text-sm leading-relaxed text-muted">
                  — {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h3 className="mb-3 font-mono text-sm text-accent">{t('education')}</h3>
        {cv.education.map((e) => (
          <div key={e.school} className="flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="text-sm text-fg">
              {e.school} · {e.degree}
            </p>
            <p className="font-mono text-xs text-muted">{e.period}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Add print styles to globals.css**

```css
@media print {
  :root {
    --bg: #ffffff;
    --bg-panel: #ffffff;
    --border: #cccccc;
    --text: #111111;
    --text-muted: #333333;
    --accent: #111111;
    --accent-contrast: #ffffff;
  }
  header, footer, .print\:hidden { display: none !important; }
  body { font-size: 11px; }
  article#cv { padding: 0; max-width: none; }
}
```
(Site `<header>`/`<footer>` elements hide on print; the CV's own `<header>` is inside `article#cv` — scope the rule: `body > div header` if needed, or give the site header a `site-header` class and hide that. Verify in print preview and adjust selectors so the CV header survives.)

- [ ] **Step 3: Write scripts/build-cv-pdf.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="${1:-http://localhost:3000}"
mkdir -p public/cv
for locale in en ru; do
  "$CHROME" --headless=new --disable-gpu \
    --print-to-pdf="public/cv/anton-gavrilov-cv-${locale}.pdf" \
    --no-pdf-header-footer \
    "${BASE}/${locale}/cv"
  echo "wrote public/cv/anton-gavrilov-cv-${locale}.pdf"
done
```

`chmod +x scripts/build-cv-pdf.sh`. Add npm script: `"build:cv-pdf": "scripts/build-cv-pdf.sh"`.

- [ ] **Step 4: Generate PDFs and verify**

Run: `npm run dev` (background), wait for ready, then `npm run build:cv-pdf`. Stop dev server.
Expected: two PDFs in `public/cv/`. Open both — readable single-column layout, black on white, **no phone number anywhere**, Cyrillic renders in the RU PDF. The download button on `/en/cv` serves the file.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: cv page with print styles and chrome-generated pdf downloads"
```

---

### Task 11: Blog routes (gated)

**Files:**
- Create: `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`

- [ ] **Step 1: Write blog index**

`src/app/[locale]/blog/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const posts = await getPosts(locale as Locale);
  return (
    <div className="py-12">
      <h1 className="mb-8 font-mono text-lg text-accent">$ ls blog/</h1>
      {posts.length === 0 ? (
        <p className="font-mono text-sm text-muted">{t('empty')}</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group flex flex-wrap items-baseline gap-x-4">
                <span className="font-mono text-xs text-muted">{post.date}</span>
                <span className="text-fg group-hover:text-accent">{post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write post page**

`src/app/[locale]/blog/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPost, getPosts } from '@/lib/content';
import { routing, type Locale } from '@/i18n/routing';
import { MdxContent } from '@/components/mdx-content';

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    const posts = await getPosts(locale);
    params.push(...posts.map((p) => ({ locale, slug: p.slug })));
  }
  return params;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const post = await getPost(locale as Locale, slug);
  if (!post || post.draft) notFound();

  return (
    <article className="py-12">
      <Link href="/blog" className="font-mono text-sm text-muted hover:text-accent">
        {t('back')}
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">{post.title}</h1>
      <p className="mb-8 font-mono text-xs text-muted">{post.date}</p>
      <MdxContent source={post.content} />
    </article>
  );
}
```
(Same `content` string-vs-function note as Task 9 Step 3.)

- [ ] **Step 3: Verify and commit**

`/en/blog` shows the empty-state line (0 posts); header still hides the blog link. Direct URL works — intentional: the section exists, it's just not advertised.

```bash
git add -A && git commit -m "feat: blog routes with draft filtering and empty state"
```

---

### Task 12: SEO — metadata, hreflang, sitemap, robots, JSON-LD, OG image

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/[locale]/opengraph-image.tsx`, `src/lib/seo.ts`
- Modify: `src/app/[locale]/layout.tsx` (generateMetadata + JSON-LD), `src/app/[locale]/projects/[slug]/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`, `src/app/[locale]/cv/page.tsx`, `src/app/[locale]/projects/page.tsx` (per-page generateMetadata)

- [ ] **Step 1: Write src/lib/seo.ts**

```ts
import type { Locale } from '@/i18n/routing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://antongavrilov.dev';

export function languageAlternates(path: string) {
  return {
    canonical: undefined,
    languages: {
      en: `${SITE_URL}/en${path}`,
      ru: `${SITE_URL}/ru${path}`,
      'x-default': `${SITE_URL}/en${path}`,
    },
  };
}

export function pageTitle(locale: Locale, suffix?: string) {
  const base = locale === 'ru' ? 'Антон Гаврилов — Senior Frontend Engineer' : 'Anton Gavrilov — Senior Frontend Engineer';
  return suffix ? `${suffix} · ${base}` : base;
}
```

- [ ] **Step 2: Add generateMetadata to the locale layout + JSON-LD Person**

In `src/app/[locale]/layout.tsx` add:
```tsx
import type { Metadata } from 'next';
import { SITE_URL, languageAlternates, pageTitle } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description =
    locale === 'ru'
      ? 'Senior Frontend / Product Engineer — React, TypeScript, Server-Driven UI. Проекты, кейсы, резюме.'
      : 'Senior Frontend / Product Engineer — React, TypeScript, Server-Driven UI. Projects, case studies, CV.';
  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle(locale as 'en' | 'ru'),
    description,
    alternates: languageAlternates(''),
    openGraph: {
      type: 'website',
      siteName: 'Anton Gavrilov',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
    },
  };
}
```

And inside the layout body (in `<body>`, before children), JSON-LD:
```tsx
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Anton Gavrilov',
  jobTitle: 'Senior Frontend / Product Engineer',
  url: SITE_URL,
  sameAs: ['https://linkedin.com/in/agavrilov88'],
  knowsAbout: ['React', 'TypeScript', 'Server-Driven UI', 'Go', 'Python'],
};
// in JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
```

- [ ] **Step 3: Per-page generateMetadata**

Add to projects index, cv page (static titles via `pageTitle(locale, ...)` + `languageAlternates('/projects')` etc.), and to project/blog detail pages (dynamic):

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(locale as Locale, slug);
  if (!project) return {};
  return {
    title: pageTitle(locale as Locale, project.title),
    description: project.summary,
    alternates: languageAlternates(`/projects/${slug}`),
  };
}
```
(Blog: same with `getPost`, description from title.)

- [ ] **Step 4: sitemap.ts and robots.ts**

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getProjects, getPosts } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    entries.push({ url: `${SITE_URL}/${locale}`, changeFrequency: 'monthly', priority: 1 });
    entries.push({ url: `${SITE_URL}/${locale}/projects`, changeFrequency: 'monthly', priority: 0.9 });
    entries.push({ url: `${SITE_URL}/${locale}/cv`, changeFrequency: 'monthly', priority: 0.9 });
    for (const p of await getProjects(locale)) {
      entries.push({ url: `${SITE_URL}/${locale}/projects/${p.slug}`, changeFrequency: 'monthly', priority: 0.8 });
    }
    for (const post of await getPosts(locale)) {
      entries.push({ url: `${SITE_URL}/${locale}/blog/${post.slug}`, changeFrequency: 'weekly', priority: 0.7 });
    }
  }
  return entries;
}
```

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/keystatic', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: OG image**

`src/app/[locale]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tagline =
    locale === 'ru'
      ? 'Senior Frontend / Product Engineer · React · TypeScript · SDUI'
      : 'Senior Frontend / Product Engineer · React · TypeScript · SDUI';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#0b0e11',
          color: '#e6edf3',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ color: '#34d399', fontSize: 28, marginBottom: 24 }}>$ whoami</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>Anton Gavrilov</div>
        <div style={{ fontSize: 28, color: '#8b949e' }}>{tagline}</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 6: Verify and commit**

`npm run build` succeeds. `curl -s http://localhost:3000/sitemap.xml` (via `npm run start`) lists both locales and all slugs; `/robots.txt` disallows `/keystatic`; page source of `/en` contains `hreflang` link tags and the JSON-LD script.

```bash
git add -A && git commit -m "feat: seo — hreflang alternates, sitemap, robots, json-ld person, og image"
```

---

### Task 13: Localized 404

**Files:**
- Create: `src/app/[locale]/not-found.tsx`, `src/app/[locale]/[...rest]/page.tsx`

- [ ] **Step 1: Write not-found and catch-all**

`src/app/[locale]/not-found.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <div className="py-24 text-center">
      <p className="mb-2 font-mono text-lg text-accent">{t('title')}</p>
      <p className="mb-8 text-muted">{t('body')}</p>
      <Link href="/" className="rounded border border-line px-4 py-2 font-mono text-sm hover:border-line-strong hover:text-accent">
        {t('home')}
      </Link>
    </div>
  );
}
```

`src/app/[locale]/[...rest]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';

export default function CatchAll() {
  notFound();
}
```

- [ ] **Step 2: Verify and commit**

`/en/nope` renders the localized 404 inside the site chrome; `/ru/nope` in Russian.

```bash
git add -A && git commit -m "feat: localized 404 with catch-all route"
```

---

### Task 14: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Verify the same gates pass locally, then commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all green. Fix anything that isn't before committing.

```bash
git add -A && git commit -m "ci: lint, typecheck, test, build on push and pr"
```

---

### Task 15: Analytics, README, GitHub repo, deploy prep

**Files:**
- Create: `README.md`, `.env.example`
- Modify: `src/app/[locale]/layout.tsx` (analytics), `content/site.yaml` (real GitHub URL)

- [ ] **Step 1: Add Vercel Analytics**

In `src/app/[locale]/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';
// inside <body>, after children:
<Analytics />
```

- [ ] **Step 2: Write .env.example and README.md**

`.env.example`:
```
NEXT_PUBLIC_SITE_URL=https://antongavrilov.dev
```

`README.md`:
```markdown
# antongavrilov.dev

Personal site of Anton Gavrilov — Senior Frontend / Product Engineer.
Bilingual (EN/RU), fully static, content-managed, built as a work sample.

## Stack & architecture

- **Next.js 15** (App Router) — every public page is statically generated:
  `[locale]` segment × file-based content.
- **next-intl** — routed locales (`/en`, `/ru`) with hreflang alternates;
  message catalogs are parity-tested so locales cannot drift.
- **Keystatic** — git-backed CMS: `/keystatic` admin edits MDX/YAML files in
  `content/`. No database; content history is git history.
- **Tailwind v4** — terminal-minimal design system via CSS tokens, dark
  default + light theme, mobile-first.
- **MDX** case studies with rehype-pretty-code (shiki) highlighting.
- **CV pipeline** — one structured `content/cv/*.yaml` source renders the
  `/cv` page and the downloadable ATS-friendly PDFs.

## Development

    npm install
    npm run dev          # site on :3000, admin on /keystatic
    npm test             # vitest: message parity + content integrity
    npm run build:cv-pdf # regenerate public/cv/*.pdf (needs dev server + Chrome)

## Quality gates

CI runs lint, typecheck, tests, and a full build on every push. Content
integrity tests fail the build when EN/RU project slugs diverge or required
contact/CV fields go missing.
```

- [ ] **Step 3: Create the GitHub repo and push**

```bash
gh auth status
gh api user -q .login
```
Fix `content/site.yaml` `githubUrl` to the real login if it differs from `antongavrilov88`, then:
```bash
git add -A && git commit -m "feat: analytics, readme, env example"
gh repo create my-personal-page --public --source=. --remote=origin --push
```
Expected: repo visible at `github.com/<login>/my-personal-page`, CI run starts and passes.

- [ ] **Step 4: Deploy checklist for Anton (manual, document in final report)**

These need Anton's accounts — do not attempt them, list them in the final summary:
1. Buy the domain (suggest `antongavrilov.dev`).
2. `vercel.com/new` → import `my-personal-page` → framework auto-detected → set env `NEXT_PUBLIC_SITE_URL=https://<domain>`.
3. Add the domain in Vercel project settings.
4. After first deploy, verify `/en`, `/ru`, `/sitemap.xml`, the PDF downloads, and LinkedIn link preview (paste URL into a LinkedIn draft post).

---

### Task 16: Final verification

- [ ] **Step 1: Full local gate**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass with zero warnings that matter.

- [ ] **Step 2: Route sweep on the production build**

`npm run start` (background), then verify HTTP 200 for: `/en`, `/ru`, `/en/projects`, `/ru/projects`, all 4 `/en/projects/<slug>` + 4 RU, `/en/cv`, `/ru/cv`, `/en/blog`, `/ru/blog`, `/sitemap.xml`, `/robots.txt`, both `/cv/*.pdf` files, and HTTP 404 for `/en/nope`:

```bash
for p in /en /ru /en/projects /ru/projects /en/projects/server-driven-ui /en/projects/jobhunt /en/projects/agvpn /en/projects/browsec-extension /ru/projects/server-driven-ui /ru/projects/jobhunt /ru/projects/agvpn /ru/projects/browsec-extension /en/cv /ru/cv /en/blog /ru/blog /sitemap.xml /robots.txt /cv/anton-gavrilov-cv-en.pdf /cv/anton-gavrilov-cv-ru.pdf; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3000$p"); echo "$code $p";
done
```
Expected: all 200. Then `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/en/nope` → 404.

- [ ] **Step 3: Visual smoke at three widths**

Using the preview/browser tooling: 375px, 768px, 1280px on `/en` and one case study — no horizontal scroll, nav usable, cards stack properly, theme toggle works, RU page renders Cyrillic correctly.

- [ ] **Step 4: Grep for the phone number (must be absent)**

Run: `grep -ri "194-4166\|1944166" --exclude-dir=node_modules --exclude-dir=.git . ; echo "exit: $?"`
Expected: no matches (exit 1).

- [ ] **Step 5: Final commit and report**

Commit any stragglers. Report to Anton: what shipped, the deploy checklist from Task 15 Step 4, and what's next (v1.1 playground + Keystatic GitHub mode, v1.2 blog posts).
