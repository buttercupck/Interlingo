-- Migration: Add config column to organizations table
-- Purpose: Store organization-specific instructions and settings as JSONB
-- Date: 2025-10-28

-- Add config column to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance on config
CREATE INDEX IF NOT EXISTS idx_organizations_config ON public.organizations USING gin (config);

-- Add comment explaining the config structure
COMMENT ON COLUMN public.organizations.config IS
'Organization-specific configuration including zoom_instructions, in_person_instructions, probation_rules, etc. Structure: {
  "zoom_instructions": {
    "check_in_required": boolean,
    "chat_message_on_join": string,
    "chat_message_on_leave": string,
    "name_format": string,
    "special_notes": string
  },
  "in_person_instructions": {
    "check_in_location": string,
    "seating": string,
    "special_notes": string
  }
}';

-- Seed Kent Municipal Court configuration based on markdown documentation
UPDATE public.organizations
SET config = '{
  "zoom_instructions": {
    "check_in_required": true,
    "chat_message_on_join": "Language Interpreter present",
    "chat_message_on_leave": "Language Interpreter finished",
    "name_format": "{LANGUAGE} — {FIRST_NAME} {LAST_NAME}",
    "special_notes": "Kent Municipal Court requires you to check in and out using the chat."
  },
  "in_person_instructions": {
    "check_in_location": "Courtroom clerk",
    "seating": "Jury box",
    "special_notes": "For Jury Readiness: Please check in with the courtroom clerk and then sit in the jury box. Check out with the courtroom clerk before you leave."
  }
}'::jsonb
WHERE name = 'Kent Municipal Court';
