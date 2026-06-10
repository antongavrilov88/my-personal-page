import { describe, it, expect } from 'vitest';
import { getProjects, getFeaturedProjects, getSite, getCv, checkProjectParity, isBlogLive } from './content';

describe('content integrity', () => {
  it('has at least 4 projects in both locales, sorted by priority', async () => {
    for (const locale of ['en', 'ru'] as const) {
      const projects = await getProjects(locale);
      expect(projects.length).toBeGreaterThanOrEqual(4);
      const priorities = projects.map((p) => p.priority);
      expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
    }
  });

  it('has 1-3 featured projects', async () => {
    const featured = await getFeaturedProjects('en');
    expect(featured.length).toBeGreaterThanOrEqual(1);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  it('en and ru project slugs match exactly', async () => {
    const parity = await checkProjectParity();
    expect(parity.missingInRu).toEqual([]);
    expect(parity.missingInEn).toEqual([]);
  });

  it('site singleton has required contact fields', async () => {
    const site = await getSite();
    expect(site.email).toContain('@');
    expect(site.githubUrl).toBeTruthy();
    expect(site.linkedinUrl).toBeTruthy();
    expect(site.availabilityEn).toBeTruthy();
    expect(site.availabilityRu).toBeTruthy();
  });

  it('cv singletons have experience and education in both locales', async () => {
    for (const locale of ['en', 'ru'] as const) {
      const cv = await getCv(locale);
      expect(cv.experience.length).toBeGreaterThanOrEqual(4);
      expect(cv.education.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('isBlogLive', () => {
  it('is false below 2 posts, true at 2', () => {
    expect(isBlogLive([])).toBe(false);
    expect(isBlogLive([{ slug: 'a' }])).toBe(false);
    expect(isBlogLive([{ slug: 'a' }, { slug: 'b' }])).toBe(true);
  });
});
