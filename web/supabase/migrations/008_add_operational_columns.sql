-- Migration 008: Add operational columns for interpreter metadata
-- Created: 2026-01-27
-- Purpose: Add business logic fields from Notion operational database

-- Add operational columns to interpreters table
ALTER TABLE interpreters
ADD COLUMN IF NOT EXISTS requires_reconfirmation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS operational_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS secondary_emails TEXT[];

-- Add comments for clarity
COMMENT ON COLUMN interpreters.requires_reconfirmation IS 'If true, add "PLEASE RECONFIRM" to email subject line (frequently queried)';
COMMENT ON COLUMN interpreters.operational_metadata IS 'JSONB store for less common operational flags: check_rate_with_court, no_booking_from_date, custom notes, etc.';
COMMENT ON COLUMN interpreters.secondary_emails IS 'Additional email addresses from Notion (Secondary Email, Third Email)';

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_interpreters_operational_metadata
ON interpreters USING gin (operational_metadata);
