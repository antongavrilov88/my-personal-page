import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getProjects, getPosts } from '@/lib/content';
import { demos } from '@/playground/registry';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    entries.push({ url: `${SITE_URL}/${locale}`, changeFrequency: 'monthly', priority: 1 });
    entries.push({ url: `${SITE_URL}/${locale}/projects`, changeFrequency: 'monthly', priority: 0.9 });
    entries.push({ url: `${SITE_URL}/${locale}/playground`, changeFrequency: 'monthly', priority: 0.9 });
    entries.push({ url: `${SITE_URL}/${locale}/cv`, changeFrequency: 'monthly', priority: 0.9 });
    entries.push({ url: `${SITE_URL}/${locale}/blog`, changeFrequency: 'weekly', priority: 0.9 });
    for (const demo of demos) {
      entries.push({
        url: `${SITE_URL}/${locale}/playground/${demo.slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
    for (const p of await getProjects(locale)) {
      entries.push({
        url: `${SITE_URL}/${locale}/projects/${p.slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
    for (const post of await getPosts(locale)) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }
  return entries;
}
