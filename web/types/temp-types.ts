/**
 * Temporary type definitions while database.types.ts is being regenerated
 *
 * TODO: Delete this file after regenerating types with:
 * supabase gen types typescript --project-id [project-id] > types/database.types.ts
 */

// Basic types
export type CertificationLevel = 'Certified' | 'Registered' | 'Non-certified';
export type ModalityType = 'In-Person' | 'Zoom' | 'Phone';
export type JobStatus = 'pending' | 'assigned' | 'confirmed' | 'completed' | 'cancelled';

// Filter types
export type InterpreterFilters = {
  languages?: string[];
  certifications?: CertificationLevel[];
  modalities?: ModalityType[];
  cities?: string[];
  isLocal?: boolean;
  isAgency?: boolean;
};

export type InterpreterSortOption = {
  field: 'name' | 'city' | 'languages' | 'certification' | 'languageCount';
  direction: 'asc' | 'desc';
};

// Use 'any' for complex types that would require full database schema
// This allows the build to pass while we regenerate proper types
export type InterpreterWithLanguages = any;
export type JobWithDetails = any;
export type Language = any;
export type Organization = any;
export type Location = any;
export type ClientRequest = any;
export type Interpreter = any;
export type InterpreterLanguage = any;
export type JobAssignment = any;
export type JobAssignmentAttemptWithInterpreter = any;
export type CommitmentBlockInsert = any;
export type ClientRequestInsert = any;
export type InterpreterInsert = any;
export type InterpreterUpdate = any;
export type CommitmentBlockUpdate = any;
export type ClientRequestUpdate = any;
export type JobAssignmentAttemptInsert = any;
export type AssignmentStatus = any;
