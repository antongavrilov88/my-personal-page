import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Anton Gavrilov — Senior Frontend / Product Engineer';

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  const tagline = 'Senior Frontend / Product Engineer · React · TypeScript · SDUI';
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
        <div style={{ color: '#34d399', fontSize: 28, marginBottom: 24 }}>$ whoami</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>Anton Gavrilov</div>
        <div style={{ fontSize: 28, color: '#8b949e' }}>{tagline}</div>
      </div>
    ),
    size,
  );
}
