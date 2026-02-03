'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { Interpreter, JobWithDetails } from '@/types/database.types';
import { useInterpreterMatches } from '@/lib/hooks/useInterpreterMatches';
import { useGroupedAttempts } from '@/lib/hooks/useJobAssignmentTracker';
import { useMarkContacted, useMarkDeclined } from '@/lib/hooks/useJobAssignmentTracker';
import { useAssignInterpreter } from '@/lib/hooks/useJob';

interface InterpreterMatch extends Interpreter {
  matchScore: number;
  matchReason: string[];
  certification: 'Certified' | 'Registered' | 'Neither';
  preferenceRank: number | null;
}

interface QuickAssignTableProps {
  job: JobWithDetails;
  className?: string;
}

export function QuickAssignTable({ job, className }: QuickAssignTableProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedInterpreter, setSelectedInterpreter] = useState<InterpreterMatch | null>(null);

  const { data: matchData, isLoading } = useInterpreterMatches(job);
  const { attemptedInterpreterIds, attempts } = useGroupedAttempts(job.id);

  const markContacted = useMarkContacted();
  const markDeclined = useMarkDeclined();
  const assignInterpreter = useAssignInterpreter();

  const matches = matchData?.matches || [];
  const visibleMatches = matches.slice(0, visibleCount);
  const hasMore = visibleCount < matches.length;

  const language = job.client_requests?.[0]?.language?.name || 'Unknown';
  const currentInterpreter = job.interpreter;

  // Get attempt status for an interpreter
  const getAttemptStatus = (interpreterId: string) => {
    return attempts?.find(a => a.interpreter_id === interpreterId);
  };

  // Check if interpreter was declined within 2-hour window
  const isWithinDeclineWindow = (interpreterId: string) => {
    const attempt = getAttemptStatus(interpreterId);
    if (!attempt || attempt.status !== 'declined') return false;
    if (!job.start_time || !job.end_time) return false;

    const jobStart = new Date(job.start_time);
    const jobEnd = new Date(job.end_time);
    const twoHoursBefore = new Date(jobStart.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(jobEnd.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();

    return now >= twoHoursBefore && now <= twoHoursAfter;
  };

  const handleContact = async (interpreter: InterpreterMatch) => {
    try {
      await markContacted.mutateAsync({
        jobId: job.id,
        interpreterId: interpreter.id,
      });
    } catch (error) {
      console.error('Failed to mark contacted:', error);
      alert('Failed to mark interpreter as contacted. Please try again.');
    }
  };

  const handleDecline = async (interpreter: InterpreterMatch) => {
    if (!confirm(`Mark ${interpreter.first_name} ${interpreter.last_name} as declined?`)) {
      return;
    }

    try {
      await markDeclined.mutateAsync({
        jobId: job.id,
        interpreterId: interpreter.id,
      });
    } catch (error) {
      console.error('Failed to mark declined:', error);
      alert('Failed to mark interpreter as declined. Please try again.');
    }
  };

  const handleAssign = async (interpreter: InterpreterMatch) => {
    console.log('handleAssign called for:', interpreter.first_name, interpreter.last_name);
    console.log('currentInterpreter:', currentInterpreter);
    console.log('currentInterpreter ID:', currentInterpreter?.id);
    console.log('interpreter ID:', interpreter.id);
    console.log('Are they different?', currentInterpreter && currentInterpreter.id !== interpreter.id);

    // If job already has an interpreter, show conflict modal
    if (currentInterpreter && currentInterpreter.id !== interpreter.id) {
      console.log('Showing conflict modal');
      setSelectedInterpreter(interpreter);
      setShowConflictModal(true);
      return;
    }

    // Otherwise, assign directly
    console.log('Assigning directly');
    try {
      await assignInterpreter.mutateAsync({
        jobId: job.id,
        interpreterId: interpreter.id,
      });
    } catch (error) {
      console.error('Failed to assign interpreter:', error);
      alert('Failed to assign interpreter. Please try again.');
    }
  };

  const handleReplaceConfirm = async () => {
    if (!selectedInterpreter) return;

    try {
      await assignInterpreter.mutateAsync({
        jobId: job.id,
        interpreterId: selectedInterpreter.id,
      });
      setShowConflictModal(false);
      setSelectedInterpreter(null);
    } catch (error) {
      console.error('Failed to replace interpreter:', error);
      alert('Failed to replace interpreter. Please try again.');
    }
  };

  const certificationColors = {
    Certified: 'bg-cert-bg text-cert-text',
    Registered: 'bg-cert-reg-bg text-cert-reg-text',
    Neither: 'bg-gray-100 text-gray-600',
  };

  if (isLoading) {
    return (
      <div className={cn('card', className)}>
        <h3 className="heading-3">Quick Assign</h3>
        <div className="body-base text-gray-500 text-center py-8">
          Loading interpreter matches...
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className={cn('card', className)}>
        <h3 className="heading-3">Quick Assign</h3>
        <div className="alert-warning p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-900 text-2xl">⚠️</span>
            <div>
              <div className="font-medium text-amber-900 mb-1">No Matches Found</div>
              <div className="body-small text-amber-900">
                No interpreters match the requirements for this job.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('card', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading-3">
            Quick Assign — Top {Math.min(visibleCount, matches.length)} Matches for {language}
          </h3>
          <div className="body-small text-gray-500">
            {matches.length} total interpreters
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 caption text-gray-600 font-medium">Rank</th>
                <th className="text-left py-3 px-4 caption text-gray-600 font-medium">Interpreter</th>
                <th className="text-left py-3 px-4 caption text-gray-600 font-medium">Cert</th>
                <th className="text-left py-3 px-2 caption text-gray-600 font-medium">Match</th>
                <th className="text-right py-3 px-4 caption text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMatches.map((interpreter, index) => {
                const attempt = getAttemptStatus(interpreter.id);
                const isContacted = !!attempt && attempt.status === 'contacted';
                const isDeclined = !!attempt && attempt.status === 'declined';
                const isInDeclineWindow = isDeclined && isWithinDeclineWindow(interpreter.id);
                const isAssigned = currentInterpreter?.id === interpreter.id;

                return (
                  <tr
                    key={interpreter.id}
                    className={cn(
                      'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                      isDeclined && isInDeclineWindow && 'bg-gray-100 opacity-60',
                      isAssigned && 'bg-green-50'
                    )}
                  >
                    {/* Rank */}
                    <td className="py-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-xs">
                        #{index + 1}
                      </div>
                    </td>

                    {/* Interpreter Info */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 body-base">
                        {interpreter.first_name} {interpreter.last_name}
                      </div>
                      {interpreter.phone && (
                        <a
                          href={`tel:${interpreter.phone}`}
                          className="body-small text-secondary-teal hover:text-secondary-teal/80 transition-colors"
                        >
                          📞 {interpreter.phone}
                        </a>
                      )}
                      {interpreter.email && (
                        <a
                          href={`mailto:${interpreter.email}`}
                          className="block body-small text-secondary-teal hover:text-secondary-teal/80 transition-colors truncate"
                          title={interpreter.email}
                        >
                          ✉️ {interpreter.email}
                        </a>
                      )}
                    </td>

                    {/* Certification */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase w-fit',
                            certificationColors[interpreter.certification]
                          )}
                          style={{ letterSpacing: '0.05em' }}
                        >
                          {interpreter.certification}
                        </span>
                        {interpreter.is_local && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 w-fit">
                            Local
                          </span>
                        )}
                        {isDeclined && isInDeclineWindow && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 w-fit">
                            Declined
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="py-3 px-2">
                      <div className="text-xl font-bold text-primary">
                        {interpreter.matchScore}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {!isContacted && !isDeclined && (
                          <button
                            onClick={() => handleContact(interpreter)}
                            disabled={markContacted.isPending}
                            className="body-small px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Contact
                          </button>
                        )}

                        {isContacted && (
                          <>
                            <span className="body-small text-green-600 font-medium">
                              Contacted ✓
                            </span>
                            <button
                              onClick={() => handleDecline(interpreter)}
                              disabled={markDeclined.isPending}
                              className="body-small px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Mark as declined"
                            >
                              ✗
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleAssign(interpreter)}
                          disabled={
                            assignInterpreter.isPending ||
                            (isDeclined && isInDeclineWindow) ||
                            isAssigned
                          }
                          className={cn(
                            'body-small px-3 py-1 rounded transition-colors disabled:opacity-50',
                            isAssigned
                              ? 'bg-green-600 text-white'
                              : 'bg-secondary-teal text-white hover:bg-secondary-teal/80'
                          )}
                        >
                          {isAssigned ? 'Assigned' : 'Assign'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + 10, matches.length))}
              className="body-base px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Load More Interpreters ({matches.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Conflict Modal - Rendered via Portal */}
      {(() => {
        console.log('Modal render check - showConflictModal:', showConflictModal);
        console.log('Modal render check - selectedInterpreter:', selectedInterpreter);
        return null;
      })()}
      {showConflictModal && selectedInterpreter && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            style={{ backgroundColor: '#ffffff' }}
          >
            <h3 className="heading-3 mb-4">Replace Current Assignment?</h3>

            <div className="body-base text-gray-700 mb-4">
              <p className="mb-2">This job is currently assigned to:</p>
              <p className="font-medium text-primary">
                {currentInterpreter?.first_name} {currentInterpreter?.last_name}
              </p>
            </div>

            <div className="body-base text-gray-700 mb-6">
              <p className="mb-2">Replace with:</p>
              <p className="font-medium text-secondary-teal">
                {selectedInterpreter.first_name} {selectedInterpreter.last_name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReplaceConfirm}
                disabled={assignInterpreter.isPending}
                className="flex-1 bg-secondary-teal text-white px-4 py-2 rounded hover:bg-secondary-teal/80 transition-colors disabled:opacity-50"
              >
                {assignInterpreter.isPending ? 'Replacing...' : 'Replace'}
              </button>
              <button
                onClick={() => {
                  setShowConflictModal(false);
                  setSelectedInterpreter(null);
                }}
                disabled={assignInterpreter.isPending}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
