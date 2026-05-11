import { useEffect } from 'react';
import { chooseActive, type SpyEntry } from '../../lib/scrollspy';

export default function ScrollSpy() {
  useEffect(() => {
    const sectionIds = ['about', 'experience', 'work', 'contact'] as const;
    const sections = sectionIds
      .map(id => ({ id, el: document.getElementById(id) }))
      .filter((s): s is { id: string; el: HTMLElement } => s.el !== null);

    if (sections.length === 0) return;

    const ratios = new Map<string, number>(sections.map(s => [s.id, 0]));

    const setActive = (id: string | null) => {
      document.querySelectorAll<HTMLElement>('a[data-section]').forEach(link => {
        link.dataset.active = (link.dataset.section === id) ? 'true' : 'false';
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        const list: SpyEntry[] = Array.from(ratios.entries()).map(([id, ratio]) => ({ id, ratio }));
        setActive(chooseActive(list));
      },
      { threshold: [0, 0.4, 0.7, 1] }
    );

    sections.forEach(s => observer.observe(s.el));
    return () => observer.disconnect();
  }, []);

  return null;
}
