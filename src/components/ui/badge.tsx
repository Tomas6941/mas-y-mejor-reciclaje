/* eslint-disable react-refresh/only-export-components -- patrón shadcn: variantes exportadas junto al componente */
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-soft text-primary dark:text-primary-bright',
        accent: 'border-transparent bg-accent-soft text-accent-hover dark:text-accent',
        neutral: 'border-border bg-surface-soft text-muted',
        outline: 'border-border-strong text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
