'use client';

import { useState } from 'react';
import { useInterpreterMatches } from '@/lib/hooks/useInterpreterMatches';
import {
  useGroupedAttempts,
  useMarkContacted,
  useMarkDeclined,
  useMarkConfirmed,
} from '@/lib/hooks/useJobAssignmentTracker';
import {
  useAssignInterpreter,
  useUnassignInterpreter,
} from '@/lib/hooks/useJob';
import type { JobWithDetails } from '@/types/database.types';

interface InterpreterManagementProps {
  job: JobWithDetails;
  className?: string;
}

export function InterpreterManagement({ job, className }: InterpreterManagementProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  // Hooks
  const { data: matchData } = useInterpreterMatches(job);
  const { grouped, attemptedInterpreterIds } = useGroupedAttempts(job.id);
  const markContacted = useMarkContacted();
  const markDeclined = useMarkDeclined();
  const markConfirmed = useMarkConfirmed();
  const assignInterpreter = useAssignInterpreter();
  const unassignInterpreter = useUnassignInterpreter();

  // Data
  const matches = matchData?.matches || [];
  const availableMatches = matches.filter((m) => !attemptedInterpreterIds.has(m.id));
  const visibleMatches = availableMatches.slice(0, visibleCount);
  const hasMore = visibleCount < availableMatches.length;
  const pendingAttempts = grouped.pending || [];

  // Handlers
  const handleRemoveAssignment = async () => {
    if (!confirm('Remove current interpreter assignment?')) return;
    await unassignInterpreter.mutateAsync(job.id);
  };

  const handleContact = async (interpreterId: string) => {
    await markContacted.mutateAsync({ jobId: job.id, interpreterId });
  };

  const handleUnavailable = async (interpreterId: string) => {
    await markDeclined.mutateAsync({ jobId: job.id, interpreterId });
  };

  const handleAccept = async (interpreterId: string) => {
    await markConfirmed.mutateAsync({ jobId: job.id, interpreterId });
    await assignInterpreter.mutateAsync({ jobId: job.id, interpreterId });
  };

  const handlePrevious = () => {
    setVisibleCount(Math.max(5, visibleCount - 2));
  };

  const handleNext = () => {
    setVisibleCount(Math.min(availableMatches.length, visibleCount + 2));
  };

  return (
    <div className={className}>
      {/* Section 1: Currently Assigned */}
      <div className="card mb-6">
        <h3 className="heading-3 section-divider-bottom">Currently Assigned</h3>

        {job.interpreter ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {job.interpreter.first_name} {job.interpreter.last_name}
                </div>
                <div className="body-small text-gray-600">
                  {job.interpreter.email} • {job.interpreter.phone}
                </div>
              </div>
              <button
                onClick={handleRemoveAssignment}
                disabled={unassignInterpreter.isPending}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
              >
                {unassignInterpreter.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500 text-center">No interpreter assigned</p>
          </div>
        )}
      </div>

      {/* Section 2: Pending Responses */}
      {pendingAttempts.length > 0 && (
        <div className="card mb-6">
          <h3 className="heading-3 section-divider-bottom">Pending Responses</h3>

          <div className="space-y-3">
            {pendingAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {attempt.interpreter.first_name} {attempt.interpreter.last_name}
                    </div>
                    <div className="body-small text-gray-600">
                      {attempt.interpreter.email} • {attempt.interpreter.phone}
                    </div>
                    <div className="caption text-gray-500 mt-1">
                      Contacted: {new Date(attempt.attempted_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleUnavailable(attempt.interpreter_id)}
                      disabled={markDeclined.isPending}
                      className="button button-outline text-sm text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Unavailable
                    </button>
                    <button
                      onClick={() => handleAccept(attempt.interpreter_id)}
                      disabled={markConfirmed.isPending || assignInterpreter.isPending}
                      className="button button-primary text-sm disabled:opacity-50"
                    >
                      Accepted
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Available to Contact */}
      <div className="card">
        <div className="section-divider-bottom">
          <div className="flex items-center justify-between">
            <h3 className="heading-3 mb-0">Available to Contact</h3>
            <div className="caption text-gray-600">
              Showing {visibleMatches.length} of {availableMatches.length}
            </div>
          </div>
        </div>

        {availableMatches.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500 text-center">No interpreters available to contact</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {visibleMatches.map((match, index) => (
                <div
                  key={match.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <div className="font-bold text-gray-400 text-lg">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {match.first_name} {match.last_name}
                        </div>
                        <div className="body-small text-gray-600">
                          {match.email} • {match.phone}
                        </div>
                        {match.city && match.state && (
                          <div className="caption text-gray-500 mt-1">
                            📍 {match.city}, {match.state}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleContact(match.id)}
                      disabled={markContacted.isPending}
                      className="button button-secondary text-sm disabled:opacity-50 ml-4"
                    >
                      {markContacted.isPending ? 'Contacting...' : 'Contact'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {availableMatches.length > 5 && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={visibleCount <= 5}
                  className="button button-outline text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasMore}
                  className="button button-outline text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
