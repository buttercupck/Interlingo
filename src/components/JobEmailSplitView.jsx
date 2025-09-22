import React, { useState } from 'react';
import EmailDraftInterface from './email/EmailDraftInterface';

// Main split view component showing job list/details + email interface
const JobEmailSplitView = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showEmailPanel, setShowEmailPanel] = useState(false);

  // Sample job data - replace with your actual data
  const sampleJobs = [
    {
      id: 1,
      organization: 'FIFE Municipal Court',
      interpreter: 'Vannara Lim',
      language: 'Cambodian',
      date: '2025-09-23',
      time: '8:30 AM',
      modality: 'IN PERSON',
      status: 'confirmed',
      duration: '3 hours'
    },
    {
      id: 2,
      organization: 'Kent Municipal Court',
      interpreter: 'Elena McGivern',
      language: 'Ukrainian',
      date: '2025-09-23',
      time: '1:00 PM',
      modality: 'ZOOM',
      status: 'pending',
      duration: '2 hours'
    }
  ];

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setShowEmailPanel(true);
  };

  const handleCloseEmailPanel = () => {
    setShowEmailPanel(false);
    setSelectedJob(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Job Details Panel */}
      <div className={`${showEmailPanel ? 'flex-1' : 'w-full'} bg-white overflow-y-auto transition-all duration-300`}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="heading-2">Today's Assignments</h1>
            <p className="body-base text-gray-600">Manage and communicate about interpretation jobs</p>
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {sampleJobs.map((job) => (
              <div 
                key={job.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedJob?.id === job.id ? 'ring-2 ring-primary-blue ring-opacity-50' : ''
                }`}
                onClick={() => handleJobSelect(job)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="heading-4 mb-1">{job.organization}</h3>
                    <p className="body-small text-gray-500">{job.date} at {job.time} • {job.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      job.status === 'confirmed' ? 'badge-success' :
                      job.status === 'pending' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {job.status}
                    </span>
                    {!showEmailPanel && (
                      <button 
                        className="button button-primary text-xs px-3 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobSelect(job);
                        }}
                      >
                        Draft Email
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-2 gap-4">
                  <div>
                    <p className="body-small text-gray-500 mb-1">Interpreter</p>
                    <p className="body-base font-medium">{job.interpreter}</p>
                  </div>
                  <div>
                    <p className="body-small text-gray-500 mb-1">Language</p>
                    <p className="body-base">{job.language}</p>
                  </div>
                  <div>
                    <p className="body-small text-gray-500 mb-1">Modality</p>
                    <p className="body-base">{job.modality}</p>
                  </div>
                  <div>
                    <p className="body-small text-gray-500 mb-1">Status</p>
                    <p className="body-base capitalize">{job.status}</p>
                  </div>
                </div>

                {selectedJob?.id === job.id && showEmailPanel && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
                      <span className="body-small text-primary-blue font-medium">
                        Email interface active →
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Controls */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button className="button button-primary">
                Add New Job
              </button>
              <button className="button button-outline">
                View Calendar
              </button>
              <button className="button button-ghost">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Draft Interface Panel */}
      {showEmailPanel && (
        <EmailDraftInterface 
          selectedJob={selectedJob}
          onClose={handleCloseEmailPanel}
        />
      )}
    </div>
  );
};

export default JobEmailSplitView;
