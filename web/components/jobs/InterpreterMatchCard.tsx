import { cn } from '@/lib/utils';
import type { Interpreter } from '@/types/database.types';

interface InterpreterMatch extends Interpreter {
  matchScore: number;
  matchReason: string[];
  certification: 'Certified' | 'Registered' | 'Neither';
}

interface InterpreterMatchCardProps {
  interpreter: InterpreterMatch;
  rank: number;
  onAssign: (interpreterId: string) => void;
  isAssigning?: boolean;
  className?: string;
}

export function InterpreterMatchCard({
  interpreter,
  rank,
  onAssign,
  isAssigning,
  className,
}: InterpreterMatchCardProps) {
  const certificationColors = {
    Certified: 'bg-cert-bg text-cert-text',
    Registered: 'bg-cert-reg-bg text-cert-reg-text',
    Neither: 'bg-gray-100 text-gray-600',
  };

  const fullName = `${interpreter.first_name} ${interpreter.last_name}`;

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 hover:border-[#1B365C] transition-colors shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
            #{rank}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{fullName}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded text-xs font-medium uppercase',
                  certificationColors[interpreter.certification]
                )}
                style={{ letterSpacing: '0.05em' }}
              >
                {interpreter.certification}
              </span>
              {interpreter.is_local && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  Local
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {interpreter.matchScore}
          </div>
          <div className="text-xs text-gray-500">Match Score</div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        {interpreter.phone && (
          <div>
            <span className="text-gray-500">Phone:</span>
            <a
              href={`tel:${interpreter.phone}`}
              className="block text-secondary-teal hover:text-secondary-teal/80 font-medium transition-colors"
            >
              {interpreter.phone}
            </a>
          </div>
        )}
        {interpreter.email && (
          <div>
            <span className="text-gray-500">Email:</span>
            <a
              href={`mailto:${interpreter.email}`}
              className="block text-secondary-teal hover:text-secondary-teal/80 font-medium truncate transition-colors"
            >
              {interpreter.email}
            </a>
          </div>
        )}
      </div>

      {/* Match Reasons */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 uppercase mb-2">
          Why This Match:
        </div>
        <ul className="space-y-1">
          {interpreter.matchReason.map((reason, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onAssign(interpreter.id)}
          disabled={isAssigning}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-md transition-all duration-200 shadow-sm',
            isAssigning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-secondary-teal hover:bg-secondary-teal/80 hover:-translate-y-0.5 hover:shadow-md'
          )}
        >
          {isAssigning ? 'Assigning...' : 'Assign Interpreter'}
        </button>
        {interpreter.phone && (
          <a
            href={`tel:${interpreter.phone}`}
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            📞 Call
          </a>
        )}
      </div>

      {/* Internal Notes (if any) */}
      {interpreter.internal_notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">
            Internal Notes:
          </div>
          <p className="text-sm text-gray-600">{interpreter.internal_notes}</p>
        </div>
      )}
    </div>
  );
}
