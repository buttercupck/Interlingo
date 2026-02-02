'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JobNote {
  id: string;
  note_text: string;
  created_by: string;
  created_at: string;
}

interface JobNotesSectionProps {
  jobId: string;
  notes?: JobNote[];
  className?: string;
}

export function JobNotesSection({ jobId, notes = [], className }: JobNotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleAddNote = async () => {
    // TODO: Implement in Phase 6
    alert('Note saving functionality coming in Phase 6');
    setNoteText('');
    setIsAddingNote(false);
  };

  return (
    <div className={cn('card', className)}>
      <h3 className="heading-3 mb-5">
        Job Notes
      </h3>

      {/* Add Note Form */}
      {isAddingNote ? (
        <div className="mb-5">
          <div className="caption mb-2">Add Note</div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note about this job..."
            className="dropdown-styled resize-vertical min-h-[100px]"
            autoFocus
          />
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim()}
            className={cn(
              'button button-primary w-full mt-3 py-3',
              !noteText.trim() && 'opacity-50 cursor-not-allowed'
            )}
          >
            Add Note
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingNote(true)}
          className="button button-primary w-full mb-6 py-3"
        >
          Add Note
        </button>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-50 rounded-lg border-l-[3px] border-l-secondary">
              <div className="caption mb-2">
                {new Date(note.created_at).toLocaleString()} - {note.created_by}
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {note.note_text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAddingNote && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-2">📝</div>
            <div className="body-small">No notes yet</div>
          </div>
        )
      )}
    </div>
  );
}
