'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJob } from '@/lib/hooks/useJob';
import { useInterpreterMatches } from '@/lib/hooks/useInterpreterMatches';
import { JobOverviewCard } from '@/components/jobs/JobOverviewCard';
import { OrganizationLocationCard } from '@/components/jobs/OrganizationLocationCard';
import { InterpreterManagement } from '@/components/jobs/InterpreterManagement';
import { JobNotesSection } from '@/components/jobs/JobNotesSection';
import { EmailComposer } from '@/components/jobs/EmailComposer';

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
          <p className="text-gray-500 mt-4">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'This job could not be loaded'}
          </p>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#1B365C] rounded-md hover:bg-[#2D4A6B] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ← Back to Jobs Board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/dashboard/jobs"
          className="text-secondary hover:text-[#0A5D61] text-sm inline-block font-medium transition-colors"
        >
          ← Back to Jobs Board
        </Link>

      {/* Job Title */}
      <h2 className="heading-2">
        {/* Multi-language format: Language1/Language2 or single language */}
        {job.client_requests && job.client_requests.length > 0
          ? job.client_requests.map((req: any, idx: any) => req.language?.name || 'Unknown').join('/')
          : 'Unknown Language'
        } — {job.interpreter ? `${job.interpreter.first_name} ${job.interpreter.last_name}` : 'Unassigned'} {job.modality || 'TBD'}
      </h2>

      {/* Two-Column Grid: Job Overview and Organization Cards */}
      <div className="grid grid-cols-2 gap-6">
        <JobOverviewCard job={job} />
        <OrganizationLocationCard job={job} />
      </div>

      {/* Interpreter Management (replaces QuickAssignTable) */}
      <InterpreterManagement job={job} />

      {/* Job Notes Section (full-width) */}
      <JobNotesSection jobId={job.id} />

      {/* Email Composer (collapsible - kept for now) */}
      <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          ✉️ Email Composer
        </summary>
        <div className="mt-4">
          <EmailComposer job={job} />
        </div>
      </details>

      {/* Unavailable Interpreters (collapsible) */}
      {matchData && matchData.unavailable.length > 0 && (
        <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            ⛔ Unavailable Interpreters ({matchData.unavailable.length})
          </summary>
          <div className="mt-4 space-y-2">
            {matchData.unavailable.map(({ interpreter, reason }) => (
              <div
                key={interpreter.id}
                className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0"
              >
                <span className="text-gray-700">
                  {interpreter.first_name} {interpreter.last_name}
                </span>
                <span className="text-gray-500 text-xs">{reason}</span>
              </div>
            ))}
          </div>
        </details>
      )}
      </div>
    </div>
  );
}
