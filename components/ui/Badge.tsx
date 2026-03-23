import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({ variant = 'primary', size = 'md', className = '', children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-kawaii-purple/20 text-text-primary border border-kawaii-purple',
    secondary: 'bg-kawaii-pink/20 text-text-primary border border-kawaii-pink',
    success: 'bg-kawaii-mint/20 text-text-primary border border-kawaii-mint',
    warning: 'bg-kawaii-yellow/20 text-text-primary border border-kawaii-yellow',
  };
  const sizeStyles = { sm: 'px-2 py-1 text-xs rounded-[0.5rem]', md: 'px-3 py-1.5 text-sm rounded-[0.75rem]' };
  return <span className={`inline-flex items-center justify-center font-medium whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>{children}</span>;
}
