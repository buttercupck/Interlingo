'use client';

import { Building2, MapPin, Video, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">Organization & Location</h3>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Organization */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Organization</span>
          </div>
          <div className="text-sm font-medium">{orgName}</div>
        </div>

        {/* Program */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Program</div>
          <div className="text-sm">{programName || '—'}</div>
        </div>

        {/* Courtroom/Location Section */}
        {(courtroom || parsedZoomCreds || job.location?.zoom_link || job.location?.address) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Courtroom/Location</span>
            </div>
            <div className="space-y-2">
              {/* Courtroom name */}
              {courtroom && (
                <div className="text-sm font-medium">{courtroom}</div>
              )}

              {/* Zoom credentials */}
              {job.modality === 'Zoom' && parsedZoomCreds && (
                <div className="space-y-1">
                  {parsedZoomCreds.meetingId && (
                    <div className="text-sm text-muted-foreground">Meeting ID: {parsedZoomCreds.meetingId}</div>
                  )}
                  {parsedZoomCreds.password && (
                    <div className="text-sm text-muted-foreground">Password: {parsedZoomCreds.password}</div>
                  )}
                </div>
              )}

              {/* Zoom link */}
              {job.modality === 'Zoom' && job.location?.zoom_link && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Video className="h-4 w-4" />
                    <span>Zoom Link</span>
                  </div>
                  <a
                    href={job.location.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                  >
                    {job.location.zoom_link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* In-person address */}
              {job.modality === 'In-Person' && job.location?.address && (
                <div className="text-sm">{job.location.address}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
