import '@/styles/globals.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { inter, jetbrains } from '@/lib/fonts';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Analytics } from '@vercel/analytics/react';
import { getSite } from '@/lib/content';
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

  const site = await getSite();
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Anton Gavrilov',
    jobTitle: 'Senior Frontend / Product Engineer',
    url: SITE_URL,
    sameAs: [site.linkedinUrl, site.githubUrl].filter(Boolean),
    knowsAbout: ['React', 'TypeScript', 'Server-Driven UI', 'Go', 'Python'],
  };

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-bg text-fg flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <NextIntlClientProvider>
          <Header locale={locale as Locale} />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
