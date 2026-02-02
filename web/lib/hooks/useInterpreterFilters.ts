import { useMemo } from 'react';
import type {
  InterpreterWithLanguages,
  InterpreterFilters,
  InterpreterSortOption,
  CertificationLevel,
  ModalityType,
} from '@/types/database.types';

/**
 * Client-side filtering and sorting for interpreters
 *
 * Performance rationale:
 * - Dataset size: 50-200 interpreters (small enough for client-side)
 * - Benefits: Instant filtering, no network latency, reduced API calls
 * - Memory footprint: ~500KB for 200 interpreters with details
 *
 * Filter logic:
 * - Language: Match ANY language (OR logic)
 * - Certification: Match ANY certification level (OR logic)
 * - Modality: Match ANY modality preference (OR logic)
 * - Location: Exact boolean match
 * - Agency: Exact boolean match
 *
 * @param interpreters - Array of interpreters from useInterpreters()
 * @param filters - Active filter criteria
 * @param sort - Sort configuration
 * @returns Filtered and sorted interpreter array
 */
export function useInterpreterFilters(
  interpreters: InterpreterWithLanguages[] | undefined,
  filters: InterpreterFilters = {},
  sort: InterpreterSortOption = { field: 'name', direction: 'asc' }
) {
  return useMemo(() => {
    if (!interpreters) return [];

    let filtered = [...interpreters];

    // Filter 1: Languages (match ANY language)
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter((interpreter) => {
        return interpreter.interpreter_languages?.some((il: any) =>
          filters.languages!.includes(il.language_id || '')
        );
      });
    }

    // Filter 2: Certifications (match ANY certification level)
    if (filters.certifications && filters.certifications.length > 0) {
      filtered = filtered.filter((interpreter) => {
        // Get all unique certification levels for this interpreter
        const interpreterCertLevels = new Set<CertificationLevel>();

        interpreter.interpreter_languages?.forEach((il: any) => {
          if (il.certification === 'Certified') {
            interpreterCertLevels.add('Certified');
          } else if (il.certification === 'Registered') {
            interpreterCertLevels.add('Registered');
          } else {
            interpreterCertLevels.add('Non-certified');
          }
        });

        // If interpreter has no languages, they are non-certified
        if (interpreterCertLevels.size === 0) {
          interpreterCertLevels.add('Non-certified');
        }

        // Match if interpreter has ANY of the requested certification levels
        return filters.certifications!.some((certLevel) =>
          interpreterCertLevels.has(certLevel)
        );
      });
    }

    // Filter 3: Modalities (match ANY modality preference)
    if (filters.modalities && filters.modalities.length > 0) {
      filtered = filtered.filter((interpreter) => {
        const modalityPrefs = interpreter.modality_preferences || [];

        // Match if interpreter supports ANY of the requested modalities
        return filters.modalities!.some((modality) =>
          modalityPrefs.includes(modality as string)
        );
      });
    }

    // Filter 4: Cities (match ANY city)
    if (filters.cities && filters.cities.length > 0) {
      filtered = filtered.filter((interpreter) => {
        const city = interpreter.city?.trim();
        if (!city) return false;

        // Match if interpreter's city is in the selected cities list
        return filters.cities!.includes(city);
      });
    }

    // Filter 5: Local interpreters only
    if (filters.isLocal !== undefined) {
      filtered = filtered.filter(
        (interpreter) => interpreter.is_local === filters.isLocal
      );
    }

    // Filter 6: Agency interpreters only
    if (filters.isAgency !== undefined) {
      filtered = filtered.filter(
        (interpreter) => interpreter.is_agency === filters.isAgency
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'name': {
          // Sort by last name, then first name
          const aName = `${a.last_name} ${a.first_name}`.toLowerCase();
          const bName = `${b.last_name} ${b.first_name}`.toLowerCase();
          comparison = aName.localeCompare(bName);
          break;
        }

        case 'certification': {
          // Sort by highest certification level
          // Certified = 3, Registered = 2, Non-certified = 1
          const getCertLevel = (interpreter: InterpreterWithLanguages): number => {
            const levels = interpreter.interpreter_languages?.map((il: any) => {
              if (il.certification === 'Certified') return 3;
              if (il.certification === 'Registered') return 2;
              return 1;
            });
            return Math.max(...(levels || [1]));
          };

          comparison = getCertLevel(b) - getCertLevel(a); // Descending by default
          break;
        }

        case 'languageCount': {
          // Sort by number of languages
          const aCount = a.interpreter_languages?.length || 0;
          const bCount = b.interpreter_languages?.length || 0;
          comparison = bCount - aCount; // Descending by default
          break;
        }
      }

      // Apply sort direction
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [interpreters, filters, sort]);
}

/**
 * Helper function to check if any filters are active
 *
 * @param filters - Filter object to check
 * @returns true if any filter is applied
 */
export function hasActiveFilters(filters: InterpreterFilters): boolean {
  return !!(
    (filters.languages && filters.languages.length > 0) ||
    (filters.certifications && filters.certifications.length > 0) ||
    (filters.modalities && filters.modalities.length > 0) ||
    (filters.cities && filters.cities.length > 0) ||
    filters.isLocal !== undefined ||
    filters.isAgency !== undefined
  );
}

/**
 * Get count of active filters
 *
 * @param filters - Filter object to count
 * @returns Number of active filter criteria
 */
export function getActiveFilterCount(filters: InterpreterFilters): number {
  let count = 0;

  if (filters.languages && filters.languages.length > 0) count++;
  if (filters.certifications && filters.certifications.length > 0) count++;
  if (filters.modalities && filters.modalities.length > 0) count++;
  if (filters.cities && filters.cities.length > 0) count++;
  if (filters.isLocal !== undefined) count++;
  if (filters.isAgency !== undefined) count++;

  return count;
}

/**
 * Clear all filters
 *
 * @returns Empty filter object
 */
export function clearAllFilters(): InterpreterFilters {
  return {};
}

/**
 * Get highest certification level for an interpreter
 *
 * @param interpreter - Interpreter to check
 * @returns Highest certification level
 */
export function getHighestCertification(
  interpreter: InterpreterWithLanguages
): CertificationLevel {
  const hasCertified = interpreter.interpreter_languages?.some(
    (il: any) => il.certification === 'Certified'
  );
  if (hasCertified) return 'Certified';

  const hasRegistered = interpreter.interpreter_languages?.some(
    (il: any) => il.certification === 'Registered'
  );
  if (hasRegistered) return 'Registered';

  return 'Non-certified';
}

/**
 * Get all unique modalities supported by an interpreter
 *
 * @param interpreter - Interpreter to check
 * @returns Array of supported modality types
 */
export function getSupportedModalities(
  interpreter: InterpreterWithLanguages
): ModalityType[] {
  const prefs = interpreter.modality_preferences || [];
  return prefs.filter((p: any): p is ModalityType =>
    ['In-Person', 'Zoom', 'Phone'].includes(p)
  );
}
