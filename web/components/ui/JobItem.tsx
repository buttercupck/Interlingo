import { cn } from '@/lib/utils';

export interface JobItemProps {
  time: string;
  client: string;
  language: string;
  interpreter: string;
  modality: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  className?: string;
}

export function JobItem({
  time,
  client,
  language,
  interpreter,
  modality,
  status,
  className,
}: JobItemProps) {
  const statusStyles = {
    confirmed: 'bg-system-success text-white',
    pending: 'bg-system-warning text-white',
    cancelled: 'bg-system-danger text-white',
    completed: 'bg-gray-500 text-white',
  };

  return (
    <div className={cn('flex items-start space-x-4 p-3 bg-gray-50 rounded-lg', className)}>
      <div className="text-sm font-bold text-primary min-w-[60px]">{time}</div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{client}</p>
        <p className="text-sm text-gray-600">
          {language} • {interpreter} • {modality}
        </p>
      </div>
      <span
        className={cn('px-2 py-1 rounded text-xs font-medium', statusStyles[status])}
      >
        {status}
      </span>
    </div>
  );
}
