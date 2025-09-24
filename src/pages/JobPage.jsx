import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { ArrowLeft, Mail, Edit3, Calendar, Clock, MapPin, User, Globe } from 'lucide-react';

export default function JobPage() {
  const { jobId } = useParams(); // Changed from 'id' to 'jobId' to match route
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) { // Changed from 'id' to 'jobId'
      fetchJobDetails(jobId);
    }
  }, [jobId]);

  const fetchJobDetails = async (jobId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select(`
          *,
          commitment_blocks (
            *,
            interpreters (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            locations (
              *,
              organizations (
                *
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
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not specified';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'badge badge-success';
      case 'pending': return 'badge badge-warning';
      case 'cancelled': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="body-large text-gray-600">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="heading-3 text-red-600 mb-2">Error</div>
          <div className="body-base text-gray-600">{error || 'Job not found'}</div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="button button-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const commitmentBlock = job.commitment_blocks?.[0];
  const interpreter = commitmentBlock?.interpreters;
  const location = commitmentBlock?.locations;
  const organization = location?.organizations;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="button button-ghost"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="heading-2 mb-1">
                  Job Details - {job.client_name}
                </h1>
                <p className="body-small text-gray-500">
                  Case: {job.case_number || 'No case number'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="button button-outline">
                <Mail className="h-4 w-4" />
                Draft Email
              </button>
              <button className="button button-primary">
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Job Information - Main Column */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Job Information</h2>
                {commitmentBlock?.status && (
                  <span className={getStatusBadgeClass(commitmentBlock.status)}>
                    {commitmentBlock.status}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {/* Client Details */}
                <div>
                  <h3 className="heading-4 mb-3">Client Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Client Name</label>
                      <p className="body-base">{job.client_name}</p>
                    </div>
                    <div>
                      <label className="input-label">Case Number</label>
                      <p className="body-base">{job.case_number || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="input-label">Language</label>
                      <p className="body-base">{job.languages?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="input-label">Program</label>
                      <p className="body-base">{job.court_programs?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="input-label">Meeting Type</label>
                      <p className="body-base">{job.meeting_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="input-label">Key Contact</label>
                      <p className="body-base">{job.key_contact_name || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Charges */}
                {job.charges && (
                  <div>
                    <label className="input-label">Charges</label>
                    <p className="body-base">{job.charges}</p>
                  </div>
                )}

                {/* Requestor Information */}
                <div>
                  <label className="input-label">Requestor Email</label>
                  <p className="body-base">{job.requestor_email || 'Not specified'}</p>
                </div>

                {/* Location Details */}
                {job.specific_location_details && (
                  <div>
                    <label className="input-label">Specific Location Details</label>
                    <p className="body-base">{job.specific_location_details}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Information */}
            {commitmentBlock && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Schedule Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <label className="input-label mb-0">Start Time</label>
                    </div>
                    <p className="body-base">{formatDateTime(commitmentBlock.start_time)}</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <label className="input-label mb-0">End Time</label>
                    </div>
                    <p className="body-base">{formatDateTime(commitmentBlock.end_time)}</p>
                  </div>

                  <div>
                    <label className="input-label">Duration</label>
                    <p className="body-base">{commitmentBlock.duration ? `${commitmentBlock.duration} minutes` : 'Not specified'}</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <label className="input-label mb-0">Modality</label>
                    </div>
                    <p className="body-base">{commitmentBlock.modality || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Interpreter Assignment */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Interpreter Assignment</h2>
              </div>

              {interpreter ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-blue text-white rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="heading-4 mb-1">
                        {interpreter.first_name} {interpreter.last_name}
                      </p>
                      <p className="body-small text-gray-600">{interpreter.email}</p>
                      {interpreter.phone && (
                        <p className="body-small text-gray-600">{interpreter.phone}</p>
                      )}
                    </div>
                  </div>

                  <button className="button button-secondary w-full">
                    <Mail className="h-4 w-4" />
                    Send Email Update
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="body-base text-gray-600 mb-4">No interpreter assigned</p>
                  <button className="button button-primary">
                    Assign Interpreter
                  </button>
                </div>
              )}
            </div>

            {/* Location Information */}
            {location && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Location</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <label className="input-label mb-0">Organization</label>
                    </div>
                    <p className="body-base">{organization?.name || location.name}</p>
                    {organization?.abbreviation && (
                      <p className="body-small text-gray-600">({organization.abbreviation})</p>
                    )}
                  </div>

                  {location.address && (
                    <div>
                      <label className="input-label">Address</label>
                      <p className="body-base">{location.address}</p>
                    </div>
                  )}

                  {location.zoom_link && (
                    <div>
                      <label className="input-label">Zoom Link</label>
                      <a 
                        href={location.zoom_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-blue hover:text-primary-light body-base"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Timeline</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="body-small text-gray-600">Created</span>
                  <span className="body-small">{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="body-small text-gray-600">Last Updated</span>
                  <span className="body-small">{new Date(job.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}