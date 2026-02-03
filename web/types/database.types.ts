/**
 * Database type definitions
 * Generated from Supabase schema: 2025-12-29
 * Based on: INCOME/Interlingo/supabase/Supabase-Schema.md
 */

// ============================================================================
// CORE TABLES
// ============================================================================

export type Organization = {
  id: string;
  name: string;
  abbreviation: string | null;
  address: string | null;
  type: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  config: Record<string, any>;
  zoom_instructions: string | null;
  in_person_instructions: string | null;
  phone_instructions: string | null;
};

export type Language = {
  id: string;
  name: string;
};

export type Interpreter = {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  timezone: string | null;
  rate: string | null;
  internal_notes: string | null;
  is_agency: boolean;
  agency_name: string | null;
  agency_contact_email: string | null;
  agency_contact_phone: string | null;
  modality_preferences: string[] | null;
  is_local: boolean;
};

export type InterpreterAlias = {
  id: string;
  alias: string;
  interpreter_id: string | null;
};

export type InterpreterLanguage = {
  id: string;
  interpreter_id: string | null;
  language_id: string | null;
  proficiency_rank: number | null;
  certification: string | null;
  preference_rank: number | null;
};

export type Location = {
  id: string;
  name: string;
  org_id: string | null;
  zoom_link: string | null;
  zoom_login: string | null;
  type: 'courtroom' | 'law_office' | null;
  address: string | null;
  notes: string | null;
  organization?: Organization | null;
};

export type CourtProgram = {
  id: string;
  name: string;
  description: string | null;
};

// ============================================================================
// JOB TABLES
// ============================================================================

export type CommitmentBlock = {
  id: string;
  interpreter_id: string | null;
  modality: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  status: string;
  created_at: string;
  location_id: string | null;
  fingerprint_hash: string | null;
  version: number;
  gcal_event_id: string | null;
  last_synced_at: string;
};

export type ClientRequest = {
  id: string;
  commitment_block_id: string;
  language_id: string;
  program_id: string | null;
  client_name: string;
  case_number: string | null;
  meeting_type: string;
  requestor_email: string | null;
  specific_location_details: string | null;
  key_contact_name: string | null;
  created_at: string;
  updated_at: string;
  charges: string | null;
  request_received: boolean;
  language?: Language | null;
  program?: CourtProgram | null;
};

// ============================================================================
// JOB TRACKING TABLES
// ============================================================================

export type JobCommunication = {
  id: string;
  job_id: string;
  communication_type: 'REQ' | 'CONF' | 'REM';
  recipient_email: string | null;
  subject: string | null;
  body: string | null;
  sent_at: string;
  sent_by: string | null;
  marked_sent: boolean;
};

export type InterpreterUnavailability = {
  id: string;
  interpreter_id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type JobNote = {
  id: string;
  job_id: string;
  note_text: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JobStatusHistory = {
  id: string;
  job_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
};

export type AssignmentStatus = 'contacted' | 'pending' | 'declined' | 'confirmed';

export type JobAssignmentAttempt = {
  id: string;
  job_id: string;
  interpreter_id: string;
  status: AssignmentStatus;
  contacted_at: string;
  responded_at: string | null;
  notes: string | null;
  created_at: string;
};

export type JobAssignmentAttemptInsert = Omit<JobAssignmentAttempt, 'id' | 'created_at'>;
export type JobAssignmentAttemptUpdate = Partial<JobAssignmentAttemptInsert>;

export type JobVersionHistory = {
  id: string;
  commitment_block_id: string;
  version_number: number;
  changed_at: string;
  change_source: string;
  changed_fields: Record<string, any>;
  previous_values: Record<string, any>;
  new_values: Record<string, any>;
};

// ============================================================================
// NESTED/COMPOSITE TYPES (For queries with joins)
// ============================================================================

export type InterpreterWithLanguages = Interpreter & {
  interpreter_languages?: Array<InterpreterLanguage & {
    language?: Language | null;
  }> | null;
};

export type JobWithDetails = CommitmentBlock & {
  organization_name: string | null;
  location?: Location | null;
  interpreter?: Interpreter | null;
  client_requests?: ClientRequest[] | null;
  // Legacy fields for backward compatibility
  appointment_date: string | null;
  appointment_time: string | null;
  notes: string | null;
};

export type JobAssignmentAttemptWithInterpreter = JobAssignmentAttempt & {
  interpreter: Interpreter;
};

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export type InterpreterInsert = Omit<Interpreter, 'id'>;
export type InterpreterUpdate = Partial<InterpreterInsert>;

export type ClientRequestInsert = {
  commitment_block_id?: string;
  language_id: string;
  program_id?: string | null;
  client_name: string;
  case_number?: string | null;
  meeting_type: string;
  requestor_email?: string | null;
  specific_location_details?: string | null;
  key_contact_name?: string | null;
  charges?: string | null;
  request_received?: boolean;
};
export type ClientRequestUpdate = Partial<ClientRequestInsert>;

export type CommitmentBlockInsert = Omit<CommitmentBlock, 'id' | 'created_at' | 'version' | 'last_synced_at'>;
export type CommitmentBlockUpdate = Partial<CommitmentBlockInsert>;

// ============================================================================
// FILTER TYPES
// ============================================================================

export type CertificationLevel = 'Certified' | 'Registered' | 'Non-certified';
export type ModalityType = 'In-Person' | 'Zoom' | 'Phone';

export type InterpreterFilters = {
  languages?: string[];
  certifications?: CertificationLevel[];
  modalities?: ModalityType[];
  cities?: string[];
  isLocal?: boolean;
  isAgency?: boolean;
};

export type InterpreterSortOption = {
  field: 'name' | 'city' | 'certification' | 'languageCount' | 'languages';
  direction: 'asc' | 'desc';
};
