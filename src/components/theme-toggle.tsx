'use client';

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="font-mono text-xs text-muted hover:text-accent border border-line rounded px-2 py-1 cursor-pointer"
    >
      ☾/☀
    </button>
  );
}
