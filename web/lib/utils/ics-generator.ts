import type { JobWithDetails } from '@/types/database.types';

/**
 * Generates an iCalendar (.ics) file content from a job
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */
export function generateICS(job: JobWithDetails): string {
  // Format: YYYYMMDDTHHMMSSZ (UTC)
  const formatICSDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = new Date();
  const timestamp = formatICSDate(now.toISOString());

  // Extract job details
  const startTime = job.start_time ? formatICSDate(job.start_time) : '';
  const endTime = job.end_time ? formatICSDate(job.end_time) : '';

  // Build title: "Language - Client Name (Modality)"
  const languages = job.client_requests?.map(req => req.language?.name || 'Unknown').join('/') || 'Unknown';
  const clientName = job.client_requests?.[0]?.client_name || 'Unknown Client';
  const modality = job.modality || 'TBD';
  const title = `${languages} - ${clientName} (${modality})`;

  // Build description with all relevant details
  const descriptionLines: string[] = [];

  // Organization and location
  const orgName = job.location?.organization?.name || 'Unknown Organization';
  const locName = job.location?.name || 'Unknown Location';
  descriptionLines.push(`Organization: ${orgName}`);
  descriptionLines.push(`Location: ${locName}`);

  // Case numbers
  if (job.client_requests && job.client_requests.length > 0) {
    job.client_requests.forEach(req => {
      if (req.case_number) {
        descriptionLines.push(`Case Number: ${req.case_number}`);
      }
      if (req.meeting_type) {
        descriptionLines.push(`Meeting Type: ${req.meeting_type}`);
      }
    });
  }

  // Interpreter if assigned
  if (job.interpreter) {
    descriptionLines.push(`Interpreter: ${job.interpreter.first_name} ${job.interpreter.last_name}`);
  }

  // Zoom link if virtual
  if (job.location?.zoom_link) {
    descriptionLines.push(`Zoom Link: ${job.location.zoom_link}`);
  }

  // Address if in-person
  if (job.location?.address) {
    descriptionLines.push(`Address: ${job.location.address}`);
  }

  const description = descriptionLines.join('\\n');

  // Location field (for map integration)
  const location = job.location?.zoom_link
    ? job.location.zoom_link
    : job.location?.address || orgName;

  // Build ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Interlingo//Job Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${job.id}@interlingo.app`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${startTime}`,
    `DTEND:${endTime}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

/**
 * Downloads an .ics file to the user's device
 */
export function downloadICS(job: JobWithDetails, filename?: string): void {
  const icsContent = generateICS(job);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `job-${job.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Saves .ics content to a file (Node.js/Bun environment)
 */
export async function saveICSToFile(job: JobWithDetails, filepath: string): Promise<void> {
  const icsContent = generateICS(job);
  await Bun.write(filepath, icsContent);
}
