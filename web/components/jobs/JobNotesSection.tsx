'use client';

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Job Notes
        </h3>
      </CardHeader>

      <CardContent>
        {/* Add Note Form */}
        {isAddingNote ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Note</label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this job..."
                className="min-h-[100px] resize-y"
                autoFocus
              />
            </div>
            <Button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="w-full"
            >
              Add Note
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingNote(true)}
            className="w-full"
          >
            Add Note
          </Button>
        )}

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="flex flex-col gap-3 mt-6">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-muted rounded-lg border-l-4 border-l-primary">
                <div className="text-xs text-muted-foreground mb-2">
                  {new Date(note.created_at).toLocaleString()} - {note.created_by}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {note.note_text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isAddingNote && (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No notes yet</div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
