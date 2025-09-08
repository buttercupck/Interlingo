import React, { useEffect, useState } from 'react';
// Corrected import paths to resolve the "Could not resolve" error
import { getOrgs } from '../services/orgService.js';
import { getLanguages } from '../services/languageService.js';
import { getLocationsByOrgId } from '../services/locationService.js';
import { getPrograms } from '../services/programsService.js';
import { createNewRequest } from '../services/requestService.js';

// Define the form field structure and initial state
const initialFormData = {
  organization: '',
  location: '',
  language: '',
  program: '',
  modality: '',
  startTime: '',
  endTime: '',
  clientName: '',
  caseNumber: '',
  meetingType: '',
  charges: '',
};

function IntakeForm({ onCancel, onSuccess }) {
  // State for dropdown data (from DB)
  const [orgs, setOrgs] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [locations, setLocations] = useState([]);

  // State for form input values
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);

  // Handle form input changes
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  // Handle organization change to fetch locations
  if (name === 'organization' && value) {
    const fetchedLocations = await getLocationsByOrgId(value);
    setLocations(fetchedLocations || []);
    setFormData(prevState => ({ ...prevState, location: '' }));
   }
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // 1. Get the local Date objects from the form input
    const startTimeLocal = new Date(formData.startTime);

    // 2. Calculate endTime based on startTimeLocal and duration (e.g., 2 hours)
    const durationInHours = 2; // Or get this from another form field if applicable
    const endTimeLocal = new Date(startTimeLocal.getTime() + durationInHours * 60 * 60 * 1000);

    // 3. Convert both local Date objects to UTC ISO strings for database storage
    const startTimeUTC = startTimeLocal.toISOString();
    const endTimeUTC = endTimeLocal.toISOString();

    const newRequestData = { ...formData, startTime: startTimeUTC, endTime: endTimeUTC, program: formData.program === '' ? null : formData.program,};

    const result = await createNewRequest(newRequestData);

    if (result.success) {
      alert('Request created successfully!');
      setFormData(initialFormData);
      if (onSuccess) onSuccess();
      } else {
      alert(`Failed to create request: ${result.error}`);
    }
    setLoading(false);
  };

  // Fetch all dropdown data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const org = await getOrgs();
        const langs = await getLanguages();
        const progs = await getPrograms();

        setOrgs(org || []);
        setLanguages(langs || []);
        setPrograms(progs || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <div className="intake-form-container">
      <h2 style={{ marginBottom: '20px' }}>Client Request Intake</h2>

      <form onSubmit={handleSubmit} className="intake-form">
        {/* --- Commitment Block Fields --- */}
        <div className="form-section">
          <h3>Commitment Block Details</h3>
          <label>
            Organization:
            <select name="organization" value={formData.org} onChange={handleInputChange} required>
              <option value="">Select an organization</option>
              {orgs.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}
            </select>
          </label>
          <label>
          Location:
          <select name="location" value={formData.location} onChange={handleInputChange} required>
            <option value="">Select a location</option>
            {locations.map(loc => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
          </select>
          </label>
          
          <label>
            Modality:
            <select name="modality" value={formData.modality} onChange={handleInputChange} required>
              <option value="">Select a modality</option>
              <option value="In-Person">In-Person</option>
              <option value="Phone">Phone</option>
              <option value="Zoom">Zoom</option>
            </select>
          </label>

          <label>
            Start Time:
            <input 
              type="datetime-local" 
              name="startTime" 
              value={formData.startTime} 
              onChange={handleInputChange} 
              required 
            />
          </label>
        </div>

        {/* --- Client Request Fields --- */}
        <div className="form-section">
          <h3>Client Request Details</h3>
          <label>
            Language:
            <select name="language" value={formData.language} onChange={handleInputChange} required>
              <option value="">Select a language</option>
              {languages.map(lang => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}
            </select>
          </label>

          <label>
            Court Program:
            <select name="program" value={formData.program} onChange={handleInputChange}>
              <option value="">Select a program</option>
              {programs.map(prog => (<option key={prog.id} value={prog.id}>{prog.name}</option>))}
            </select>
          </label>

          <label>
            Client Name:
            <input 
              type="text" 
              name="clientName" 
              value={formData.clientName} 
              onChange={handleInputChange} 
              required 
            />
          </label>

          <label>
            Case Number:
            <input 
              type="text" 
              name="caseNumber" 
              value={formData.caseNumber} 
              onChange={handleInputChange} 
            />
          </label>

          <label>
            Meeting Type:
            <input 
              type="text" 
              name="meetingType" 
              value={formData.meetingType} 
              onChange={handleInputChange} 
              required 
            />
          </label>

          <label>
            Charges (as text):
            <input 
              type="text" 
              name="charges" 
              value={formData.charges} 
              onChange={handleInputChange} 
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px'}}>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        </div>
      </form>

      {/* Basic Inline Styling */}
      <style>
        {`
        .intake-form-container {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .intake-form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .form-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .form-section h3 {
            margin-top: 0;
            border-bottom: 2px solid #333;
            padding-bottom: 5px;
        }
        label {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        input, select {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
        button {
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
            grid-column: 1 / -1;
        }
        `}
      </style>
    </div>
  );
}

export default IntakeForm;
