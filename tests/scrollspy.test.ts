import { describe, it, expect } from 'vitest';
import { chooseActive } from '../src/lib/scrollspy';

describe('chooseActive', () => {
  it('returns null when no entry is intersecting', () => {
    expect(chooseActive([])).toBeNull();
  });

  it('returns the section with the highest intersection ratio', () => {
    const entries = [
      { id: 'about',      ratio: 0.2 },
      { id: 'experience', ratio: 0.7 },
      { id: 'work',       ratio: 0.4 },
    ];
    expect(chooseActive(entries)).toBe('experience');
  });

  it('ignores entries below the 0.4 threshold', () => {
    const entries = [
      { id: 'about',      ratio: 0.39 },
      { id: 'experience', ratio: 0.39 },
    ];
    expect(chooseActive(entries)).toBeNull();
  });

  it('breaks ties by document order (first wins)', () => {
    const entries = [
      { id: 'about',      ratio: 0.6 },
      { id: 'experience', ratio: 0.6 },
    ];
    expect(chooseActive(entries)).toBe('about');
  });
});
