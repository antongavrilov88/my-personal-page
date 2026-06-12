// v1 runs Keystatic in local-storage mode: the admin only makes sense in local
// dev. Until GitHub mode lands (v1.1), hide the admin on production deploys
// unless explicitly enabled.
const adminDisabled = process.env.NODE_ENV === 'production' && process.env.KEYSTATIC_ENABLED !== 'true';

export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{adminDisabled ? <p style={{ fontFamily: 'monospace', padding: 24 }}>admin is disabled on this deployment</p> : children}</body>
    </html>
  );
}
