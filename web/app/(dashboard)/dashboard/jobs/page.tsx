'use client';

import { useState, useMemo } from 'react';
import { useJobs } from '@/lib/hooks/useJobs';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar, User, Building2, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function JobsBoardPage() {
  const { data: jobs, isLoading, error } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModality, setFilterModality] = useState<string>('all');

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    let filtered = jobs;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((job) => job.status === filterStatus);
    }

    // Filter by modality
    if (filterModality !== 'all') {
      filtered = filtered.filter((job) => job.modality === filterModality);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((job) => {
        const interpreterName = job.interpreter
          ? `${job.interpreter.first_name} ${job.interpreter.last_name}`.toLowerCase()
          : '';
        const language = job.client_requests?.[0]?.language?.name?.toLowerCase() || '';
        const organization = job.location?.organization?.name?.toLowerCase() || '';

        return (
          interpreterName.includes(query) ||
          language.includes(query) ||
          organization.includes(query)
        );
      });
    }

    return filtered;
  }, [jobs, filterStatus, filterModality, searchQuery]);

  // Get unique statuses and modalities
  const statuses = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((j) => j.status).filter(Boolean)));
  }, [jobs]);

  const modalities = useMemo(() => {
    if (!jobs) return [];
    return Array.from(new Set(jobs.map((j) => j.modality).filter((m): m is string => Boolean(m))));
  }, [jobs]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Jobs</h3>
                <p className="text-sm text-red-700 mt-1">
                  {error instanceof Error ? error.message : 'An error occurred'}
                </p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Board</h1>
          <p className="text-muted-foreground mt-1">
            Manage interpretation job assignments and scheduling
          </p>
        </div>
        <Button>+ New Job</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by language, organization, or interpreter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterModality} onValueChange={setFilterModality}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Modality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modalities</SelectItem>
            {modalities.map((modality) => (
              <SelectItem key={modality} value={modality}>
                {modality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || filterStatus !== 'all' || filterModality !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterModality('all');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {jobs?.length || 0} jobs
        </p>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No Jobs Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || filterStatus !== 'all' || filterModality !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first job'}
                </p>
              </div>
              {!searchQuery && filterStatus === 'all' && filterModality === 'all' && (
                <Button>+ New Job</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const startTime = job.start_time ? new Date(job.start_time) : null;
            const clientRequest = job.client_requests?.[0];
            const language = clientRequest?.language?.name || 'Unknown';
            const organization = job.location?.organization?.name || 'Unknown Organization';
            const interpreterName = job.interpreter
              ? `${job.interpreter.first_name} ${job.interpreter.last_name}`
              : 'Unassigned';
            const status = job.status || 'Initial';

            const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
              Initial: 'secondary',
              Pending: 'outline',
              Confirmed: 'default',
              Completed: 'secondary',
              Cancelled: 'destructive',
            };

            return (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={statusVariants[status] || 'secondary'}>
                      {status}
                    </Badge>
                    {job.modality && (
                      <Badge variant="outline" className="text-xs">
                        {job.modality}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mt-2">{language}</h3>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm">
                  {startTime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(startTime, 'MMM d, yyyy')} at {format(startTime, 'h:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{organization}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className={interpreterName === 'Unassigned' ? 'italic' : ''}>
                      {interpreterName}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/dashboard/jobs/${job.id}`} className="w-full">
                    <Button variant="default" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
