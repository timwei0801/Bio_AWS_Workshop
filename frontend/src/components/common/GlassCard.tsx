import { forwardRef, HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  tone?: 'default' | 'violet' | 'emerald' | 'red' | 'sky';
}

const PADDING: Record<NonNullable<GlassCardProps['padding']>, string> = {
  none: '',
  sm:   'px-3 py-2',
  md:   'p-4',
  lg:   'p-5',
};

const TONE_RING: Record<NonNullable<GlassCardProps['tone']>, string> = {
  default: 'ring-slate-700/60',
  violet:  'ring-violet-500/30',
  emerald: 'ring-emerald-500/30',
  red:     'ring-red-500/30',
  sky:     'ring-sky-500/30',
};

/**
 * Shared "glass" card wrapper. Replaces the repeated
 * bg-slate-800/50 backdrop-blur-sm ring-1 ring-slate-700/60 rounded-xl shadow-2xl
 * string that was inlined across ~8 files.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { children, padding = 'md', tone = 'default', className = '', ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`bg-slate-800/50 backdrop-blur-sm ring-1 ${TONE_RING[tone]} rounded-xl shadow-2xl ${PADDING[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
