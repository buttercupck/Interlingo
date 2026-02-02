-- Migration: Job Detail Enhancements
-- Purpose: Add communications tracking, interpreter unavailability, job notes, and audit logging
-- Date: 2025-10-28

-- 1. Communications Log (Email Tracking)
CREATE TABLE IF NOT EXISTS public.job_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('REQ', 'CONF', 'REM')),
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT, -- User identifier (deferred auth system)
  marked_sent BOOLEAN DEFAULT false
);

-- Index for querying communications by job
CREATE INDEX IF NOT EXISTS idx_job_communications_job_id
ON public.job_communications(job_id);

-- Index for finding sent communications
CREATE INDEX IF NOT EXISTS idx_job_communications_sent
ON public.job_communications(job_id, communication_type, marked_sent);

COMMENT ON TABLE public.job_communications IS
'Tracks all email communications (requests, confirmations, reminders) for interpretation jobs.
Provides audit trail of when emails were sent and by whom.';

-- 2. Interpreter Unavailability Blocking
CREATE TABLE IF NOT EXISTS public.interpreter_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpreter_id UUID NOT NULL REFERENCES public.interpreters(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT, -- 'declined_job', 'personal', 'scheduled_off', etc.
  notes TEXT, -- Additional context
  created_by TEXT, -- User identifier (deferred auth system)
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index for fast availability checks during interpreter matching
CREATE INDEX IF NOT EXISTS idx_interpreter_unavail_time
ON public.interpreter_unavailability(interpreter_id, start_time, end_time);

-- Index for cleanup/management
CREATE INDEX IF NOT EXISTS idx_interpreter_unavail_created
ON public.interpreter_unavailability(created_at);

COMMENT ON TABLE public.interpreter_unavailability IS
'Tracks time blocks when interpreters are unavailable.
When an interpreter declines a job, their unavailability is recorded here.
The matching algorithm automatically excludes interpreters with conflicting unavailability blocks.
Example: If Hilary declines Tuesday 9:00-11:00 AM, any job overlapping that time will exclude her from matches.';

-- 3. Job Notes
CREATE TABLE IF NOT EXISTS public.job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by TEXT, -- User identifier (deferred auth system)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying notes by job
CREATE INDEX IF NOT EXISTS idx_job_notes_job_id
ON public.job_notes(job_id);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_job_notes_created
ON public.job_notes(job_id, created_at DESC);

COMMENT ON TABLE public.job_notes IS
'Internal notes attached to interpretation jobs.
Visible only to Intercom team members (you, Clinton, 3rd).
Use for tracking special requirements, communication history, or private observations.';

-- 4. Job Status History (Audit Trail)
CREATE TABLE IF NOT EXISTS public.job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT, -- User identifier (deferred auth system)
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying status history by job
CREATE INDEX IF NOT EXISTS idx_job_status_history_job_id
ON public.job_status_history(job_id, changed_at DESC);

COMMENT ON TABLE public.job_status_history IS
'Audit trail of all status changes for interpretation jobs.
Tracks who changed the status, when, and what it changed from/to.
Example: Initial → Pending (when Request sent) → Confirmed (when Confirmation sent).';

-- 5. Add helper function to check interpreter availability
CREATE OR REPLACE FUNCTION public.is_interpreter_available(
  p_interpreter_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if there are any unavailability blocks that overlap with the requested time
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.interpreter_unavailability
    WHERE interpreter_id = p_interpreter_id
      AND start_time < p_end_time
      AND end_time > p_start_time
  );
END;
$$;

COMMENT ON FUNCTION public.is_interpreter_available IS
'Helper function to check if an interpreter is available for a given time range.
Returns TRUE if available, FALSE if they have an unavailability block overlapping the requested time.
Usage: SELECT is_interpreter_available(''interpreter-uuid'', ''2025-10-28 09:00'', ''2025-10-28 11:00'');';

-- Grant necessary permissions (when auth is implemented, adjust these)
-- For now, assuming public access since auth is deferred
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_communications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interpreter_unavailability TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_notes TO anon, authenticated;
GRANT SELECT, INSERT ON public.job_status_history TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_interpreter_available TO anon, authenticated;
