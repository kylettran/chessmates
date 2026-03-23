'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'outlined';
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({ variant = 'default', hoverable = false, className = '', children, ...props }: CardProps) {
  const baseStyles = 'rounded-[1.5rem] p-6 transition-all duration-200';
  const variantStyles = {
    default: 'bg-white dark:bg-background-secondary shadow-[0_4px_15px_rgba(224,176,255,0.3)]',
    gradient: 'bg-white dark:bg-background-secondary shadow-[0_4px_15px_rgba(224,176,255,0.3)] dark:shadow-[0_4px_15px_rgba(139,124,255,0.6)]',
    outlined: 'bg-white dark:bg-background-secondary border-2 border-kawaii-lavender dark:border-kawaii-purple/40',
  };
  if (hoverable) {
    return (
      <motion.div className={`${baseStyles} ${variantStyles[variant]} cursor-pointer ${className}`} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} onClick={props.onClick}>
        {children}
      </motion.div>
    );
  }
  return <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>{children}</div>;
}
