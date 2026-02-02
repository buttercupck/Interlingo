'use client';

import { useState, useMemo } from 'react';
import { useInterpreters } from '@/lib/hooks/useInterpreters';
import { useInterpreterFilters } from '@/lib/hooks/useInterpreterFilters';
import { useInterpreterSearch } from '@/lib/hooks/useInterpreterSearch';
import { InterpreterCard } from '@/components/interpreters/InterpreterCard';
import { FilterBar } from '@/components/interpreters/FilterBar';
import type { InterpreterFilters } from '@/types/database.types';

type InterpreterSortOption = {
  field: 'name' | 'city' | 'languages' | 'certification' | 'languageCount';
  direction: 'asc' | 'desc';
};

export default function InterpretersPage() {
  const [filters, setFilters] = useState<InterpreterFilters>({});
  const [sort, setSort] = useState<InterpreterSortOption>({
    field: 'name',
    direction: 'asc',
  });

  // Fetch all interpreters
  const { data: interpreters, isLoading, error } = useInterpreters();

  // Extract unique languages and cities for filter dropdowns
  const availableLanguages = useMemo(() => {
    if (!interpreters) return [];

    const languageMap = new Map<string, { id: string; name: string }>();
    interpreters.forEach((interp) => {
      interp.interpreter_languages?.forEach((il: any) => {
        if (il.language_id && il.language?.name) {
          languageMap.set(il.language_id, {
            id: il.language_id,
            name: il.language.name,
          });
        }
      });
    });

    return Array.from(languageMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [interpreters]);

  const availableCities = useMemo(() => {
    if (!interpreters) return [];

    const citySet = new Set<string>();
    interpreters.forEach((interp) => {
      if (interp.city?.trim()) {
        citySet.add(interp.city.trim());
      }
    });

    return Array.from(citySet).sort();
  }, [interpreters]);

  // Apply search
  const { query, setQuery, searchResults, isSearching } = useInterpreterSearch(
    interpreters,
    ''
  );

  // Apply filters and sorting
  const filteredInterpreters = useInterpreterFilters(
    searchResults,
    filters,
    sort
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading mb-4" style={{ width: '40px', height: '40px' }} />
            <p className="body-base" style={{ color: 'var(--gray-600)' }}>
              Loading interpreters...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="alert alert-danger mb-4">
              <h3 className="heading-4 mb-2">Failed to load interpreters</h3>
              <p className="body-base">{(error as Error).message}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCount = interpreters?.length || 0;
  const filteredCount = filteredInterpreters.length;
  const hasActiveFilters = query.trim().length > 0 || Object.keys(filters).length > 0;

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-1">Interpreter Directory</h1>
          <p className="body-base" style={{ color: 'var(--gray-600)' }}>
            {hasActiveFilters
              ? `Showing ${filteredCount} of ${totalCount} interpreters`
              : `${totalCount} ${totalCount === 1 ? 'interpreter' : 'interpreters'} total`}
          </p>
        </div>

        {/* Future: Add Interpreter button */}
        {/* <button className="button button-primary">
          + Add Interpreter
        </button> */}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, language, or city..."
            className="input w-full"
            style={{
              paddingRight: isSearching ? '3rem' : '1rem',
            }}
          />
          {isSearching && (
            <div
              className="absolute right-3 top-1/2"
              style={{ transform: 'translateY(-50%)' }}
            >
              <div className="loading" style={{ width: '20px', height: '20px' }} />
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        availableLanguages={availableLanguages}
        availableCities={availableCities}
      />

      {/* Sort Controls */}
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="sort-select" className="body-small font-medium" style={{ color: 'var(--gray-700)' }}>
          Sort by:
        </label>
        <select
          id="sort-select"
          value={`${sort.field}-${sort.direction}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-') as [
              'name' | 'certification' | 'languageCount',
              'asc' | 'desc'
            ];
            setSort({ field, direction });
          }}
          className="select"
          style={{ width: 'auto', minWidth: '200px' }}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="certification-desc">Certification (Highest first)</option>
          <option value="languageCount-desc">Language Count (Most first)</option>
        </select>
      </div>

      {/* Interpreter Grid */}
      {filteredCount === 0 ? (
        <div className="text-center py-16">
          {hasActiveFilters ? (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="heading-2 mb-2">No interpreters found</h2>
              <p className="body-base mb-6" style={{ color: 'var(--gray-600)' }}>
                No interpreters match your current search or filters.
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setFilters({});
                }}
                className="button button-primary"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">👥</div>
              <h2 className="heading-2 mb-2">No interpreters yet</h2>
              <p className="body-base mb-6" style={{ color: 'var(--gray-600)' }}>
                Get started by adding your first interpreter to the directory.
              </p>
              {/* Future: Add Interpreter button */}
              {/* <button className="button button-primary">
                + Add First Interpreter
              </button> */}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInterpreters.map((interpreter) => (
            <InterpreterCard
              key={interpreter.id}
              interpreter={interpreter}
              onClick={() => {
                // Future: Navigate to interpreter detail page
                console.log('Clicked interpreter:', interpreter.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
