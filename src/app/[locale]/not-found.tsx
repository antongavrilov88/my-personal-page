import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <div className="py-24 text-center">
      <p className="mb-2 font-mono text-lg text-accent">{t('title')}</p>
      <p className="mb-8 text-muted">{t('body')}</p>
      <Link href="/" className="rounded border border-line px-4 py-2 font-mono text-sm hover:border-line-strong hover:text-accent">
        {t('home')}
      </Link>
    </div>
  );
}
