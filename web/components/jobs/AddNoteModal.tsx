'use client';

import { useState } from 'react';

interface AddNoteModalProps {
  jobId: string;
  onClose: () => void;
  onSave: (noteText: string) => Promise<void>;
}

export function AddNoteModal({ jobId, onClose, onSave }: AddNoteModalProps) {
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = noteText.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) {
      setError('Note cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(noteText.trim());
      onClose();
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Failed to save note. Please try again.');
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isValid && !isSaving) {
        handleSave();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">Add Note</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Note Text Area */}
          <div>
            <label htmlFor="note-text" className="block body-small font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              id="note-text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your note here..."
              className="input w-full min-h-[150px] resize-y"
              autoFocus
              required
            />
            <p className="caption text-gray-500 mt-1">
              Tip: Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to save
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert-danger p-3">
              <p className="body-small text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="button button-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="button button-primary flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
