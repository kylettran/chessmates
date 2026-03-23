import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>}
        <div className="relative">
          {leftIcon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">{leftIcon}</div>}
          <input ref={ref} className={`w-full px-4 py-3 rounded-[1rem] bg-white border-2 border-kawaii-lavender text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-kawaii-purple focus:shadow-[0_4px_15px_rgba(224,176,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${leftIcon ? 'pl-12' : ''} ${error ? 'border-red-400' : ''} ${className}`} {...props} />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
