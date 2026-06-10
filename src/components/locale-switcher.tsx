'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <span className="font-mono text-xs border border-line rounded px-2 py-1">
      {routing.locales.map((l, i) => (
        <span key={l}>
          {i > 0 && <span className="text-muted"> / </span>}
          {l === locale ? (
            <span className="text-accent">{l.toUpperCase()}</span>
          ) : (
            <Link href={pathname} locale={l} className="text-muted hover:text-fg">
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
