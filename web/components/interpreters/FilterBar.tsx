'use client';

import type { InterpreterFilters, CertificationLevel, ModalityType } from '@/types/database.types';

interface FilterBarProps {
  filters: InterpreterFilters;
  onFiltersChange: (filters: InterpreterFilters) => void;
  availableLanguages: Array<{ id: string; name: string }>;
  availableCities: string[];
}

const CERTIFICATIONS: CertificationLevel[] = ['Certified', 'Registered', 'Non-certified'];
const MODALITIES: ModalityType[] = ['In-Person', 'Zoom', 'Phone'];

export function FilterBar({
  filters,
  onFiltersChange,
  availableLanguages,
  availableCities,
}: FilterBarProps) {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    onFiltersChange({ ...filters, languages: selected.length > 0 ? selected : undefined });
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value) as CertificationLevel[];
    onFiltersChange({ ...filters, certifications: selected.length > 0 ? selected : undefined });
  };

  const handleModalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value) as ModalityType[];
    onFiltersChange({ ...filters, modalities: selected.length > 0 ? selected : undefined });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    onFiltersChange({
      ...filters,
      cities: selected.length > 0 ? selected : undefined
    });
  };

  const handleLocalToggle = () => {
    onFiltersChange({ ...filters, isLocal: filters.isLocal ? undefined : true });
  };

  const handleAgencyToggle = () => {
    onFiltersChange({ ...filters, isAgency: filters.isAgency ? undefined : true });
  };

  const hasActiveFilters =
    (filters.languages?.length ?? 0) > 0 ||
    (filters.certifications?.length ?? 0) > 0 ||
    (filters.modalities?.length ?? 0) > 0 ||
    (filters.cities?.length ?? 0) > 0 ||
    filters.isLocal ||
    filters.isAgency;

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Filter Label */}
      <div className="flex items-center justify-between">
        <h2 className="heading-4" style={{ color: 'var(--gray-800)' }}>
          Filter Interpreters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="button button-ghost text-sm"
            style={{ color: 'var(--primary-blue)' }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language Filter */}
        <div>
          <label htmlFor="language-filter" className="caption font-medium mb-2 block" style={{ color: 'var(--gray-700)' }}>
            Languages ({filters.languages?.length ?? 0} selected)
          </label>
          <select
            id="language-filter"
            multiple
            value={filters.languages ?? []}
            onChange={handleLanguageChange}
            className="select w-full"
            style={{ minHeight: '120px' }}
          >
            <option value="" disabled>
              Hold Ctrl/Cmd to select multiple
            </option>
            {availableLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Certification Filter */}
        <div>
          <label htmlFor="certification-filter" className="caption font-medium mb-2 block" style={{ color: 'var(--gray-700)' }}>
            Certifications ({filters.certifications?.length ?? 0} selected)
          </label>
          <select
            id="certification-filter"
            multiple
            value={filters.certifications ?? []}
            onChange={handleCertificationChange}
            className="select w-full"
            style={{ minHeight: '120px' }}
          >
            <option value="" disabled>
              Hold Ctrl/Cmd to select multiple
            </option>
            {CERTIFICATIONS.map((cert) => (
              <option key={cert} value={cert}>
                {cert}
              </option>
            ))}
          </select>
        </div>

        {/* Modality Filter */}
        <div>
          <label htmlFor="modality-filter" className="caption font-medium mb-2 block" style={{ color: 'var(--gray-700)' }}>
            Modalities ({filters.modalities?.length ?? 0} selected)
          </label>
          <select
            id="modality-filter"
            multiple
            value={filters.modalities ?? []}
            onChange={handleModalityChange}
            className="select w-full"
            style={{ minHeight: '120px' }}
          >
            <option value="" disabled>
              Hold Ctrl/Cmd to select multiple
            </option>
            {MODALITIES.map((modality) => (
              <option key={modality} value={modality}>
                {modality}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label htmlFor="city-filter" className="caption font-medium mb-2 block" style={{ color: 'var(--gray-700)' }}>
            Cities ({filters.cities?.length ?? 0} selected)
          </label>
          <select
            id="city-filter"
            multiple
            value={filters.cities ?? []}
            onChange={handleCityChange}
            className="select w-full"
            style={{ minHeight: '120px' }}
          >
            <option value="" disabled>
              Hold Ctrl/Cmd to select multiple
            </option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle Filters */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isLocal ?? false}
            onChange={handleLocalToggle}
            className="w-4 h-4 rounded border-gray-300"
            style={{ accentColor: 'var(--primary-blue)' }}
          />
          <span className="body-small" style={{ color: 'var(--gray-700)' }}>
            Local interpreters only
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isAgency ?? false}
            onChange={handleAgencyToggle}
            className="w-4 h-4 rounded border-gray-300"
            style={{ accentColor: 'var(--primary-blue)' }}
          />
          <span className="body-small" style={{ color: 'var(--gray-700)' }}>
            Show agencies
          </span>
        </label>
      </div>
    </div>
  );
}
