import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProject, getProjects } from '@/lib/content';
import { routing, type Locale } from '@/i18n/routing';
import { MdxContent } from '@/components/mdx-content';
import { languageAlternates, pageTitle } from '@/lib/seo';

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

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const locale of routing.locales) {
    const projects = await getProjects(locale);
    params.push(...projects.map((p) => ({ slug: p.slug })));
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
            {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{t('repo')}</a> : null}
            {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{t('live')}</a> : null}
            {!project.repoUrl && !project.liveUrl ? <span className="text-muted">—</span> : null}
          </dd>
        </div>
      </dl>
      <MdxContent source={project.content} />
    </article>
  );
}
