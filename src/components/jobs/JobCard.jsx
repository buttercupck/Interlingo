import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

export default function JobCard({ job, onClick }) {
  const commitmentBlock = job.commitment_blocks?.[0];
  const interpreter = commitmentBlock?.interpreters;
  const location = commitmentBlock?.locations;
  const status = commitmentBlock?.status || 'pending';

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'TBD';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {job.client_name}
          </h3>
          <p className="text-sm text-gray-600">
            Case: {job.case_number || 'No case number'}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Job Details */}
      <div className="space-y-3">
        {/* Date/Time */}
        {commitmentBlock?.start_time && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {formatDateTime(commitmentBlock.start_time)}
          </div>
        )}

        {/* Duration */}
        {commitmentBlock?.duration && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {commitmentBlock.duration} minutes
          </div>
        )}

        {/* Language */}
        {job.languages && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2 text-gray-400">🗣️</span>
            {job.languages.name}
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {location.organizations?.name || location.name}
          </div>
        )}

        {/* Interpreter */}
        {interpreter && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            {interpreter.first_name} {interpreter.last_name}
          </div>
        )}

        {/* Meeting Type */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 h-4 mr-2 text-gray-400">⚖️</span>
          {job.meeting_type}
        </div>

        {/* Modality */}
        {commitmentBlock?.modality && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2 text-gray-400">
              {commitmentBlock.modality === 'remote' ? '💻' : '👥'}
            </span>
            {commitmentBlock.modality}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
          {job.requestor_email && (
            <span className="truncate ml-2">{job.requestor_email}</span>
          )}
        </div>
      </div>
    </div>
  );
}