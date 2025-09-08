import React, { useEffect, useState } from 'react';
import { getAllRequestsWithDetails } from '../services/requestService.js';
import RDV from './RDV.jsx';
import Intakeform from './IntakeForm.jsx'

function RequestQueue() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchRequests = async () => {
  setLoading(true);
      try {
        const fetchedRequests = await getAllRequestsWithDetails();
        if (fetchedRequests) {
          setRequests(fetchedRequests);
        } else {
          setError('No requests found');
        }
      } catch (e) {
        setError('Error fetching requests');
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchRequests();
  }, []);
  if (showIntakeForm){
    return <Intakeform onCancel={() => setShowIntakeForm(false)} onSuccess={fetchRequests} />;
  }
  if (selectedRequest){
    return <RDV request={selectedRequest} onBack={() => setSelectedRequest(null)} />;
  }
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  if (requests.length === 0){
    return (
      <div>
        <h2>Request Queue</h2>  
      <button onClick={() => setShowIntakeForm(true)}>Create New Request</button>
      <div> No pending requests found.</div>
      </div>
    );
  }
  
  return (
    <div>
    <h2>Request Queue</h2>
      <button onClick={() => setShowIntakeForm(true)}>Create New Request</button>
      <ul>
        {requests.map(request => (
      <li key={request.id} onClick={() => setSelectedRequest(request)}>
        <strong>Organization:</strong> {request.organization?.name || 'N/A'} -
        <strong>Language:</strong> {request.client_requests[0]?.languages?.name || 'N/A'} -
        <strong>Time:</strong> {new Date(request.start_time).toLocaleString()}
        </li>
      ))}
    </ul>
  </div>
  );
}

export default RequestQueue;