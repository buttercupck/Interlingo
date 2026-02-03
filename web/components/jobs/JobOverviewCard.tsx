'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Trash2, Plus, Edit as EditIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateJob, useUpdateJobStatus, useDeleteJob } from '@/lib/hooks/useJob';
import { EditClientRequestModal } from './EditClientRequestModal';
import { AddLanguageRequestModal } from './AddLanguageRequestModal';
import { EditDateTimeModal } from './EditDateTimeModal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Commitment Block</h3>
          <Select value={status} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date & Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Date & Time</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDateTime(true)}
              className="h-7 text-xs"
            >
              <EditIcon className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="text-sm">
            {startTime ? (
              <>
                <div className="font-medium">{format(startTime, 'EEEE, MMM d, yyyy')}</div>
                <div className="text-muted-foreground">
                  {format(startTime, 'h:mm a')}
                  {endTime && ` - ${format(endTime, 'h:mm a')}`}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                <span>TBD</span>
                <div className="text-xs mt-1">To Be Determined - Date/time not yet scheduled</div>
              </div>
            )}
          </div>
        </div>

        {/* Duration - Only show if > 2 hours */}
        {durationHours > 2 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration</span>
            </div>
            <div className="text-sm">
              {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
            </div>
          </div>
        )}

        {/* Modality */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Modality</div>
          <Select value={modality} onValueChange={handleModalityChange} disabled={updateJob.isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Request Details */}
        {job.client_requests && job.client_requests.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold">Client Request Details</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddLanguage(true)}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Request
              </Button>
            </div>
            <div className="space-y-3">
              {job.client_requests.map((request) => (
                <div key={request.id} className="group relative p-3 rounded-lg border hover:border-primary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-sm">{request.client_name}</div>
                      {request.case_number && request.meeting_type && (
                        <div className="text-sm text-muted-foreground">{request.case_number} — {request.meeting_type}</div>
                      )}
                      {request.charges && (
                        <div className="text-sm text-muted-foreground">{request.charges}</div>
                      )}
                      <button
                        onClick={() => handleToggleRequestReceived(request.id, request.request_received)}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary mt-2"
                      >
                        <span className="w-4 h-4 border rounded flex items-center justify-center bg-background">
                          {request.request_received && <Check className="h-3 w-3 text-green-600" />}
                        </span>
                        Request Received
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRequest(request)}
                      className="opacity-0 group-hover:opacity-100 h-7 text-xs"
                    >
                      <EditIcon className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
        <div className="pt-4 border-t">
          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Job
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm">Are you sure?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteJob.isPending}
              >
                {deleteJob.isPending ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteJob.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
