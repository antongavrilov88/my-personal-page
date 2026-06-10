import { setRequestLocale } from 'next-intl/server';
import { getProjects } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { ProjectCard } from '@/components/project-card';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
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
