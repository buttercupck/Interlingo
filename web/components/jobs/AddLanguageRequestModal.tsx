'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAddClientRequest } from '@/lib/hooks/useJob';
import type { JobWithDetails } from '@/types/database.types';

interface AddLanguageRequestModalProps {
  job: JobWithDetails;
  onClose: () => void;
}

interface Language {
  id: string;
  name: string;
}

export function AddLanguageRequestModal({
  job,
  onClose
}: AddLanguageRequestModalProps) {
  const addClientRequest = useAddClientRequest();
  const [showDurationConfirm, setShowDurationConfirm] = useState(false);
  const [formData, setFormData] = useState({
    language_id: '',
    client_name: '',
    case_number: '',
    meeting_type: '',
    charges: '',
  });

  // Fetch all languages
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('languages')
        .select('id, name')
        .order('name');

      if (error) throw new Error(error.message);
      return data as Language[];
    },
  });

  // Validation warnings
  const warnings: string[] = [];
  const selectedLanguage = languages.find(l => l.id === formData.language_id);

  // Check if interpreter speaks this language
  if (job.interpreter && formData.language_id) {
    const interpreterLanguages = (job.interpreter as any).interpreter_languages || [];
    const hasLanguage = interpreterLanguages.some(
      (il: any) => il.language_id === formData.language_id
    );

    if (!hasLanguage) {
      warnings.push(`⚠️ ${job.interpreter.first_name} ${job.interpreter.last_name} may not speak ${selectedLanguage?.name || 'this language'}`);
    }
  }

  // Check duration (if there's already 1 client request, this would be the 2nd)
  const currentDuration = job.duration || 120;
  const willUpdateDuration = !!(job.client_requests && job.client_requests.length === 1 && currentDuration < 180);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // If duration needs updating and hasn't been confirmed, show confirmation
    if (willUpdateDuration && !showDurationConfirm) {
      setShowDurationConfirm(true);
      return;
    }

    try {
      await addClientRequest.mutateAsync({
        jobId: job.id,
        clientRequest: formData,
        updateDuration: willUpdateDuration,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add language request:', error);
      alert('Failed to add language request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="heading-3 mb-4">Add Language Request</h3>

          {/* Duration Confirmation */}
          {showDurationConfirm && (
            <div className="alert-warning p-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">⏱️</span>
                <div>
                  <div className="font-semibold mb-1">Duration Update Required</div>
                  <div className="body-small">
                    Adding a second language will automatically update the commitment block duration from <strong>2 hours → 3 hours</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="alert-warning p-4 mb-4">
              <div className="space-y-1">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="body-small">{warning}</div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Dropdown */}
            <div>
              <label htmlFor="language_id" className="block caption mb-1">
                Language *
              </label>
              <select
                id="language_id"
                required
                value={formData.language_id}
                onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                className="input w-full"
              >
                <option value="">Select a language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Name */}
            <div>
              <label htmlFor="client_name" className="block caption mb-1">
                Client Name *
              </label>
              <input
                id="client_name"
                type="text"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Case Number */}
            <div>
              <label htmlFor="case_number" className="block caption mb-1">
                Case Number
              </label>
              <input
                id="case_number"
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Meeting Type */}
            <div>
              <label htmlFor="meeting_type" className="block caption mb-1">
                Meeting Type *
              </label>
              <input
                id="meeting_type"
                type="text"
                required
                value={formData.meeting_type}
                onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Charges */}
            <div>
              <label htmlFor="charges" className="block caption mb-1">
                Charges
              </label>
              <textarea
                id="charges"
                rows={3}
                value={formData.charges}
                onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={addClientRequest.isPending}
                className="button button-primary flex-1"
              >
                {addClientRequest.isPending
                  ? 'Adding...'
                  : showDurationConfirm
                    ? 'Confirm & Add'
                    : 'Add Language Request'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={addClientRequest.isPending}
                className="button bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
