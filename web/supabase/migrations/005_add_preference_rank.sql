-- Add preference_rank column to interpreter_languages table
-- This column stores business preference for interpreter assignment (distinct from proficiency_rank which measures skill level)

ALTER TABLE interpreter_languages
ADD COLUMN preference_rank INTEGER;

COMMENT ON COLUMN interpreter_languages.preference_rank IS 'Business preference ranking for interpreter assignment priority (1 = highest preference). Distinct from proficiency_rank which measures language skill level.';
