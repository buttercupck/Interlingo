'use client';

import { ArrowRight, History } from 'lucide-react';
import { useJobStatusHistory } from '@/lib/hooks/useJobStatusHistory';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusHistoryTimelineProps {
  jobId: string;
}

export function StatusHistoryTimeline({ jobId }: StatusHistoryTimelineProps) {
  const { data: history, isLoading } = useJobStatusHistory(jobId);

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Loading status history...
        </p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          No status changes recorded yet.
        </p>
      </div>
    );
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Initial: 'secondary',
      Pending: 'outline',
      Confirmed: 'default',
      Completed: 'secondary',
      Cancelled: 'destructive',
      'Needs Info': 'outline',
    };
    return statusMap[status] || 'secondary';
  };

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1;
        const isFirst = index === 0;

        return (
          <div
            key={entry.id}
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
                  isFirst ? "bg-primary" : "bg-muted"
                )}
              >
                <History className={cn(
                  "h-6 w-6",
                  isFirst ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>

              {/* Content Card */}
              <div className={cn("flex-1 border rounded-lg p-4", !isLast && "mb-4")}>
                <div className="space-y-3">
                  {/* Status transition */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.old_status && (
                      <>
                        <Badge variant={getStatusVariant(entry.old_status)}>
                          {entry.old_status}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                    <Badge variant={getStatusVariant(entry.new_status)}>
                      {entry.new_status}
                    </Badge>
                    {!entry.old_status && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Initial status)
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.changed_at).toLocaleString()}
                  </p>

                  {/* Changed by */}
                  {entry.changed_by && (
                    <p className="text-sm">
                      Changed by: <span className="font-medium">{entry.changed_by}</span>
                    </p>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mt-2 p-3 rounded-lg bg-muted">
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
