'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUpdateJob, useUpdateJobStatus, useDeleteJob } from '@/lib/hooks/useJob';
import { EditClientRequestModal } from './EditClientRequestModal';
import { AddLanguageRequestModal } from './AddLanguageRequestModal';
import { EditDateTimeModal } from './EditDateTimeModal';
import type { JobWithDetails, ClientRequest } from '@/types/database.types';

interface JobOverviewCardProps {
  job: JobWithDetails;
  className?: string;
}

const STATUS_OPTIONS = ['Initial', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Needs Info'];
const MODALITY_OPTIONS = ['Zoom', 'In-Person', 'Phone', 'TBD'];

export function JobOverviewCard({ job, className }: JobOverviewCardProps) {
  const router = useRouter();
  const updateJob = useUpdateJob();
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ClientRequest | null>(null);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [showEditDateTime, setShowEditDateTime] = useState(false);

  const startTime = job.start_time ? new Date(job.start_time) : null;
  const endTime = job.end_time ? new Date(job.end_time) : null;

  // Get language from first client request
  const clientRequest = job.client_requests?.[0];
  const language = clientRequest?.language?.name || 'Unknown Language';

  // Get interpreter name
  const interpreterName = job.interpreter
    ? `${job.interpreter.first_name} ${job.interpreter.last_name}`
    : 'Unassigned';

  // Calculate duration in hours
  const durationMinutes = job.duration || 0;
  const durationHours = Math.round(durationMinutes / 60 * 10) / 10; // Round to 1 decimal

  const modality = job.modality || 'TBD';
  const status = job.status || 'Initial';

  // Design system badge classes for status
  const statusColors: Record<string, string> = {
    Initial: 'badge-info',
    Pending: 'badge-warning',
    Confirmed: 'badge-success',
    Completed: 'badge-info',
    Cancelled: 'badge-danger',
    'Needs Info': 'badge-warning',
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    await updateStatus.mutateAsync({
      jobId: job.id,
      newStatus,
      oldStatus: status,
    });
  };

  const handleModalityChange = async (newModality: string) => {
    if (newModality === modality) return;

    await updateJob.mutateAsync({
      jobId: job.id,
      updates: { modality: newModality },
    });
  };

  const handleDelete = async () => {
    try {
      await deleteJob.mutateAsync(job.id);
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Failed to delete job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete job: ${errorMessage}`);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleRequestReceived = async (requestId: string, currentValue: boolean | null) => {
    try {
      // TODO: Create API mutation for updating client_requests.request_received
      console.log('Toggle request_received:', requestId, !currentValue);
      // await updateRequestReceived.mutateAsync({ requestId, value: !currentValue });
    } catch (error) {
      console.error('Failed to toggle request received:', error);
    }
  };

  return (
    <div className={cn('card', className)}>
      {/* Header */}
      <div className="section-divider-bottom flex items-center justify-between">
        <div className="flex-1">
          <h3 className="heading-3 mb-0">Commitment Block</h3>
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updateStatus.isPending}
          className={cn(
            'status-dropdown',
            status.toLowerCase().replace(/\s+/g, ''),
            updateStatus.isPending && 'opacity-50 cursor-wait'
          )}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Facts Row */}
      <div className="flex flex-col gap-6 section-gap">
        {/* Date & Time */}
        <div className="info-field">
          <div className="flex items-center justify-between mb-0.5">
            <div className="caption">Date & Time</div>
            <button
              onClick={() => setShowEditDateTime(true)}
              className="text-secondary-teal hover:text-[#0A5D61] text-xs font-medium transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="info-field-value">
            {startTime ? (
              <>
                <div>{format(startTime, 'EEEE, MMM d, yyyy')}</div>
                <div>
                  {format(startTime, 'h:mm a')}
                  {endTime && ` - ${format(endTime, 'h:mm a')}`}
                </div>
              </>
            ) : (
              <>
                <span className="text-gray-400">TBD</span>
                <div className="mt-2">
                  <span className="text-gray-400 text-sm">
                    TBD (To Be Determined - Date/time not yet scheduled)
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Duration - Only show if > 2 hours */}
        {durationHours > 2 && (
          <div className="info-field">
            <div className="caption">Duration</div>
            <div className="info-field-value">
              {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
            </div>
          </div>
        )}

        {/* Modality Dropdown */}
        <div className="info-field">
          <div className="caption">Modality</div>
          <select
            value={modality}
            onChange={(e) => handleModalityChange(e.target.value)}
            disabled={updateJob.isPending}
            className={cn(
              'dropdown-styled',
              updateJob.isPending && 'opacity-50 cursor-wait'
            )}
          >
            {MODALITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Client Request Details */}
      {job.client_requests && job.client_requests.length > 0 && (
        <div className="section-divider">
          <div className="flex items-center justify-between mb-4">
            <h4 className="heading-4 mb-0">Client Request Details</h4>
            <button
              onClick={() => setShowAddLanguage(true)}
              className="text-sm text-secondary-teal hover:text-[#0A5D61] font-medium transition-colors"
            >
              + Add New Request
            </button>
          </div>
          {job.client_requests.map((request: any, idx: number) => (
            <div key={request.id} className="group relative mb-3 last:mb-0 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-gray-900 text-base">{request.client_name}</div>
                  {request.case_number && request.meeting_type && (
                    <div className="body-small">{request.case_number} — {request.meeting_type}</div>
                  )}
                  {request.charges && (
                    <div className="body-small">{request.charges}</div>
                  )}
                  <button
                    onClick={() => handleToggleRequestReceived(request.id, request.request_received)}
                    className="text-gray-600 hover:text-secondary-teal text-xs font-medium flex items-center gap-2 mt-2"
                  >
                    <span className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center bg-white">
                      {request.request_received && <span className="text-green-600">✓</span>}
                    </span>
                    Request Received
                  </button>
                </div>
                <button
                  onClick={() => setEditingRequest(request)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-secondary-teal hover:text-[#0A5D61] font-medium ml-2"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Client Request Modal */}
      {editingRequest && (
        <EditClientRequestModal
          clientRequest={editingRequest}
          jobId={job.id}
          onClose={() => setEditingRequest(null)}
        />
      )}

      {/* Add Language Request Modal */}
      {showAddLanguage && (
        <AddLanguageRequestModal
          job={job}
          onClose={() => setShowAddLanguage(false)}
        />
      )}

      {/* Edit Date/Time Modal */}
      {showEditDateTime && (
        <EditDateTimeModal
          job={job}
          onClose={() => setShowEditDateTime(false)}
        />
      )}

      {/* Delete Button */}
      <div className="section-divider">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
          >
            🗑️ Delete Job
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Are you sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleteJob.isPending}
              className="button-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteJob.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteJob.isPending}
              className="button-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
