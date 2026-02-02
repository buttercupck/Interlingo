-- Migration: Add fingerprint and version tracking for upsert workflow
-- Purpose: Enable deduplication via fingerprint hash and track job version history
-- Created: 2025-12-29
-- Phase: Upsert Workflow - Database Changes

-- ============================================================================
-- PART 1: Add columns to commitment_blocks for fingerprint/version tracking
-- ============================================================================

-- Fingerprint hash for deduplication (unique identifier based on start_time|org|language)
ALTER TABLE public.commitment_blocks
ADD COLUMN IF NOT EXISTS fingerprint_hash TEXT UNIQUE;

-- Version tracking for change history
ALTER TABLE public.commitment_blocks
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Google Calendar event ID for source tracking
ALTER TABLE public.commitment_blocks
ADD COLUMN IF NOT EXISTS gcal_event_id TEXT;

-- Last synced timestamp
ALTER TABLE public.commitment_blocks
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();

-- Index for fast fingerprint lookups (primary deduplication query)
CREATE INDEX IF NOT EXISTS idx_commitment_blocks_fingerprint
ON public.commitment_blocks(fingerprint_hash);

-- Index for gcal event ID lookups
CREATE INDEX IF NOT EXISTS idx_commitment_blocks_gcal_event
ON public.commitment_blocks(gcal_event_id);

-- Column comments for documentation
COMMENT ON COLUMN public.commitment_blocks.fingerprint_hash IS
'SHA256 hash of start_time|org_abbreviation|language for deduplication. Format: first 32 chars of sha256(fingerprint_raw)';

COMMENT ON COLUMN public.commitment_blocks.version IS
'Version number incremented on each update from GCal sync. Starts at 1 for new jobs.';

COMMENT ON COLUMN public.commitment_blocks.gcal_event_id IS
'Google Calendar event ID from the source event (e.g., "abc123xyz"). Used for tracking source.';

COMMENT ON COLUMN public.commitment_blocks.last_synced_at IS
'Timestamp of last successful sync from Google Calendar. Updated on both create and update.';

-- ============================================================================
-- PART 2: Create job_version_history table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_block_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_source TEXT NOT NULL, -- 'gcal_sync', 'manual_edit', 'api'

  -- What changed
  changed_fields JSONB NOT NULL, -- ['end_time', 'case_number']

  -- Before/After snapshots
  previous_values JSONB NOT NULL, -- {"end_time": "2025-01-15T10:00:00", "case_number": null}
  new_values JSONB NOT NULL,      -- {"end_time": "2025-01-15T11:00:00", "case_number": "CR-2025-001"}

  CONSTRAINT unique_version_per_job UNIQUE (commitment_block_id, version_number)
);

-- Index for fast history lookups by job
CREATE INDEX IF NOT EXISTS idx_job_version_history_job
ON public.job_version_history(commitment_block_id);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_job_version_history_changed_at
ON public.job_version_history(changed_at DESC);

-- Table comment
COMMENT ON TABLE public.job_version_history IS
'Audit trail of all changes to jobs from GCal sync. Each sync that modifies a job creates a new version record with before/after snapshots.';

-- ============================================================================
-- PART 3: Permissions
-- ============================================================================

-- Grant permissions (auth deferred, using anon/authenticated for now)
GRANT SELECT, INSERT, UPDATE ON public.job_version_history TO anon, authenticated;

-- ============================================================================
-- PART 4: Verification
-- ============================================================================

DO $$
BEGIN
  -- Check fingerprint_hash column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'commitment_blocks'
    AND column_name = 'fingerprint_hash'
  ) THEN
    RAISE EXCEPTION 'Migration failed: fingerprint_hash column not found';
  END IF;

  -- Check job_version_history table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'job_version_history'
  ) THEN
    RAISE EXCEPTION 'Migration failed: job_version_history table not found';
  END IF;

  RAISE NOTICE 'Migration 007 successful: fingerprint columns and version history table created';
END $$;
