import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { demos, getDemo } from '@/playground/registry';
import { SortingRace } from '@/components/playground/sorting-race';
import { DemoErrorBoundary } from '@/components/playground/error-boundary';
import { languageAlternates, pageTitle } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const demo = getDemo(slug);
  if (!demo) return {};
  const loc = locale as Locale;
  return {
    title: pageTitle(loc, demo.title[loc]),
    description: demo.summary[loc],
    alternates: languageAlternates(`/playground/${slug}`),
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap(() => demos.map((d) => ({ slug: d.slug })));
}

export default async function PlaygroundDemoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('playground');
  const demo = getDemo(slug);
  if (!demo) notFound();
  const loc = locale as Locale;

  return (
    <article className="py-12">
      <Link href="/playground" className="font-mono text-sm text-muted hover:text-accent">
        {t('back')}
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {demo.title[loc]}
      </h1>
      <p className="mb-8 max-w-2xl text-muted">{demo.summary[loc]}</p>
      {demo.slug === 'sorting-race' && (
        <DemoErrorBoundary fallback={t('error')}>
          <SortingRace />
        </DemoErrorBoundary>
      )}
      <div className="mt-10 max-w-2xl space-y-4">
        {demo.writeup[loc].map((paragraph, i) => (
          <p key={i} className="leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
