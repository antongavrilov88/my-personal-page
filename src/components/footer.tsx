import { getTranslations } from 'next-intl/server';
import { getSite } from '@/lib/content';

export async function Footer() {
  const t = await getTranslations('footer');
  const site = await getSite();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Anton Gavrilov</span>
        <span className="flex gap-4">
          <a href={`mailto:${site.email}`} className="hover:text-accent">email</a>
          <a href={site.githubUrl ?? '#'} rel="me noopener" className="hover:text-accent">github</a>
          <a href={site.linkedinUrl ?? '#'} rel="me noopener" className="hover:text-accent">linkedin</a>
        </span>
        <span>{t('builtWith')}</span>
      </div>
    </footer>
  );
}
