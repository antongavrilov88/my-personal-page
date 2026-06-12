export function TerminalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 sm:py-14">
      <h2 className="mb-6 font-mono text-sm text-accent">{title}</h2>
      {children}
    </section>
  );
}
