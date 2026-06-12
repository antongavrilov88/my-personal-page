import { getReader } from './reader';
import type { Locale } from '@/i18n/routing';

export type ProjectListItem = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  stack: readonly string[];
  priority: number;
  featured: boolean;
  repoUrl: string | null;
  liveUrl: string | null;
};

export type PostListItem = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: readonly string[];
};

function projectCollection(locale: Locale) {
  const reader = getReader();
  return locale === 'en' ? reader.collections.projectsEn : reader.collections.projectsRu;
}

function postCollection(locale: Locale) {
  const reader = getReader();
  return locale === 'en' ? reader.collections.postsEn : reader.collections.postsRu;
}

export async function getProjects(locale: Locale): Promise<ProjectListItem[]> {
  const entries = await projectCollection(locale).all();
  return entries
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      summary: entry.summary,
      role: entry.role ?? '',
      period: entry.period ?? '',
      stack: entry.stack as readonly string[],
      priority: entry.priority ?? 100,
      featured: entry.featured,
      repoUrl: entry.repoUrl ?? null,
      liveUrl: entry.liveUrl ?? null,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export async function getFeaturedProjects(locale: Locale): Promise<ProjectListItem[]> {
  return (await getProjects(locale)).filter((p) => p.featured).slice(0, 3);
}

export async function getProject(locale: Locale, slug: string) {
  const entry = await projectCollection(locale).read(slug, { resolveLinkedFiles: true });
  return entry; // entry.content is the MDX string; null if not found
}

export async function getPosts(locale: Locale): Promise<PostListItem[]> {
  const entries = await postCollection(locale).all();
  return entries
    .filter(({ entry }) => !entry.draft)
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      date: entry.date ?? '',
      summary: entry.summary ?? '',
      tags: entry.tags as readonly string[],
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(locale: Locale, slug: string) {
  return postCollection(locale).read(slug, { resolveLinkedFiles: true });
}

export function isBlogLive(posts: { slug: string }[]): boolean {
  return posts.length >= 2;
}

export async function getSite() {
  const site = await getReader().singletons.site.read();
  if (!site) throw new Error('content/site.yaml is missing — required for build');
  return site;
}

export async function getCv(locale: Locale) {
  const reader = getReader();
  const cv = await (locale === 'en' ? reader.singletons.cvEn.read() : reader.singletons.cvRu.read());
  if (!cv) throw new Error(`content/cv/${locale}.yaml is missing — required for build`);
  return cv;
}

export async function checkProjectParity(): Promise<{ missingInRu: string[]; missingInEn: string[] }> {
  const reader = getReader();
  const en = new Set(await reader.collections.projectsEn.list());
  const ru = new Set(await reader.collections.projectsRu.list());
  return {
    missingInRu: [...en].filter((s) => !ru.has(s)),
    missingInEn: [...ru].filter((s) => !en.has(s)),
  };
}

export async function checkPostParity(): Promise<{ missingInRu: string[]; missingInEn: string[] }> {
  const reader = getReader();
  const en = new Set(await reader.collections.postsEn.list());
  const ru = new Set(await reader.collections.postsRu.list());
  return {
    missingInRu: [...en].filter((s) => !ru.has(s)),
    missingInEn: [...ru].filter((s) => !en.has(s)),
  };
}
