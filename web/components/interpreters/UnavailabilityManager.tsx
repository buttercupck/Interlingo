'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import {
  useInterpreterUnavailability,
  useAddUnavailability,
  useUpdateUnavailability,
  useDeleteUnavailability,
  filterUnavailabilityBlocks,
  type UnavailabilityBlock
} from '@/lib/hooks/useInterpreterUnavailability';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UnavailabilityManagerProps {
  interpreterId: string;
}

export function UnavailabilityManager({ interpreterId }: UnavailabilityManagerProps) {
  const { data: blocks, isLoading } = useInterpreterUnavailability(interpreterId);
  const addUnavailability = useAddUnavailability();
  const updateUnavailability = useUpdateUnavailability();
  const deleteUnavailability = useDeleteUnavailability();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showPast, setShowPast] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading unavailability blocks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { future, past } = filterUnavailabilityBlocks(blocks || []);
  const displayBlocks = showPast ? past : future;

  const handleDelete = async (blockId: string) => {
    if (!confirm('Delete this unavailability block?')) return;

    try {
      await deleteUnavailability.mutateAsync({ id: blockId, interpreterId });
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete block');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Unavailability Blocks
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPast(!showPast)}
            >
              {showPast ? 'Show Future' : 'Show Past'}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Block
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {displayBlocks.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No {showPast ? 'past' : 'upcoming'} unavailability blocks.
            </p>
            {!showPast && (
              <Button size="sm" variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Add Unavailability Block
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayBlocks.map((block) => {
              const startDate = new Date(block.start_time);
              const endDate = new Date(block.end_time);
              const isPast = endDate < new Date();

              return (
                <div
                  key={block.id}
                  className={cn(
                    "border rounded-lg p-4 transition-colors",
                    isPast ? "bg-muted/50" : "hover:border-primary"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Time range */}
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(startDate, 'MMM d, yyyy h:mm a')} - {format(endDate, 'h:mm a')}
                        </span>
                        {isPast && <Badge variant="secondary">Past</Badge>}
                      </div>

                      {/* Reason */}
                      {block.reason && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{block.reason}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {block.notes && (
                        <div className="pl-6 text-sm text-muted-foreground">
                          {block.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {!isPast && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(block.id)}
                          disabled={deleteUnavailability.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {blocks && blocks.length > 0 && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            {future.length} upcoming, {past.length} past
          </div>
        )}
      </CardContent>
    </Card>
  );
}
