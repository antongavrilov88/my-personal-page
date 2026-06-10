import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPosts, isBlogLive } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  const blogLive = isBlogLive(await getPosts(locale));
  return (
    <header className="site-header sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-mono text-sm text-accent">
          ~/anton-gavrilov
        </Link>
        <nav className="flex items-center gap-4 font-mono text-xs sm:gap-6 sm:text-sm">
          <Link href="/projects" className="text-muted hover:text-fg">
            {t('projects')}
          </Link>
          {blogLive && (
            <Link href="/blog" className="text-muted hover:text-fg">
              {t('blog')}
            </Link>
          )}
          <Link href="/cv" className="text-muted hover:text-fg">
            {t('cv')}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
