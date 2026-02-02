'use client';

import { useJobs } from '@/lib/hooks/useJobs';
import { format } from 'date-fns';
import Link from 'next/link';

export default function JobsBoardPage() {
  const { data: jobs, isLoading, error } = useJobs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2 mb-0 text-primary">Jobs Board</h1>
        </div>
        <div className="card p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="body-base text-center mt-4">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2 mb-0 text-primary">Jobs Board</h1>
        </div>
        <div className="card p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="heading-3 mb-2">
              Error Loading Jobs
            </h2>
            <p className="body-base mb-4">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-1 mb-0">Jobs Board</h1>
          <p className="body-small mt-2">
            {jobs?.length || 0} total jobs
          </p>
        </div>
        <button className="button bg-secondary-teal text-white hover:bg-[#0A5D61] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md">
          + New Job
        </button>
      </div>

      {/* Jobs Table */}
      <div className="card overflow-hidden">
        {!jobs || jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="heading-3 mb-2">
              No Jobs Yet
            </h3>
            <p className="body-base mb-6">
              Get started by creating your first interpreter assignment.
            </p>
            <button className="button bg-secondary-teal text-white hover:bg-[#0A5D61] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md px-6 py-3">
              Create First Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Date/Time
                  </th>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Language
                  </th>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Interpreter
                  </th>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Modality
                  </th>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left caption uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => {
                  const startTime = job.start_time
                    ? new Date(job.start_time)
                    : null;

                  // Get first client request (most jobs have one request)
                  const clientRequest = job.client_requests?.[0];
                  const language = clientRequest?.language?.name || 'N/A';
                  const organization = job.location?.organization?.name || 'Unknown Organization';

                  const interpreterName = job.interpreter
                    ? `${job.interpreter.first_name} ${job.interpreter.last_name}`
                    : 'Unassigned';
                  const status = job.status || 'Initial';

                  // Calculate if job is upcoming (within 48 hours)
                  const isUpcoming = startTime ?
                    (startTime.getTime() - Date.now()) < (48 * 60 * 60 * 1000) &&
                    startTime.getTime() > Date.now()
                    : false;

                  // Duration display: only if > 2 hours, show in hours
                  const durationDisplay = job.duration && job.duration > 120
                    ? `${(job.duration / 60).toFixed(1)}h duration`
                    : '';

                  // Design system badge classes
                  const statusBadges: Record<string, string> = {
                    Initial: 'badge-info',
                    Pending: 'badge-warning',
                    Confirmed: 'badge-success',
                    Completed: 'badge-info',
                    Cancelled: 'badge-danger',
                  };

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Date/Time Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {startTime ? (
                          <div>
                            <div className={`body-small font-semibold ${isUpcoming ? 'text-secondary-teal' : 'text-gray-900'}`}>
                              {format(startTime, 'MMM d, yyyy')}
                            </div>
                            <div className="body-small">
                              {format(startTime, 'h:mm a')}
                            </div>
                            {durationDisplay && (
                              <div className="caption mt-1">
                                {durationDisplay}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="body-small">TBD</span>
                        )}
                      </td>

                      {/* Language Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-small font-medium text-gray-900">{language}</div>
                      </td>

                      {/* Organization Column */}
                      <td className="px-6 py-4">
                        <div className="body-small text-gray-900">{organization}</div>
                      </td>

                      {/* Interpreter Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`body-small ${interpreterName === 'Unassigned' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                          {interpreterName}
                        </div>
                      </td>

                      {/* Modality Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-small text-gray-900">
                          {job.modality || 'N/A'}
                        </div>
                      </td>

                      {/* Status Column - Design System Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${statusBadges[status] || statusBadges.Initial}`}>
                          {status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 whitespace-nowrap body-small font-medium">
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="text-secondary-teal hover:text-[#0A5D61] font-medium transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
