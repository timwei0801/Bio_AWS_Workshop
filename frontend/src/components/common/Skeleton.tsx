interface SkeletonProps {
  className?: string;
  /** 'text' = single line; 'card' = block; 'list' = N stacked rows. */
  variant?: 'text' | 'card' | 'list';
  rows?: number;
}

/**
 * Low-opacity shimmer placeholder. Respects prefers-reduced-motion
 * automatically because we only rely on tailwind's `animate-pulse`.
 */
export function Skeleton({ className = '', variant = 'text', rows = 3 }: SkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-2" role="status" aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`h-6 rounded bg-slate-700/40 animate-pulse ${className}`} />
        ))}
      </div>
    );
  }
  if (variant === 'card') {
    return (
      <div role="status" aria-busy="true" className={`rounded-lg bg-slate-700/30 animate-pulse ${className || 'h-20'}`} />
    );
  }
  return <div role="status" aria-busy="true" className={`h-4 rounded bg-slate-700/40 animate-pulse ${className}`} />;
}
