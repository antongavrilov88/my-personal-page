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
