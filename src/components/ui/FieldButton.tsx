import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FieldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'destructive';
  size?: 'default' | 'lg' | 'xl';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const FieldButton = forwardRef<HTMLButtonElement, FieldButtonProps>(
  ({ className, variant = 'primary', size = 'default', icon, isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      flex items-center justify-center gap-3 font-bold rounded-2xl
      transition-all duration-200 active:scale-95
      focus:outline-none focus:ring-4 focus:ring-ring/50
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    `;

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg',
      outline: 'border-4 border-primary text-primary bg-transparent hover:bg-primary/10',
      success: 'bg-success text-success-foreground hover:bg-success/90 shadow-lg',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg',
    };

    const sizes = {
      default: 'min-h-14 px-6 py-3 text-lg',
      lg: 'min-h-16 px-8 py-4 text-xl',
      xl: 'min-h-20 px-10 py-5 text-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

FieldButton.displayName = 'FieldButton';

export { FieldButton };
