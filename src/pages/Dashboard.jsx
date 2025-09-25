import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import jobService from '../services/jobService';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, assigned, completed
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      console.log('Fetching jobs using jobService...');

      const { data, error } = await jobService.getAllJobs();

      if (error) {
        console.error('Service error:', error);
        throw new Error(error);
      }

      console.log('Data from jobService:', data);

      // Log each job to see the structure
      data?.forEach((job, index) => {
        console.log(`Job ${index + 1}:`, {
          id: job.id,
          client_name: job.client_name,
          language: job.languages?.name,
          commitment_block: job.commitment_blocks ? 'Present' : 'Missing',
          interpreter: job.commitment_blocks?.interpreters ? `${job.commitment_blocks.interpreters.first_name}` : 'No interpreter',
          start_time: job.commitment_blocks?.start_time,
          status: job.commitment_blocks?.status
        });
      });

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    const status = job.commitment_blocks?.status || 'pending';
    return status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="body-large text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="heading-1">Interlingo Dashboard</h1>
              <p className="body-base text-gray-600">Manage interpretation jobs and assignments</p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input select"
                >
                  <option value="all">All Jobs</option>
                  <option value="initial">Initial</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4">
          <p className="body-small text-yellow-800">
            DEBUG: Found {jobs.length} jobs. Check console for detailed data structure.
          </p>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="heading-3 text-gray-500">No jobs found</div>
            <p className="body-base text-gray-400 mt-2">
              {filter === 'all' ? 'No jobs created yet' : `No ${filter} jobs found`}
            </p>
            <button 
              onClick={fetchJobs}
              className="button button-primary mt-4"
            >
              Refresh Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}