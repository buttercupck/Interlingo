'use client';

import { useState } from 'react';
import { useUpdateJob } from '@/lib/hooks/useJob';
import type { JobWithDetails } from '@/types/database.types';

interface EditDateTimeModalProps {
  job: JobWithDetails;
  onClose: () => void;
}

export function EditDateTimeModal({ job, onClose }: EditDateTimeModalProps) {
  const updateJob = useUpdateJob();

  // Format existing dates or use empty strings
  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5); // HH:mm
  };

  const [startDate, setStartDate] = useState(formatDate(job.start_time));
  const [startTime, setStartTime] = useState(formatTime(job.start_time));
  const [endTime, setEndTime] = useState(formatTime(job.start_time)); // Note: using start_time as base since job doesn't have end_time field yet

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isValid = startDate.trim() !== '' && startTime.trim() !== '' && endTime.trim() !== '';

  const handleSave = async () => {
    if (!isValid) {
      setError('All fields are required');
      return;
    }

    // Validate end time is after start time
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateJob.mutateAsync({
        jobId: job.id,
        updates: {
          start_time: startDateTime.toISOString(),
          // TODO: Add end_time field to database schema and update here
          // end_time: endDateTime.toISOString(),
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to update date/time:', err);
      setError('Failed to save changes. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">Edit Date & Time</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="start-date" className="block body-small font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="start-time" className="block body-small font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end-time" className="block body-small font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert-danger p-3">
              <p className="body-small text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="button button-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="button button-primary flex-1"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
