import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  className,
}: StatCardProps) {
  const trendColors = {
    up: 'text-system-success',
    down: 'text-system-warning',
    neutral: 'text-gray-500',
  };

  return (
    <div className={cn('card', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="caption">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className={cn('body-small mt-1', trendColors[trend])}>{change}</p>
      </div>
    </div>
  );
}
