'use client';

import { useState } from 'react';
import { User, Mail, Phone, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useJobAssignmentAttempts, useUpdateAssignmentAttemptStatus } from '@/lib/hooks/useJobAssignmentAttempts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AssignmentAttemptListProps {
  jobId: string;
}

export function AssignmentAttemptList({ jobId }: AssignmentAttemptListProps) {
  const { data: attempts, isLoading } = useJobAssignmentAttempts(jobId);
  const updateStatus = useUpdateAssignmentAttemptStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Loading assignment history...
        </p>
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          No interpreters have been contacted for this job yet.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      contacted: { variant: 'secondary' as const, label: 'Contacted' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      declined: { variant: 'destructive' as const, label: 'Declined' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
    };

    const badge = badges[status as keyof typeof badges] || badges.contacted;
    return (
      <Badge variant={badge.variant}>
        {badge.label}
      </Badge>
    );
  };

  const handleStatusUpdate = async (
    attemptId: string,
    newStatus: 'contacted' | 'pending' | 'declined' | 'confirmed'
  ) => {
    try {
      await updateStatus.mutateAsync({
        attemptId,
        jobId,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {attempts.map((attempt, index) => {
        const isExpanded = expandedId === attempt.id;
        const interpreter = attempt.interpreter;
        const isLast = index === attempts.length - 1;
        const getStatusColor = () => {
          if (attempt.status === 'confirmed') return 'bg-green-100';
          if (attempt.status === 'declined') return 'bg-red-100';
          return 'bg-blue-100';
        };

        return (
          <div
            key={attempt.id}
            className="relative"
          >
            {/* Timeline connector line */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
            )}

            <div className="flex gap-4">
              {/* Timeline dot */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold z-10",
                  getStatusColor()
                )}
              >
                <span className="text-sm">
                  {interpreter?.first_name?.[0]}{interpreter?.last_name?.[0]}
                </span>
              </div>

              {/* Content Card */}
              <div className={cn("flex-1 border rounded-lg p-4", !isLast && "mb-4")}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {interpreter?.first_name} {interpreter?.last_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Contacted {new Date(attempt.contacted_at).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(attempt.status)}
                </div>

                {/* Contact info */}
                {interpreter && (
                  <div className="space-y-1 mb-3">
                    {interpreter.email && (
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {interpreter.email}
                      </p>
                    )}
                    {interpreter.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {interpreter.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Response time */}
                {attempt.responded_at && (
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Responded {new Date(attempt.responded_at).toLocaleString()}
                  </p>
                )}

                {/* Notes */}
                {attempt.notes && (
                  <div className="mb-3 p-3 rounded-lg bg-muted">
                    <p className="text-sm">{attempt.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {attempt.status === 'contacted' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusUpdate(attempt.id, 'pending')}
                      disabled={updateStatus.isPending}
                      className="flex-1"
                    >
                      Mark Pending
                    </Button>
                  </div>
                )}

                {attempt.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusUpdate(attempt.id, 'confirmed')}
                      disabled={updateStatus.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(attempt.id, 'declined')}
                      disabled={updateStatus.isPending}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Declined
                    </Button>
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
