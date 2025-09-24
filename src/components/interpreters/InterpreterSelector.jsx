import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const InterpreterSelector = ({ 
  selectedInterpreter, 
  onInterpreterSelect, 
  requiredLanguage = null,
  requiredCertification = null,
  disabled = false 
}) => {
  const [interpreters, setInterpreters] = useState([]);
  const [filteredInterpreters, setFilteredInterpreters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchInterpreters();
  }, []);

  useEffect(() => {
    filterInterpreters();
  }, [interpreters, searchTerm, requiredLanguage, requiredCertification]);

  const fetchInterpreters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interpreters')
        .select(`
          *,
          interpreter_languages (
            language_id,
            certification_level,
            languages (
              id,
              name
            )
          )
        `)
        .eq('active', true)
        .order('last_name', { ascending: true });

      if (error) throw error;

      setInterpreters(data || []);
    } catch (err) {
      console.error('Error fetching interpreters:', err);
      setError('Failed to load interpreters');
    } finally {
      setLoading(false);
    }
  };

  const filterInterpreters = () => {
    let filtered = interpreters;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(interpreter =>
        `${interpreter.first_name} ${interpreter.last_name}`.toLowerCase().includes(term) ||
        interpreter.email?.toLowerCase().includes(term)
      );
    }

    // Filter by required language
    if (requiredLanguage) {
      filtered = filtered.filter(interpreter =>
        interpreter.interpreter_languages?.some(lang =>
          lang.languages?.name === requiredLanguage
        )
      );
    }

    // Filter by required certification
    if (requiredCertification) {
      filtered = filtered.filter(interpreter =>
        interpreter.interpreter_languages?.some(lang =>
          lang.certification_level === requiredCertification
        )
      );
    }

    setFilteredInterpreters(filtered);
  };

  const handleSelect = (interpreter) => {
    onInterpreterSelect(interpreter);
    setSearchTerm(`${interpreter.first_name} ${interpreter.last_name}`);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    // Clear selection if input is cleared
    if (!value && selectedInterpreter) {
      onInterpreterSelect(null);
    }
  };

  const getInterpreterLanguages = (interpreter) => {
    return interpreter.interpreter_languages
      ?.map(lang => `${lang.languages?.name} (${lang.certification_level})`)
      .join(', ') || 'No languages listed';
  };

  const getInterpreterStatus = (interpreter) => {
    // You can add logic here to determine availability
    // For now, we'll just show if they have the required language
    if (requiredLanguage) {
      const hasLanguage = interpreter.interpreter_languages?.some(lang =>
        lang.languages?.name === requiredLanguage
      );
      return hasLanguage ? 'qualified' : 'not-qualified';
    }
    return 'available';
  };

  if (loading) {
    return (
      <div className="input-group">
        <label className="input-label">Select Interpreter</label>
        <div className="input bg-gray-100 text-gray-500">
          Loading interpreters...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="input-group">
        <label className="input-label">Select Interpreter</label>
        <div className="input border-red-300 bg-red-50 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="input-group">
      <label className="input-label">
        Select Interpreter
        {requiredLanguage && (
          <span className="body-small text-gray-500 ml-2">
            (Required: {requiredLanguage})
          </span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          className={`input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search by name or email..."
          disabled={disabled}
        />

        {/* Dropdown */}
        {showDropdown && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredInterpreters.length > 0 ? (
              filteredInterpreters.map((interpreter) => {
                const status = getInterpreterStatus(interpreter);
                return (
                  <div
                    key={interpreter.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelect(interpreter)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {interpreter.first_name} {interpreter.last_name}
                        </div>
                        <div className="body-small text-gray-600 mt-1">
                          {interpreter.email}
                        </div>
                        <div className="body-small text-gray-500 mt-1">
                          Languages: {getInterpreterLanguages(interpreter)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 ml-3">
                        <span className={`badge ${
                          status === 'qualified' ? 'badge-success' :
                          status === 'not-qualified' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {status === 'qualified' ? 'Qualified' :
                           status === 'not-qualified' ? 'Not Qualified' :
                           'Available'}
                        </span>

                        {interpreter.phone && (
                          <span className="caption text-gray-400">
                            {interpreter.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-gray-500 text-center">
                {searchTerm ? 'No interpreters found matching your search' : 'No interpreters available'}
                {requiredLanguage && (
                  <div className="body-small mt-1">
                    Try searching without language filter
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Clear button */}
        {searchTerm && !disabled && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setSearchTerm('');
              onInterpreterSelect(null);
              setShowDropdown(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Selected interpreter info */}
      {selectedInterpreter && (
        <div className="mt-3 p-3 bg-primary-lighter rounded-md">
          <div className="body-small text-primary-blue font-medium">
            Selected: {selectedInterpreter.first_name} {selectedInterpreter.last_name}
          </div>
          <div className="body-small text-gray-600 mt-1">
            {selectedInterpreter.email} • {selectedInterpreter.phone}
          </div>
          <div className="body-small text-gray-500 mt-1">
            Languages: {getInterpreterLanguages(selectedInterpreter)}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterpreterSelector;