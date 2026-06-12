import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { languageAlternates, pageTitle } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale as Locale, locale === 'ru' ? 'Блог' : 'Blog'),
    alternates: languageAlternates('/blog'),
  };
}

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
