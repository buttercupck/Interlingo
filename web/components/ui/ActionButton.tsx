import { cn } from '@/lib/utils';

export interface ActionButtonProps {
  title: string;
  description: string;
  icon: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}

export function ActionButton({
  title,
  description,
  icon,
  variant = 'secondary',
  onClick,
  className,
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-secondary hover:bg-opacity-90 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg transition-colors',
        variantStyles[variant],
        className
      )}
    >
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <p className="font-medium">{title}</p>
        <p className="body-small opacity-80">{description}</p>
      </div>
    </button>
  );
}
