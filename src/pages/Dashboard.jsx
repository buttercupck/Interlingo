import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, MapPin, User, Filter } from 'lucide-react';

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
          commitment_blocks (
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
              email
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

      if (error) throw error;
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

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'badge badge-success';
      case 'pending': return 'badge badge-warning';
      case 'cancelled': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'TBD';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
              <h1 className="heading-1 mb-2">Interlingo Dashboard</h1>
              <p className="body-base text-gray-600">Manage interpretation jobs and assignments</p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input"
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
            <div className="heading-3 text-gray-500">No jobs found</div>
            <p className="body-base text-gray-400 mt-2">Jobs will appear here when created</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`/jobs/${job.id}`)}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Job Card Component
function JobCard({ job, onClick, getStatusBadgeClass }) {
  const commitmentBlock = job.commitment_blocks?.[0];
  const interpreter = commitmentBlock?.interpreters;
  const location = commitmentBlock?.locations;
  const status = commitmentBlock?.status || 'pending';

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'TBD';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="heading-4 mb-1">
            {job.client_name}
          </h3>
          <p className="body-small text-gray-600">
            Case: {job.case_number || 'No case number'}
          </p>
        </div>
        <span className={getStatusBadgeClass(status)}>
          {status}
        </span>
      </div>

      {/* Job Details */}
      <div className="space-y-3">
        {/* Date/Time */}
        {commitmentBlock?.start_time && (
          <div className="flex items-center body-small text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {formatDateTime(commitmentBlock.start_time)}
          </div>
        )}

        {/* Duration */}
        {commitmentBlock?.duration && (
          <div className="flex items-center body-small text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {commitmentBlock.duration} minutes
          </div>
        )}

        {/* Language */}
        {job.languages && (
          <div className="flex items-center body-small text-gray-600">
            <span className="w-4 h-4 mr-2 text-gray-400">🗣️</span>
            {job.languages.name}
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center body-small text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {location.organizations?.name || location.name}
          </div>
        )}

        {/* Interpreter */}
        {interpreter && (
          <div className="flex items-center body-small text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            {interpreter.first_name} {interpreter.last_name}
          </div>
        )}

        {/* Meeting Type */}
        <div className="flex items-center body-small text-gray-600">
          <span className="w-4 h-4 mr-2 text-gray-400">⚖️</span>
          {job.meeting_type}
        </div>

        {/* Modality */}
        {commitmentBlock?.modality && (
          <div className="flex items-center body-small text-gray-600">
            <span className="w-4 h-4 mr-2 text-gray-400">
              {commitmentBlock.modality === 'remote' ? '💻' : '👥'}
            </span>
            {commitmentBlock.modality}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center body-small text-gray-500">
          <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
          {job.requestor_email && (
            <span className="truncate ml-2">{job.requestor_email}</span>
          )}
        </div>
      </div>
    </div>
  );
}