'use client';

import { useState } from 'react';
import { useUpdateClientRequest } from '@/lib/hooks/useJob';
import type { ClientRequest } from '@/types/database.types';

interface EditClientRequestModalProps {
  clientRequest: ClientRequest;
  jobId: string;
  onClose: () => void;
}

export function EditClientRequestModal({
  clientRequest,
  jobId,
  onClose
}: EditClientRequestModalProps) {
  const updateClientRequest = useUpdateClientRequest();
  const [formData, setFormData] = useState({
    client_name: clientRequest.client_name || '',
    case_number: clientRequest.case_number || '',
    meeting_type: clientRequest.meeting_type || '',
    charges: clientRequest.charges || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateClientRequest.mutateAsync({
        clientRequestId: clientRequest.id,
        updates: formData,
        jobId,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update client request:', error);
      alert('Failed to update client request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="heading-3 mb-4">Edit Client Request</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={updateClientRequest.isPending}
                className="button button-primary flex-1"
              >
                {updateClientRequest.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={updateClientRequest.isPending}
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
