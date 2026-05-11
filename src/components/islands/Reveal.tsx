import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const EASE_BRAND = [0.16, 1, 0.3, 1] as const;

const listVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_BRAND } },
};

type AsTag = 'div' | 'section' | 'ul' | 'li';

interface RevealProps {
  children: ReactNode;
  stagger?: boolean;
  as?: AsTag;
}

export default function Reveal({ children, stagger = false, as = 'div' }: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    const Tag = as as keyof React.JSX.IntrinsicElements;
    return <Tag>{children}</Tag>;
  }

  const MotionTag = motion[as] as React.ComponentType<any>;
  const variants = stagger ? listVariants : itemVariants;

  return (
    <MotionTag
      variants={variants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-15% 0px' }}
    >
      {children}
    </MotionTag>
  );
}

interface RevealItemProps {
  children: ReactNode;
  as?: 'div' | 'li';
}

export function RevealItem({ children, as = 'div' }: RevealItemProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    const Tag = as as keyof React.JSX.IntrinsicElements;
    return <Tag>{children}</Tag>;
  }

  const MotionTag = motion[as] as React.ComponentType<any>;
  return <MotionTag variants={itemVariants}>{children}</MotionTag>;
}
