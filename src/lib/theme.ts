export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

export function resolveInitialTheme(prefersDark: boolean): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (_) { /* localStorage unavailable */ }
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  const html = document.documentElement;
  if (theme === 'dark') html.classList.add('dark');
  else html.classList.remove('dark');
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
}

interface TransitionOrigin { x: number; y: number; }

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * Apply a theme with a circular-reveal animation originating from `origin`.
 * Falls back to instant `applyTheme` when the View Transitions API is unavailable
 * or the user prefers reduced motion.
 */
export function applyThemeWithTransition(theme: Theme, origin: TransitionOrigin): void {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const doc = document as DocWithVT;
  if (reduced || !doc.startViewTransition) {
    applyTheme(theme);
    return;
  }

  const transition = doc.startViewTransition(() => applyTheme(theme));

  void transition.ready.then(() => {
    const { x, y } = origin;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
      },
      {
        duration: 520,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
}
