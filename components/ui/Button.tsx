'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  withSparkle?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', withSparkle = false, fullWidth = false, className = '', children, disabled, onClick, type, ...props }, ref) => {
    const baseStyles = 'relative font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-kawaii-purple focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantStyles = {
      primary: 'bg-kawaii-purple text-white hover:bg-[#7A6BF0] shadow-[0_4px_15px_rgba(139,124,255,0.3)] hover:shadow-[0_6px_20px_rgba(139,124,255,0.4)] active:scale-95',
      secondary: 'bg-kawaii-mint text-white hover:bg-[#3DB8B0] shadow-[0_4px_15px_rgba(78,205,196,0.3)] hover:shadow-[0_6px_20px_rgba(78,205,196,0.4)] active:scale-95',
      ghost: 'bg-transparent text-text-primary hover:bg-kawaii-lavender/30 active:scale-95',
    };
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-[1rem] min-h-[36px]',
      md: 'px-6 py-3 text-base rounded-[1.5rem] min-h-[44px]',
      lg: 'px-8 py-4 text-lg rounded-[2rem] min-h-[52px]',
    };
    return (
      <motion.button ref={ref} type={type} className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`} disabled={disabled} onClick={onClick} whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.98 } : {}}>
        <span className="flex items-center justify-center gap-2">{children}{withSparkle && <span className="text-kawaii-yellow animate-[sparkle_1.5s_ease-in-out_infinite]">✨</span>}</span>
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
