'use client';

import { GitBranch, Calendar, User as UserIcon, Code } from 'lucide-react';
import { useJobVersionHistory } from '@/lib/hooks/useJobVersionHistory';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VersionHistoryTimelineProps {
  jobId: string;
}

export function VersionHistoryTimeline({ jobId }: VersionHistoryTimelineProps) {
  const { data: history, isLoading } = useJobVersionHistory(jobId);

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Loading version history...
        </p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <GitBranch className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          No version history recorded yet.
        </p>
      </div>
    );
  }

  const getSourceBadge = (source: string) => {
    const sources = {
      gcal_sync: { variant: 'default' as const, label: 'GCal Sync', icon: Calendar },
      manual_edit: { variant: 'secondary' as const, label: 'Manual Edit', icon: UserIcon },
      api: { variant: 'outline' as const, label: 'API', icon: Code },
    };
    const config = sources[source as keyof typeof sources] || sources.manual_edit;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatFieldName = (field: string): string => {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(empty)';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (value instanceof Date) return value.toLocaleString();
    return String(value);
  };

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1;
        const isFirst = index === 0;
        const changedFieldsArray = Object.entries(entry.changed_fields || {});

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
                <GitBranch className={cn(
                  "h-6 w-6",
                  isFirst ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>

              {/* Content Card */}
              <div className={cn("flex-1 border rounded-lg p-4", !isLast && "mb-4")}>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">v{entry.version_number}</Badge>
                      {getSourceBadge(entry.change_source)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.changed_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Changed by */}
                  {entry.changed_by && (
                    <p className="text-sm">
                      Changed by: <span className="font-medium">{entry.changed_by}</span>
                    </p>
                  )}

                  {/* Changed fields */}
                  {changedFieldsArray.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Changed Fields:</p>
                      <div className="space-y-3 pl-4 border-l-2 border-border">
                        {changedFieldsArray.map(([field, values]) => (
                          <div key={field} className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              {formatFieldName(field)}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded bg-red-50 border border-red-200">
                                <span className="font-medium text-red-700">Before:</span>
                                <pre className="mt-1 text-red-900 whitespace-pre-wrap break-all">
                                  {formatValue(values.old)}
                                </pre>
                              </div>
                              <div className="p-2 rounded bg-green-50 border border-green-200">
                                <span className="font-medium text-green-700">After:</span>
                                <pre className="mt-1 text-green-900 whitespace-pre-wrap break-all">
                                  {formatValue(values.new)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
