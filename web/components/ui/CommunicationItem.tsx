import { cn } from '@/lib/utils';

export type CommunicationType = 'REQ' | 'CONF' | 'REM';

export interface CommunicationItemProps {
  type: CommunicationType;
  recipient: string;
  subject: string;
  time: string;
  className?: string;
  onClick?: () => void;
}

export function CommunicationItem({
  type,
  recipient,
  subject,
  time,
  className,
  onClick,
}: CommunicationItemProps) {
  const typeColors: Record<CommunicationType, string> = {
    REQ: 'bg-secondary-purple',
    CONF: 'bg-system-success',
    REM: 'bg-secondary-teal',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start space-x-4 p-3 border-l-4 border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <span
        className={cn(
          'px-2 py-1 rounded text-xs font-bold text-white',
          typeColors[type]
        )}
      >
        {type}
      </span>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{subject}</p>
        <p className="text-sm text-gray-600">To: {recipient}</p>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}
