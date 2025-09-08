import React, { useEffect, useMemo, useState } from 'react';
import { getFilteredYPrioritizedInpterpreters } from '../services/interpreterService.jsx'

const getJobLocationDetails = (organization) => {
  if (!organization) return { city: null, state: null };
  return { city: organization.city ?? null, state: organization.state ?? null };
};
function RDV({ request, onBack }) {
  console.log("Request object in RDV:", request);
  
  const firstClientRequest = request?.client_requests?.[0] ?? null;
  const jobOrganization = request?.locations?.organizations ?? null;
  const languageId = useMemo(() => (
    firstClientRequest?.language_id
    ?? firstClientRequest?.language?.id
    ?? firstClientRequest?.languages?.id
    ?? null
  ), [firstClientRequest]);
  
  const [interpreterData, setInterpreterData] = useState({ available: [], unavailable: [] });
  const [loadingInterpreters, setLoadingInterpreters] = useState(true);
  const { city: jobCity, state: jobState } = getJobLocationDetails(jobOrganization);
  
  useEffect(() => {
    async function fetchInterpretersData(){
      setLoadingInterpreters(true);
       const { city: jobCity, state: jobState } = getJobLocationDetails(jobOrganization);
      if (firstClientRequest?.language.id) {
      const data = await getFilteredYPrioritizedInpterpreters(
        firstClientRequest?.language_id,
        request.modality,
        request.start_time,
        request.end_time,
        jobCity,
        jobState
      );
      console.log("Fetched Interpreter Data:", data);
        if (data) {
          setInterpreterData(data);
        } else {
          setInterpreterData({ available: [], unavailable: [] });
        }
      } else {
        setInterpreterData({ available: [], unavailable: [] });
      }
      setLoadingInterpreters(false);
    }
    fetchInterpretersData();
  },[request, firstClientRequest, jobOrganization, jobCity, jobState]);
  
  return (
    <div>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ccc'}}>
    <button onClick={onBack}>Back to Queue</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between'}} >
        <div style={{ width: '45%', padding: '1rem', borderRight: '1px solid #ccc' }}>
    <h2> Request Details</h2>
    <p><strong>Organization:</strong> {request.locations?.organizations?.name || 'N/A'}</p>
    <p><strong>Location:</strong> {request.locations?.name || 'N/A'}</p>
          {request.locations?.zoom_link && (
    <p><strong>Zoom Link:</strong> <a href={request.locations.zoom_link} target="_blank" rel="noopener noreferrer">{request.locations.zoom_link}</a></p>
          )}
          {request.locations?.zoom_login && (
            <p><strong>Zoom Login:</strong> {request.locations.zoom_login}</p>
          )}
    <p><strong> Address:</strong> {jobOrganization?.street && `${jobOrganization.street}, `}
      {jobOrganization?.city && `${jobOrganization.city}, `}
      {jobOrganization?.state && `${jobOrganization.state} `}
      {jobOrganization?.zip || 'N/A'}</p>
    <p><strong>Date & Time:</strong> {new Date(request.start_time).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</p>
    <p><strong>Modality:</strong> {request.modality}</p>
    <p><strong>Status:</strong> {request.status}</p>
          
    <hr style={{ margin: '1rem 0'}} />

          {firstClientRequest && (
    <>
      <h3> Client Details</h3>
      <p><strong>Client Name:</strong>  {firstClientRequest.client_name}</p>
      <p><strong>Language:</strong> {firstClientRequest.languages?.name || 'N/A'}</p>
      <p><strong>Meeting Type:</strong> {firstClientRequest.meeting_type}</p>
      <p><strong>Case Number:</strong> {firstClientRequest.case_number || 'N/A'}</p>
      <p><strong>Charges:</strong> {firstClientRequest.charges || 'N/A'}</p>
      <p><strong>Program:</strong> {firstClientRequest.court_programs?.name || 'N/A'}</p>
    </>
          )}
        </div>
        {/* Right Panel: Interpreter List & Action Bar */}
        <div style={{ width: '45%', padding: '1rem' }}>
          <h2>Interpreter Assignment</h2>
          {loadingInterpreters ?(
            <div>Loading interpreters...</div>
          ) : (
      <>
        <h3> Available Interpreters ({ interpreterData.available.length})</h3>
        {interpreterData.available.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {interpreterData.available.map(interpreter => (
            <li key={interpreter.id} style={{ 
                padding: '8px', 
                margin: '4px 0', 
                border: '1px solid #28a745', 
                borderRadius: '4px', 
                backgroundColor: '#e6ffe6' 
            }}>
              <strong>{interpreter.first_name} {interpreter.last_name}</strong>
              {interpreter.interpreter_languages?.[0]?.certification && 
               ` (${interpreter.interpreter_languages[0].certification})`}
              {/* Add a reason for unavailability */}
              {modality === 'In-Person' && (interpreter.city !== city || interpreter.state !== state) && ` (Not local)`}
              {modality !== 'In-Person' && !interpreter.modality_preferences.includes(modality) && ` (Modality mismatch)`}
              {busyInterpreterIds.includes(interpreter.id) && ` (Booked)`} {/* Added booked reason */}
            </li>
          ))}
        </ul>
        ) : (
        <p>No available interpreters found.</p>
        )}
      </>
      )}
          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button>Confirm & Assign</button>
            <button>Edit Request</button>
            <button style={{ backgroundColor: 'red', color: 'white' }}>Cancel Job</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RDV;