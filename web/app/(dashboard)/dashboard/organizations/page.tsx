'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, MapPin, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

// Type definitions
type Organization = {
  id: string;
  name: string;
  abbreviation: string;
  address?: string;
  type?: string;
};

type FilterType = 'all' | string;

// Main component
export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Fetch organizations from Supabase
  const fetchOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setOrganizations(data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Navigate to add new organization page
  const handleAddNew = () => {
    router.push('/dashboard/organizations/new');
  };

  // Filtered and searched organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((org) => org.type === filterType);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.abbreviation.toLowerCase().includes(query) ||
          org.address?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [organizations, filterType, searchQuery]);

  // Get unique organization types
  const organizationTypes = useMemo(() => {
    const types = new Set(organizations.map((org) => org.type).filter(Boolean));
    return Array.from(types) as string[];
  }, [organizations]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Organizations</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <Button onClick={fetchOrganizations} variant="outline" size="sm">
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
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your network of courts, law offices, and service locations
          </p>
        </div>
        <Button onClick={handleAddNew}>Add Organization</Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {organizationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || filterType !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredOrganizations.length} of {organizations.length} organizations
          {/* TODO: Implement pagination when dataset grows beyond 50-100 items.
              Consider using shadcn/ui's Pagination component with configurable page size (10, 25, 50).
              Store current page and page size in state, and slice filteredOrganizations accordingly.
              Example: filteredOrganizations.slice((page - 1) * pageSize, page * pageSize) */}
        </p>
      )}

      {/* Organizations Grid */}
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
      ) : filteredOrganizations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No Organizations Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'Get started by adding your first organization'}
                </p>
              </div>
              {!searchQuery && filterType === 'all' && (
                <Button onClick={handleAddNew}>Add Organization</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-xs font-mono">
                    {org.abbreviation}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mt-2">{org.name}</h3>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                {org.type && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" aria-label="Organization type icon" />
                    <span>{org.type}</span>
                  </div>
                )}
                {org.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" aria-label="Location icon" />
                    <span className="flex-1">{org.address}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${org.id}/edit`)}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
