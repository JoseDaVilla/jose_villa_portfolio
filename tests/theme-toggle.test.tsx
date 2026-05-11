import { describe, it, expect, beforeEach } from 'vitest';
import { resolveInitialTheme, applyTheme } from '../src/lib/theme';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  describe('resolveInitialTheme', () => {
    it('returns the stored value when present', () => {
      localStorage.setItem('theme', 'dark');
      expect(resolveInitialTheme(false)).toBe('dark');
    });

    it('falls back to the OS preference when nothing is stored (dark)', () => {
      expect(resolveInitialTheme(true)).toBe('dark');
    });

    it('falls back to the OS preference when nothing is stored (light)', () => {
      expect(resolveInitialTheme(false)).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('adds .dark to <html> when theme is dark', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes .dark from <html> when theme is light', () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('persists to localStorage', () => {
      applyTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });
});
