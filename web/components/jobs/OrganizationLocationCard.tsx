'use client';

import { cn } from '@/lib/utils';
import type { JobWithDetails } from '@/types/database.types';

interface OrganizationLocationCardProps {
  job: JobWithDetails;
  className?: string;
}

export function OrganizationLocationCard({ job, className }: OrganizationLocationCardProps) {
  const orgName = job.location?.organization?.name || 'Unknown Organization';
  const courtroom = job.location?.name; // Courtroom is location.name
  const programName = job.client_requests?.[0]?.program?.name;
  const zoomLogin = job.location?.zoom_login;

  // Parse zoom login credentials if available
  const parsedZoomCreds = zoomLogin ? parseZoomLogin(zoomLogin) : null;

  return (
    <div className={cn('card', className)}>
      <h3 className="heading-3 mb-6">
        Organization & Location
      </h3>

      <div className="flex flex-col gap-6">
        {/* 1. Organization */}
        <div className="info-field">
          <div className="caption">Organization</div>
          <div className="info-field-value">{orgName}</div>
        </div>

        {/* 2. Program */}
        <div className="info-field">
          <div className="caption">Program</div>
          <div className="info-field-value">{programName || '—'}</div>
        </div>

        {/* 3. Courtroom/Location Section */}
        {(courtroom || parsedZoomCreds || job.location?.zoom_link || job.location?.address) && (
          <div className="info-field">
            <div className="caption">Courtroom/Location</div>
            <div className="flex flex-col gap-2">
              {/* Courtroom name */}
              {courtroom && (
                <div className="info-field-value mb-1">{courtroom}</div>
              )}

              {/* Zoom credentials */}
              {job.modality === 'Zoom' && parsedZoomCreds && (
                <>
                  {parsedZoomCreds.meetingId && (
                    <div className="body-small">Meeting ID: {parsedZoomCreds.meetingId}</div>
                  )}
                  {parsedZoomCreds.password && (
                    <div className="body-small">Password: {parsedZoomCreds.password}</div>
                  )}
                </>
              )}

              {/* Zoom link */}
              {job.modality === 'Zoom' && job.location?.zoom_link && (
                <>
                  <div className="font-bold text-gray-900 text-sm mt-2">Zoom Link</div>
                  <a
                    href={job.location.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-[#0A5D61] transition-colors break-all block text-sm"
                  >
                    {job.location.zoom_link}
                  </a>
                </>
              )}

              {/* In-person address */}
              {job.modality === 'In-Person' && job.location?.address && (
                <div className="text-gray-900 text-sm">{job.location.address}</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper function to parse zoom login credentials
function parseZoomLogin(zoomLogin: string): { meetingId?: string; password?: string } | null {
  try {
    const result: { meetingId?: string; password?: string } = {};

    // Try to extract Meeting ID
    const meetingIdMatch = zoomLogin.match(/Meeting ID[:\s]+([0-9\s]+)/i);
    if (meetingIdMatch) {
      result.meetingId = meetingIdMatch[1].trim();
    }

    // Try to extract Password
    const passwordMatch = zoomLogin.match(/Password[:\s]+([^\n\r]+)/i);
    if (passwordMatch) {
      result.password = passwordMatch[1].trim();
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}
