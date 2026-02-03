import { useState, useEffect, useMemo } from 'react';
import type { InterpreterWithLanguages } from '@/types/database.types';

/**
 * Debounced search hook for interpreters
 *
 * Search fields:
 * - first_name (case-insensitive)
 * - last_name (case-insensitive)
 * - email (case-insensitive)
 * - language names (case-insensitive)
 * - license_number (exact match)
 * - phone (partial match)
 * - city (case-insensitive)
 *
 * Performance:
 * - 300ms debounce to prevent excessive re-renders
 * - Client-side search (fast for 50-200 records)
 * - Memoized results to prevent recalculation
 *
 * @param interpreters - Array of interpreters to search
 * @param initialQuery - Initial search query
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Search results and search control functions
 */
export function useInterpreterSearch(
  interpreters: InterpreterWithLanguages[] | undefined,
  initialQuery = '',
  debounceMs = 300
) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search with memoization
  const searchResults = useMemo(() => {
    if (!interpreters) return [];
    if (!debouncedQuery.trim()) return interpreters;

    const searchTerm = debouncedQuery.toLowerCase().trim();

    return interpreters.filter((interpreter) => {
      // Search first name
      if (interpreter.first_name?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search last name
      if (interpreter.last_name?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search full name (handles "John Doe" searches)
      const fullName =
        `${interpreter.first_name} ${interpreter.last_name}`.toLowerCase();
      if (fullName.includes(searchTerm)) {
        return true;
      }

      // Search email
      if (interpreter.email?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search license number (exact match, case-insensitive)
      if (interpreter.license_number?.toLowerCase() === searchTerm) {
        return true;
      }

      // Search phone (remove formatting for comparison)
      if (interpreter.phone) {
        const normalizedPhone = interpreter.phone.replace(/\D/g, '');
        const normalizedSearch = searchTerm.replace(/\D/g, '');
        if (normalizedPhone.includes(normalizedSearch)) {
          return true;
        }
      }

      // Search city
      if (interpreter.city?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search language names
      const languages = interpreter.interpreter_languages || [];
      const hasLanguageMatch = languages.some((il) =>
        il.language?.name?.toLowerCase().includes(searchTerm)
      );
      if (hasLanguageMatch) {
        return true;
      }

      // Search agency name (if applicable)
      if (interpreter.is_agency && interpreter.agency_name) {
        if (interpreter.agency_name.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }

      return false;
    });
  }, [interpreters, debouncedQuery]);

  return {
    query,
    setQuery,
    debouncedQuery,
    searchResults,
    isSearching: query !== debouncedQuery, // True while debounce is active
    hasQuery: debouncedQuery.trim().length > 0,
    clearSearch: () => setQuery(''),
  };
}

/**
 * Advanced search with field-specific queries
 *
 * Usage:
 * ```tsx
 * const search = useAdvancedInterpreterSearch(interpreters, {
 *   name: 'john',
 *   language: 'spanish',
 *   certification: 'Certified'
 * });
 * ```
 *
 * @param interpreters - Array of interpreters to search
 * @param searchCriteria - Field-specific search criteria
 * @returns Filtered interpreters matching all criteria
 */
export function useAdvancedInterpreterSearch(
  interpreters: InterpreterWithLanguages[] | undefined,
  searchCriteria: {
    name?: string;
    email?: string;
    language?: string;
    certification?: 'Certified' | 'Registered';
    city?: string;
    licenseNumber?: string;
  }
) {
  return useMemo(() => {
    if (!interpreters) return [];

    let results = [...interpreters];

    // Filter by name (first or last)
    if (searchCriteria.name) {
      const nameTerm = searchCriteria.name.toLowerCase().trim();
      results = results.filter(
        (int) =>
          int.first_name?.toLowerCase().includes(nameTerm) ||
          int.last_name?.toLowerCase().includes(nameTerm) ||
          `${int.first_name} ${int.last_name}`.toLowerCase().includes(nameTerm)
      );
    }

    // Filter by email
    if (searchCriteria.email) {
      const emailTerm = searchCriteria.email.toLowerCase().trim();
      results = results.filter((int) =>
        int.email?.toLowerCase().includes(emailTerm)
      );
    }

    // Filter by language
    if (searchCriteria.language) {
      const langTerm = searchCriteria.language.toLowerCase().trim();
      results = results.filter((int) =>
        int.interpreter_languages?.some((il) =>
          il.language?.name?.toLowerCase().includes(langTerm)
        )
      );
    }

    // Filter by certification
    if (searchCriteria.certification) {
      results = results.filter((int) =>
        int.interpreter_languages?.some(
          (il) => il.certification === searchCriteria.certification
        )
      );
    }

    // Filter by city
    if (searchCriteria.city) {
      const cityTerm = searchCriteria.city.toLowerCase().trim();
      results = results.filter((int) =>
        int.city?.toLowerCase().includes(cityTerm)
      );
    }

    // Filter by license number
    if (searchCriteria.licenseNumber) {
      const licenseTerm = searchCriteria.licenseNumber.toLowerCase().trim();
      results = results.filter(
        (int) => int.license_number?.toLowerCase() === licenseTerm
      );
    }

    return results;
  }, [interpreters, searchCriteria]);
}

/**
 * Highlight search matches in text
 *
 * @param text - Text to highlight
 * @param query - Search query
 * @returns Text with <mark> tags around matches
 */
export function highlightSearchMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape regex special characters
 *
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get search result statistics
 *
 * @param totalCount - Total number of interpreters
 * @param resultCount - Number of search results
 * @param query - Search query
 * @returns Human-readable search statistics
 */
export function getSearchStats(
  totalCount: number,
  resultCount: number,
  query: string
): string {
  if (!query.trim()) {
    return `Showing all ${totalCount} interpreters`;
  }

  if (resultCount === 0) {
    return `No results found for "${query}"`;
  }

  if (resultCount === totalCount) {
    return `All ${totalCount} interpreters match "${query}"`;
  }

  return `Found ${resultCount} of ${totalCount} interpreters matching "${query}"`;
}
