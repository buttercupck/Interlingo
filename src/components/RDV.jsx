import React, { useEffect, useMemo, useState } from 'react';
import { getInterpreterById } from '../services/interpreterService.jsx'

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
  
  const [interpretersList, setInterpretersList] = useState([]);
  const [interpreterData, setInterpreterData] = useState({ available: [], unavailable: [] });
  const [loadingInterpreters, setLoadingInterpreters] = useState(true);
  const { city: jobCity, state: jobState } = getJobLocationDetails(jobOrganization);

  useEffect(() => {
    async function fetchInterpreters() {
      // Make sure firstClientRequest and its language property exist before fetching
      if (firstClientRequest?.language?.id) {
        const languageId = firstClientRequest.language.id;
        const interpreters = await getInterpretersByLanguage(languageId);
        setInterpretersList(interpreters);
      } else {
        setInterpretersList([]); // Clear the list if no language is selected
      }
    }

    fetchInterpreters();
  }, [firstClientRequest]); // The dependency array ensures this runs whenever the client request changes

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
        <div>
          <h2>Interpreters</h2>
          {interpretersList.length > 0 ? (
            <ul>
              {interpretersList.map(interpreter => (
                <li key={interpreter.id}>
                  {interpreter.first_name} {interpreter.last_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No interpreters found for this language.</p>
          )}
        </div>
          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button>Confirm & Assign</button>
            <button>Edit Request</button>
            <button style={{ backgroundColor: 'red', color: 'white' }}>Cancel Job</button>
          </div>
        </div>
      </div>
  );
}
export default RDV;