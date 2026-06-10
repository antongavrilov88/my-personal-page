'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  // false on the server and first client render; synced after mount so there
  // is never a hydration mismatch.
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      // dark is the default: absence of the attribute and of the storage key
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      aria-label="Toggle color theme"
      className="font-mono text-xs text-muted hover:text-accent border border-line rounded px-2 py-1 cursor-pointer"
    >
      ☾/☀
    </button>
  );
}
