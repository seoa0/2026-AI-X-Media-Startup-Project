import type { ReactNode } from 'react';
import './AnimatedGradientBackground.css';

interface AnimatedGradientBackgroundProps {
  variant?: 'landing' | 'auth';
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
      <div className="animated-gradient__canvas" aria-hidden="true">
        <div className="animated-gradient__orb animated-gradient__orb--1" />
        <div className="animated-gradient__orb animated-gradient__orb--2" />
        <div className="animated-gradient__orb animated-gradient__orb--3" />
        <div className="animated-gradient__orb animated-gradient__orb--4" />
      </div>
      <div className="animated-gradient__content">{children}</div>
    </div>
  );
}
