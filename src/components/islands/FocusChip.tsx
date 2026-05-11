import { useState, type CSSProperties } from 'react';
import RotatingText from './RotatingText';
import './FocusChip.css';

export interface FocusPhrase {
  /** What to display, e.g. "SaaS platforms". */
  text: string;
  /** CSS custom property name driving the chip's hue, e.g. "--color-pink". */
  color: string;
}

interface FocusChipProps {
  phrases: FocusPhrase[];
  rotationInterval?: number;
}

/**
 * The chip that sits under the role line in the hero.
 *
 * Wraps the lower-level RotatingText with two pieces of state-driven
 * polish that the bare component can't express:
 *
 *   1. Each phrase carries its own hue. As the text rotates, the chip's
 *      bg/border/text colors transition together over 700ms — so the
 *      phrase and its color land in sync, instead of the bg cycling on a
 *      separate keyframe clock.
 *   2. A leading dot with an outward pulse ring acts as a visual "tick"
 *      for the rotation, keeping the chip from feeling like dead chrome.
 */
export default function FocusChip({ phrases, rotationInterval = 2400 }: FocusChipProps) {
  const [index, setIndex] = useState(0);

  const texts = phrases.map((p) => p.text);
  const currentColor = phrases[index]?.color ?? '--color-accent';

  return (
    <span
      className="focus-chip"
      style={{ '--chip-color': `var(${currentColor})` } as CSSProperties}
    >
      <span className="focus-chip-dot" aria-hidden="true" />
      <RotatingText
        texts={texts}
        rotationInterval={rotationInterval}
        staggerDuration={0.018}
        staggerFrom="last"
        transition={{ type: 'spring', damping: 32, stiffness: 240, mass: 0.9 }}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-115%', opacity: 0 }}
        animatePresenceMode="popLayout"
        splitBy="characters"
        onNext={setIndex}
        mainClassName="focus-chip-text"
        splitLevelClassName="focus-chip-word"
        auto
        loop
      />
    </span>
  );
}
