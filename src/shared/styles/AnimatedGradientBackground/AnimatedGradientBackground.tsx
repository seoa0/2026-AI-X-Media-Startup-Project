import type { ReactNode } from 'react';
import './AnimatedGradientBackground.css';

export type GradientVariant = 'landing' | 'auth' | 'chat';

interface AnimatedGradientCanvasProps {
  variant?: GradientVariant;
  embedded?: boolean;
}

export function AnimatedGradientCanvas({
  variant = 'landing',
  embedded = false,
}: AnimatedGradientCanvasProps) {
  return (
    <div
      className={`animated-gradient__canvas animated-gradient--${variant}${
        embedded ? ' animated-gradient__canvas--embedded' : ''
      }`.trim()}
      aria-hidden="true"
    >
      <div className="animated-gradient__base" />
      <div className="animated-gradient__orb animated-gradient__orb--1" />
      <div className="animated-gradient__orb animated-gradient__orb--2" />
      <div className="animated-gradient__orb animated-gradient__orb--3" />
      <div className="animated-gradient__orb animated-gradient__orb--4" />
    </div>
  );
}

interface AnimatedGradientBackgroundProps {
  variant?: GradientVariant;
  className?: string;
  children: ReactNode;
}

export default function AnimatedGradientBackground({
  variant = 'landing',
  className = '',
  children,
}: AnimatedGradientBackgroundProps) {
  return (
    <div className={`animated-gradient animated-gradient--${variant} ${className}`.trim()}>
      <AnimatedGradientCanvas variant={variant} />
      <div className="animated-gradient__content">{children}</div>
    </div>
  );
}
