-- Migration 009: Add synced_at column to track org config sync
-- Purpose: Track when markdown configs were last synced to database
-- Date: 2026-02-03

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN organizations.synced_at IS 'Timestamp of last sync from markdown config files';
