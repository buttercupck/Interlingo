import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import EmailDraftInterface from '../components/email/EmailDraftInterface';
import Navbar from '../components/layout/Navbar';

export default function EmailPreviewPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('commitment_blocks')
        .select(`
          id,
          start_time,
          end_time,
          modality,
          status,
          locations (
            name,
            organizations (
              name,
              abbreviation
            )
          ),
          client_requests (
            client_name,
            case_number,
            languages (
              name
            )
          ),
          interpreters (
            first_name,
            last_name
          )
        `)
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) throw error;

      setJobs(data || []);

      // Auto-select first job for demo
      if (data && data.length > 0) {
        setSelectedJob(data[0]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatJobDisplay = (job) => {
    const startTime = new Date(job.start_time);
    const timeString = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const dateString = startTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });

    const orgName = job.locations?.organizations?.abbreviation || 
                   job.locations?.organizations?.name || 
                   'Unknown Org';
    const language = job.client_requests?.[0]?.languages?.name || 'Unknown';
    const interpreterName = job.interpreters ? 
      `${job.interpreters.first_name} ${job.interpreters.last_name}` : 
      'No Interpreter';

    return `${dateString} ${timeString} - ${orgName} - ${language} - ${interpreterName}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        {/* Job Selection Sidebar */}
        <div className="w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Select Job for Email Draft</h2>
            <p className="text-sm text-gray-600 mt-1">Choose a job to preview email generation</p>
          </div>

          <div className="p-4 space-y-2">
            {jobs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No jobs found
              </div>
            ) : (
              jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedJob?.id === job.id
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-800 mb-1">
                    {formatJobDisplay(job)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {job.status} • Modality: {job.modality}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-100">
            <button
              onClick={fetchJobs}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Refresh Jobs
            </button>
          </div>
        </div>

        {/* Email Draft Interface */}
        <div className="flex-1">
          <EmailDraftInterface
            selectedJob={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        </div>
      </div>
    </div>
  );
}