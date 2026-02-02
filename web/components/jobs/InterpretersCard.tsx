'use client';

import { cn } from '@/lib/utils';
import { useUnassignInterpreter } from '@/lib/hooks/useJob';
import type { JobWithDetails, Interpreter } from '@/types/database.types';

interface InterpreterMatch extends Interpreter {
  matchScore: number;
  matchReason: string[];
  certification: 'Certified' | 'Registered' | 'Neither';
}

interface InterpretersCardProps {
  job: JobWithDetails;
  matches?: InterpreterMatch[];
  onAssign: (interpreterId: string) => void;
  onReassign: () => void;
  isAssigning: boolean;
  isReassigning: boolean;
  className?: string;
}

export function InterpretersCard({
  job,
  matches = [],
  onAssign,
  onReassign,
  isAssigning,
  isReassigning,
  className
}: InterpretersCardProps) {
  const unassignInterpreter = useUnassignInterpreter();
  const assignedInterpreter = job.interpreter;
  const language = job.client_requests?.[0]?.language?.name || 'Unknown';

  const handleUnassign = async () => {
    if (!confirm('Are you sure you want to unassign this interpreter? The job status will be reset to Initial.')) {
      return;
    }

    try {
      await unassignInterpreter.mutateAsync(job.id);
    } catch (error) {
      console.error('Failed to unassign interpreter:', error);
      alert('Failed to unassign interpreter. Please try again.');
    }
  };

  return (
    <div className={cn('card', className)}>
      <h3 className="heading-3 mb-6">Interpreters</h3>

      {/* Section 1: Currently Assigned */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Currently Assigned</h4>

        {assignedInterpreter ? (
          <div className="alert-success p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#065F46] font-medium text-lg">
                    ✓ {assignedInterpreter.first_name} {assignedInterpreter.last_name}
                  </span>
                  <span className="badge badge-success">Assigned</span>
                </div>

                {/* Language */}
                <div className="body-small text-[#065F46] mb-1">
                  Language: {language}
                </div>

                {/* Contact Info */}
                <div className="body-small text-[#065F46] flex flex-wrap gap-4 mt-2">
                  {assignedInterpreter.phone && (
                    <a
                      href={`tel:${assignedInterpreter.phone}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>📞</span>
                      {assignedInterpreter.phone}
                    </a>
                  )}
                  {assignedInterpreter.email && (
                    <a
                      href={`mailto:${assignedInterpreter.email}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>✉️</span>
                      {assignedInterpreter.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Reassign/Unassign Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={onReassign}
                  disabled={isReassigning || unassignInterpreter.isPending}
                  className="body-small text-secondary hover:text-[#0A5D61] font-medium transition-colors disabled:opacity-50"
                >
                  {isReassigning ? 'Cancel' : 'Reassign'}
                </button>
                <button
                  onClick={handleUnassign}
                  disabled={unassignInterpreter.isPending}
                  className="body-small text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
                >
                  {unassignInterpreter.isPending ? 'Unassigning...' : 'Unassign'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* No Interpreter Assigned */
          <div className="alert-warning p-4">
            <div className="flex items-start gap-3">
              <span className="text-[#92400E] text-2xl">⚠️</span>
              <div>
                <div className="font-medium text-[#92400E] mb-1">No Interpreter Assigned</div>
                <div className="body-small text-[#92400E]">
                  Select an interpreter from the available matches below.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Available Interpreters */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          {isReassigning ? '🔄 Select New Interpreter' : 'Available Interpreters'}
        </h4>

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
    </div>
  );
}
