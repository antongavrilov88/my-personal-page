import { Link } from '@/i18n/navigation';
import type { ProjectListItem } from '@/lib/content';

export function ProjectCard({ project, index }: { project: ProjectListItem; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line-strong"
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
