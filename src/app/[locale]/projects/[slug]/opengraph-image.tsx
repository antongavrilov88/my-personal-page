import { ImageResponse } from 'next/og';
import { getProject } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Case study — Anton Gavrilov';

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getProject(locale as Locale, slug);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0b0e11',
            color: '#e6edf3',
            fontFamily: 'monospace',
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          Anton Gavrilov
        </div>
      ),
      size,
    );
  }

  const title = project.title;
  const titleSize = title.length > 40 ? 44 : title.length > 24 ? 54 : 64;
  const stack = (project.stack as readonly string[]).join(' · ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#0b0e11',
          color: '#e6edf3',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ color: '#34d399', fontSize: 26, marginBottom: 28 }}>
          {`$ cat projects/${slug}.mdx`}
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 26, color: '#8b949e', marginBottom: 48 }}>{stack}</div>
        <div style={{ fontSize: 26, color: '#34d399' }}>Anton Gavrilov</div>
      </div>
    ),
    size,
  );
}
