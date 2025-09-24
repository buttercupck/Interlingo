import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { ArrowLeft, Edit3, Save, X } from 'lucide-react';
import InterpreterSelector from '../components/interpreters/InterpreterSelector';

export default function JobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [interpreters, setInterpreters] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
      fetchDropdownData();
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
            name
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);

      // Initialize form data
      const commitmentBlock = data.commitment_blocks?.[0];
      setFormData({
        // Client Request fields
        client_name: data.client_name || '',
        case_number: data.case_number || '',
        meeting_type: data.meeting_type || '',
        charges: data.charges || '',
        key_contact_name: data.key_contact_name || '',
        requestor_email: data.requestor_email || '',

        // Commitment Block fields
        start_time: commitmentBlock?.start_time || '',
        end_time: commitmentBlock?.end_time || '',
        modality: commitmentBlock?.modality || '',
        status: commitmentBlock?.status || 'pending',
        interpreter_id: commitmentBlock?.interpreter_id || '',
        location_id: commitmentBlock?.location_id || '',

        // Related IDs
        language_id: data.language_id || '',
        program_id: data.program_id || ''
      });

    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch interpreters for the language filter
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      const { data: locsData } = await supabase
        .from('locations')
        .select('*, organizations(*)')
        .order('name');

      setOrganizations(orgsData || []);
      setLocations(locsData || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Update client_requests
      const { error: clientError } = await supabase
        .from('client_requests')
        .update({
          client_name: formData.client_name,
          case_number: formData.case_number,
          meeting_type: formData.meeting_type,
          charges: formData.charges,
          key_contact_name: formData.key_contact_name,
          requestor_email: formData.requestor_email,
          language_id: formData.language_id,
          program_id: formData.program_id
        })
        .eq('id', jobId);

      if (clientError) throw clientError;

      // Update commitment_blocks
      const commitmentBlock = job.commitment_blocks?.[0];
      if (commitmentBlock) {
        const { error: blockError } = await supabase
          .from('commitment_blocks')
          .update({
            start_time: formData.start_time,
            end_time: formData.end_time,
            modality: formData.modality,
            status: formData.status,
            interpreter_id: formData.interpreter_id || null,
            location_id: formData.location_id
          })
          .eq('id', commitmentBlock.id);

        if (blockError) throw blockError;
      }

      setIsEditing(false);
      fetchJobDetails(jobId); // Refresh data
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save changes');
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'badge badge-success';
      case 'pending': return 'badge badge-warning';
      case 'cancelled': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="button button-ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="button button-ghost"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="button button-primary"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="button button-primary"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          {/* Title: [Language] - [Interpreter First Name | "?"] [Modality] */}
          <div className="mb-6">
            {isEditing ? (
              <input
                type="text"
                className="heading-2 w-full border-0 p-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-blue rounded"
                value={`${job.languages?.name || 'Unknown'} - ${interpreter?.first_name || '?'} ${formData.modality?.toUpperCase() || 'TBD'}`}
                readOnly
              />
            ) : (
              <h1 className="heading-2">
                {job.languages?.name || 'Unknown'} - {interpreter?.first_name || '?'} {commitmentBlock?.modality?.toUpperCase() || 'TBD'}
              </h1>
            )}
          </div>

          <hr className="mb-6" />

          {/* Job Status */}
          <div className="mb-6">
            <label className="input-label">Job Status</label>
            {isEditing ? (
              <select 
                className="input"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <span className={getStatusBadgeClass(commitmentBlock?.status)}>
                {commitmentBlock?.status || 'pending'}
              </span>
            )}
          </div>

          {/* Commitment Block */}
          <div className="mb-6">
            <h3 className="heading-4 mb-3">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Start Time</label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{commitmentBlock?.start_time ? new Date(commitmentBlock.start_time).toLocaleString() : 'TBD'}</p>
                )}
              </div>
              <div>
                <label className="input-label">End Time</label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{commitmentBlock?.end_time ? new Date(commitmentBlock.end_time).toLocaleString() : 'TBD'}</p>
                )}
              </div>
              <div>
                <label className="input-label">Modality</label>
                {isEditing ? (
                  <select 
                    className="input"
                    value={formData.modality}
                    onChange={(e) => handleInputChange('modality', e.target.value)}
                  >
                    <option value="">Select modality</option>
                    <option value="in_person">IN PERSON</option>
                    <option value="zoom">ZOOM</option>
                    <option value="phone">PHONE</option>
                  </select>
                ) : (
                  <p className="body-base">{commitmentBlock?.modality?.toUpperCase() || 'TBD'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Client Requests */}
          <div className="mb-6">
            <h3 className="heading-4 mb-3">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Client Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{job.client_name}</p>
                )}
              </div>
              <div>
                <label className="input-label">Case Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={formData.case_number}
                    onChange={(e) => handleInputChange('case_number', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{job.case_number || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="input-label">Meeting Type</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={formData.meeting_type}
                    onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{job.meeting_type || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="input-label">Key Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={formData.key_contact_name}
                    onChange={(e) => handleInputChange('key_contact_name', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{job.key_contact_name || 'N/A'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Charges</label>
                {isEditing ? (
                  <textarea
                    className="input"
                    rows="2"
                    value={formData.charges}
                    onChange={(e) => handleInputChange('charges', e.target.value)}
                  />
                ) : (
                  <p className="body-base">{job.charges || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <hr className="mb-6" />

          {/* Filtered Dropdown of Interpreters */}
          <div className="mb-6">
            <h3 className="heading-4 mb-3">Interpreter Assignment</h3>
            {isEditing ? (
              <InterpreterSelector
                selectedInterpreter={interpreter}
                onInterpreterSelect={(interp) => handleInputChange('interpreter_id', interp?.id || '')}
                requiredLanguage={job.languages?.name}
              />
            ) : (
              <div className="card bg-gray-50">
                {interpreter ? (
                  <div>
                    <p className="heading-4">{interpreter.first_name} {interpreter.last_name}</p>
                    <p className="body-small text-gray-600">{interpreter.email}</p>
                    {interpreter.phone && <p className="body-small text-gray-600">{interpreter.phone}</p>}
                  </div>
                ) : (
                  <p className="body-base text-gray-600">No interpreter assigned</p>
                )}
              </div>
            )}
          </div>

          <hr className="mb-6" />

          {/* Organization & Location */}
          <div>
            <h3 className="heading-4 mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Organization</label>
                {isEditing ? (
                  <select 
                    className="input"
                    value={organization?.id || ''}
                    onChange={(e) => {
                      // Find location that belongs to this organization
                      const orgLocations = locations.filter(loc => loc.organizations?.id === e.target.value);
                      if (orgLocations.length > 0) {
                        handleInputChange('location_id', orgLocations[0].id);
                      }
                    }}
                  >
                    <option value="">Select organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="body-base">{organization?.name || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="input-label">Location</label>
                {isEditing ? (
                  <select 
                    className="input"
                    value={formData.location_id}
                    onChange={(e) => handleInputChange('location_id', e.target.value)}
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.organizations?.name ? `(${loc.organizations.name})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <p className="body-base">{location?.name || 'N/A'}</p>
                    {location?.address && <p className="body-small text-gray-600">{location.address}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}