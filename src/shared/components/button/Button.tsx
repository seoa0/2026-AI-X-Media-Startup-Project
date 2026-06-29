import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'white' | 'ghost' | 'glass';
export type ButtonLayout = 'inline' | 'full' | 'fixed';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  layout?: ButtonLayout;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  layout = 'inline',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${layout}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
