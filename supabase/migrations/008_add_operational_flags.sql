-- Migration 008: Add operational flags from Notion data
-- Created: 2026-01-27
-- Purpose: Add business logic fields that exist in Notion operational database

-- Add new columns to interpreters table for Notion operational flags
ALTER TABLE interpreters
ADD COLUMN IF NOT EXISTS requires_reconfirmation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS check_rate_with_court BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_currently_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_booking_from_date DATE,
ADD COLUMN IF NOT EXISTS secondary_emails TEXT[];

-- Add comments for clarity
COMMENT ON COLUMN interpreters.requires_reconfirmation IS 'If true, add "PLEASE RECONFIRM" to email subject line';
COMMENT ON COLUMN interpreters.check_rate_with_court IS 'If true, verify rate with court before confirming assignment';
COMMENT ON COLUMN interpreters.is_currently_out IS 'If true, interpreter is currently unavailable (Notion OUT flag)';
COMMENT ON COLUMN interpreters.no_booking_from_date IS 'Date when NO BOOKING FROM restriction starts';
COMMENT ON COLUMN interpreters.secondary_emails IS 'Additional email addresses from Notion (Secondary Email, Third Email)';
