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
            <div key={group.category ?? ''}>
              <dt className="mb-1 font-mono text-xs text-fg">{group.category ?? ''}</dt>
              <dd className="text-sm leading-relaxed text-muted">{group.items ?? ''}</dd>
            </div>
          ))}
        </dl>
      </TerminalSection>

      <TerminalSection title={tHome('contactTitle')}>
        <p className="mb-4 max-w-2xl leading-relaxed text-muted">{tHome('contactLine')}</p>
        <div className="flex flex-wrap gap-3 font-mono text-sm">
          <a href={`mailto:${site.email}`} className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">{site.email}</a>
          <a href={site.linkedinUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">linkedin</a>
          <a href={site.githubUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">github</a>
          {site.bookingUrl ? (
            <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded border border-line px-3 py-1.5 hover:border-line-strong hover:text-accent">{tHome('bookCall')}</a>
          ) : null}
        </div>
      </TerminalSection>
    </>
  );
}
