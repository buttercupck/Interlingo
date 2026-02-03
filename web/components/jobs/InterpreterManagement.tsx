'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInterpreterMatches } from '@/lib/hooks/useInterpreterMatches';
import {
  useGroupedAttempts,
  useMarkContacted,
  useMarkDeclined,
  useMarkConfirmed,
} from '@/lib/hooks/useJobAssignmentTracker';
import {
  useAssignInterpreter,
  useUnassignInterpreter,
} from '@/lib/hooks/useJob';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JobWithDetails } from '@/types/database.types';

interface InterpreterManagementProps {
  job: JobWithDetails;
  className?: string;
}

export function InterpreterManagement({ job, className }: InterpreterManagementProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  // Hooks
  const { data: matchData } = useInterpreterMatches(job);
  const { grouped, attemptedInterpreterIds } = useGroupedAttempts(job.id);
  const markContacted = useMarkContacted();
  const markDeclined = useMarkDeclined();
  const markConfirmed = useMarkConfirmed();
  const assignInterpreter = useAssignInterpreter();
  const unassignInterpreter = useUnassignInterpreter();

  // Data
  const matches = matchData?.matches || [];
  const availableMatches = matches.filter((m) => !attemptedInterpreterIds.has(m.id));
  const visibleMatches = availableMatches.slice(0, visibleCount);
  const hasMore = visibleCount < availableMatches.length;
  const pendingAttempts = grouped.pending || [];

  // Handlers
  const handleRemoveAssignment = async () => {
    if (!confirm('Remove current interpreter assignment?')) return;
    await unassignInterpreter.mutateAsync(job.id);
  };

  const handleContact = async (interpreterId: string) => {
    await markContacted.mutateAsync({ jobId: job.id, interpreterId });
  };

  const handleUnavailable = async (interpreterId: string) => {
    await markDeclined.mutateAsync({ jobId: job.id, interpreterId });
  };

  const handleAccept = async (interpreterId: string) => {
    await markConfirmed.mutateAsync({ jobId: job.id, interpreterId });
    await assignInterpreter.mutateAsync({ jobId: job.id, interpreterId });
  };

  const handlePrevious = () => {
    setVisibleCount(Math.max(5, visibleCount - 2));
  };

  const handleNext = () => {
    setVisibleCount(Math.min(availableMatches.length, visibleCount + 2));
  };

  return (
    <div className={className}>
      {/* Section 1: Currently Assigned */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Currently Assigned</h3>
        </CardHeader>
        <CardContent>
          {job.interpreter ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {job.interpreter.first_name} {job.interpreter.last_name}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {job.interpreter.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {job.interpreter.phone}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAssignment}
                disabled={unassignInterpreter.isPending}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                {unassignInterpreter.isPending ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">No interpreter assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Pending Responses */}
      {pendingAttempts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Pending Responses</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {attempt.interpreter.first_name} {attempt.interpreter.last_name}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {attempt.interpreter.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {attempt.interpreter.phone}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Contacted: {new Date(attempt.contacted_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnavailable(attempt.interpreter_id)}
                      disabled={markDeclined.isPending}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Unavailable
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAccept(attempt.interpreter_id)}
                      disabled={markConfirmed.isPending || assignInterpreter.isPending}
                    >
                      Accepted
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section 3: Available to Contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available to Contact</h3>
            <div className="text-sm text-muted-foreground">
              Showing {visibleMatches.length} of {availableMatches.length}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {availableMatches.length === 0 ? (
            <div className="p-4 border rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">No interpreters available to contact</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {visibleMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <Badge variant="outline" className="h-6 px-2">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 space-y-1">
                          <div className="font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {match.first_name} {match.last_name}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {match.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {match.phone}
                            </span>
                          </div>
                          {match.city && match.state && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.city}, {match.state}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleContact(match.id)}
                        disabled={markContacted.isPending}
                      >
                        {markContacted.isPending ? 'Contacting...' : 'Contact'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {availableMatches.length > 5 && (
                <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={visibleCount <= 5}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={!hasMore}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
