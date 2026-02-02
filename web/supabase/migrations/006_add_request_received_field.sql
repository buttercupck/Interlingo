-- Migration: Add request_received field to client_requests table
-- Purpose: Track whether client request has been received/confirmed
-- Created: 2025-12-05
-- Phase: Phase 1 - Database Migration

-- Add request_received column
ALTER TABLE public.client_requests
ADD COLUMN IF NOT EXISTS request_received BOOLEAN DEFAULT FALSE;

-- Add column comment for documentation
COMMENT ON COLUMN public.client_requests.request_received IS
'Indicates whether client request has been received/confirmed. Used for checkbox toggle in JobOverviewCard UI.';

-- Create index for filtering by received status
-- Only index TRUE values since queries will primarily filter for received requests
CREATE INDEX IF NOT EXISTS idx_client_requests_received
ON public.client_requests(request_received)
WHERE request_received = TRUE;

-- Verify column was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'client_requests'
    AND column_name = 'request_received'
  ) THEN
    RAISE NOTICE 'Migration successful: request_received column added to client_requests table';
  ELSE
    RAISE EXCEPTION 'Migration failed: request_received column not found';
  END IF;
END $$;
