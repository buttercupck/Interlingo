'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useGroupedAttempts,
  useMarkContacted,
  useMarkDeclined,
  useMarkConfirmed,
  useRemoveAttempt
} from '@/lib/hooks/useJobAssignmentTracker';
import type { JobWithDetails, Interpreter, JobAssignmentAttemptWithInterpreter } from '@/types/database.types';

interface InterpreterMatch extends Interpreter {
  matchScore: number;
  matchReason: string[];
  certification: 'Certified' | 'Registered' | 'Neither';
}

interface JobAssignmentTrackerProps {
  job: JobWithDetails;
  matches?: InterpreterMatch[];
  className?: string;
}

export function JobAssignmentTracker({
  job,
  matches = [],
  className
}: JobAssignmentTrackerProps) {
  const [declinedExpanded, setDeclinedExpanded] = useState(false);

  const {
    grouped,
    attemptedInterpreterIds,
    isLoading,
  } = useGroupedAttempts(job.id);

  const markContacted = useMarkContacted();
  const markDeclined = useMarkDeclined();
  const markConfirmed = useMarkConfirmed();
  const removeAttempt = useRemoveAttempt();

  // Filter matches to only show those not yet attempted
  const availableMatches = matches.filter(m => !attemptedInterpreterIds.has(m.id));

  const handleMarkContacted = async (interpreterId: string) => {
    try {
      await markContacted.mutateAsync({ jobId: job.id, interpreterId });
    } catch (error) {
      console.error('Failed to mark contacted:', error);
      alert('Failed to mark contacted. Please try again.');
    }
  };

  const handleMarkDeclined = async (interpreterId: string) => {
    try {
      await markDeclined.mutateAsync({ jobId: job.id, interpreterId });
    } catch (error) {
      console.error('Failed to mark declined:', error);
      alert('Failed to mark declined. Please try again.');
    }
  };

  const handleMarkConfirmed = async (interpreterId: string) => {
    try {
      await markConfirmed.mutateAsync({ jobId: job.id, interpreterId });
    } catch (error) {
      console.error('Failed to mark confirmed:', error);
      alert('Failed to mark confirmed. Please try again.');
    }
  };

  const handleUndoContacted = async (interpreterId: string) => {
    try {
      await removeAttempt.mutateAsync({ jobId: job.id, interpreterId });
    } catch (error) {
      console.error('Failed to undo:', error);
      alert('Failed to undo. Please try again.');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className={cn('card', className)}>
        <h3 className="heading-3 mb-6">Assignment Tracker</h3>
        <div className="text-center py-8 text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('card', className)}>
      <h3 className="heading-3 mb-6">Assignment Tracker</h3>

      {/* Section 1: Pending Response */}
      {grouped.pending.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-amber-500">⏳</span>
            Pending Response ({grouped.pending.length})
          </h4>
          <div className="space-y-2">
            {grouped.pending.map((attempt) => (
              <PendingInterpreterRow
                key={attempt.id}
                attempt={attempt}
                onDecline={() => handleMarkDeclined(attempt.interpreter_id)}
                onConfirm={() => handleMarkConfirmed(attempt.interpreter_id)}
                onUndo={() => handleUndoContacted(attempt.interpreter_id)}
                isLoading={markDeclined.isPending || markConfirmed.isPending || removeAttempt.isPending}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Confirmed */}
      {grouped.confirmed.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Confirmed ({grouped.confirmed.length})
          </h4>
          <div className="space-y-2">
            {grouped.confirmed.map((attempt) => (
              <div
                key={attempt.id}
                className="alert-success p-3 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[#065F46]">
                      {attempt.interpreter.first_name} {attempt.interpreter.last_name}
                    </span>
                    <span className="body-small text-[#065F46] ml-2">
                      Confirmed at {formatTime(attempt.responded_at || attempt.contacted_at)}
                    </span>
                  </div>
                  <span className="badge badge-success">Assigned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Declined (collapsible) */}
      {grouped.declined.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setDeclinedExpanded(!declinedExpanded)}
            className="font-semibold text-gray-900 mb-3 flex items-center gap-2 hover:text-gray-700 transition-colors"
          >
            <span className="text-red-500">✗</span>
            Declined ({grouped.declined.length})
            <span className="text-gray-400 text-sm">
              {declinedExpanded ? '▼' : '▶'}
            </span>
          </button>
          {declinedExpanded && (
            <div className="space-y-1 pl-6">
              {grouped.declined.map((attempt) => (
                <div
                  key={attempt.id}
                  className="body-small text-gray-500 flex items-center gap-2"
                >
                  <span className="text-red-400">•</span>
                  {attempt.interpreter.first_name} {attempt.interpreter.last_name}
                  <span className="text-gray-400">
                    — {formatTime(attempt.responded_at || attempt.contacted_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 4: Available to Contact */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-blue-500">📋</span>
          Available to Contact ({availableMatches.length})
        </h4>

        {availableMatches.length > 0 ? (
          <div className="space-y-2">
            {availableMatches.map((match, index) => (
              <AvailableInterpreterRow
                key={match.id}
                match={match}
                rank={index + 1}
                onMarkContacted={() => handleMarkContacted(match.id)}
                isLoading={markContacted.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">
              {matches.length === 0 ? '🔍' : '✓'}
            </div>
            <div className="body-small">
              {matches.length === 0
                ? 'No interpreters match this job\'s requirements'
                : 'All matching interpreters have been contacted'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component: Pending Interpreter Row
function PendingInterpreterRow({
  attempt,
  onDecline,
  onConfirm,
  onUndo,
  isLoading,
  formatTime
}: {
  attempt: JobAssignmentAttemptWithInterpreter;
  onDecline: () => void;
  onConfirm: () => void;
  onUndo: () => void;
  isLoading: boolean;
  formatTime: (t: string) => string;
}) {
  const interpreter = attempt.interpreter;

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {interpreter.first_name} {interpreter.last_name}
            </span>
            <span className="body-small text-amber-700">
              Contacted {formatTime(attempt.contacted_at)}
            </span>
          </div>
          <div className="body-small text-gray-600 flex flex-wrap gap-3">
            {interpreter.phone && (
              <a
                href={`tel:${interpreter.phone}`}
                className="flex items-center gap-1 hover:text-primary"
              >
                <span>📞</span>
                {interpreter.phone}
              </a>
            )}
            {interpreter.email && (
              <a
                href={`mailto:${interpreter.email}`}
                className="flex items-center gap-1 hover:text-primary"
              >
                <span>✉️</span>
                {interpreter.email}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={isLoading}
            className="body-small text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Undo contacted"
          >
            ↩
          </button>
          <button
            onClick={onDecline}
            disabled={isLoading}
            className="button button-danger text-sm py-1 px-3"
          >
            Declined
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="button button-success text-sm py-1 px-3"
          >
            Confirmed
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Available Interpreter Row
function AvailableInterpreterRow({
  match,
  rank,
  onMarkContacted,
  isLoading
}: {
  match: InterpreterMatch;
  rank: number;
  onMarkContacted: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-secondary transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 text-sm">#{rank}</span>
            <span className="font-medium text-gray-900">
              {match.first_name} {match.last_name}
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
          <div className="body-small text-gray-600 flex flex-wrap gap-3">
            {match.phone && (
              <a
                href={`tel:${match.phone}`}
                className="flex items-center gap-1 hover:text-primary"
              >
                <span>📞</span>
                {match.phone}
              </a>
            )}
            {match.email && (
              <a
                href={`mailto:${match.email}`}
                className="flex items-center gap-1 hover:text-primary"
              >
                <span>✉️</span>
                {match.email}
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onMarkContacted}
          disabled={isLoading}
          className={cn(
            'button button-outline text-sm py-1 px-3 whitespace-nowrap',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          Mark Contacted
        </button>
      </div>
    </div>
  );
}
