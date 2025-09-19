import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Email Draft Interface Component
const EmailDraftInterface = ({ selectedJob, onClose }) => {
  const [emailType, setEmailType] = useState('REM');
  const [jobData, setJobData] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [missingData, setMissingData] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch complete job data when selectedJob changes
  useEffect(() => {
    if (selectedJob?.id) {
      fetchCompleteJobData(selectedJob.id);
    }
  }, [selectedJob]);

  // Generate email content when job data or email type changes
  useEffect(() => {
    if (jobData) {
      generateEmailContent();
    }
  }, [jobData, emailType]);

  const fetchCompleteJobData = async (jobId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('commitment_blocks')
        .select(`
          *,
          locations (
            id,
            name,
            zoom_link,
            zoom_login,
            organizations (
              id,
              name,
              street,
              city,
              state,
              zip,
              abbreviation
            )
          ),
          client_requests (
            *,
            languages (id, name),
            court_programs (id, name)
          ),
          interpreters (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      setJobData(data);
    } catch (error) {
      console.error('Error fetching job data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmailContent = () => {
    if (!jobData) return;

    const missing = [];
    const firstRequest = jobData.client_requests?.[0];
    const organization = jobData.locations?.organizations;
    const interpreter = jobData.interpreters;

    // Check for missing data
    if (!interpreter?.email) missing.push('Interpreter Email');
    if (!interpreter?.phone) missing.push('Interpreter Phone');
    if (!firstRequest?.meeting_type) missing.push('Hearing Type');
    if (!firstRequest?.charges) missing.push('Charges');
    if (!firstRequest?.case_number) missing.push('Case Number');

    setMissingData(missing);

    // Format date and time
    const startTime = new Date(jobData.start_time);
    const timeString = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const dateString = startTime.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });

    // Calculate duration in hours
    const endTime = new Date(jobData.end_time);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));

    // Generate content based on email type
    let content = '';
    let subject = '';

    switch (emailType) {
      case 'REM':
        subject = `Reminder: ${timeString} ${jobData.modality?.toUpperCase()} Assignment Tomorrow${durationHours > 2 ? ` (${durationHours} hours)` : ''}`;
        content = generateREMContent(jobData, firstRequest, organization, interpreter, timeString, dateString, durationHours);
        break;
      case 'REQ':
        subject = `Assignment Request: ${organization?.name || 'Court'} - ${firstRequest?.languages?.name} - ${timeString}`;
        content = generateREQContent(jobData, firstRequest, organization, interpreter, timeString, dateString);
        break;
      case 'CONF':
        subject = `Assignment Confirmation: ${organization?.name || 'Court'} - ${dateString} at ${timeString}`;
        content = generateCONFContent(jobData, firstRequest, organization, interpreter, timeString, dateString);
        break;
    }

    setEmailContent({ subject, body: content });
  };

  const generateREMContent = (job, request, org, interpreter, time, date, duration) => {
    const modality = job.modality?.toUpperCase();
    const orgName = org?.abbreviation || org?.name || 'Court';
    
    let content = `You are scheduled for ${orgName} tomorrow, ${date} at ${time}.\n\n`;
    
    if (modality === 'IN PERSON') {
      content += `Please submit your round trip mileage via email by 5 PM today.\n\n`;
    }
    
    if (duration > 2) {
      content += `⚠️ **Extended Assignment:** This is a ${duration}-hour assignment ending at ${new Date(job.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}. Please plan accordingly.\n\n`;
    }

    if (modality === 'ZOOM' && job.locations?.zoom_link) {
      content += `Zoom Link: ${job.locations.zoom_link}\n`;
      if (job.locations?.zoom_login) {
        content += `Zoom Login: ${job.locations.zoom_login}\n`;
      }
      content += '\n';
    }

    // Add case details
    const caseInfo = [];
    if (request?.client_name) caseInfo.push(request.client_name);
    if (request?.case_number) caseInfo.push(request.case_number);
    if (!request?.meeting_type) caseInfo.push('⚠️ MISSING: Hearing Type');
    else caseInfo.push(request.meeting_type);
    
    content += caseInfo.join(', ') + '\n';
    
    if (!request?.charges) {
      content += '⚠️ MISSING: Charges';
    } else {
      content += request.charges;
    }

    return content;
  };

  const generateREQContent = (job, request, org, interpreter, time, date) => {
    const modality = job.modality?.toUpperCase();
    
    let content = `Assignment Request:\n\n`;
    content += `Date: ${date}\n`;
    content += `Time: ${time}\n`;
    content += `Language: ${request?.languages?.name || 'Unknown'}\n`;
    content += `Modality: ${modality}\n`;
    content += `Organization: ${org?.name || 'Unknown'}\n\n`;
    
    if (request?.client_name) content += `Client: ${request.client_name}\n`;
    if (request?.case_number) content += `Case: ${request.case_number}\n`;
    if (request?.meeting_type) content += `Type: ${request.meeting_type}\n`;
    if (request?.charges) content += `Charges: ${request.charges}\n`;
    
    content += `\nPlease confirm your availability for this assignment.`;
    
    return content;
  };

  const generateCONFContent = (job, request, org, interpreter, time, date) => {
    const modality = job.modality?.toUpperCase();
    
    let content = `Your assignment has been confirmed:\n\n`;
    content += `Date: ${date}\n`;
    content += `Time: ${time}\n`;
    content += `Language: ${request?.languages?.name || 'Unknown'}\n`;
    content += `Modality: ${modality}\n`;
    content += `Organization: ${org?.name || 'Unknown'}\n`;
    
    if (org?.street) {
      content += `Address: ${org.street}`;
      if (org.city) content += `, ${org.city}`;
      if (org.state) content += `, ${org.state}`;
      if (org.zip) content += ` ${org.zip}`;
      content += '\n';
    }
    
    if (modality === 'ZOOM' && job.locations?.zoom_link) {
      content += `\nZoom Details:\n`;
      content += `Link: ${job.locations.zoom_link}\n`;
      if (job.locations?.zoom_login) {
        content += `Login: ${job.locations.zoom_login}\n`;
      }
    }
    
    content += `\nCase Information:\n`;
    if (request?.client_name) content += `Client: ${request.client_name}\n`;
    if (request?.case_number) content += `Case: ${request.case_number}\n`;
    if (request?.meeting_type) content += `Type: ${request.meeting_type}\n`;
    if (request?.charges) content += `Charges: ${request.charges}\n`;
    
    return content;
  };

  const handleCopyEmail = async () => {
    if (!emailContent) return;
    
    const fullEmail = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    
    try {
      await navigator.clipboard.writeText(fullEmail);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  if (!selectedJob) {
    return (
      <div className="email-draft-panel">
        <div className="email-draft-empty">
          <div className="empty-state">
            <h3>No Job Selected</h3>
            <p>Select a job from the list to generate email drafts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-draft-panel">
      <div className="email-draft-header">
        <h2>Email Draft</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Loading job details...</p>
        </div>
      ) : (
        <>
          {/* Email Type Selector */}
          <div className="email-type-selector">
            <div className="tab-group">
              {['REM', 'REQ', 'CONF'].map((type) => (
                <button
                  key={type}
                  className={`tab ${emailType === type ? 'active' : ''}`}
                  onClick={() => setEmailType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="email-preview">
            <div className="email-preview-header">
              <div className="email-field">
                <strong>To:</strong> 
                {jobData?.interpreters?.email ? (
                  <span className="email-valid"> {jobData.interpreters.email}</span>
                ) : (
                  <span className="email-missing"> ⚠️ MISSING: Interpreter Email</span>
                )}
              </div>
              <div className="email-field">
                <strong>Subject:</strong> {emailContent?.subject || ''}
              </div>
            </div>
            
            <div className="email-body">
              {emailContent?.body || ''}
            </div>
            
            {missingData.length > 0 && (
              <div className="missing-data-warning">
                <h4>⚠️ Missing Information:</h4>
                <ul>
                  {missingData.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="email-actions">
            <button 
              className="button button-primary"
              onClick={handleCopyEmail}
              disabled={!emailContent}
            >
              {isCopied ? '✓ Copied!' : 'Copy Email'}
            </button>
            <button className="button button-secondary">
              Send for Review
            </button>
            <button className="button button-outline">
              Edit Template
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .email-draft-panel {
          width: 400px;
          height: 100vh;
          background: white;
          border-left: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .email-draft-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .email-draft-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .email-draft-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .loading-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #6b7280;
        }

        .email-type-selector {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab-group {
          display: flex;
          gap: 0.25rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .tab {
          flex: 1;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab.active {
          background: #1b365c;
          color: white;
        }

        .tab:hover:not(.active) {
          background: #e5e7eb;
          color: #374151;
        }

        .email-preview {
          flex: 1;
          overflow-y: auto;
          background: white;
        }

        .email-preview-header {
          background: #f9fafb;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .email-field {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .email-field strong {
          color: #374151;
          display: inline-block;
          width: 60px;
        }

        .email-valid {
          color: #059669;
        }

        .email-missing {
          color: #dc2626;
        }

        .email-body {
          padding: 1.5rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          white-space: pre-wrap;
          color: #374151;
          background: white;
        }

        .missing-data-warning {
          margin: 1rem 1.5rem;
          padding: 1rem;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
        }

        .missing-data-warning h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #92400e;
        }

        .missing-data-warning ul {
          margin: 0;
          padding-left: 1rem;
          font-size: 0.875rem;
          color: #92400e;
        }

        .email-actions {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-family: inherit;
        }

        .button-primary {
          background-color: #1b365c;
          color: white;
        }

        .button-primary:hover:not(:disabled) {
          background-color: #2d4a6b;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .button-primary:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .button-secondary {
          background-color: #0d7377;
          color: white;
        }

        .button-secondary:hover {
          background-color: #0a5d61;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .button-outline {
          background-color: transparent;
          color: #1b365c;
          border: 1px solid #1b365c;
        }

        .button-outline:hover {
          background-color: #ebf1f7;
        }
      `}</style>
    </div>
  );
};

export default EmailDraftInterface;
