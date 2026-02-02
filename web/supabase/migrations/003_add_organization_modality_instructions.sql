-- Migration: Add modality-specific instruction fields to organizations table
-- Purpose: Implement Layer 3 (organization-specific) instructions for three-layer template system
-- Created: 2025-11-12
--
-- This migration adds text fields for storing organization-specific instructions
-- for each modality (Zoom, In-Person, Phone). These instructions override the
-- standard modality instructions (Layer 2) when they exist.
--
-- Template variable: {{LANGUAGE}} will be replaced with the job's language at runtime

-- Add modality instruction fields to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS zoom_instructions TEXT,
ADD COLUMN IF NOT EXISTS in_person_instructions TEXT,
ADD COLUMN IF NOT EXISTS phone_instructions TEXT;

-- Add comment to columns for documentation
COMMENT ON COLUMN public.organizations.zoom_instructions IS
'Organization-specific instructions for Zoom interpretation jobs. Supports {{LANGUAGE}} template variable. Overrides standard Zoom instructions when present.';

COMMENT ON COLUMN public.organizations.in_person_instructions IS
'Organization-specific instructions for in-person interpretation jobs. Supports {{LANGUAGE}} template variable. Overrides standard in-person instructions when present.';

COMMENT ON COLUMN public.organizations.phone_instructions IS
'Organization-specific instructions for phone interpretation jobs. Supports {{LANGUAGE}} template variable. Overrides standard phone instructions when present.';

-- Example: Populate Kent Municipal Court's Zoom instructions
-- This demonstrates the three-layer system:
-- - Layer 1: Base email template (CONF/REQ/REM)
-- - Layer 2: Standard Zoom instructions (fallback, in code)
-- - Layer 3: Kent-specific instructions (this data, overrides Layer 2)

UPDATE public.organizations
SET zoom_instructions = '**IMPORTANT:**
**Kent Municipal Court requires you to check in and out using the chat.**

(1) AS SOON AS you log on, please chat Everyone on Zoom (because this is the time the clerk will sign you in):
**Language Interpreter present**

(2) Before you log off, please chat Everyone on Zoom:
**Language Interpreter finished**

(3) Please double-check that your name on Zoom appears as:
**{{LANGUAGE}} — First and Last Name**'
WHERE name = 'Kent Municipal Court';

-- Note: Other organizations without these fields will automatically fall back
-- to Layer 2 (standard modality instructions defined in code)
