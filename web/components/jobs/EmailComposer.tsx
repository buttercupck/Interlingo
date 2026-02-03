'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
    <div className={cn('card', 'p-0', className)}>
      {/* Email Type Selector */}
      <div className="border-b border-gray-200 px-5 py-5">
        <div className="flex gap-3">
          {(['REQ', 'CONF', 'REM'] as EmailType[]).map((type) => {
            const labelMap = {
              REQ: 'Request',
              CONF: 'Confirmation',
              REM: 'Reminder'
            };
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'button',
                  selectedType === type
                    ? typeColors[type]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {labelMap[type]}
              </button>
            );
          })}
        </div>
        <p className="caption mt-2" style={{ textTransform: 'none' }}>
          {selectedType === 'REQ' && 'Request availability from interpreter'}
          {selectedType === 'CONF' && 'Confirm assignment with interpreter'}
          {selectedType === 'REM' && 'Send reminder before the job'}
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="alert-warning border-b border-yellow-100 px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Missing Information:
              </p>
              <ul className="text-sm text-yellow-700 ml-5 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview */}
      <div className="px-6 py-6 space-y-5">
        <div>
          <label className="caption block mb-2">
            Subject:
          </label>
          <div className="text-base font-semibold text-gray-900">{subject}</div>
        </div>

        <div>
          <label className="caption block mb-2">
            Body:
          </label>
          <div className="bg-gray-50 rounded-lg p-5 text-sm text-gray-800 whitespace-pre-wrap font-mono border border-gray-200 max-h-96 overflow-y-auto">
            {body}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
        <button
          onClick={handleCopy}
          className={cn(
            'button w-full justify-center gap-2 py-3.5 text-[15px] font-semibold transition-all duration-200',
            copiedRecently
              ? 'bg-[#10B981] text-white'
              : 'button-primary hover:-translate-y-0.5 hover:shadow-md'
          )}
        >
          {copiedRecently ? '✓ Copied to Clipboard!' : '📋 Copy Email to Clipboard'}
        </button>
        <p className="caption text-center mt-2.5" style={{ textTransform: 'none' }}>
          Paste into your email client to send
        </p>
      </div>
    </div>
  );
}
