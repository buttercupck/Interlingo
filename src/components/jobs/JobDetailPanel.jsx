import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import JobStatus from "../shared/JobStatus";
import { format, addMinutes } from "date-fns";
import { X, User, MapPin, Clock, Globe } from "lucide-react";

export default function JobDetailPanel({ job, onClose, interpreters = [], locations = [] }) {
  const [status, setStatus] = useState(job?.status);
  const [modality, setModality] = useState(job?.modality);
  const [interpreterId, setInterpreterId] = useState(job?.interpreter_id);
  const [locationId, setLocationId] = useState(job?.location_id);
  const [caseNotes, setCaseNotes] = useState(job?.case_notes || "");

  if (!job) return null;

  const start = new Date(job.start_time);
  const end = addMinutes(start, job.duration || 120);
  const formattedDate = format(start, "EEEE, MMMM d");
  const formattedTime = `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    const { error } = await supabase
      .from("requests")
      .update({ status: newStatus })
      .eq("id", job.id);
    if (error) console.error("Failed to update status:", error);
  };

  const handleUpdateField = async (field, value) => {
    const { error } = await supabase
      .from("requests")
      .update({ [field]: value })
      .eq("id", job.id);
    if (error) console.error(`Failed to update ${field}:`, error);
  };

  const filteredInterpreters = interpreters.filter((i) =>
    i.interpreter_languages?.some((lang) => lang.language_id === job.required_language_id)
  );

  const filteredLocations = locations.filter((loc) =>
    loc.org_id === job.locations?.organizations?.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="heading-2 mb-1">
                {job.client_name || 'Job Details'}
              </h1>
              <p className="body-base text-gray-600">
                {job.languages?.name} • {formattedDate}
              </p>
            </div>

            <button
              onClick={onClose}
              className="button button-ghost"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Job Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Job Information</h2>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="body-small text-gray-600">{formattedTime}</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Client Details */}
              <div>
                <h3 className="heading-4 mb-3">Client Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="input-label">Client Name</label>
                    <p className="body-base">{job.client_name || 'Not specified'}</p>
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
                    <label className="input-label">Meeting Type</label>
                    <p className="body-base">{job.meeting_type || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              {job.locations?.organizations?.name && (
                <div>
                  <h3 className="heading-4 mb-3">Location</h3>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="body-base font-medium">{job.locations.organizations.name}</p>
                      <p className="body-small text-gray-600">{job.locations.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment & Settings */}
          <div className="space-y-6">

            {/* Interpreter Assignment */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Interpreter Assignment</h2>
                <User className="h-5 w-5 text-gray-400" />
              </div>

              <div className="input-group">
                <label className="input-label">Select Interpreter</label>
                <select
                  value={interpreterId || ""}
                  onChange={(e) => {
                    setInterpreterId(e.target.value);
                    handleUpdateField("interpreter_id", e.target.value);
                  }}
                  className="input select"
                >
                  <option value="">Select Interpreter</option>
                  {filteredInterpreters.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.first_name} {i.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job Settings */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Job Settings</h2>
              </div>

              <div className="space-y-4">
                {/* Job Status */}
                <div className="input-group">
                  <label className="input-label">Status</label>
                  <JobStatus status={status} onChange={handleStatusChange} />
                </div>

                {/* Modality */}
                <div className="input-group">
                  <label className="input-label">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Modality
                  </label>
                  <select
                    value={modality || ""}
                    onChange={(e) => {
                      setModality(e.target.value);
                      handleUpdateField("modality", e.target.value);
                    }}
                    className="input select"
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Phone">Phone</option>
                    <option value="In Person">In Person</option>
                  </select>
                </div>

                {/* Location */}
                <div className="input-group">
                  <label className="input-label">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location
                  </label>
                  <select
                    value={locationId || ""}
                    onChange={(e) => {
                      setLocationId(e.target.value);
                      handleUpdateField("location_id", e.target.value);
                    }}
                    className="input select"
                  >
                    <option value="">Select Location</option>
                    {filteredLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Case Notes */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Case Notes</h2>
              </div>

              <div className="input-group">
                <label className="input-label">Notes & Description</label>
                <textarea
                  value={caseNotes}
                  onChange={(e) => {
                    setCaseNotes(e.target.value);
                    handleUpdateField("case_notes", e.target.value);
                  }}
                  className="input resize-none"
                  rows="6"
                  placeholder="Add any relevant case notes or special instructions..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}