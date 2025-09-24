import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Filter } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';

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
      // Add debugging to see what we get back
      console.log('Fetching jobs from Supabase...');

      const { data, error } = await supabase
        .from('client_requests')
        .select(`
          id,
          client_name,
          case_number,
          meeting_type,
          requestor_email,
          specific_location_details,
          key_contact_name,
          charges,
          created_at,
          updated_at,
          commitment_block_id,
          commitment_blocks:commitment_block_id (
            id,
            start_time,
            end_time,
            duration,
            status,
            modality,
            interpreter_id,
            location_id,
            interpreters (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            locations (
              id,
              name,
              address,
              zoom_link,
              organizations (
                id,
                name,
                abbreviation
              )
            )
          ),
          languages (
            id,
            name
          ),
          court_programs (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw data from Supabase:', data);

      // Log each job to see the structure
      data?.forEach((job, index) => {
        console.log(`Job ${index + 1}:`, {
          id: job.id,
          client_name: job.client_name,
          language: job.languages?.name,
          commitment_blocks_count: job.commitment_blocks?.length || 0,
          first_commitment_block: job.commitment_blocks?.[0]
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
    const status = job.commitment_blocks?.[0]?.status || 'pending';
    return status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading jobs...</div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interlingo Dashboard</h1>
              <p className="text-base text-gray-600">Manage interpretation jobs and assignments</p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Jobs</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl font-semibold text-gray-500">No jobs found</div>
            <p className="text-base text-gray-400 mt-2">Jobs will appear here when created</p>
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