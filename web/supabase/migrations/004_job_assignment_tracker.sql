-- Migration: Job Assignment Tracker
-- Purpose: Track interpreter assignment workflow per job (contacted, declined, confirmed)
-- Date: 2025-11-25

-- Create table to track assignment attempts
CREATE TABLE IF NOT EXISTS job_assignment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES commitment_blocks(id) ON DELETE CASCADE,
  interpreter_id UUID NOT NULL REFERENCES interpreters(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('contacted', 'pending', 'declined', 'confirmed')),
  contacted_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- One record per interpreter per job
  UNIQUE(job_id, interpreter_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_assignment_attempts_job ON job_assignment_attempts(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignment_attempts_interpreter ON job_assignment_attempts(interpreter_id);
CREATE INDEX IF NOT EXISTS idx_job_assignment_attempts_status ON job_assignment_attempts(job_id, status);

-- Comments for documentation
COMMENT ON TABLE job_assignment_attempts IS 'Tracks interpreter assignment workflow per job';
COMMENT ON COLUMN job_assignment_attempts.status IS 'contacted=initial outreach, pending=awaiting response, declined=interpreter said no, confirmed=interpreter accepted';
COMMENT ON COLUMN job_assignment_attempts.contacted_at IS 'When the interpreter was first contacted for this job';
COMMENT ON COLUMN job_assignment_attempts.responded_at IS 'When the interpreter responded (declined or confirmed)';

-- Permissions
GRANT ALL ON job_assignment_attempts TO anon, authenticated;
