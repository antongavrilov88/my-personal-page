import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPost, getPosts } from '@/lib/content';
import { routing, type Locale } from '@/i18n/routing';
import { MdxContent } from '@/components/mdx-content';

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const locale of routing.locales) {
    const posts = await getPosts(locale);
    params.push(...posts.map((p) => ({ slug: p.slug })));
  }
  return params;
}

export const dynamicParams = false;

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
