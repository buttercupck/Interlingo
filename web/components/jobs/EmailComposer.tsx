'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Mail, Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JobWithDetails } from '@/types/database.types';
import { getOrgInstructions, getInstructionsWithFallback } from '@/lib/services/organizationInstructions';
import { formatInstructionsGradeA } from '@/lib/utils/instructionFormatter';

type EmailType = 'REQ' | 'CONF' | 'REM';

interface EmailComposerProps {
  job: JobWithDetails;
  className?: string;
}

export function EmailComposer({ job, className }: EmailComposerProps) {
  const [selectedType, setSelectedType] = useState<EmailType>('CONF');
  const [copiedRecently, setCopiedRecently] = useState(false);

  // Fetch organization instructions dynamically from database
  const orgId = job.location?.organization?.id;
  const { data: orgConfig } = useQuery({
    queryKey: ['orgInstructions', orgId],
    queryFn: () => getOrgInstructions(orgId!),
    enabled: !!orgId,
  });

  // Generate email content based on type and job data
  const generateEmailContent = (): { subject: string; body: string; warnings: string[] } => {
    const warnings: string[] = [];
    const startTime = job.start_time ? new Date(job.start_time) : null;
    const orgName = job.location?.organization?.name || 'Unknown Organization';
    const clientRequests = job.client_requests || [];

    // Get first client request for language info
    const firstRequest = clientRequests.length > 0 ? clientRequests[0] : null;
    const language = firstRequest && 'language' in firstRequest && firstRequest.language
      ? firstRequest.language.name
      : 'Unknown Language';
    const interpreterName = job.interpreter
      ? `${job.interpreter.first_name} ${job.interpreter.last_name}`
      : null;

    if (!interpreterName && selectedType !== 'REQ') {
      warnings.push('No interpreter assigned');
    }

    if (!startTime) {
      warnings.push('Missing job date/time');
    }

    if (!job.location?.zoom_link && job.modality === 'Zoom') {
      warnings.push('Missing Zoom link');
    }

    let subject = '';
    let body = '';

    if (selectedType === 'CONF') {
      subject = `CONFIRMATION: ${startTime ? format(startTime, 'M/d/yyyy h:mm a') : '[DATE]'} ${job.modality || 'TBD'}`;

      body = `${startTime ? format(startTime, 'EEEE, MMMM d, yyyy') : '[DATE]'}
${startTime ? format(startTime, 'h:mm a') : '[TIME]'} ${job.modality || '[MODALITY]'}

${orgName}

`;

      // Add instructions using three-layer template resolution with Grade A formatting
      // Layer 3 (org-specific) overrides Layer 2 (standard modality) if exists
      console.log('🔍 Email Composer Debug:', {
        orgConfig,
        modality: job.modality,
        language,
        interpreterName,
        orgName
      });
      const instructions = getInstructionsWithFallback(
        orgConfig,
        job.modality || 'TBD',
        language,
        interpreterName || undefined
      );
      console.log('📧 Grade A Instructions returned:', instructions);
      if (instructions) {
        body += instructions + '\n\n';
      }

      // Add Zoom information if available
      if (job.location?.zoom_link) {
        body += `${job.location.zoom_link}
`;
        if (job.location.zoom_login) {
          body += `${job.location.zoom_login}
`;
        }
        body += '\n';
      }

      // Add client request details - loop through all requests
      clientRequests.forEach((request) => {
        if (request.client_name) {
          body += `\t${request.client_name}
`;
        }
        if (request.case_number && request.meeting_type) {
          body += `\t${request.case_number} - ${request.meeting_type}
`;
        }
        if (request.charges) {
          body += `\t${request.charges}
`;
        }
      });
    } else if (selectedType === 'REQ') {
      subject = `REQUEST: ${language} - ${startTime ? format(startTime, 'M/d/yyyy') : '[DATE]'}`;

      body = `${startTime ? format(startTime, 'EEEE, MMMM d, yyyy') : '[DATE]'}
${startTime ? format(startTime, 'h:mm a') : '[TIME]'} ${job.modality || '[MODALITY]'}

${orgName}

`;

      // Add client request details - loop through all requests
      clientRequests.forEach((request) => {
        if (request.client_name) {
          body += `${request.client_name}
`;
        }
        if (request.case_number && request.meeting_type) {
          body += `${request.case_number} - ${request.meeting_type}
`;
        }
        if (request.charges) {
          body += `1\t${request.charges}
`;
        }
      });
    } else if (selectedType === 'REM') {
      // REMINDER email - Grade A quality with database-based rendering
      // Uses the same three-layer template resolution as CONF
      // Applies Grade A formatting: placeholder substitution + markdown cleaning
      subject = `Reminder: ${startTime ? format(startTime, 'h:mm a') : '[TIME]'} ${job.modality || 'TBD'} Assignment Tomorrow`;

      body = `You are scheduled for ${orgName} tomorrow, ${startTime ? format(startTime, 'EEEE, MMMM d, yyyy') : '[DATE]'} at ${startTime ? format(startTime, 'h:mm a') : '[TIME]'}.\n\n`;

      // Get Grade A formatted instructions from database (same as CONF email)
      const instructions = getInstructionsWithFallback(
        orgConfig,
        job.modality || 'TBD',
        language,
        interpreterName || undefined
      );

      if (instructions) {
        body += instructions + '\n\n';
      }

      // Add Zoom link if available
      if (job.location?.zoom_link) {
        body += `${job.location.zoom_link}\n`;
        if (job.location.zoom_login) {
          body += `${job.location.zoom_login}\n`;
        }
        body += '\n';
      }

      // Add client details
      clientRequests.forEach((request) => {
        if (request.client_name) {
          body += `\t${request.client_name}\n`;
        }
        if (request.case_number && request.meeting_type) {
          body += `\t${request.case_number} - ${request.meeting_type}\n`;
        }
        if (request.charges) {
          body += `\t${request.charges}\n`;
        }
      });
    }

    return { subject, body, warnings };
  };

  const { subject, body, warnings } = generateEmailContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedRecently(true);
      setTimeout(() => setCopiedRecently(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const typeColors: Record<EmailType, string> = {
    REQ: 'bg-secondary-purple text-white',
    CONF: 'bg-system-success text-white',
    REM: 'bg-secondary-teal text-white',
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Composer
        </h3>
        <div className="flex gap-2 mt-4">
          {(['REQ', 'CONF', 'REM'] as EmailType[]).map((type) => {
            const labelMap = {
              REQ: 'Request',
              CONF: 'Confirmation',
              REM: 'Reminder'
            };
            const isSelected = selectedType === type;
            return (
              <Button
                key={type}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={cn(
                  isSelected && type === 'REQ' && 'bg-purple-600 hover:bg-purple-700',
                  isSelected && type === 'CONF' && 'bg-green-600 hover:bg-green-700',
                  isSelected && type === 'REM' && 'bg-teal-600 hover:bg-teal-700'
                )}
              >
                {labelMap[type]}
              </Button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedType === 'REQ' && 'Request availability from interpreter'}
          {selectedType === 'CONF' && 'Confirm assignment with interpreter'}
          {selectedType === 'REM' && 'Send reminder before the job'}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  Missing Information:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Email Preview */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Subject:
            </label>
            <div className="text-sm font-semibold">{subject}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Body:
            </label>
            <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap font-mono border max-h-96 overflow-y-auto">
              {body}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleCopy}
            className={cn(
              'w-full gap-2',
              copiedRecently && 'bg-green-600 hover:bg-green-700'
            )}
          >
            {copiedRecently ? (
              <>
                <Check className="h-4 w-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Email to Clipboard
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Paste into your email client to send
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
