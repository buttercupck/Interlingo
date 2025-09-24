import React from 'react';

export default function JobCard({ job, onClick }) {
  // Add debugging to see what data we're receiving
  console.log('JobCard received job data:', job);

  const commitmentBlock = job.commitment_blocks; // Now it's a single object, not an array
  const interpreter = commitmentBlock?.interpreters;
  const status = commitmentBlock?.status || 'pending';

  // Debug the data structure
  console.log('Commitment block:', commitmentBlock);
  console.log('Interpreter:', interpreter);
  console.log('Language:', job.languages);

  // Get interpreter first name or "?" if not available
  const interpreterName = interpreter?.first_name || '?';

  // Get language name
  const language = job.languages?.name || 'Unknown Language';

  // Get modality - convert "ZOOM" to "ZOOM", handle the modality properly
  const modality = commitmentBlock?.modality?.toUpperCase() || 'TBD';

  // Format date and time with better error handling
  const formatDateTime = () => {
    if (!commitmentBlock?.start_time) {
      console.log('No start_time found in commitment block');
      return 'Date TBD';
    }

    try {
      const startDate = new Date(commitmentBlock.start_time);
      const endDate = commitmentBlock.end_time ? new Date(commitmentBlock.end_time) : null;

      if (isNaN(startDate.getTime())) {
        console.log('Invalid start date:', commitmentBlock.start_time);
        return 'Invalid Date';
      }

      const month = startDate.toLocaleDateString('en-US', { month: 'short' });
      const date = startDate.getDate();
      const startTime = startDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      if (endDate && !isNaN(endDate.getTime())) {
        const endTime = endDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        return `${month} ${date}, ${startTime} - ${endTime}`;
      } else {
        return `${month} ${date}, ${startTime}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };

  // Get status badge class based on design system
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'badge badge-success';
      case 'pending': return 'badge badge-warning';
      case 'cancelled': return 'badge badge-danger';
      case 'assigned': return 'badge badge-info';
      default: return 'badge badge-info';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col justify-between"
    >
      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-red-500 mb-2 p-1 bg-red-50 rounded">
          DEBUG: ID={job.id}, Lang={job.languages?.name}, Interp={interpreter?.first_name}
        </div>
      )}

      {/* Title: [Language] - [Interpreter First Name | "?"] [Modality] */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {language} - {interpreterName} {modality}
        </h3>

        {/* [Month, Date, and Start, End times] */}
        <p className="text-sm text-gray-600 mb-3">
          {formatDateTime()}
        </p>
      </div>

      {/* [Job Status] */}
      <div className="flex justify-start mt-auto">
        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide ${
          status === 'confirmed' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}