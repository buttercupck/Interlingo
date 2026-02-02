'use client';

import { cn } from '@/lib/utils';
import type { Interpreter } from '@/types/database.types';

interface InterpreterMatch extends Interpreter {
  matchScore: number;
  matchReason: string[];
  certification: 'Certified' | 'Registered' | 'Neither';
}

interface AvailableInterpretersCardProps {
  matches?: InterpreterMatch[];
  onAssign: (interpreterId: string) => void;
  isAssigning: boolean;
  isReassigning?: boolean;
  className?: string;
}

export function AvailableInterpretersCard({
  matches = [],
  onAssign,
  isAssigning,
  isReassigning = false,
  className
}: AvailableInterpretersCardProps) {
  return (
    <div className={cn('card', className)}>
      <h3 className="heading-3">
        {isReassigning ? '🔄 Select New Interpreter' : '🎯 Available Interpreters'}
      </h3>

      {matches.length > 0 ? (
        <div>
          <p className="body-small mb-4">
            Showing {Math.min(matches.length, 5)} of {matches.length} matches sorted by qualification
          </p>
          <div className="space-y-2">
            {matches.slice(0, 5).map((match, index) => (
              <div
                key={match.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        #{index + 1} {match.first_name} {match.last_name}
                      </span>
                      <span
                        className={cn(
                          'badge',
                          match.certification === 'Certified'
                            ? 'badge-success'
                            : match.certification === 'Registered'
                            ? 'badge-info'
                            : 'bg-gray-200 text-gray-700'
                        )}
                      >
                        {match.certification}
                      </span>
                    </div>
                    <div className="caption space-y-0.5">
                      {match.matchReason.map((reason, i) => (
                        <div key={i}>• {reason}</div>
                      ))}
                    </div>
                    {/* Contact Info */}
                    <div className="body-small text-gray-600 flex flex-wrap gap-3 mt-2">
                      {match.phone && (
                        <span className="flex items-center gap-1">
                          <span>📞</span>
                          {match.phone}
                        </span>
                      )}
                      {match.email && (
                        <span className="flex items-center gap-1">
                          <span>✉️</span>
                          {match.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onAssign(match.id)}
                    disabled={isAssigning}
                    className={cn(
                      'button button-primary whitespace-nowrap',
                      isAssigning && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isAssigning ? 'Assigning...' : isReassigning ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {matches.length > 5 && (
            <p className="body-small mt-3 text-gray-500">
              + {matches.length - 5} more interpreters available
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-medium">No Available Interpreters Found</div>
          <div className="body-small mt-1">
            Try adjusting the job requirements or check interpreter availability.
          </div>
        </div>
      )}
    </div>
  );
}
