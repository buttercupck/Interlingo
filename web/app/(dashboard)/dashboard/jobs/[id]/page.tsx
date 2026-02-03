'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Send, UserX, History } from 'lucide-react';
import { useJob } from '@/lib/hooks/useJob';
import { useInterpreterMatches } from '@/lib/hooks/useInterpreterMatches';
import { JobOverviewCard } from '@/components/jobs/JobOverviewCard';
import { OrganizationLocationCard } from '@/components/jobs/OrganizationLocationCard';
import { InterpreterManagement } from '@/components/jobs/InterpreterManagement';
import { JobNotesSection } from '@/components/jobs/JobNotesSection';
import { EmailComposer } from '@/components/jobs/EmailComposer';
import { AssignmentAttemptList } from '@/components/jobs/AssignmentAttemptList';
import { CommunicationHistory } from '@/components/jobs/CommunicationHistory';
import { StatusHistoryTimeline } from '@/components/jobs/StatusHistoryTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const { data: job, isLoading, error } = useJob(jobId);
  const { data: matchData } = useInterpreterMatches(job);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <UserX className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error instanceof Error ? error.message : 'This job could not be loaded'}
                </p>
              </div>
              <Link href="/dashboard/jobs">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs Board
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs Board
          </Button>
        </Link>

        {/* Job Title */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {job.client_requests && job.client_requests.length > 0
              ? job.client_requests.map((req: any) => req.language?.name || 'Unknown').join('/')
              : 'Unknown Language'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {job.interpreter ? `${job.interpreter.first_name} ${job.interpreter.last_name}` : 'Unassigned'} • {job.modality || 'TBD'}
          </p>
        </div>

        {/* Two-Column Grid: Job Overview and Organization Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JobOverviewCard job={job} />
          <OrganizationLocationCard job={job} />
        </div>

        {/* Interpreter Management */}
        <InterpreterManagement job={job} />

        {/* Job Notes Section */}
        <JobNotesSection jobId={job.id} />

        {/* Assignment Attempts Workflow */}
        <Card>
          <Collapsible>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assignment History
                  </h3>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <AssignmentAttemptList jobId={job.id} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Status History */}
        <Card>
          <Collapsible>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Status History
                  </h3>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <StatusHistoryTimeline jobId={job.id} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Communication History */}
        <Card>
          <Collapsible>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Communication History
                  </h3>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <CommunicationHistory jobId={job.id} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Email Composer */}
        <Card>
          <Collapsible>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Email Composer
                  </h3>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <EmailComposer job={job} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Unavailable Interpreters */}
        {matchData && matchData.unavailable.length > 0 && (
          <Card>
            <Collapsible>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserX className="h-5 w-5" />
                      Unavailable Interpreters ({matchData.unavailable.length})
                    </h3>
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-2">
                    {matchData.unavailable.map(({ interpreter, reason }) => (
                      <div
                        key={interpreter.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm font-medium">
                          {interpreter.first_name} {interpreter.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </div>
  );
}
