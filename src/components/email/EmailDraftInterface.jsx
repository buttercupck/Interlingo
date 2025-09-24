import React, { useState, useEffect } from 'react';
import { supabase } from '/src/lib/supabase.js';


// Email Draft Interface Component with Interlingo Design System
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
      <div className="w-96 h-screen bg-white border-l border-gray-200 flex flex-col font-primary">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <h3 className="heading-4 text-gray-700 mb-2">No Job Selected</h3>
            <p className="body-base">Select a job from the list to generate email drafts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 h-screen bg-white border-l border-gray-200 flex flex-col font-primary">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="heading-4 text-gray-700 mb-0">Email Draft</h2>
        <button 
          className="bg-transparent border-0 text-xl text-gray-500 cursor-pointer p-1 rounded transition-all duration-200 hover:bg-gray-200 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
          <p className="body-base">Loading job details...</p>
        </div>
      ) : (
        <>
          {/* Email Type Selector */}
          <div className="p-4 px-6 border-b border-gray-200">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['REM', 'REQ', 'CONF'].map((type) => (
                <button
                  key={type}
                  className={`flex-1 px-4 py-2 bg-transparent border-0 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                    emailType === type 
                      ? 'bg-primary-blue text-white' 
                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                  onClick={() => setEmailType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* Email Header */}
            <div className="bg-gray-50 p-4 px-6 border-b border-gray-200">
              <div className="mb-2 text-sm leading-normal">
                <span className="text-gray-700 inline-block w-16 font-medium">To:</span>
                {jobData?.interpreters?.email ? (
                  <span className="text-green-600"> {jobData.interpreters.email}</span>
                ) : (
                  <span className="text-red-600"> ⚠️ MISSING: Interpreter Email</span>
                )}
              </div>
              <div className="mb-2 text-sm leading-normal">
                <span className="text-gray-700 inline-block w-16 font-medium">Subject:</span>
                <span className="text-gray-700"> {emailContent?.subject || ''}</span>
              </div>
            </div>
            
            {/* Email Body */}
            <div className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-700 bg-white">
              {emailContent?.body || ''}
            </div>
            
            {/* Missing Data Warning */}
            {missingData.length > 0 && (
              <div className="m-4 mx-6 p-4 bg-yellow-100 border border-warning rounded-lg">
                <h4 className="heading-4 text-yellow-800 mb-2">⚠️ Missing Information:</h4>
                <ul className="m-0 pl-4 text-sm text-yellow-800">
                  {missingData.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
            <button 
              className={`button button-primary ${!emailContent ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    </div>
  );
};

export default EmailDraftInterface;
