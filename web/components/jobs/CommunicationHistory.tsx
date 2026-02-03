'use client';

import { useState } from 'react';
import { Mail, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useJobCommunications } from '@/lib/hooks/useJobCommunications';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CommunicationHistoryProps {
  jobId: string;
}

export function CommunicationHistory({ jobId }: CommunicationHistoryProps) {
  const { data: communications, isLoading } = useJobCommunications(jobId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Loading communication history...
        </p>
      </div>
    );
  }

  if (!communications || communications.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          No emails have been sent for this job yet.
        </p>
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      REQ: { variant: 'secondary' as const, label: 'Request', icon: Mail },
      CONF: { variant: 'default' as const, label: 'Confirmation', icon: CheckCircle2 },
      REM: { variant: 'outline' as const, label: 'Reminder', icon: Clock },
    };

    const badge = badges[type as keyof typeof badges] || badges.REQ;
    const Icon = badge.icon;
    return (
      <Badge variant={badge.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {communications.map((comm, index) => {
        const isExpanded = expandedId === comm.id;
        const isLast = index === communications.length - 1;
        const getIcon = () => {
          if (comm.communication_type === 'REQ') return Mail;
          if (comm.communication_type === 'CONF') return CheckCircle2;
          return Clock;
        };
        const Icon = getIcon();

        return (
          <div
            key={comm.id}
            className="relative"
          >
            {/* Timeline connector line */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
            )}

            <div className="flex gap-4">
              {/* Timeline icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10",
                  comm.marked_sent ? "bg-green-100" : "bg-muted"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6",
                  comm.marked_sent ? "text-green-600" : "text-muted-foreground"
                )} />
              </div>

              {/* Content Card */}
              <div className={cn("flex-1 border rounded-lg p-4", !isLast && "mb-4")}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(comm.communication_type)}
                      {!comm.marked_sent && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold">{comm.subject || 'No subject'}</h4>
                    <p className="text-xs text-muted-foreground">
                      {comm.marked_sent ? 'Sent' : 'Created'} {new Date(comm.sent_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Recipient */}
                {comm.recipient_email && (
                  <p className="text-sm mb-2">
                    To: {comm.recipient_email}
                  </p>
                )}

                {/* Sent by */}
                {comm.sent_by && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Sent by: {comm.sent_by}
                  </p>
                )}

                {/* Expandable body */}
                {comm.body && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : comm.id)}
                      className="w-full justify-between"
                    >
                      <span className="text-sm font-medium">
                        {isExpanded ? 'Hide' : 'Show'} email content
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {comm.body}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
