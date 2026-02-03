'use client';

import { useState, useMemo } from 'react';
import { useInterpreters } from '@/lib/hooks/useInterpreters';
import { Search, User, Mail, Phone, MapPin, Languages } from 'lucide-react';
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

export default function InterpretersPage() {
  const { data: interpreters, isLoading, error } = useInterpreters();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterCertification, setFilterCertification] = useState<string>('all');

  // Extract unique values for filters
  const { languages, cities, certifications } = useMemo(() => {
    if (!interpreters) return { languages: [], cities: [], certifications: [] };

    const langSet = new Set<string>();
    const citySet = new Set<string>();
    const certSet = new Set<string>();

    interpreters.forEach((interp) => {
      interp.interpreter_languages?.forEach((il: any) => {
        if (il.language?.name) langSet.add(il.language.name);
        if (il.certification) certSet.add(il.certification);
      });
      if (interp.city?.trim()) citySet.add(interp.city.trim());
    });

    return {
      languages: Array.from(langSet).sort(),
      cities: Array.from(citySet).sort(),
      certifications: Array.from(certSet).sort(),
    };
  }, [interpreters]);

  // Filtered interpreters
  const filteredInterpreters = useMemo(() => {
    if (!interpreters) return [];

    let filtered = interpreters;

    // Filter by language
    if (filterLanguage !== 'all') {
      filtered = filtered.filter((interp) =>
        interp.interpreter_languages?.some(
          (il: any) => il.language?.name === filterLanguage
        )
      );
    }

    // Filter by city
    if (filterCity !== 'all') {
      filtered = filtered.filter((interp) => interp.city === filterCity);
    }

    // Filter by certification
    if (filterCertification !== 'all') {
      filtered = filtered.filter((interp) =>
        interp.interpreter_languages?.some(
          (il: any) => il.certification === filterCertification
        )
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((interp) => {
        const name = `${interp.first_name} ${interp.last_name}`.toLowerCase();
        const email = interp.email?.toLowerCase() || '';
        const city = interp.city?.toLowerCase() || '';
        return name.includes(query) || email.includes(query) || city.includes(query);
      });
    }

    return filtered;
  }, [interpreters, filterLanguage, filterCity, filterCertification, searchQuery]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <User className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Interpreters</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Interpreter Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your network of qualified interpreters
          </p>
        </div>
        <Button>+ Add Interpreter</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCertification} onValueChange={setFilterCertification}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Certification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Certifications</SelectItem>
            {certifications.map((cert) => (
              <SelectItem key={cert} value={cert}>
                {cert}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || filterLanguage !== 'all' || filterCity !== 'all' || filterCertification !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterLanguage('all');
              setFilterCity('all');
              setFilterCertification('all');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredInterpreters.length} of {interpreters?.length || 0} interpreters
        </p>
      )}

      {/* Interpreters Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : filteredInterpreters.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No Interpreters Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || filterLanguage !== 'all' || filterCity !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first interpreter'}
                </p>
              </div>
              {!searchQuery && filterLanguage === 'all' && (
                <Button>+ Add Interpreter</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredInterpreters.map((interpreter) => {
            const languages = interpreter.interpreter_languages || [];
            const displayLanguages = languages.slice(0, 3);
            const remainingCount = languages.length - 3;

            // Get highest certification
            const certs = languages.map((il: any) => il.certification).filter(Boolean);
            const hasCertified = certs.includes('Certified');
            const hasRegistered = certs.includes('Registered');
            const highestCert = hasCertified ? 'Certified' : hasRegistered ? 'Registered' : null;

            return (
              <Card key={interpreter.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                        {interpreter.first_name?.[0]}{interpreter.last_name?.[0]}
                      </div>
                    </div>
                    {highestCert && (
                      <Badge variant={highestCert === 'Certified' ? 'default' : 'secondary'}>
                        {highestCert}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mt-2">
                    {interpreter.first_name} {interpreter.last_name}
                  </h3>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm">
                  {/* Languages */}
                  {displayLanguages.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs uppercase">
                        <Languages className="h-3 w-3" />
                        <span>Languages</span>
                      </div>
                      {displayLanguages.map((il: any) => (
                        <div key={il.id} className="flex items-center gap-2 text-sm">
                          <span>{il.language?.name}</span>
                          {il.preference_rank === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Top Priority
                            </Badge>
                          )}
                        </div>
                      ))}
                      {remainingCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{remainingCount} more
                        </p>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {(interpreter.city || interpreter.state) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {interpreter.city}{interpreter.city && interpreter.state && ', '}{interpreter.state}
                      </span>
                    </div>
                  )}

                  {/* Contact */}
                  {interpreter.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-xs">{interpreter.email}</span>
                    </div>
                  )}
                  {interpreter.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">{interpreter.phone}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2">
                  {interpreter.email && (
                    <a href={`mailto:${interpreter.email}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        Email
                      </Button>
                    </a>
                  )}
                  {interpreter.phone && (
                    <a href={`tel:${interpreter.phone}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Call
                      </Button>
                    </a>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
