import { describe, it, expect } from 'vitest';
import { demos } from './registry';

describe('playground registry', () => {
  it('has at least one demo', () => {
    expect(demos.length).toBeGreaterThan(0);
  });

  it('slugs are unique and url-safe', () => {
    const slugs = demos.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(demos.map((d) => [d.slug, d] as const))(
    '%s has non-empty en+ru title, summary, and writeup',
    (_slug, demo) => {
      for (const locale of ['en', 'ru'] as const) {
        expect(demo.title[locale].trim()).not.toBe('');
        expect(demo.summary[locale].trim()).not.toBe('');
        expect(demo.writeup[locale].length).toBeGreaterThan(0);
        for (const paragraph of demo.writeup[locale]) {
          expect(paragraph.trim()).not.toBe('');
        }
      }
    },
  );
});
