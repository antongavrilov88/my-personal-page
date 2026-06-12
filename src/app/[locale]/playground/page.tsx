import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { demos } from '@/playground/registry';
import { languageAlternates, pageTitle } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale as Locale, locale === 'ru' ? 'Песочница' : 'Playground'),
    alternates: languageAlternates('/playground'),
  };
}

export default async function PlaygroundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  return (
    <div className="py-12">
      <h1 className="mb-8 font-mono text-lg text-accent">$ ls playground/</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {demos.map((demo, i) => (
          <Link
            key={demo.slug}
            href={`/playground/${demo.slug}`}
            className="group flex flex-col gap-2 rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line-strong"
          >
            <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
            <span className="font-medium text-fg group-hover:text-accent">{demo.title[loc]}</span>
            <span className="text-sm leading-relaxed text-muted">{demo.summary[loc]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
