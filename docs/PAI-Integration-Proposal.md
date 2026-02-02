# Interlingo + PAI Integration Architecture

**Version:** 1.1.0
**Date:** 2025-10-27
**Author:** Itza (with Chavvo)
**Status:** Design Phase - Revised for Current Workflow

---

## Executive Summary

This document outlines the technical architecture for integrating **Interlingo** (interpreter scheduling web application) with **PAI** (Personal AI Infrastructure) to create an intelligent, AI-powered scheduling assistant that reduces manual work by 80%+ while improving accuracy and response times.

**Note:** This revised version (v1.1.0) reflects the current workflow constraints:
- No voice interface (removed)
- Manual email handling (no FastMail automation)
- GCAL → n8n as primary job intake (85% of jobs)
- Simplified ML/AI approach (rule-based matching initially)

### Key Objectives
1. **Speed:** Reduce job creation from 10+ minutes to <2 minutes
2. **Intelligence:** AI-powered interpreter matching with 95%+ accuracy
3. **Automation:** 70%+ of routine tasks automated with human oversight
4. **Integration:** Seamless GCAL → n8n → Interlingo workflow for 85% of job intake
5. **Scalability:** Handle 3-5x current volume without additional staff

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Data Flow](#data-flow)
4. [API Design](#api-design)
5. [Database Architecture](#database-architecture)
6. [Integration Points](#integration-points)
7. [AI/ML Components](#aiml-components)
8. [Security & Privacy](#security--privacy)
9. [Deployment Architecture](#deployment-architecture)
10. [Implementation Phases](#implementation-phases)
11. [Technical Stack](#technical-stack)

---

## System Overview

### High-Level Architecture

```
┌────────────────────────────────────────────────────┐
│                        USER INTERFACES             │
├────────────────────────────────────────────────────┤
│  Web App (Desktop)  │  Mobile PWA  │ Email Client  │
└──────────┬──────────┴──────┬───────┴───────┬───────┘
           │                 │               │ 
           └─────────────────┴───────────────┴
                                      │
                              ┌───────▼────────┐
                              │   API GATEWAY  │
                              │  (Rate Limit,  │
                              │   Auth, Route) │
                              └───────┬────────┘
                                      │
           ┌──────────────────────────┼
           │                          │
    ┌──────▼─────┐          ┌────────▼────────┐       
    │ INTERLINGO │          │   PAI SERVICE   │       
    │  WEB APP   │◄────────►│   (AI Brain)    │
    │            │          │                 │       
    │ Next.js    │          │ Express/Bun API │       
    │ React      │          │ Agent Orchestr. │       
    └──────┬─────┘          └────────┬────────┘       
           │                         │
           │                         │
    ┌──────▼─────────────────────────▼───────┐
    │         SUPABASE (PostgreSQL)          │
    │  ┌────────┐  ┌────────┐  ┌────────┐    │
    │  │ Jobs   │  │Interp. │  │ AI     │    │
    │  │ Data   │  │ Data   │  │Context │    │
    │  └────────┘  └────────┘  └────────┘    │
    └──────────────────┬─────────────────────┘
                       │
    ┌──────────────────┴──────────────────────┐
    │        EXTERNAL INTEGRATIONS            │
    ├──────────────┬──────────────┬───────────┤
    │  FastMail    │  Google Cal  │ Webhooks  │
    │  IMAP/SMTP   │  CalDAV API  │ (Zapier)  │
    └──────────────┴──────────────┴───────────┘
```

### System Boundaries

**Interlingo Web App:**
- User interface for job management
- Client-facing features (job board, interpreter profiles, email preview)
- Traditional CRUD operations
- Real-time updates via WebSocket

**PAI Service:**
- AI-powered decision making
- Natural language processing
- Interpreter matching engine
- Email template generation
- Workflow automation
- GCAL event parsing


---

## Architecture Components

### 1. Interlingo Web Application

**Technology:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui

**Responsibilities:**
- User authentication and authorization
- Job CRUD operations
- Interpreter management
- Email template preview and editing
- Real-time dashboard
- Mobile-responsive PWA

**Key Pages:**
```
/dashboard           - Overview with widgets
/jobs                - Jobs board with filters
/jobs/[id]           - Job detail page
/jobs/new            - Job creation flow
/interpreters        - Interpreter database
/interpreters/[id]   - Interpreter profile
/settings            - User/org settings
/reports             - Analytics and reports
```

**State Management:**
- React Query (server state)
- Zustand (client state)
- Supabase Realtime (live updates)

---

### 2. PAI Service (AI Brain)

**Technology:** Bun + Express (or Hono for speed), TypeScript

**Port:** `8889`

**Responsibilities:**
- Natural language understanding
- AI agent orchestration
- Interpreter matching algorithms
- Email generation/parsing
- Workflow automation
- Context management
- Learning from user behavior

**Core Modules:**

```typescript
// Module structure
pai-service/
├── src/
│   ├── agents/
│   │   ├── matching-agent.ts      // Interpreter matching logic
│   │   ├── email-agent.ts         // Email template generation
│   │   ├── calendar-parser.ts     // GCAL event parsing
│   │   └── analytics-agent.ts     // Pattern recognition
│   ├── api/
│   │   ├── routes/
│   │   │   ├── jobs.ts            // Job-related AI endpoints
│   │   │   ├── calendar.ts        // GCAL import endpoint
│   │   │   ├── interpreters.ts    // Interpreter matching
│   │   │   ├── emails.ts          // Email generation
│   │   └── middleware/
│   │       ├── auth.ts            // JWT validation
│   │       ├── rate-limit.ts      // Rate limiting
│   │       └── logging.ts         // Request logging
│   ├── services/
│   │   ├── supabase.ts            // Database client
│   │   ├── claude.ts              // Anthropic API client
│   │   └── gcal.ts                // Google Calendar client (read-only)
│   ├── utils/
│   │   ├── context-loader.ts      // Load org-specific rules
│   │   ├── template-engine.ts     // Email template processor
│   │   ├── conflict-detector.ts   // Calendar conflict logic
│   │   └── ics-generator.ts       // Generate .ics files
│   └── index.ts                   // Server entry point
├── tests/
├── package.json
└── tsconfig.json
```

**API Endpoints Overview:**
```
POST   /api/match-interpreter          - AI-powered interpreter suggestions
POST   /api/generate-email             - Generate REQ/CONF/REM emails
POST   /api/jobs/import-from-calendar  - Import job from GCAL via n8n
POST   /api/create-job-nl              - Natural language job creation (paste requests)
POST   /api/generate-ics               - Generate .ics file for manual GCAL import
GET    /api/insights                   - Analytics and patterns
POST   /api/conflict-check             - Detect scheduling conflicts
```

---

## Data Flow

### Scenario 1: Manual Job Creation (Traditional)

```
User opens Interlingo → Fills form → Clicks "Create Job"
                                              │
                                              ▼
                                    Next.js Server Action
                                              │
                                              ▼
                                    Supabase Insert (commitment_blocks)
                                              │
                                              ▼
                                    Realtime broadcast to connected clients
                                              │
                                              ▼
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
            Dashboard updates (new job)              Webhook to PAI Service
                                                              │
                                                              ▼
                                            PAI suggests interpreters
```

### Scenario 2: GCAL Import (85% of Jobs)

```
Clinton/3rd creates event in GCAL: "Kent Court - Spanish - Jose Martinez"
                        │
                        ▼
            n8n Webhook triggered on new calendar event
                        │
                        ▼
            n8n parses event:
            - Organization: "Kent Court" (from calendar name)
            - Language: "Spanish" (from title)
            - Client: "Jose Martinez" (from title)
            - Date/Time: from event start/end
                        │
                        ▼
            n8n POST /api/jobs/import-from-calendar
                        │
                        ▼
            PAI receives data, validates organization
                        │
                        ▼
            If missing data: PAI uses Claude to parse description
                        │
                        ▼
            Creates commitment_block + client_request in Supabase
                        │
                        ▼
            Immediately runs matching agent
                        │
                        ▼
            Displays job in Interlingo dashboard with top 3 suggestions
                        │
                        ▼
            You review, select interpreter, generate REQ email
                        │
                        ▼
            Copy email to clipboard, paste in email client, send manually
```

### Scenario 3: Natural Language Job Creation (Paste Request)

```
Clinton forwards email: "Need Spanish interpreter tomorrow 9am Kent Court
                        for Jose Martinez case #12345, criminal arraignment"
            │
            ▼
You copy the text, open Interlingo
            │
            ▼
Click "Create from Text" → Paste request
            │
            ▼
POST /api/create-job-nl with description
            │
            ▼
PAI uses Claude to extract:
- Date: tomorrow (resolves to 2025-10-28)
- Time: 09:00
- Organization: Kent Municipal Court (matched to DB)
- Language: Spanish
- Client: Jose Martinez
- Case Number: 12345
- Hearing Type: Criminal arraignment
            │
            ▼
Returns parsed data with confidence scores
            │
            ▼
UI shows parsed fields (editable if wrong)
            │
            ▼
You confirm → Job created in Supabase
            │
            ▼
PAI offers: "Generate .ics file for GCAL?"
            │
            ▼
Downloads .ics → You manually import to shared calendar
```

---

## API Design

### PAI Service REST API

#### 1. Interpreter Matching

**Endpoint:** `POST /api/match-interpreter`

**Request:**
```typescript
interface MatchRequest {
  job_id: string;
  language: string;
  certification_required: boolean;
  modality: 'In-Person' | 'Zoom' | 'Teams' | 'Phone';
  organization_id: string;
  start_time: string; // ISO 8601
  end_time: string;
  location_id?: string;
  priority?: 'normal' | 'urgent';
}
```

**Response:**
```typescript
interface MatchResponse {
  suggestions: Array<{
    interpreter_id: string;
    interpreter_name: string;
    match_score: number; // 0-100
    confidence: 'very_high' | 'high' | 'medium' | 'low';
    reasoning: string[];
    availability: {
      confirmed: boolean;
      conflicts: Array<{
        job_id: string;
        start_time: string;
        end_time: string;
        overlap_minutes: number;
      }>;
    };
    statistics: {
      acceptance_rate: number;
      response_time_avg_minutes: number;
      completion_rate: number;
      organization_preference: boolean;
    };
    estimated_response_time: string; // "< 2 hours"
  }>;
  auto_action?: {
    action: 'assign' | 'send_request' | 'none';
    target_interpreter_id?: string;
    reason: string;
  };
  alternatives_count: number;
}
```

**Algorithm Logic:**
```typescript
// Matching score calculation
const matchScore = (
  languageMatch * 30 +          // Must match (30 points)
  certificationMatch * 25 +     // Cert > Reg > None (25 points)
  availabilityScore * 20 +      // No conflicts (20 points)
  organizationPreference * 15 + // Org prefers this interpreter (15 points)
  historicalReliability * 10    // Past performance (10 points)
);

// Confidence thresholds
if (matchScore >= 90) confidence = 'very_high';
else if (matchScore >= 75) confidence = 'high';
else if (matchScore >= 60) confidence = 'medium';
else confidence = 'low';
```

#### 2. Email Generation

**Endpoint:** `POST /api/generate-email`

**Request:**
```typescript
interface EmailGenerateRequest {
  template_type: 'REQ' | 'CONF' | 'REM';
  job_id: string;
  interpreter_id?: string;
  custom_instructions?: string;
  organization_id: string;
}
```

**Response:**
```typescript
interface EmailGenerateResponse {
  subject: string;
  body: string;
  to: string;
  cc?: string[];
  variables_used: Record<string, any>;  // Useful for debugging
  organization_instructions_applied: boolean;
}
```

**Template Processing:**
```typescript
// Load base template
const template = await loadTemplate(template_type);

// Load org-specific instructions
const orgInstructions = await loadOrgInstructions(organization_id);

// Load job data
const job = await supabase.from('commitment_blocks').select('*').eq('id', job_id).single();
const clientRequests = await supabase.from('client_requests').select('*').eq('commitment_block_id', job_id);

// Variable substitution
const variables = {
  'CommitmentBlock.date': formatDate(job.start_time),
  'CommitmentBlock.time': formatTime(job.start_time),
  'CommitmentBlock.modality': job.modality,
  'CommitmentBlock.organization': await getOrgName(job.organization_id),
  'ClientRequest[]': clientRequests.map(cr => ({
    clientName: cr.client_name,
    caseNumber: cr.case_number,
    hearingType: cr.meeting_type,
    charges: cr.charges
  }))
};

// Inject org-specific instructions
const bodyWithInstructions = injectOrgInstructions(template.body, orgInstructions);

// Final rendering
const renderedBody = renderTemplate(bodyWithInstructions, variables);
```

#### 3. Calendar Import (Primary Intake)

**Endpoint:** `POST /api/jobs/import-from-calendar`

**Request:**
```typescript
interface CalendarImportRequest {
  calendar_event_id: string;        // GCAL event ID for tracking
  calendar_name: string;             // "Kent Court Calendar"
  event_title: string;               // "Spanish - Jose Martinez"
  event_description?: string;        // Additional details
  start_time: string;                // ISO 8601
  end_time: string;                  // ISO 8601

  // n8n pre-parsed fields (optional - PAI will parse if missing)
  organization_name?: string;        // Extracted from calendar name
  language?: string;                 // Extracted from title
  client_name?: string;              // Extracted from title
  case_number?: string;              // From description
  modality?: 'In-Person' | 'Zoom' | 'Teams' | 'Phone';
}
```

**Response:**
```typescript
interface CalendarImportResponse {
  success: boolean;
  job_id?: string;
  commitment_block: {
    id: string;
    start_time: string;
    end_time: string;
    organization_id: string;
    organization_name: string;
    modality: string;
  };
  client_requests: Array<{
    id: string;
    language: string;
    client_name: string;
    case_number?: string;
    meeting_type: string;
  }>;
  interpreter_suggestions: Array<{
    interpreter_id: string;
    interpreter_name: string;
    match_score: number;
    reasoning: string[];
  }>;
  parsing_confidence: number;
  fields_needing_review: string[];  // Fields PAI wasn't confident about
  errors?: string[];
}
```

**Processing Logic:**
```typescript
async function importFromCalendar(request: CalendarImportRequest) {
  // Step 1: Validate or match organization
  let org_id = null;
  if (request.organization_name) {
    org_id = await matchOrganization(request.organization_name);
  } else {
    // Extract from calendar name: "Kent Court Calendar" → "Kent Court"
    const orgName = request.calendar_name.replace(/calendar/i, '').trim();
    org_id = await matchOrganization(orgName);
  }

  // Step 2: Parse additional fields from title/description if needed
  if (!request.language || !request.client_name) {
    const parsedData = await claudeParseEvent({
      title: request.event_title,
      description: request.event_description
    });

    request.language = request.language || parsedData.language;
    request.client_name = request.client_name || parsedData.client_name;
    request.case_number = request.case_number || parsedData.case_number;
    request.modality = request.modality || parsedData.modality || 'In-Person';
  }

  // Step 3: Create commitment_block
  const commitmentBlock = await supabase.from('commitment_blocks').insert({
    start_time: request.start_time,
    end_time: request.end_time,
    modality: request.modality,
    status: 'Initial',
    location_id: await getOrgDefaultLocation(org_id)
  }).select().single();

  // Step 4: Create client_request
  const language_id = await getLanguageId(request.language);
  const clientRequest = await supabase.from('client_requests').insert({
    commitment_block_id: commitmentBlock.id,
    language_id: language_id,
    client_name: request.client_name,
    case_number: request.case_number,
    meeting_type: request.meeting_type || 'Hearing'
  }).select().single();

  // Step 5: Immediately run matching
  const suggestions = await matchInterpreter(commitmentBlock.id);

  // Step 6: Log the import for tracking
  await supabase.from('calendar_imports').insert({
    calendar_event_id: request.calendar_event_id,
    commitment_block_id: commitmentBlock.id,
    raw_event_data: request
  });

  return {
    success: true,
    job_id: commitmentBlock.id,
    commitment_block: commitmentBlock,
    client_requests: [clientRequest],
    interpreter_suggestions: suggestions.slice(0, 3),  // Top 3
    parsing_confidence: calculateConfidence(request),
    fields_needing_review: identifyUncertainFields(request)
  };
}
```

#### 4. Natural Language Job Creation

**Endpoint:** `POST /api/create-job-nl`

**Request:**
```typescript
interface NLJobCreateRequest {
  description: string; // Natural language description
  user_id: string;
}
```

**Response:**
```typescript
interface NLJobCreateResponse {
  parsed_data: {
    date: string;
    time: string;
    organization: string;
    language: string;
    certification_required: boolean;
    modality: string;
    client_name?: string;
    case_number?: string;
    hearing_type?: string;
    charges?: string;
  };
  confidence: number;
  missing_fields: string[];
  clarifications_needed: Array<{
    field: string;
    question: string;
    options?: string[];
  }>;
  job_id?: string; // If created
  next_steps: string[];
  ics_file_url?: string; // Download link for .ics file
}
```

**Implementation:**
```typescript
async function createJobFromNaturalLanguage(description: string) {
  // Step 1: Use Claude to extract structured data
  const claudePrompt = `
You are parsing interpreter scheduling requests. Extract:
- Date and time
- Organization name (must match known orgs)
- Language needed
- Certification required (yes/no)
- Modality (In-Person, Remote, Phone)
- Client details if mentioned

Description: "${description}"

Respond with JSON only.
  `;

  const parsed = await callClaudeAPI(claudePrompt);

  // Step 2: Validate against database
  const orgMatch = await fuzzyMatchOrganization(parsed.organization);
  const languageMatch = await matchLanguage(parsed.language);

  // Step 3: Check for missing required fields
  const required = ['date', 'time', 'organization', 'language', 'modality'];
  const missing = required.filter(f => !parsed[f]);

  if (missing.length > 0) {
    return {
      confidence: 0.6,
      missing_fields: missing,
      clarifications_needed: generateClarificationQuestions(missing)
    };
  }

  // Step 4: Create job
  const job = await createJob(parsed);

  // Step 5: Immediately run matching
  const suggestions = await matchInterpreter(job.id);

  // Step 6: Generate .ics file for manual GCAL import
  const icsFile = await generateICSFile(job);

  return {
    parsed_data: parsed,
    confidence: 0.95,
    job_id: job.id,
    next_steps: [
      `Job created for ${parsed.date} at ${parsed.time}`,
      `Top suggestion: ${suggestions[0].interpreter_name} (${suggestions[0].match_score}% match)`,
      'Click to download .ics file for calendar import'
    ],
    ics_file_url: icsFile.download_url
  };
}
```

#### 5. ICS File Generation

**Endpoint:** `POST /api/generate-ics`

**Request:**
```typescript
interface ICSGenerateRequest {
  job_id: string;
  interpreter_id?: string;  // Include interpreter if assigned
}
```

**Response:**
```typescript
interface ICSGenerateResponse {
  success: boolean;
  ics_content: string;      // Raw ICS file content
  download_url: string;     // Temporary download URL
  filename: string;         // Suggested filename
}
```

**Implementation:**
```typescript
async function generateICSFile(job_id: string, interpreter_id?: string) {
  const job = await supabase.from('commitment_blocks')
    .select(`
      *,
      client_requests (*)
    `)
    .eq('id', job_id)
    .single();

  const interpreter = interpreter_id
    ? await supabase.from('interpreters').select('*').eq('id', interpreter_id).single()
    : null;

  // Build ICS content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Interlingo//Job Scheduler//EN
BEGIN:VEVENT
UID:${job.id}@interlingo.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(job.start_time)}
DTEND:${formatICSDate(job.end_time)}
SUMMARY:${job.client_requests[0].language} - ${interpreter?.first_name || 'UNASSIGNED'} - ${job.modality}
DESCRIPTION:Client: ${job.client_requests[0].client_name}\\nCase: ${job.client_requests[0].case_number || 'N/A'}\\nHearing: ${job.client_requests[0].meeting_type}
LOCATION:${job.modality === 'Zoom' ? 'Zoom Meeting' : job.modality === 'Teams' ? 'Microsoft Teams' : 'In-Person'}
STATUS:TENTATIVE
END:VEVENT
END:VCALENDAR`;

  // Store temporarily in Supabase Storage
  const filename = `job-${job.id}.ics`;
  const { data } = await supabase.storage
    .from('temp-files')
    .upload(filename, icsContent, {
      contentType: 'text/calendar',
      cacheControl: '3600',
      upsert: true
    });

  const { data: { publicUrl } } = supabase.storage
    .from('temp-files')
    .getPublicUrl(filename);

  return {
    success: true,
    ics_content: icsContent,
    download_url: publicUrl,
    filename: filename
  };
}
```

---

## Database Architecture

### Supabase Schema Extensions

**New Tables for PAI Integration:**

#### 1. `ai_interpreter_insights`
```sql
CREATE TABLE ai_interpreter_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpreter_id UUID NOT NULL REFERENCES interpreters(id),

  -- Performance metrics
  acceptance_rate DECIMAL(5,2), -- % of requests accepted
  response_time_avg_minutes INTEGER, -- Avg response time
  completion_rate DECIMAL(5,2), -- % of jobs completed
  cancellation_rate DECIMAL(5,2), -- % of jobs cancelled

  -- Preferences learned by AI
  preferred_organizations UUID[], -- Array of org IDs
  preferred_modalities TEXT[], -- ['Remote', 'In-Person']
  preferred_time_slots JSONB, -- { "monday": ["09:00-12:00"], ... }
  decline_patterns JSONB, -- Reasons for declining

  -- Reliability score (AI-calculated)
  reliability_score INTEGER, -- 0-100
  last_calculated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_insights_interpreter ON ai_interpreter_insights(interpreter_id);
CREATE INDEX idx_ai_insights_reliability ON ai_interpreter_insights(reliability_score DESC);
```

#### 2. `ai_matching_history`
```sql
CREATE TABLE ai_matching_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES commitment_blocks(id),

  -- What AI suggested
  suggested_interpreters JSONB, -- Array of suggestions with scores
  top_suggestion_id UUID REFERENCES interpreters(id),
  top_suggestion_score INTEGER,

  -- What user chose
  user_selected_id UUID REFERENCES interpreters(id),
  user_accepted_suggestion BOOLEAN, -- Did they pick top suggestion?

  -- Outcome
  interpreter_accepted BOOLEAN,
  interpreter_response_time_minutes INTEGER,
  job_completed BOOLEAN,

  -- Learning
  feedback_score INTEGER, -- User can rate the suggestion
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_matching_history_job ON ai_matching_history(job_id);
CREATE INDEX idx_matching_history_accepted ON ai_matching_history(user_accepted_suggestion);
```

#### 3. `ai_email_templates`
```sql
CREATE TABLE ai_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL, -- 'REQ', 'CONF', 'REM'
  organization_id UUID REFERENCES organizations(id), -- Org-specific or NULL for default

  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,

  -- AI learns from edits
  times_used INTEGER DEFAULT 0,
  times_edited INTEGER DEFAULT 0,
  avg_edit_distance INTEGER, -- How much users modify it

  -- Performance
  avg_response_time_minutes INTEGER, -- How fast interpreters respond
  acceptance_rate DECIMAL(5,2), -- % of REQs that get accepted

  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  created_by UUID, -- user_id
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_templates_type_org ON ai_email_templates(template_type, organization_id);
CREATE INDEX idx_ai_templates_active ON ai_email_templates(is_active) WHERE is_active = true;
```

#### 4. `calendar_imports`
```sql
CREATE TABLE calendar_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id TEXT NOT NULL UNIQUE,
  commitment_block_id UUID REFERENCES commitment_blocks(id),

  -- Raw data from n8n/GCAL
  calendar_name TEXT NOT NULL,
  event_title TEXT NOT NULL,
  raw_event_data JSONB NOT NULL,

  -- Parsing metadata
  parsing_confidence DECIMAL(5,2),
  fields_manually_corrected TEXT[],  -- Which fields user had to fix
  parsing_errors JSONB,

  -- Tracking
  imported_at TIMESTAMPTZ DEFAULT now(),
  imported_by_user_id UUID
);

CREATE INDEX idx_calendar_imports_event ON calendar_imports(calendar_event_id);
CREATE INDEX idx_calendar_imports_job ON calendar_imports(commitment_block_id);
CREATE INDEX idx_calendar_imports_date ON calendar_imports(imported_at DESC);
```

#### 5. `ai_conflict_resolutions`
```sql
CREATE TABLE ai_conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conflict details
  interpreter_id UUID NOT NULL REFERENCES interpreters(id),
  job_1_id UUID NOT NULL REFERENCES commitment_blocks(id),
  job_2_id UUID NOT NULL REFERENCES commitment_blocks(id),
  conflict_type TEXT NOT NULL, -- 'time_overlap', 'location_distance', 'capacity'

  -- AI suggestion
  suggested_resolution TEXT, -- 'reschedule_job_2', 'assign_alternative', etc.
  alternative_interpreters UUID[], -- If reassignment suggested

  -- User decision
  user_resolution TEXT,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conflict_interpreter ON ai_conflict_resolutions(interpreter_id);
CREATE INDEX idx_conflict_unresolved ON ai_conflict_resolutions(resolved_at) WHERE resolved_at IS NULL;
```

### Row Level Security (RLS) Policies

**Note:** For Phase 1, keeping RLS simple with super admin only (you). Can expand later when Clinton/3rd are added.

```sql
-- Enable RLS on all AI tables
ALTER TABLE ai_interpreter_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_matching_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conflict_resolutions ENABLE ROW LEVEL SECURITY;

-- Super Admin (Itza) has full access to everything
-- Using your actual Supabase auth.uid()
CREATE POLICY "Super Admin Full Access - Insights" ON ai_interpreter_insights
  FOR ALL USING (auth.uid() = 'your-actual-uuid-here'::uuid);

CREATE POLICY "Super Admin Full Access - Matching" ON ai_matching_history
  FOR ALL USING (auth.uid() = 'your-actual-uuid-here'::uuid);

CREATE POLICY "Super Admin Full Access - Templates" ON ai_email_templates
  FOR ALL USING (auth.uid() = 'your-actual-uuid-here'::uuid);

CREATE POLICY "Super Admin Full Access - Imports" ON calendar_imports
  FOR ALL USING (auth.uid() = 'your-actual-uuid-here'::uuid);

CREATE POLICY "Super Admin Full Access - Conflicts" ON ai_conflict_resolutions
  FOR ALL USING (auth.uid() = 'your-actual-uuid-here'::uuid);

-- When adding more users later, create additional policies
-- Example for future:
-- CREATE POLICY "Coordinator Read Access" ON ai_matching_history
--   FOR SELECT USING (auth.uid() IN (SELECT id FROM authorized_users));
```

---

## Integration Points

### 1. Email Workflow (Manual with Copy/Paste)

**Current Reality:** No FastMail SMTP/IMAP automation in Phase 1. Manual handling is acceptable.

**Email Generation Flow:**
```typescript
// In Interlingo Web UI
async function handleGenerateEmail(job_id: string, template_type: 'REQ' | 'CONF' | 'REM') {
  // Call PAI to generate email
  const response = await fetch(`${PAI_URL}/api/generate-email`, {
    method: 'POST',
    body: JSON.stringify({
      template_type,
      job_id,
      interpreter_id: selectedInterpreter.id,
      organization_id: job.organization_id
    })
  });

  const emailData = await response.json();

  // Display in modal with preview
  showEmailModal({
    subject: emailData.subject,
    body: emailData.body,
    to: emailData.to,
    onCopy: () => {
      // Copy to clipboard
      navigator.clipboard.writeText(`To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.body}`);

      // Log that email was "sent" (manually)
      logEmailSent(job_id, template_type, emailData.to);

      toast.success('Email copied to clipboard!');
    },
    onEdit: () => {
      // Allow inline editing before copying
      setEmailEditable(true);
    }
  });
}
```

**Communication Tracking (Simplified):**
```typescript
// Manual logging when user copies email
async function logEmailSent(job_id: string, type: string, to: string) {
  await supabase.from('communication_log').insert({
    job_id: job_id,
    direction: 'outbound',
    type: type,
    to: to,
    sent_manually_at: new Date().toISOString(),
    sent_by_user_id: currentUser.id
  });
}

// User manually updates status when interpreter replies
async function markInterpreterResponse(job_id: string, accepted: boolean, notes?: string) {
  await supabase.from('communication_log').insert({
    job_id: job_id,
    direction: 'inbound',
    type: 'RESPONSE',
    response_status: accepted ? 'accepted' : 'declined',
    notes: notes,
    received_manually_at: new Date().toISOString()
  });

  if (accepted) {
    await supabase.from('commitment_blocks')
      .update({ status: 'Confirmed' })
      .eq('id', job_id);
  }
}
```

**Future Enhancement:** When you're ready, FastMail IMAP/SMTP can be added in Phase 2+ to automate this flow. For now, manual is fine.

### 2. Google Calendar Integration (Read-Only)

**Purpose:** GCAL is the source of truth for job intake (via n8n). PAI only reads for case history lookup.

**API Setup:**
```typescript
// pai-service/src/services/google-calendar.ts
import { google } from 'googleapis';

class GoogleCalendarService {
  private calendar;

  constructor() {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // PRIMARY USE CASE: Find case history
  async findCaseHistory(caseNumber: string): Promise<PreviousHearings[]> {
    // Search shared calendar for past events matching case number
    const events = await this.calendar.events.list({
      calendarId: process.env.GCAL_SHARED_CALENDAR_ID,  // Your shared work calendar
      q: caseNumber,
      timeMax: new Date().toISOString(), // Past events only
      singleEvents: true,
      orderBy: 'startTime'
    });

    return events.data.items.map(e => ({
      date: e.start.dateTime,
      interpreter: extractInterpreterFromSummary(e.summary),
      organization: extractOrganization(e.location || e.summary),
      hearing_type: extractHearingType(e.description),
      charges: extractCharges(e.description),
      language: extractLanguage(e.summary)
    }));
  }

  // SECONDARY USE CASE: Check for duplicate events
  async checkDuplicateEvent(calendarEventId: string): Promise<boolean> {
    // When n8n sends event, verify it hasn't already been imported
    const existing = await supabase
      .from('calendar_imports')
      .select('id')
      .eq('calendar_event_id', calendarEventId)
      .single();

    return !!existing.data;
  }
}
```

**Note:** Jobs created manually in Interlingo can generate .ics files for manual import to GCAL. No automatic GCAL event creation.

### 3. Webhook System

**Webhook Dispatcher (Interlingo → PAI):**
```typescript
// interlingo-web/src/lib/webhooks.ts
export async function sendWebhook(event: WebhookEvent) {
  const webhookUrl = process.env.PAI_WEBHOOK_URL || 'http://localhost:8889/webhooks';

  try {
    await fetch(`${webhookUrl}/${event.type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET
      },
      body: JSON.stringify({
        event: event.type,
        data: event.data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    // Queue for retry
    await queueWebhook(event);
  }
}

// Trigger webhooks on key events
export const webhookEvents = {
  JOB_CREATED: 'job.created',
  JOB_UPDATED: 'job.updated',
  JOB_ASSIGNED: 'job.assigned',
  JOB_CONFIRMED: 'job.confirmed',
  EMAIL_SENT: 'email.sent',
  INTERPRETER_UNAVAILABLE: 'interpreter.unavailable'
};
```

**Webhook Receiver (PAI Service):**
```typescript
// pai-service/src/api/routes/webhooks.ts
import { Router } from 'express';

const router = Router();

// Middleware: Verify webhook signature
router.use((req, res, next) => {
  const signature = req.headers['x-webhook-secret'];
  if (signature !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  next();
});

router.post('/job.created', async (req, res) => {
  const { data } = req.body;

  // Immediately run interpreter matching
  const suggestions = await matchInterpreter(data.job_id);

  // Send voice notification with suggestions
  await sendVoiceNotification(
    `New job created for ${data.organization}. Top suggestion: ${suggestions[0].interpreter_name}`
  );

  res.json({ success: true });
});

router.post('/job.assigned', async (req, res) => {
  const { data } = req.body;

  // Generate REQ email (ready for manual sending)
  const email = await generateEmail({
    template_type: 'REQ',
    job_id: data.job_id,
    interpreter_id: data.interpreter_id
  });

  // Return email for display in UI
  res.json({
    success: true,
    email: email,
    message: 'Email generated and ready to copy'
  });
});

router.post('/calendar.import', async (req, res) => {
  // Handle calendar imports from n8n
  const { data } = req.body;

  try {
    const result = await importFromCalendar(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

---

## AI/ML Components

### 1. Interpreter Matching Model

**Approach:** Rule-Based Scoring (Phase 1), ML Later (Phase 2+)

**Phase 1 Strategy:** Start with weighted scoring algorithm. Simple, fast, and 90%+ accurate. Only add ML if you see patterns the rules miss after 500+ jobs.

**Rules-Based Layer (Filters):**
```typescript
// Hard constraints that must be met
const filters = {
  languageMatch: (interpreter, job) =>
    interpreter.languages.includes(job.language),

  certificationMatch: (interpreter, job) =>
    !job.certification_required ||
    interpreter.certification === 'Certified' ||
    interpreter.certification === 'Registered',

  modalityMatch: (interpreter, job) =>
    interpreter.modality_preferences.includes(job.modality),

  availabilityCheck: async (interpreter, job) =>
    !(await hasConflict(interpreter.id, job.start_time, job.end_time))
};
```

**ML Scoring Layer (Rankings):**
```typescript
// Feature engineering for ML model
const features = {
  // Historical performance
  acceptance_rate: interpreter.acceptance_rate,
  response_time_norm: normalize(interpreter.avg_response_time_minutes, 0, 1440),
  completion_rate: interpreter.completion_rate,

  // Preferences
  org_preference_score: interpreter.preferred_organizations.includes(job.org_id) ? 1 : 0,
  time_preference_match: checkTimePreference(interpreter, job.start_time),

  // Recent patterns
  recent_workload: getRecentJobCount(interpreter.id, days=7),
  days_since_last_job: getDaysSinceLastJob(interpreter.id),

  // Contextual
  is_local: interpreter.is_local && job.modality === 'In-Person',
  has_worked_this_org: hasWorkedOrg(interpreter.id, job.org_id),

  // Decline patterns
  recent_decline_rate: getDeclineRate(interpreter.id, days=30),
  declined_similar_jobs: checkSimilarJobDeclines(interpreter.id, job)
};

// Simple weighted scoring (can be replaced with trained model)
const score = (
  features.acceptance_rate * 25 +
  (1 - features.response_time_norm) * 15 +
  features.completion_rate * 20 +
  features.org_preference_score * 15 +
  features.time_preference_match * 10 +
  (features.is_local ? 10 : 0) +
  (features.has_worked_this_org ? 5 : 0) -
  (features.recent_decline_rate * 10)
);
```

**Future Consideration (Phase 2+):** If rule-based matching accuracy drops below 85% after analyzing 500+ jobs, consider training an ML model using `ai_matching_history` data. For now, the weighted scoring approach is sufficient.

### 2. Calendar Event Parsing

**Using Claude for Intelligent Parsing:**
```typescript
async function claudeParseEvent(event: { title: string; description?: string }): Promise<ParsedEventData> {
  const prompt = `
Parse this calendar event for interpreter scheduling. Extract:
- Language needed
- Client name
- Case number (if mentioned)
- Meeting type (hearing, deposition, etc.)
- Modality (In-Person, Zoom, Teams, Phone)

Event Title: "${event.title}"
Event Description: "${event.description || 'N/A'}"

Respond with JSON only:
{
  "language": string,
  "client_name": string,
  "case_number": string | null,
  "meeting_type": string,
  "modality": "In-Person" | "Zoom" | "Teams" | "Phone",
  "confidence": number
}
  `;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.content[0].text);
}
```

### 3. Pattern Recognition (Analytics)

**Simple SQL-Based Analytics (No ML Needed):**

```typescript
// Run weekly to update interpreter insights
async function updateInterpreterInsights() {
  // Calculate metrics using SQL aggregations
  const insights = await supabase.rpc('calculate_interpreter_insights');

  // Update ai_interpreter_insights table
  for (const insight of insights) {
    await supabase.from('ai_interpreter_insights')
      .upsert({
        interpreter_id: insight.interpreter_id,
        acceptance_rate: insight.acceptance_rate,
        response_time_avg_minutes: insight.avg_response_time,
        completion_rate: insight.completion_rate,
        preferred_organizations: insight.preferred_orgs,
        reliability_score: calculateReliabilityScore(insight),
        last_calculated_at: new Date().toISOString()
      }, { onConflict: 'interpreter_id' });
  }
}

// SQL function for calculating insights
// CREATE OR REPLACE FUNCTION calculate_interpreter_insights()
// RETURNS TABLE(...) AS $$
// SELECT
//   i.id as interpreter_id,
//   COUNT(cb.id) FILTER (WHERE cb.status = 'Confirmed')::DECIMAL /
//     NULLIF(COUNT(cb.id), 0) as acceptance_rate,
//   AVG(EXTRACT(EPOCH FROM (cb.updated_at - cb.created_at)) / 60) as avg_response_time,
//   COUNT(cb.id) FILTER (WHERE cb.status = 'Completed')::DECIMAL /
//     NULLIF(COUNT(cb.id) FILTER (WHERE cb.status = 'Confirmed'), 0) as completion_rate,
//   ARRAY_AGG(DISTINCT o.id) FILTER (WHERE cb.status = 'Completed') as preferred_orgs
// FROM interpreters i
// LEFT JOIN commitment_blocks cb ON cb.interpreter_id = i.id
// LEFT JOIN locations l ON cb.location_id = l.id
// LEFT JOIN organizations o ON l.org_id = o.id
// WHERE cb.created_at > NOW() - INTERVAL '180 days'
// GROUP BY i.id
// $$ LANGUAGE SQL;

// Schedule to run weekly on Sundays at 2am
cron.schedule('0 2 * * 0', updateInterpreterInsights);
```

**Key Insight Queries:**

```sql
-- High-demand time slots
SELECT
  EXTRACT(hour FROM start_time) as hour,
  EXTRACT(dow FROM start_time) as day_of_week,
  COUNT(*) as job_count
FROM commitment_blocks
WHERE start_time > NOW() - INTERVAL '90 days'
GROUP BY hour, day_of_week
ORDER BY job_count DESC
LIMIT 10;

-- Interpreter workload distribution
SELECT
  i.first_name || ' ' || i.last_name as name,
  COUNT(cb.id) as total_jobs,
  COUNT(cb.id) FILTER (WHERE cb.status = 'Completed') as completed,
  COUNT(cb.id) FILTER (WHERE cb.status = 'Cancelled') as cancelled
FROM interpreters i
LEFT JOIN commitment_blocks cb ON cb.interpreter_id = i.id
WHERE cb.start_time > NOW() - INTERVAL '90 days'
GROUP BY i.id
ORDER BY total_jobs DESC;
```

---

## Security & Privacy

### 1. Authentication & Authorization

**User Authentication (Supabase Auth):**
```typescript
// Interlingo uses Supabase Auth
// JWT tokens issued on login, validated on every request

// API Gateway middleware
async function authenticateRequest(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Auth verification failed' });
  }
}
```

**Role-Based Access Control:**
```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',
  COORDINATOR = 'coordinator',
  VIEWER = 'viewer'
}

const permissions = {
  [Role.SUPER_ADMIN]: ['*'], // All permissions
  [Role.COORDINATOR]: [
    'jobs.read', 'jobs.create', 'jobs.update',
    'interpreters.read', 'interpreters.update',
    'emails.send'
  ],
  [Role.VIEWER]: ['jobs.read', 'interpreters.read']
};

function requirePermission(permission: string) {
  return async (req, res, next) => {
    const userRole = await getUserRole(req.user.id);
    const userPerms = permissions[userRole];

    if (userPerms.includes('*') || userPerms.includes(permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}

// Usage
router.post('/api/jobs',
  authenticateRequest,
  requirePermission('jobs.create'),
  createJob
);
```

### 2. API Security

**Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Voice command rate limit (more restrictive)
const voiceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 voice commands per minute
  message: 'Too many voice commands, please slow down'
});

app.use('/api', apiLimiter);
app.use('/api/voice-command', voiceLimiter);
```

**Request Validation:**
```typescript
import { z } from 'zod';

// Validate all incoming data
const JobCreateSchema = z.object({
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  organization_id: z.string().uuid(),
  language: z.string().min(1).max(100),
  modality: z.enum(['In-Person', 'Remote', 'Phone']),
  certification_required: z.boolean()
});

router.post('/api/jobs', async (req, res) => {
  try {
    const validated = JobCreateSchema.parse(req.body);
    // Safe to use validated data
  } catch (error) {
    res.status(400).json({ error: 'Invalid input', details: error.errors });
  }
});
```

### 3. Data Privacy

**PII Handling:**
```typescript
// Sensitive fields that should never be logged
const PII_FIELDS = [
  'email', 'phone', 'ssn', 'license_number',
  'client_name', 'case_number', 'charges'
];

function sanitizeForLogging(data: any): any {
  const sanitized = { ...data };

  PII_FIELDS.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

// Usage in logging
logger.info('Job created', sanitizeForLogging(jobData));
```

**Encryption at Rest:**
```sql
-- Supabase has encryption at rest by default
-- For extra-sensitive fields, use pgcrypto

-- Encrypt interpreter notes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE interpreters ADD COLUMN internal_notes_encrypted BYTEA;

-- Encrypt on insert
INSERT INTO interpreters (internal_notes_encrypted)
VALUES (pgp_sym_encrypt('sensitive notes', 'encryption-key'));

-- Decrypt on read
SELECT
  pgp_sym_decrypt(internal_notes_encrypted::bytea, 'encryption-key') AS internal_notes
FROM interpreters;
```

---

## Deployment Architecture

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN                        │
│  (DDoS Protection, WAF, SSL, Caching)                   │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐    ┌────────▼────────┐
│  Vercel Edge    │    │  Cloudflare     │
│  (Interlingo    │    │  Workers        │
│   Next.js App)  │    │  (API Proxy)    │
└────────┬────────┘    └────────┬────────┘
         │                      │
         │           ┌──────────┘
         │           │
         │    ┌──────▼────────┐
         │    │  PAI Service  │
         │    │  (Fly.io)     │
         │    │  Port: 8889   │
         │    └──────┬────────┘
         │           │
         └───────────┴───────────────┐
                                     │
                          ┌──────────▼──────────┐
                          │    SUPABASE         │
                          │  (PostgreSQL +      │
                          │   Realtime +        │
                          │   Storage)          │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼───────────┐
                          │  Google Calendar API  │
                          │  (Read-Only via n8n)  │
                          └──────────────────────┘
```

**Note:** FastMail IMAP/SMTP removed from Phase 1. Google Calendar accessed via n8n webhook (not direct API).

### Deployment Configurations

**Interlingo Web App (Vercel):**
```bash
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "PAI_API_URL": "https://pai.yourdomain.com"
  },
  "regions": ["sea1"], # Seattle (closest to you)
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

**PAI Service (Fly.io):**
```toml
# fly.toml
app = "interlingo-pai"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/nodejs"]

[env]
  PORT = "8889"
  NODE_ENV = "production"

[[services]]
  internal_port = 8889
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[services.concurrency]
  type = "connections"
  hard_limit = 25
  soft_limit = 20

[[services.http_checks]]
  interval = 10000
  timeout = 2000
  path = "/health"

[deploy]
  strategy = "rolling"
  region = "sea" # Seattle
```

### Environment Variables

**Development (.env.local):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PAI Service
PAI_API_URL=http://localhost:8889
PAI_WEBHOOK_SECRET=dev-webhook-secret

# n8n (handles GCAL webhooks)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/calendar-import

# Google Calendar (read-only for case history)
GCAL_SHARED_CALENDAR_ID=your-shared-calendar@group.calendar.google.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-key
```

**Production (Environment Secrets):**
- Store in Vercel Secrets, Fly.io Secrets
- Never commit to git
- Rotate regularly

---

## Implementation Phases

### Phase 1: Foundation (6-8 weeks - REALISTIC)

**Weeks 1-2: Core Infrastructure**
- [ ] Set up PAI Service API server (Bun + Hono for speed)
- [ ] Create database migrations for AI tables
- [ ] Implement Supabase RLS policies (super admin only)
- [ ] Deploy PAI Service to Fly.io (dev environment)
- [ ] Set up basic authentication and webhook system

**Deliverables:**
- PAI Service running on dev environment
- Database schema deployed to Supabase
- Webhook endpoint ready for testing

**Weeks 3-4: Interpreter Matching (Rule-Based)**
- [ ] Build interpreter matching algorithm (weighted scoring)
- [ ] Create `/api/match-interpreter` endpoint
- [ ] Test matching accuracy with real interpreter data
- [ ] Build UI component in Interlingo to display suggestions
- [ ] Add reasoning explanations for suggestions

**Deliverables:**
- Matching API functional with 85%+ accuracy
- Top 3 suggestions displayed in Interlingo UI
- Reasoning for each suggestion visible to user

**Weeks 5-6: Email Template Generation (All 3 Types)**
- [ ] Build template engine with variable substitution
- [ ] Create REQ, CONF, REM email templates
- [ ] Implement org-specific instruction injection
- [ ] Build email preview modal in Interlingo
- [ ] Add "Copy to Clipboard" functionality
- [ ] Create manual communication logging

**Deliverables:**
- All 3 email types (REQ, CONF, REM) working
- Email generation time: <5 seconds
- Clean copy/paste workflow
- Manual tracking in `communication_log`

**Weeks 7-8: Calendar Integration + Polish**
- [ ] Create `/api/jobs/import-from-calendar` endpoint
- [ ] Build n8n workflow: GCAL → webhook → Interlingo
- [ ] Implement Claude-based event parsing
- [ ] Add Natural Language job creation (paste requests)
- [ ] Build .ics file generator
- [ ] Test end-to-end: GCAL event → job creation → matching → email

**Deliverables:**
- 85% of jobs created automatically from GCAL
- Natural language job creation working
- .ics file generation for manual jobs
- Full workflow tested and documented

**Phase 1 Success Metrics:**
- Time to create job: 10+ min → <2 min ✅
- Time to generate email: 5-10 min → <1 min ✅
- Matching suggestions accuracy: 85%+ ✅
- GCAL import success rate: 90%+ ✅

---

### Phase 2: Intelligence & Analytics (2-3 months - FUTURE)

**Focus Areas:**
- SQL-based analytics dashboard
- Interpreter performance insights (automated weekly)
- Case history lookup from GCAL
- Conflict detection and resolution suggestions
- Mobile PWA optimization

**Consider Adding (if needed):**
- FastMail IMAP/SMTP for automated email handling
- Advanced ML-based matching (if rule-based drops below 85%)
- Predictive scheduling based on demand patterns

---

### Phase 3: Scale & Team Expansion (Future)

**When Ready:**
- Add Clinton and 3rd as users
- Multi-user role-based access
- Advanced automation workflows
- Handle 3-5x volume
- Business intelligence suite

---

## Technical Stack

### Frontend (Interlingo Web)
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI:** React + shadcn/ui + Tailwind CSS
- **State:** React Query + Zustand
- **Auth:** Supabase Auth
- **Realtime:** Supabase Realtime
- **Deployment:** Vercel (Edge Functions)

### Backend (PAI Service)
- **Runtime:** Bun (fast TypeScript runtime)
- **Framework:** Hono (lightweight & fast)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **ORM:** Supabase JS Client
- **AI:** Anthropic Claude API (3.5 Sonnet)
- **Calendar:** Google Calendar API (read-only)
- **Deployment:** Fly.io

### Infrastructure
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **CDN:** Cloudflare
- **SSL:** Cloudflare + Let's Encrypt
- **Monitoring:** Sentry + Vercel Analytics
- **Logs:** Fly.io Logs + CloudWatch

### Development Tools
- **Package Manager:** Bun
- **Linting:** ESLint + Prettier
- **Testing:** Bun Test (built-in)
- **CI/CD:** GitHub Actions
- **Version Control:** Git + GitHub

---

## Success Metrics

### Phase 1 Targets (6-8 weeks)
**Core Efficiency:**
- Job creation time: 10+ min → <2 min ✅
- Email generation time: 5-10 min → <30 sec ✅
- Interpreter matching suggestions: 85%+ accuracy ✅
- GCAL import success rate: 90%+ ✅

**Workflow Improvements:**
- 85% of jobs created automatically from GCAL ✅
- All 3 email types (REQ/CONF/REM) functional ✅
- Natural language job creation working ✅
- .ics file generation for manual jobs ✅

**User Experience:**
- Copy/paste email workflow smooth and fast ✅
- Top 3 interpreter suggestions with reasoning ✅
- Manual job creation <3 minutes ✅
- GCAL import <1 minute end-to-end ✅

### Phase 2 Targets (Future)
- SQL-based analytics dashboard operational
- Weekly interpreter insights auto-calculated
- Case history lookup functional
- Conflict detection implemented
- Mobile PWA optimized

### Phase 3 Targets (Future)
- Clinton and 3rd onboarded as users
- Handle 3-5x current volume
- 90%+ automation rate for routine tasks
- Multi-user collaboration features

---

## Next Steps

### Immediate Actions (Week 1)
1. **Review and approve this revised architecture document (v1.1.0)**
   - Confirm modality changes (Zoom/Teams vs Remote)
   - Validate simplified workflow (no voice, manual email)
   - Approve 6-8 week timeline for Phase 1

2. **Set up PAI Service development environment**
   ```bash
   mkdir pai-service
   cd pai-service
   bun init
   bun add hono @supabase/supabase-js @anthropic-ai/sdk @hono/node-server
   ```

3. **Create database migrations**
   - Deploy new AI tables to Supabase
   - Set up RLS policies (super admin only for now)
   - Add `calendar_imports` table

4. **Configure n8n webhook**
   - Set up GCAL → n8n workflow
   - Test webhook payload structure
   - Document expected data format

### Weeks 2-3
1. Build core interpreter matching algorithm
2. Create `/api/match-interpreter` endpoint
3. Test matching with real interpreter data
4. Deploy to Fly.io dev environment

### Weeks 4-6
1. Build email template engine (REQ, CONF, REM)
2. Implement copy/paste workflow in UI
3. Add natural language job creation
4. Build .ics file generator

### Weeks 7-8
1. Integrate GCAL → n8n → Interlingo flow
2. End-to-end testing of full workflow
3. Deploy to production
4. Monitor and iterate based on usage

---

**Document Version:** 1.1.0
**Last Updated:** 2025-10-27
**Changes:** Removed voice interface, simplified email workflow, adjusted for GCAL-first intake, realistic 6-8 week timeline
**Next Review:** Weekly during Phase 1 implementation

---

*This architecture is a living document. Update as requirements evolve and new insights emerge.*
