import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageWrapper({ children, className = '', maxWidth = 'xl' }: PageWrapperProps) {
  return (
    <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 py-8 ${className}`}>
      {children}
    </main>
  );
}
