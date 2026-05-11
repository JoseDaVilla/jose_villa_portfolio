import { useEffect, useState, type MouseEvent } from 'react';
import { resolveInitialTheme, applyThemeWithTransition, type Theme } from '../../lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(resolveInitialTheme(prefersDark));
  }, []);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    // Use the actual pointer location when available (mouse/touch click).
    // Keyboard activation (Enter/Space) reports clientX/Y as 0 — fall back
    // to the button's centre so the reveal still feels intentional.
    let x = e.clientX;
    let y = e.clientY;
    if (!x && !y) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    applyThemeWithTransition(next, { x, y });
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="text-fg-faint hover:text-accent transition-colors duration-base
                 ease-[cubic-bezier(0.16,1,0.3,1)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                 focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm
                 inline-flex items-center justify-center w-5 h-5"
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" /><path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
