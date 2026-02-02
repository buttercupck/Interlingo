'use client';

import { cn } from '@/lib/utils';
import { useUnassignInterpreter } from '@/lib/hooks/useJob';
import type { JobWithDetails } from '@/types/database.types';

interface InterpreterAssignmentCardProps {
  job: JobWithDetails;
  onReassign: () => void;
  isReassigning: boolean;
  className?: string;
}

export function InterpreterAssignmentCard({
  job,
  onReassign,
  isReassigning,
  className
}: InterpreterAssignmentCardProps) {
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
      <h3 className="heading-3">
        Current Assignment
      </h3>

      {/* Assigned Interpreter */}
      {assignedInterpreter ? (
        <div className="alert-success p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#065F46] font-medium text-lg">
                  ✓ {assignedInterpreter.first_name} {assignedInterpreter.last_name}
                </span>
                <span className="badge badge-success">
                  Assigned
                </span>
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
                className="body-small text-secondary-teal hover:text-[#0A5D61] font-medium transition-colors disabled:opacity-50"
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
                Select an interpreter from the available matches in the card to the right.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
