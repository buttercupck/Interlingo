---
created_datetime: 2025-10-06T21:09:30-07:00
last_edited_datetime: 2025-12-29T18:39:04-08:00
---
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- Last Updated: 2025-12-29

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  abbreviation text UNIQUE,
  address text,
  type text,
  street text,
  city text,
  state text,
  zip text,
  -- Added in migration 001
  config JSONB DEFAULT '{}'::jsonb,
  -- Added in migration 003
  zoom_instructions TEXT,
  in_person_instructions TEXT,
  phone_instructions TEXT,
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- Index for config queries
CREATE INDEX idx_organizations_config ON public.organizations USING gin (config);

CREATE TABLE public.languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT languages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.interpreters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  license_number text,
  phone text,
  email text,
  city text,
  state text,
  timezone text,
  rate text,
  internal_notes text,
  is_agency boolean DEFAULT false,
  agency_name text,
  agency_contact_email text,
  agency_contact_phone text,
  modality_preferences ARRAY,
  is_local boolean DEFAULT false,
  CONSTRAINT interpreters_pkey PRIMARY KEY (id)
);

CREATE TABLE public.interpreter_aliases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alias text NOT NULL,
  interpreter_id uuid,
  CONSTRAINT interpreter_aliases_pkey PRIMARY KEY (id),
  CONSTRAINT interpreter_aliases_interpreter_id_fkey FOREIGN KEY (interpreter_id) REFERENCES public.interpreters(id)
);

CREATE TABLE public.interpreter_languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  interpreter_id uuid,
  language_id uuid,
  proficiency_rank integer,
  certification text,
  -- Added in migration 005
  preference_rank integer,
  CONSTRAINT interpreter_languages_pkey PRIMARY KEY (id),
  CONSTRAINT interpreter_languages_interpreter_id_fkey FOREIGN KEY (interpreter_id) REFERENCES public.interpreters(id),
  CONSTRAINT interpreter_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id)
);

COMMENT ON COLUMN interpreter_languages.preference_rank IS 'Business preference ranking for interpreter assignment priority (1 = highest preference). Distinct from proficiency_rank which measures language skill level.';

CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  org_id uuid,
  zoom_link text,
  zoom_login text,
  type text DEFAULT 'courtroom'::text CHECK (type = ANY (ARRAY['courtroom'::text, 'law_office'::text])),
  address text,
  notes text,
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);

CREATE TABLE public.court_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT court_programs_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- JOB TABLES
-- ============================================================================

CREATE TABLE public.commitment_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  interpreter_id uuid,
  modality text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration integer DEFAULT (EXTRACT(epoch FROM (end_time - start_time)) / (60)::numeric),
  status text DEFAULT 'Initial'::text,
  created_at timestamp with time zone DEFAULT now(),
  location_id uuid,
  -- Added in migration 007
  fingerprint_hash TEXT UNIQUE,
  version INTEGER DEFAULT 1,
  gcal_event_id TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT commitment_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT requests_interpreter_id_fkey FOREIGN KEY (interpreter_id) REFERENCES public.interpreters(id),
  CONSTRAINT commitment_blocks_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);

-- Indexes for fingerprint lookups (migration 007)
CREATE INDEX idx_commitment_blocks_fingerprint ON public.commitment_blocks(fingerprint_hash);
CREATE INDEX idx_commitment_blocks_gcal_event ON public.commitment_blocks(gcal_event_id);

CREATE TABLE public.client_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  commitment_block_id uuid NOT NULL,
  language_id uuid NOT NULL,
  program_id uuid,
  client_name text NOT NULL,
  case_number text,
  meeting_type text NOT NULL,
  requestor_email text,
  specific_location_details text,
  key_contact_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  charges text,
  -- Added in migration 006
  request_received boolean DEFAULT false,
  CONSTRAINT client_requests_pkey PRIMARY KEY (id),
  CONSTRAINT fk_commitment_block FOREIGN KEY (commitment_block_id) REFERENCES public.commitment_blocks(id),
  CONSTRAINT fk_language FOREIGN KEY (language_id) REFERENCES public.languages(id),
  CONSTRAINT fk_program FOREIGN KEY (program_id) REFERENCES public.court_programs(id)
);

-- Index for filtering by received status
CREATE INDEX idx_client_requests_received ON public.client_requests(request_received) WHERE request_received = TRUE;

-- ============================================================================
-- JOB TRACKING TABLES (Migration 002)
-- ============================================================================

CREATE TABLE public.job_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('REQ', 'CONF', 'REM')),
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT,
  marked_sent BOOLEAN DEFAULT false
);

CREATE INDEX idx_job_communications_job_id ON public.job_communications(job_id);
CREATE INDEX idx_job_communications_sent ON public.job_communications(job_id, communication_type, marked_sent);

COMMENT ON TABLE public.job_communications IS 'Tracks all email communications (requests, confirmations, reminders) for interpretation jobs.';

CREATE TABLE public.interpreter_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpreter_id UUID NOT NULL REFERENCES public.interpreters(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_interpreter_unavail_time ON public.interpreter_unavailability(interpreter_id, start_time, end_time);
CREATE INDEX idx_interpreter_unavail_created ON public.interpreter_unavailability(created_at);

COMMENT ON TABLE public.interpreter_unavailability IS 'Tracks time blocks when interpreters are unavailable. Used by matching algorithm to exclude unavailable interpreters.';

CREATE TABLE public.job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_notes_job_id ON public.job_notes(job_id);
CREATE INDEX idx_job_notes_created ON public.job_notes(job_id, created_at DESC);

COMMENT ON TABLE public.job_notes IS 'Internal notes attached to interpretation jobs. Visible only to Intercom team members.';

CREATE TABLE public.job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_status_history_job_id ON public.job_status_history(job_id, changed_at DESC);

COMMENT ON TABLE public.job_status_history IS 'Audit trail of all status changes for interpretation jobs.';

-- ============================================================================
-- JOB ASSIGNMENT TRACKING (Migration 004)
-- ============================================================================

CREATE TABLE public.job_assignment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  interpreter_id UUID NOT NULL REFERENCES public.interpreters(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('contacted', 'pending', 'declined', 'confirmed')),
  contacted_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, interpreter_id)
);

CREATE INDEX idx_job_assignment_attempts_job ON public.job_assignment_attempts(job_id);
CREATE INDEX idx_job_assignment_attempts_interpreter ON public.job_assignment_attempts(interpreter_id);
CREATE INDEX idx_job_assignment_attempts_status ON public.job_assignment_attempts(job_id, status);

COMMENT ON TABLE public.job_assignment_attempts IS 'Tracks interpreter assignment workflow per job: contacted -> pending -> declined/confirmed';

-- ============================================================================
-- VECTOR/AI TABLES (Langchain)
-- ============================================================================

CREATE TABLE public.langchain_pg_collection (
  name character varying,
  cmetadata json,
  uuid uuid NOT NULL,
  CONSTRAINT langchain_pg_collection_pkey PRIMARY KEY (uuid)
);

CREATE TABLE public.langchain_pg_embedding (
  collection_id uuid,
  embedding USER-DEFINED,
  document character varying,
  cmetadata json,
  custom_id character varying,
  uuid uuid NOT NULL,
  CONSTRAINT langchain_pg_embedding_pkey PRIMARY KEY (uuid),
  CONSTRAINT langchain_pg_embedding_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.langchain_pg_collection(uuid)
);

CREATE TABLE public.obsidian_knowledge_vectors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  embedding USER-DEFINED,
  document text,
  cmetadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT obsidian_knowledge_vectors_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Helper function to check interpreter availability (Migration 002)
CREATE OR REPLACE FUNCTION public.is_interpreter_available(
  p_interpreter_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.interpreter_unavailability
    WHERE interpreter_id = p_interpreter_id
      AND start_time < p_end_time
      AND end_time > p_start_time
  );
END;
$$;

-- ============================================================================
-- JOB VERSION HISTORY (Migration 007)
-- ============================================================================

CREATE TABLE public.job_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_block_id UUID NOT NULL REFERENCES public.commitment_blocks(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_source TEXT NOT NULL, -- 'gcal_sync', 'manual_edit', 'api'
  changed_fields JSONB NOT NULL,
  previous_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  CONSTRAINT unique_version_per_job UNIQUE (commitment_block_id, version_number)
);

CREATE INDEX idx_job_version_history_job ON public.job_version_history(commitment_block_id);
CREATE INDEX idx_job_version_history_changed_at ON public.job_version_history(changed_at DESC);

COMMENT ON TABLE public.job_version_history IS 'Audit trail of all changes to jobs from GCal sync.';
