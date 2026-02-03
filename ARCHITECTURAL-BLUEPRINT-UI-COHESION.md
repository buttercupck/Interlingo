# Interlingo Web Application - Architectural Blueprint for UI Cohesion

**Document Version:** 2.0 (Database Schema Integration Update)
**Date:** 2026-02-03
**Author:** Atlas (Principal Software Architect)
**Production Site:** https://interlingo.augeo.one
**Repository:** `/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/web`
**Last Updated:** 2026-02-03 (Schema-aware revision with advanced component patterns)

---

## Executive Summary

This architectural blueprint provides a comprehensive analysis of the Interlingo web application's UI architecture and proposes a systematic approach to achieve design cohesion across all dashboard pages. The organization page serves as the reference implementation, demonstrating effective use of shadcn/ui components, consistent layout patterns, and clear information architecture.

### Current State Analysis
- **Reference Design:** Organizations page (fully cohesive, shadcn/ui native)
- **Needs Redesign:** Jobs board, job detail, interpreters pages (mixed design systems)
- **Technical Stack:** Next.js 15, React 18, shadcn/ui, TanStack Query, Tailwind CSS
- **Design System Conflict:** Two competing patterns (shadcn/ui vs legacy custom CSS)

### Success Metrics
- 100% shadcn/ui component adoption across dashboard pages
- Consistent Card-based layout architecture
- Unified search/filter patterns
- Standardized loading and error states
- Cohesive typography and spacing system

---

## Table of Contents

1. [Architecture Analysis](#architecture-analysis)
2. [Reference Design Pattern: Organizations Page](#reference-design-pattern-organizations-page)
3. [Current State Assessment](#current-state-assessment)
4. [Database Schema Integration](#database-schema-integration)
5. [Component Architecture Blueprint](#component-architecture-blueprint)
6. [Data Flow & State Management Patterns](#data-flow--state-management-patterns)
7. [Advanced Component Patterns](#advanced-component-patterns)
8. [Page-by-Page Redesign Specifications](#page-by-page-redesign-specifications)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Technical Risks & Mitigation](#technical-risks--mitigation)

---

## 1. Architecture Analysis

### 1.1 Technology Stack Assessment

#### Core Technologies
```typescript
// Framework & Libraries
- Next.js 15.1.6 (App Router with React Server Components)
- React 19.0.0 (client components with hooks)
- TypeScript 5.x (strict type safety)
- Tailwind CSS 3.4.1 (utility-first styling)
- shadcn/ui (Radix UI + Tailwind component library)
- TanStack Query v5 (server state management)
- Supabase (PostgreSQL database + real-time)
```

#### Component System Architecture
```
shadcn/ui Components (Radix UI Primitives)
├── Card (primary layout container)
├── Button (class-variance-authority variants)
├── Badge (status indicators)
├── Input (form controls)
├── Select (dropdowns)
└── [Additional components as needed]

Custom Utility
└── cn() - Tailwind merge utility for className composition
```

### 1.2 Design System Token Analysis

**Tailwind Configuration:**
```typescript
// Color Tokens (HSL-based CSS variables)
--background: 0 0% 100%        // Pure white
--foreground: 0 0% 8%          // Near black
--card: 0 0% 100%              // White cards
--primary: 0 0% 10%            // Dark gray-black
--secondary: 0 0% 96%          // Light gray
--muted: 0 0% 96%              // Muted backgrounds
--muted-foreground: 0 0% 34%   // Muted text
--border: 0 0% 0% / 10%        // 10% opacity borders
--radius: 0.5rem               // 8px border radius
```

**Typography System:**
- shadcn/ui uses Tailwind's default type scale
- Semantic heading levels (text-3xl, text-lg, etc.)
- Font weights: normal (400), medium (500), semibold (600), bold (700)

**Spacing System:**
- Tailwind's spacing scale (4px base unit)
- Consistent gap utilities (gap-4, gap-6)
- Container padding (p-6 standard for cards)

---

## 2. Reference Design Pattern: Organizations Page

### 2.1 Component Architecture

**File:** `app/(dashboard)/dashboard/organizations/page.tsx`

#### Structural Breakdown

```typescript
OrganizationsPage
├── Container Layer (.container mx-auto p-6 space-y-6)
│   ├── Header Section
│   │   ├── Title Group
│   │   │   ├── h1 (text-3xl font-bold tracking-tight)
│   │   │   └── p (text-muted-foreground)
│   │   └── Primary Action (Button - Add Organization)
│   │
│   ├── Search & Filter Bar
│   │   ├── Search Input (relative + icon positioning)
│   │   │   ├── Search icon (absolute left-3)
│   │   │   └── Input (pl-9 for icon clearance)
│   │   ├── Select Dropdown (type filter)
│   │   └── Clear Button (conditional rendering)
│   │
│   ├── Results Count (text-sm text-muted-foreground)
│   │
│   └── Content Area (conditional rendering based on state)
│       ├── Loading State (skeleton cards in grid)
│       ├── Empty State (centered Card with icon + message)
│       └── Success State (grid of organization cards)
│
└── Organization Cards (grid gap-4 md:grid-cols-2 lg:grid-cols-3)
    └── Card Component Structure
        ├── CardHeader
        │   ├── Badge (abbreviation)
        │   └── h3 (organization name)
        ├── CardContent (flex-1 for vertical fill)
        │   ├── Type indicator (Tag icon + text)
        │   └── Address (MapPin icon + text)
        └── CardFooter
            ├── Button (View Details - variant="default")
            └── Button (Edit - variant="outline")
```

### 2.2 Key Architectural Patterns

#### Pattern 1: Semantic Component Composition
```typescript
// ✅ GOOD - Uses shadcn/ui semantic structure
<Card key={org.id} className="flex flex-col">
  <CardHeader>
    <Badge variant="secondary">{org.abbreviation}</Badge>
    <h3 className="font-semibold text-lg">{org.name}</h3>
  </CardHeader>
  <CardContent className="flex-1 space-y-2">
    {/* Content with icons and text */}
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="default">View Details</Button>
    <Button variant="outline">Edit</Button>
  </CardFooter>
</Card>
```

#### Pattern 2: Responsive Grid Layout
```typescript
// Fluid responsive grid with gap consistency
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {filteredOrganizations.map((org) => (
    <Card key={org.id} />
  ))}
</div>
```

#### Pattern 3: Icon + Text Semantic Pairing
```typescript
// Accessible icon-text combinations
<div className="flex items-center gap-2 text-muted-foreground">
  <Tag className="h-4 w-4" aria-label="Organization type icon" />
  <span>{org.type}</span>
</div>
```

#### Pattern 4: State-Based Conditional Rendering
```typescript
if (error) return <ErrorCard />
if (isLoading) return <SkeletonGrid />
if (filteredOrganizations.length === 0) return <EmptyState />
return <SuccessGrid />
```

#### Pattern 5: Controlled Input with Icon Positioning
```typescript
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input
    placeholder="Search organizations..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-9"
  />
</div>
```

### 2.3 Data Flow Architecture

```typescript
// React Hook Composition Pattern
const [organizations, setOrganizations] = useState<Organization[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [searchQuery, setSearchQuery] = useState('')
const [filterType, setFilterType] = useState<FilterType>('all')

// Data Fetching with useCallback
const fetchOrganizations = useCallback(async () => {
  try {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) throw fetchError
    setOrganizations(data || [])
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load')
  } finally {
    setIsLoading(false)
  }
}, [])

// Memoized Filtering Logic
const filteredOrganizations = useMemo(() => {
  let filtered = organizations

  // Type filter
  if (filterType !== 'all') {
    filtered = filtered.filter((org) => org.type === filterType)
  }

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter((org) =>
      org.name.toLowerCase().includes(query) ||
      org.abbreviation.toLowerCase().includes(query) ||
      org.address?.toLowerCase().includes(query)
    )
  }

  return filtered
}, [organizations, filterType, searchQuery])
```

**Key Data Flow Principles:**
1. **useState** for UI state (search, filters, local data)
2. **useCallback** for expensive functions (API calls)
3. **useMemo** for derived data (filtering, sorting)
4. **Supabase client** for direct database queries (no intermediate API layer)
5. **Error boundaries** via try-catch with user-friendly error states

---

## 3. Current State Assessment

### 3.1 Jobs Board Page (`/dashboard/jobs/page.tsx`)

#### Issues Identified

**❌ Mixed Design System:**
```typescript
// Uses custom CSS classes instead of shadcn/ui
<h1 className="heading-2 mb-0 text-primary">Jobs Board</h1>
<button className="button bg-secondary-teal text-white">+ New Job</button>
<div className="card p-8">
```

**Problems:**
- Custom `.heading-2`, `.button`, `.card` classes bypass shadcn/ui
- Color tokens like `secondary-teal` not in Tailwind config
- Table-based layout instead of Card grid
- No Search icon positioning pattern
- Inconsistent spacing (p-8 vs p-6)

**❌ Non-Standard Table Architecture:**
```typescript
<table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-4 text-left caption uppercase tracking-widest">
```

**Problems:**
- Tables are harder to make responsive than card grids
- Custom `.caption` class instead of Tailwind utilities
- No loading skeleton for table rows
- Doesn't match organization page's grid pattern

#### Architectural Debt Metrics
- **shadcn/ui Adoption:** ~10% (only basic structure)
- **Design System Cohesion:** 25% (custom classes dominate)
- **Responsive Design Quality:** 60% (table requires horizontal scroll)
- **Loading State Consistency:** 40% (spinner vs skeleton cards)

### 3.2 Job Detail Page (`/dashboard/jobs/[id]/page.tsx`)

#### Issues Identified

**❌ Partial shadcn/ui Adoption:**
```typescript
// Uses some custom components instead of shadcn/ui primitives
<JobOverviewCard job={job} />
<OrganizationLocationCard job={job} />
<InterpreterManagement job={job} />
```

**Analysis:**
- `JobOverviewCard` uses `.card` class (custom CSS)
- `.section-divider`, `.info-field` custom classes
- `.heading-3` instead of Tailwind text utilities
- Good: Uses shadcn/ui Button for modals

**❌ Inconsistent Layout Patterns:**
```typescript
// Two-column grid (good) but lacks search/filter consistency
<div className="grid grid-cols-2 gap-6">
  <JobOverviewCard />
  <OrganizationLocationCard />
</div>
```

**Problems:**
- No header consistency with organizations page
- Missing breadcrumb navigation pattern
- Collapsible `<details>` elements instead of Accordion component
- Mixed typography scales

#### Component Architecture Issues
```typescript
// JobOverviewCard.tsx - Custom CSS dependency
<div className={cn('card', className)}>
  <div className="section-divider-bottom">
    <h3 className="heading-3 mb-0">Commitment Block</h3>
  </div>
  <div className="info-field">
    <div className="caption">Date & Time</div>
```

**Problems:**
- `.card`, `.section-divider-bottom`, `.heading-3`, `.caption` are custom
- Should use `<Card>`, `<CardHeader>`, `<CardTitle>` from shadcn/ui
- Typography should use Tailwind utilities directly

### 3.3 Interpreters Page (`/dashboard/interpreters/page.tsx`)

#### Issues Identified

**❌ Heaviest Custom CSS Usage:**
```typescript
<div className="container py-8">
  <h1 className="heading-1">Interpreter Directory</h1>
  <p className="body-base" style={{ color: 'var(--gray-600)' }}>

  <input
    type="search"
    className="input w-full"
  />

  <div className="loading" style={{ width: '20px', height: '20px' }} />
```

**Problems:**
- `.container`, `.heading-1`, `.body-base`, `.input`, `.loading` all custom
- Inline styles for CSS variables (`var(--gray-600)`)
- Should use `text-muted-foreground` instead
- Custom `.select` class instead of shadcn/ui Select

**❌ InterpreterCard Component Issues:**
```typescript
// InterpreterCard.tsx
<article className={cn('card', 'group', ...)}>
  <h3 className="heading-4 truncate">
  <h4 className="caption mb-2" style={{ color: 'var(--gray-600)' }}>
  <button className="button-ghost px-2 py-1">
```

**Problems:**
- Should use `<Card>`, `<CardHeader>`, `<CardContent>`, `<CardFooter>`
- Custom typography classes
- Inline CSS variable styles
- `.button-ghost` should be `<Button variant="ghost">`

#### Architectural Debt Metrics
- **shadcn/ui Adoption:** ~5% (minimal)
- **Design System Cohesion:** 15% (heavy custom CSS)
- **Responsive Design Quality:** 70% (grid works well)
- **Loading State Consistency:** 20% (custom loading spinner)

### 3.4 Summary of Architectural Gaps

| Page | shadcn/ui Adoption | Custom CSS Dependency | Layout Cohesion | Priority |
|------|-------------------|----------------------|----------------|----------|
| **Organizations** | ✅ 95% | ✅ <5% | ✅ Reference | - |
| **Jobs Board** | ❌ 10% | ❌ ~80% | ❌ Table-based | 🔴 High |
| **Job Detail** | ⚠️ 40% | ⚠️ ~50% | ⚠️ Partial | 🟡 Medium |
| **Interpreters** | ❌ 5% | ❌ ~85% | ⚠️ Partial | 🔴 High |

**Critical Finding:** The application suffers from **design system fragmentation** with two competing patterns:
1. **Modern:** shadcn/ui + Tailwind utilities (organizations page)
2. **Legacy:** Custom CSS classes + inline styles (other pages)

---

## 4. Database Schema Integration

### 4.1 Critical Schema Features Not Addressed in Original Blueprint

The original architectural blueprint missed several critical database features that require specialized UI components and data fetching strategies. These features significantly impact the complexity of the job detail and interpreter pages.

#### Missing Feature 1: Job Assignment Workflow Tracking

**Schema Table:** `job_assignment_attempts`

```sql
CREATE TABLE public.job_assignment_attempts (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES commitment_blocks(id),
  interpreter_id UUID NOT NULL REFERENCES interpreters(id),
  status TEXT NOT NULL CHECK (status IN ('contacted', 'pending', 'declined', 'confirmed')),
  contacted_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, interpreter_id)
);
```

**Architectural Impact:**
- **Current Assumption (WRONG):** Job detail page only shows the currently assigned interpreter
- **Reality:** Each job has a full assignment workflow history with multiple attempts
- **UI Requirement:** Need to display ALL contacted interpreters with their status progression
- **Status Flow:** contacted → pending → declined/confirmed

**Data Flow:**
```typescript
// Job has ONE assigned interpreter (commitment_blocks.interpreter_id)
// BUT also has MANY assignment attempts (job_assignment_attempts table)

Job Detail Page Components:
├── Current Assignment Card (if interpreter_id exists)
└── Assignment Attempts Section
    ├── Pending Attempts (status: contacted or pending)
    ├── Declined Attempts (status: declined)
    └── Confirmed Attempts (status: confirmed - should match interpreter_id)
```

**Existing Hook (Already Implemented):**
The codebase already has `lib/hooks/useJobAssignmentTracker.ts` with:
- `useJobAssignmentAttempts(jobId)` - Fetch all attempts
- `useMarkContacted()` - Create new attempt
- `useMarkDeclined()` - Update attempt to declined
- `useMarkConfirmed()` - Update attempt + assign interpreter to job
- `useGroupedAttempts(jobId)` - Groups attempts by status

**Missing UI Component:** Assignment attempt list with status badges and timeline

#### Missing Feature 2: Communication History Tracking

**Schema Table:** `job_communications`

```sql
CREATE TABLE public.job_communications (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES commitment_blocks(id),
  communication_type TEXT NOT NULL CHECK (communication_type IN ('REQ', 'CONF', 'REM')),
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT,
  marked_sent BOOLEAN DEFAULT false
);
```

**Architectural Impact:**
- **Purpose:** Audit trail of all emails sent (requests, confirmations, reminders)
- **UI Requirement:** Communication history panel showing email timeline
- **Email Types:**
  - `REQ` - Request emails sent to interpreters
  - `CONF` - Confirmation emails after acceptance
  - `REM` - Reminder emails before job date

**Data Display Pattern:**
```typescript
Communication History Component:
├── Timeline View (chronological)
│   ├── REQ Email (sent_at: timestamp, recipient: email)
│   ├── CONF Email (sent_at: timestamp, recipient: email)
│   └── REM Email (sent_at: timestamp, recipient: email)
└── Expandable Details (subject, body, sent_by)
```

**Missing UI Component:** Email communication timeline with expandable details

#### Missing Feature 3: Job Status Change Audit Trail

**Schema Table:** `job_status_history`

```sql
CREATE TABLE public.job_status_history (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES commitment_blocks(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);
```

**Architectural Impact:**
- **Purpose:** Complete audit trail of all status changes
- **UI Requirement:** Status history timeline showing state transitions
- **Use Cases:**
  - Compliance auditing (who changed what when)
  - Debugging status issues
  - Understanding job lifecycle

**Data Display Pattern:**
```typescript
Status History Component:
└── Timeline Items
    ├── Initial → Pending (changed_by: user@example.com, changed_at: timestamp)
    ├── Pending → Confirmed (changed_by: system, changed_at: timestamp)
    └── Confirmed → Completed (changed_by: user@example.com, changed_at: timestamp)
```

**Missing UI Component:** Audit timeline for status changes

#### Missing Feature 4: Job Version History (GCal Sync)

**Schema Table:** `job_version_history`

```sql
CREATE TABLE public.job_version_history (
  id UUID PRIMARY KEY,
  commitment_block_id UUID NOT NULL REFERENCES commitment_blocks(id),
  version_number INTEGER NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_source TEXT NOT NULL, -- 'gcal_sync', 'manual_edit', 'api'
  changed_fields JSONB NOT NULL,
  previous_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  CONSTRAINT unique_version_per_job UNIQUE (commitment_block_id, version_number)
);
```

**Architectural Impact:**
- **Purpose:** Track all changes from Google Calendar syncs and manual edits
- **UI Requirement:** Version history with diff view showing field changes
- **Use Cases:**
  - Debugging sync issues
  - Tracking manual vs automated changes
  - Rollback capability

**Data Display Pattern:**
```typescript
Version History Component:
└── Version List
    ├── Version 3 (source: gcal_sync, changed_at: timestamp)
    │   └── Changed Fields:
    │       └── start_time: "2:00 PM" → "2:30 PM"
    ├── Version 2 (source: manual_edit, changed_at: timestamp)
    │   └── Changed Fields:
    │       ├── status: "Initial" → "Confirmed"
    │       └── interpreter_id: null → "uuid-123"
    └── Version 1 (source: api, changed_at: timestamp)
        └── Initial creation
```

**Missing UI Component:** Version history with field-level diff view

#### Missing Feature 5: Interpreter Unavailability Calendar

**Schema Table:** `interpreter_unavailability`

```sql
CREATE TABLE public.interpreter_unavailability (
  id UUID PRIMARY KEY,
  interpreter_id UUID NOT NULL REFERENCES interpreters(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);
```

**Architectural Impact:**
- **Purpose:** Track interpreter time blocks when unavailable
- **UI Requirement:** Calendar view on interpreter detail pages
- **Matching Algorithm:** Used to exclude unavailable interpreters from job matches
- **Management:** Add/edit/delete unavailability blocks

**Data Display Pattern:**
```typescript
Unavailability Calendar Component:
├── Calendar View (monthly/weekly)
│   └── Blocked Time Ranges (visual blocks)
└── List View
    ├── Vacation (Jan 15 - Jan 20, 2026)
    ├── Conference (Feb 3, 2:00 PM - 5:00 PM)
    └── Personal (Feb 10, 9:00 AM - 12:00 PM)
```

**Missing UI Component:** Calendar/schedule component for unavailability blocks

#### Missing Feature 6: Complex Join Relationships

**Schema Reality:** Jobs are NOT a single table

```typescript
// WRONG ASSUMPTION
Job = commitment_blocks table (simple)

// ACTUAL REALITY
Job = commitment_blocks + client_requests (one-to-many)

// A single job (commitment_block) can have MULTIPLE client_requests
// Example: One 2-hour block covers 3 different client cases
```

**Data Fetching Complexity:**
```typescript
// Current approach (simple)
const { data: job } = useQuery({
  queryKey: ['job', jobId],
  queryFn: async () => {
    const { data } = await supabase
      .from('commitment_blocks')
      .select('*')
      .eq('id', jobId)
      .single()
    return data
  }
})

// REQUIRED approach (complex joins)
const { data: job } = useQuery({
  queryKey: ['job', jobId],
  queryFn: async () => {
    const { data } = await supabase
      .from('commitment_blocks')
      .select(`
        *,
        client_requests(
          *,
          language:languages(*),
          program:court_programs(*)
        ),
        interpreter:interpreters(*),
        location:locations(
          *,
          organization:organizations(*)
        ),
        assignment_attempts:job_assignment_attempts(
          *,
          interpreter:interpreters(*)
        ),
        communications:job_communications(*),
        status_history:job_status_history(*),
        version_history:job_version_history(*)
      `)
      .eq('id', jobId)
      .single()
    return data as JobWithFullDetails
  }
})
```

**Architectural Impact:**
- Original blueprint assumed simple table queries
- Reality requires nested joins with multiple levels
- TypeScript types must reflect complex nested structure
- UI must handle one-to-many relationships (multiple client requests per job)

#### Missing Feature 7: Interpreter Language Preferences

**Schema Table:** `interpreter_languages`

```sql
CREATE TABLE public.interpreter_languages (
  id UUID PRIMARY KEY,
  interpreter_id UUID,
  language_id UUID,
  proficiency_rank INTEGER,      -- Skill level (1 = highest skill)
  certification TEXT,             -- 'Certified', 'Registered', 'Non-certified'
  preference_rank INTEGER,        -- Business preference (1 = highest preference)
  CONSTRAINT interpreter_languages_pkey PRIMARY KEY (id),
  CONSTRAINT interpreter_languages_interpreter_id_fkey FOREIGN KEY (interpreter_id) REFERENCES interpreters(id),
  CONSTRAINT interpreter_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES languages(id)
);
```

**Architectural Impact:**
- **Two Separate Rankings:**
  1. `proficiency_rank` - How well they speak the language
  2. `preference_rank` - Business priority for assignment (1 = call them first)
- **UI Requirement:** Show both ranks in interpreter language lists
- **Assignment Algorithm:** Should prioritize by `preference_rank`, not just certification

**Data Display Pattern:**
```typescript
Interpreter Language List:
├── Spanish
│   ├── Certification: Certified
│   ├── Proficiency: Expert (rank 1)
│   └── Assignment Priority: High (rank 1) ⭐
├── Arabic
│   ├── Certification: Registered
│   ├── Proficiency: Advanced (rank 2)
│   └── Assignment Priority: Medium (rank 3)
└── French
    ├── Certification: Non-certified
    ├── Proficiency: Intermediate (rank 3)
    └── Assignment Priority: Low (rank 5)
```

**Missing UI Component:** Language list with dual ranking display

#### Missing Feature 8: Organization JSONB Config + Modality Instructions

**Schema Table:** `organizations`

```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  -- ... other fields
  config JSONB DEFAULT '{}'::jsonb,          -- Flexible configuration storage
  zoom_instructions TEXT,                     -- Modality-specific instructions
  in_person_instructions TEXT,
  phone_instructions TEXT
);
```

**Architectural Impact:**
- **JSONB Config:** Organizations can have arbitrary configuration data
- **Modality Instructions:** Different instructions per modality type
- **UI Requirement:** Display appropriate instructions based on job modality

**Data Display Pattern:**
```typescript
Organization Instructions Card (conditional on modality):
// If job.modality === 'Zoom'
└── Zoom Instructions
    └── organization.zoom_instructions (rich text)

// If job.modality === 'In-Person'
└── In-Person Instructions
    └── organization.in_person_instructions (rich text)
```

**Missing UI Component:** Dynamic modality instruction display

### 4.2 Revised Data Fetching Architecture

#### Comprehensive Job Detail Query

```typescript
// types/database.types.ts - NEW COMPREHENSIVE TYPE
export type JobWithFullDetails = CommitmentBlock & {
  // One-to-many: Multiple client requests per job
  client_requests: (ClientRequest & {
    language: Language | null;
    program: CourtProgram | null;
  })[];

  // One-to-one: Assigned interpreter
  interpreter: Interpreter | null;

  // One-to-one: Location with nested organization
  location: (Location & {
    organization: Organization | null;
  }) | null;

  // One-to-many: All assignment attempts
  assignment_attempts: (JobAssignmentAttempt & {
    interpreter: Interpreter;
  })[];

  // One-to-many: Email communications
  communications: JobCommunication[];

  // One-to-many: Status change history
  status_history: JobStatusHistory[];

  // One-to-many: Version change history
  version_history: JobVersionHistory[];
};

// lib/hooks/useJobWithFullDetails.ts - NEW HOOK
export function useJobWithFullDetails(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-full-details', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');

      const supabase = createClient();
      const { data, error } = await supabase
        .from('commitment_blocks')
        .select(`
          *,
          client_requests(
            *,
            language:languages(*),
            program:court_programs(*)
          ),
          interpreter:interpreters(*),
          location:locations(
            *,
            organization:organizations(*)
          ),
          assignment_attempts:job_assignment_attempts(
            *,
            interpreter:interpreters(*)
          ),
          communications:job_communications(*),
          status_history:job_status_history(*),
          version_history:job_version_history(*)
        `)
        .eq('id', jobId)
        .single();

      if (error) throw new Error(error.message);
      return data as JobWithFullDetails;
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes (fresher data for audit trails)
  });
}
```

#### Interpreter Detail Query with Unavailability

```typescript
// types/database.types.ts - ENHANCED TYPE
export type InterpreterWithFullDetails = Interpreter & {
  interpreter_languages: (InterpreterLanguage & {
    language: Language | null;
  })[];
  unavailability: InterpreterUnavailability[];
  aliases: InterpreterAlias[];
  // Could also include job history if needed
  assignment_attempts?: JobAssignmentAttempt[];
};

// lib/hooks/useInterpreterWithFullDetails.ts - NEW HOOK
export function useInterpreterWithFullDetails(interpreterId: string | undefined) {
  return useQuery({
    queryKey: ['interpreter-full-details', interpreterId],
    queryFn: async () => {
      if (!interpreterId) throw new Error('Interpreter ID required');

      const supabase = createClient();
      const { data, error } = await supabase
        .from('interpreters')
        .select(`
          *,
          interpreter_languages(
            *,
            language:languages(*)
          ),
          unavailability:interpreter_unavailability(*),
          aliases:interpreter_aliases(*)
        `)
        .eq('id', interpreterId)
        .single();

      if (error) throw new Error(error.message);
      return data as InterpreterWithFullDetails;
    },
    enabled: !!interpreterId,
  });
}
```

### 4.3 Performance Considerations for Complex Queries

**Challenge:** Deep nested joins can be slow and return large payloads

**Solutions:**

1. **Selective Loading Pattern**
   ```typescript
   // Don't load ALL nested data on initial page load
   // Load progressively as user interacts

   // Initial load (fast)
   const { data: jobBasic } = useJob(jobId)

   // Load on-demand when user expands sections
   const { data: attempts } = useJobAssignmentAttempts(jobId, { enabled: showAttempts })
   const { data: communications } = useJobCommunications(jobId, { enabled: showComms })
   const { data: statusHistory } = useJobStatusHistory(jobId, { enabled: showHistory })
   ```

2. **Pagination for Large Lists**
   ```typescript
   // Communications and history can grow large over time
   export function useJobCommunications(
     jobId: string,
     options?: { limit?: number; offset?: number }
   ) {
     return useQuery({
       queryKey: ['job-communications', jobId, options],
       queryFn: async () => {
         const { data, error } = await supabase
           .from('job_communications')
           .select('*')
           .eq('job_id', jobId)
           .order('sent_at', { ascending: false })
           .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50))

         if (error) throw error
         return data
       }
     })
   }
   ```

3. **Caching Strategy**
   ```typescript
   // Audit trail data rarely changes after creation
   // Longer stale time for historical data
   export function useJobVersionHistory(jobId: string) {
     return useQuery({
       queryKey: ['job-version-history', jobId],
       queryFn: async () => {
         // ... fetch logic
       },
       staleTime: 10 * 60 * 1000, // 10 minutes (historical data doesn't change)
       cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
     })
   }
   ```

---

## 5. Component Architecture Blueprint

### 5.1 Core Component Palette (shadcn/ui)

#### Essential Components for Dashboard Pages

```typescript
// Layout Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Interactive Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Data Display Components (to be added)
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

// Icons (Lucide React)
import { Search, Filter, Plus, Edit, Trash, MapPin, Building2, User, Calendar, Clock, ... } from 'lucide-react'
```

#### Component Installation Requirements

```bash
# Components that need to be added to shadcn/ui
npx shadcn@latest add table
npx shadcn@latest add skeleton
npx shadcn@latest add alert
npx shadcn@latest add accordion
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
```

### 5.2 Reusable Pattern Components

#### Pattern 1: Page Header
```typescript
// components/patterns/PageHeader.tsx
interface PageHeaderProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
}

export function PageHeader({ title, description, primaryAction }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {primaryAction && (
        <Button onClick={primaryAction.onClick}>
          {primaryAction.label}
        </Button>
      )}
    </div>
  )
}

// Usage
<PageHeader
  title="Jobs Board"
  description="Manage interpreter assignments and commitments"
  primaryAction={{ label: "Create Job", onClick: () => router.push('/dashboard/jobs/new') }}
/>
```

#### Pattern 2: Search & Filter Bar
```typescript
// components/patterns/SearchFilterBar.tsx
interface SearchFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    label: string
    value: string
    options: { label: string; value: string }[]
    onChange: (value: string) => void
  }[]
  onClear?: () => void
  showClear?: boolean
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  filters,
  onClear,
  showClear
}: SearchFilterBarProps) {
  return (
    <div className="flex gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Dropdowns */}
      {filters?.map((filter) => (
        <Select
          key={filter.label}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear Button */}
      {showClear && onClear && (
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
```

#### Pattern 3: Loading Skeleton Grid
```typescript
// components/patterns/SkeletonGrid.tsx
interface SkeletonGridProps {
  count?: number
  columns?: 2 | 3 | 4
}

export function SkeletonGrid({ count = 6, columns = 3 }: SkeletonGridProps) {
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }[columns]

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-3/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

#### Pattern 4: Empty State
```typescript
// components/patterns/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-muted p-3">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Usage
<EmptyState
  icon={Briefcase}
  title="No Jobs Found"
  description="Get started by creating your first interpreter assignment"
  action={{ label: "Create Job", onClick: handleCreateJob }}
/>
```

#### Pattern 5: Error State
```typescript
// components/patterns/ErrorState.tsx
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Error Loading Data",
  message,
  onRetry
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        {onRetry && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 5.3 Typography System

**Standard Scale (Tailwind Classes):**
```typescript
// Page Titles
<h1 className="text-3xl font-bold tracking-tight">

// Section Titles
<h2 className="text-2xl font-semibold">

// Card Titles
<h3 className="text-lg font-semibold">

// Subsection Titles
<h4 className="text-base font-semibold">

// Body Text
<p className="text-sm">

// Muted Text
<p className="text-sm text-muted-foreground">

// Small Labels
<span className="text-xs text-muted-foreground uppercase tracking-wide">
```

**❌ Replace Custom Classes:**
```typescript
// OLD (custom CSS)
<h1 className="heading-1">
<h2 className="heading-2">
<p className="body-base">
<span className="caption">

// NEW (Tailwind utilities)
<h1 className="text-3xl font-bold tracking-tight">
<h2 className="text-2xl font-semibold">
<p className="text-sm">
<span className="text-xs text-muted-foreground uppercase tracking-wide">
```

### 5.4 Spacing & Layout System

**Container Spacing:**
```typescript
// Page-level container
<div className="container mx-auto p-6 space-y-6">

// Card padding (shadcn/ui default)
<Card>
  <CardHeader className="p-6"> {/* default */}
  <CardContent className="p-6 pt-0"> {/* default */}
  <CardFooter className="p-6 pt-0"> {/* default */}
</Card>

// Grid spacing
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Stack spacing
<div className="space-y-2"> {/* 8px */}
<div className="space-y-4"> {/* 16px */}
<div className="space-y-6"> {/* 24px */}
```

**Responsive Breakpoints:**
```typescript
// Tailwind default breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices
xl: '1280px'  // Extra large devices
2xl: '1536px' // 2X Extra large devices

// Grid responsive patterns
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
```

---

## 6. Data Flow & State Management Patterns

### 6.1 TanStack Query Architecture

**Current Implementation Analysis:**

**✅ GOOD - Organizations Page (Direct Supabase):**
```typescript
// Manual useState approach (simple, predictable)
const fetchOrganizations = useCallback(async () => {
  try {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('organizations').select('*')
    if (error) throw error
    setOrganizations(data || [])
  } finally {
    setIsLoading(false)
  }
}, [])
```

**✅ GOOD - Jobs Board (TanStack Query):**
```typescript
// lib/hooks/useJobs.ts
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('commitment_blocks')
        .select(`
          *,
          client_requests(*, language:languages(*)),
          interpreter:interpreters(*),
          location:locations(*, organization:organizations(*))
        `)
        .order('start_time', { ascending: true })

      if (error) throw new Error(error.message)
      return (data || []) as JobWithDetails[]
    },
  })
}

// Usage in component
const { data: jobs, isLoading, error } = useJobs()
```

**Comparison:**
- **Organizations:** Direct `useState` + `useCallback` (simple, less boilerplate)
- **Jobs/Interpreters:** TanStack Query (caching, refetching, optimistic updates)

**Recommendation:** Standardize on **TanStack Query** for all data fetching because:
1. Automatic background refetching
2. Cache invalidation and management
3. Optimistic updates for mutations
4. Parallel query support
5. Built-in loading/error states

### 6.2 Standard Data Fetching Pattern

**Blueprint for All List Pages:**
```typescript
// File: lib/hooks/use[Entity].ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { [Entity]WithDetails } from '@/types/database.types'

export function use[Entities]() {
  return useQuery({
    queryKey: ['[entities]'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('[table_name]')
        .select(`
          *,
          [relationships if needed]
        `)
        .order('[default_sort_field]', { ascending: true })

      if (error) throw new Error(error.message)
      return (data || []) as [Entity]WithDetails[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}

// File: app/(dashboard)/dashboard/[entities]/page.tsx
'use client'

export default function [Entities]Page() {
  const { data: [entities], isLoading, error, refetch } = use[Entities]()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})

  // Client-side filtering with useMemo
  const filtered[Entities] = useMemo(() => {
    let result = [entities] || []

    // Apply filters
    if (filters.type !== 'all') {
      result = result.filter(item => item.type === filters.type)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) // adjust fields
      )
    }

    return result
  }, [[entities], filters, searchQuery])

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isLoading) return <SkeletonGrid count={6} columns={3} />
  if (filtered[Entities].length === 0) return <EmptyState {...} />

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader {...} />
      <SearchFilterBar {...} />
      <ResultsCount total={[entities]?.length || 0} filtered={filtered[Entities].length} />
      <[Entity]Grid items={filtered[Entities]} />
    </div>
  )
}
```

### 6.3 Mutation Pattern (Create/Update/Delete)

```typescript
// File: lib/hooks/use[Entity]Mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCreate[Entity]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newData: Partial<[Entity]>) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('[table]')
        .insert(newData)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as [Entity]
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['[entities]'] })
    },
  })
}

export function useUpdate[Entity]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<[Entity]> }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('[table]')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as [Entity]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entities]'] })
    },
  })
}

export function useDelete[Entity]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('[table]')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[entities]'] })
    },
  })
}

// Usage in component
const createMutation = useCreate[Entity]()
const updateMutation = useUpdate[Entity]()
const deleteMutation = useDelete[Entity]()

const handleCreate = async () => {
  await createMutation.mutateAsync({ name: 'New Item' })
}
```

### 6.4 Filter & Search Pattern

**Standardized Client-Side Filtering:**
```typescript
// Reusable hook: lib/hooks/useEntityFilter.ts
export function useEntityFilter<T extends Record<string, any>>(
  items: T[] | undefined,
  searchFields: (keyof T)[],
  filters: Record<string, any>
) {
  return useMemo(() => {
    if (!items) return []

    let result = items

    // Apply object filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => item[key] === value)
      }
    })

    // Apply search across multiple fields
    const searchQuery = filters.search?.toLowerCase().trim()
    if (searchQuery) {
      result = result.filter(item =>
        searchFields.some(field =>
          String(item[field] || '').toLowerCase().includes(searchQuery)
        )
      )
    }

    return result
  }, [items, searchFields, filters])
}

// Usage
const filteredJobs = useEntityFilter(
  jobs,
  ['client_name', 'organization.name', 'interpreter.first_name'],
  { search: searchQuery, status: statusFilter }
)
```

---

## 7. Advanced Component Patterns

This section defines new component patterns required to display the complex relational data from the database schema.

### 7.1 Assignment Attempt List Component

**Purpose:** Display all interpreter assignment attempts for a job with status workflow visualization

**Component:** `components/jobs/AssignmentAttemptList.tsx`

```typescript
'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { User, CheckCircle, XCircle, Clock, Mail } from 'lucide-react'
import { useGroupedAttempts, useMarkDeclined, useMarkConfirmed } from '@/lib/hooks/useJobAssignmentTracker'
import type { JobAssignmentAttemptWithInterpreter } from '@/types/database.types'

interface AssignmentAttemptListProps {
  jobId: string
}

export function AssignmentAttemptList({ jobId }: AssignmentAttemptListProps) {
  const { grouped, isLoading } = useGroupedAttempts(jobId)
  const markDeclined = useMarkDeclined()
  const markConfirmed = useMarkConfirmed()

  const statusConfig = {
    pending: {
      icon: Clock,
      variant: 'secondary' as const,
      label: 'Pending Response'
    },
    declined: {
      icon: XCircle,
      variant: 'destructive' as const,
      label: 'Declined'
    },
    confirmed: {
      icon: CheckCircle,
      variant: 'default' as const,
      label: 'Confirmed'
    }
  }

  const renderAttempt = (attempt: JobAssignmentAttemptWithInterpreter) => {
    const config = statusConfig[attempt.status === 'contacted' ? 'pending' : attempt.status]
    const Icon = config.icon
    const interpreterName = `${attempt.interpreter.first_name} ${attempt.interpreter.last_name}`

    return (
      <div
        key={attempt.id}
        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Interpreter Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
            {attempt.interpreter.first_name[0]}{attempt.interpreter.last_name[0]}
          </div>

          {/* Interpreter Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{interpreterName}</p>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              <span>Contacted: {format(new Date(attempt.contacted_at), 'MMM d, h:mm a')}</span>
              {attempt.responded_at && (
                <span>Responded: {format(new Date(attempt.responded_at), 'MMM d, h:mm a')}</span>
              )}
            </div>
            {attempt.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">{attempt.notes}</p>
            )}
          </div>
        </div>

        {/* Actions (only for pending attempts) */}
        {(attempt.status === 'contacted' || attempt.status === 'pending') && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markDeclined.mutate({
                jobId,
                interpreterId: attempt.interpreter_id
              })}
              disabled={markDeclined.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Declined
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => markConfirmed.mutate({
                jobId,
                interpreterId: attempt.interpreter_id
              })}
              disabled={markConfirmed.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirmed
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading assignment attempts...</CardContent></Card>
  }

  const totalAttempts = (grouped.pending?.length || 0) + (grouped.declined?.length || 0) + (grouped.confirmed?.length || 0)

  if (totalAttempts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No interpreters contacted yet</p>
            <p className="text-sm mt-1">Use the Quick Assign table to contact interpreters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Assignment Attempts</CardTitle>
          <Badge variant="outline">{totalAttempts} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Attempts (always shown, not collapsible) */}
        {grouped.pending && grouped.pending.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Pending ({grouped.pending.length})
            </h4>
            <div className="space-y-2">
              {grouped.pending.map(renderAttempt)}
            </div>
          </div>
        )}

        {/* Confirmed/Declined in Accordion */}
        <Accordion type="multiple" className="space-y-2">
          {grouped.confirmed && grouped.confirmed.length > 0 && (
            <AccordionItem value="confirmed" className="border rounded-lg">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Confirmed ({grouped.confirmed.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-2">
                {grouped.confirmed.map(renderAttempt)}
              </AccordionContent>
            </AccordionItem>
          )}

          {grouped.declined && grouped.declined.length > 0 && (
            <AccordionItem value="declined" className="border rounded-lg">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Declined ({grouped.declined.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-2">
                {grouped.declined.map(renderAttempt)}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}
```

**Key Features:**
- Status-based grouping (pending always visible, confirmed/declined collapsible)
- Action buttons for pending attempts (Decline/Confirm)
- Timestamp display for contacted and responded dates
- Visual status indicators (icons + badges)
- Empty state with helpful message

---

### 7.2 Communication History Component

**Purpose:** Display email communication timeline with expandable details

**Component:** `components/jobs/CommunicationHistory.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Mail, Send, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { JobCommunication } from '@/types/database.types'

interface CommunicationHistoryProps {
  jobId: string
}

export function CommunicationHistory({ jobId }: CommunicationHistoryProps) {
  const { data: communications, isLoading } = useQuery({
    queryKey: ['job-communications', jobId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('job_communications')
        .select('*')
        .eq('job_id', jobId)
        .order('sent_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data as JobCommunication[]
    }
  })

  const typeConfig = {
    REQ: {
      label: 'Request',
      variant: 'secondary' as const,
      icon: Mail,
      color: 'text-blue-600'
    },
    CONF: {
      label: 'Confirmation',
      variant: 'default' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    REM: {
      label: 'Reminder',
      variant: 'outline' as const,
      icon: Clock,
      color: 'text-orange-600'
    }
  }

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading communications...</CardContent></Card>
  }

  if (!communications || communications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No emails sent yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Communication History</CardTitle>
          <Badge variant="outline">{communications.length} emails</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {communications.map((comm) => {
            const config = typeConfig[comm.communication_type]
            const Icon = config.icon

            return (
              <AccordionItem key={comm.id} value={comm.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left flex-1">
                    {/* Icon */}
                    <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />

                    {/* Email Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {comm.marked_sent && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Sent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        To: {comm.recipient_email || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(comm.sent_at), 'MMM d, yyyy • h:mm a')}
                        {comm.sent_by && ` • by ${comm.sent_by}`}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  {/* Email Details */}
                  <div className="space-y-3 pt-2">
                    {comm.subject && (
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Subject</label>
                        <p className="text-sm font-semibold mt-1">{comm.subject}</p>
                      </div>
                    )}
                    {comm.body && (
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Message</label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                          {comm.body}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
```

**Key Features:**
- Chronological timeline (newest first)
- Type-based visual indicators (REQ/CONF/REM)
- Expandable accordion for email body
- Sent status indicator
- Recipient and sender metadata

---

### 7.3 Audit Timeline Component

**Purpose:** Display status change history with timeline visualization

**Component:** `components/jobs/AuditTimeline.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { JobStatusHistory } from '@/types/database.types'

interface AuditTimelineProps {
  jobId: string
}

export function AuditTimeline({ jobId }: AuditTimelineProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['job-status-history', jobId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('job_status_history')
        .select('*')
        .eq('job_id', jobId)
        .order('changed_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data as JobStatusHistory[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (historical data)
  })

  const statusColors: Record<string, string> = {
    Initial: 'bg-gray-500',
    Pending: 'bg-yellow-500',
    Confirmed: 'bg-green-500',
    Completed: 'bg-blue-500',
    Cancelled: 'bg-red-500',
  }

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading history...</CardContent></Card>
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No status changes recorded</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Status History</CardTitle>
          <Badge variant="outline">{history.length} changes</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline Line */}
          <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />

          {/* Timeline Items */}
          {history.map((item, index) => (
            <div key={item.id} className="relative pl-12 pb-4 last:pb-0">
              {/* Timeline Dot */}
              <div className={`absolute left-3 w-4 h-4 rounded-full border-2 border-background ${statusColors[item.new_status] || 'bg-gray-500'}`} />

              {/* Content */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.old_status && (
                    <>
                      <Badge variant="outline">{item.old_status}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </>
                  )}
                  <Badge variant="default">{item.new_status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.changed_at), 'MMM d, yyyy • h:mm a')}
                </p>
                {item.changed_by && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{item.changed_by}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Key Features:**
- Vertical timeline visualization
- Color-coded status dots
- Before/after status display
- Timestamp and user attribution
- Compact, scannable format

---

### 7.4 Version History Component (Diff View)

**Purpose:** Display field-level changes from Google Calendar syncs and manual edits

**Component:** `components/jobs/VersionHistory.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { GitBranch, CalendarSync, Edit, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { JobVersionHistory } from '@/types/database.types'

interface VersionHistoryProps {
  jobId: string
}

export function VersionHistory({ jobId }: VersionHistoryProps) {
  const { data: versions, isLoading } = useQuery({
    queryKey: ['job-version-history', jobId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('job_version_history')
        .select('*')
        .eq('commitment_block_id', jobId)
        .order('version_number', { ascending: false })

      if (error) throw new Error(error.message)
      return data as JobVersionHistory[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const sourceConfig = {
    gcal_sync: {
      label: 'Google Calendar Sync',
      icon: CalendarSync,
      variant: 'secondary' as const,
      color: 'text-blue-600'
    },
    manual_edit: {
      label: 'Manual Edit',
      icon: Edit,
      variant: 'outline' as const,
      color: 'text-orange-600'
    },
    api: {
      label: 'API',
      icon: Zap,
      variant: 'default' as const,
      color: 'text-purple-600'
    }
  }

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading version history...</CardContent></Card>
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No version history available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Version History</CardTitle>
          <Badge variant="outline">v{versions[0]?.version_number || 1}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {versions.map((version) => {
            const config = sourceConfig[version.change_source as keyof typeof sourceConfig] || sourceConfig.api
            const Icon = config.icon
            const changedFields = Object.keys(version.changed_fields)

            return (
              <AccordionItem key={version.id} value={version.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left flex-1">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Version {version.version_number}</span>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(version.changed_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {changedFields.length} field{changedFields.length !== 1 ? 's' : ''} changed
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 pt-2">
                    {changedFields.map((field) => {
                      const oldValue = version.previous_values[field]
                      const newValue = version.new_values[field]

                      return (
                        <div key={field} className="border-l-2 border-muted pl-3">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {field.replace(/_/g, ' ')}
                          </label>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                Old
                              </Badge>
                              <span className="text-sm font-mono line-through text-muted-foreground">
                                {oldValue !== null && oldValue !== undefined ? String(oldValue) : 'null'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                New
                              </Badge>
                              <span className="text-sm font-mono font-semibold">
                                {newValue !== null && newValue !== undefined ? String(newValue) : 'null'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
```

**Key Features:**
- Version number tracking
- Change source identification (GCal sync, manual, API)
- Field-level diff view (old value → new value)
- Color-coded old/new values (red strikethrough → green bold)
- Expandable accordion for details

---

### 7.5 Unavailability Calendar Component

**Purpose:** Display and manage interpreter unavailability time blocks

**Component:** `components/interpreters/UnavailabilityCalendar.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { InterpreterUnavailability } from '@/types/database.types'

interface UnavailabilityCalendarProps {
  interpreterId: string
}

export function UnavailabilityCalendar({ interpreterId }: UnavailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const queryClient = useQueryClient()

  // Fetch unavailability blocks
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['interpreter-unavailability', interpreterId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('interpreter_unavailability')
        .select('*')
        .eq('interpreter_id', interpreterId)
        .gte('end_time', new Date().toISOString()) // Only future/current blocks
        .order('start_time', { ascending: true })

      if (error) throw new Error(error.message)
      return data as InterpreterUnavailability[]
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('interpreter_unavailability')
        .delete()
        .eq('id', blockId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interpreter-unavailability', interpreterId] })
    }
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Helper: Check if date has unavailability
  const hasUnavailability = (date: Date) => {
    return blocks?.some(block => {
      const blockStart = new Date(block.start_time)
      const blockEnd = new Date(block.end_time)
      return date >= blockStart && date <= blockEnd
    })
  }

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading availability...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Unavailability Calendar</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Block
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {daysInMonth.map((day) => {
            const unavailable = hasUnavailability(day)
            const today = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`
                  aspect-square p-2 border rounded-lg text-center text-sm
                  ${today ? 'border-primary font-semibold' : 'border-border'}
                  ${unavailable ? 'bg-red-50 text-red-700 font-semibold' : 'bg-card'}
                  hover:bg-muted/50 transition-colors cursor-pointer
                `}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>

        {/* Unavailability List */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming Unavailability
            </h4>
            <div className="space-y-2">
              {blocks.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {format(new Date(block.start_time), 'MMM d')} -{' '}
                        {format(new Date(block.end_time), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {block.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{block.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(block.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Key Features:**
- Monthly calendar grid view
- Visual blocking of unavailable dates (red highlight)
- List view of upcoming blocks
- Add/delete functionality
- Navigation between months

---

### 7.6 Multi-Client Request Display

**Purpose:** Handle one-to-many relationship where one job has multiple client requests

**Component:** `components/jobs/ClientRequestList.tsx`

```typescript
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Plus, Edit } from 'lucide-react'
import type { ClientRequest } from '@/types/database.types'

interface ClientRequestListProps {
  requests: (ClientRequest & { language?: { name: string } | null })[]
  onAddRequest?: () => void
  onEditRequest?: (requestId: string) => void
}

export function ClientRequestList({ requests, onAddRequest, onEditRequest }: ClientRequestListProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Client Requests</CardTitle>
            {onAddRequest && (
              <Button variant="outline" size="sm" onClick={onAddRequest}>
                <Plus className="h-4 w-4 mr-1" />
                Add Request
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No client requests yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Client Requests</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{requests.length} client{requests.length !== 1 ? 's' : ''}</Badge>
            {onAddRequest && (
              <Button variant="outline" size="sm" onClick={onAddRequest}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Client Name + Language */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h4 className="font-semibold">{request.client_name}</h4>
                  {request.language && (
                    <Badge variant="secondary">{request.language.name}</Badge>
                  )}
                </div>

                {/* Case Details */}
                {(request.case_number || request.meeting_type) && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {request.case_number && request.meeting_type && (
                      <p>
                        {request.case_number} — {request.meeting_type}
                      </p>
                    )}
                    {request.case_number && !request.meeting_type && <p>Case: {request.case_number}</p>}
                    {!request.case_number && request.meeting_type && <p>Type: {request.meeting_type}</p>}
                  </div>
                )}

                {/* Charges */}
                {request.charges && (
                  <p className="text-sm text-muted-foreground italic">
                    {request.charges}
                  </p>
                )}

                {/* Request Received Badge */}
                {request.request_received && (
                  <Badge variant="outline" className="text-xs">
                    Request Received
                  </Badge>
                )}
              </div>

              {/* Edit Button */}
              {onEditRequest && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditRequest(request.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**Key Features:**
- Handles multiple requests gracefully
- Clear visual separation between requests
- Language badge per request
- Request received indicator
- Add/edit functionality

---

## 8. Page-by-Page Redesign Specifications

### 8.1 Jobs Board Page Redesign

**Current Issues:**
- Table-based layout (not responsive)
- Custom CSS classes (`.heading-2`, `.button`, `.card`)
- No shadcn/ui Card components
- Inconsistent loading states

**Redesign Specification:**

#### New Component Structure
```typescript
// app/(dashboard)/dashboard/jobs/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Briefcase } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/patterns/PageHeader'
import { SearchFilterBar } from '@/components/patterns/SearchFilterBar'
import { SkeletonGrid } from '@/components/patterns/SkeletonGrid'
import { EmptyState } from '@/components/patterns/EmptyState'
import { ErrorState } from '@/components/patterns/ErrorState'
import { useJobs } from '@/lib/hooks/useJobs'
import { format } from 'date-fns'

type FilterState = {
  status: string
  modality: string
}

export default function JobsBoardPage() {
  const router = useRouter()
  const { data: jobs, isLoading, error, refetch } = useJobs()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    modality: 'all',
  })

  // Extract unique values for filters
  const statusOptions = useMemo(() => {
    if (!jobs) return []
    const statuses = new Set(jobs.map(j => j.status).filter(Boolean))
    return [
      { label: 'All Statuses', value: 'all' },
      ...Array.from(statuses).map(s => ({ label: s, value: s }))
    ]
  }, [jobs])

  const modalityOptions = useMemo(() => {
    if (!jobs) return []
    const modalities = new Set(jobs.map(j => j.modality).filter(Boolean))
    return [
      { label: 'All Modalities', value: 'all' },
      ...Array.from(modalities).map(m => ({ label: m, value: m }))
    ]
  }, [jobs])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    let result = jobs || []

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(j => j.status === filters.status)
    }

    // Modality filter
    if (filters.modality !== 'all') {
      result = result.filter(j => j.modality === filters.modality)
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(j => {
        const clientRequest = j.client_requests?.[0]
        const language = clientRequest?.language?.name || ''
        const org = j.location?.organization?.name || ''
        const interpreter = j.interpreter
          ? `${j.interpreter.first_name} ${j.interpreter.last_name}`
          : ''

        return (
          language.toLowerCase().includes(query) ||
          org.toLowerCase().includes(query) ||
          interpreter.toLowerCase().includes(query)
        )
      })
    }

    return result
  }, [jobs, filters, searchQuery])

  const hasActiveFilters = searchQuery || filters.status !== 'all' || filters.modality !== 'all'

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Jobs Board" />
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load jobs'}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Jobs Board"
        description="Manage interpreter assignments and commitments"
        primaryAction={{
          label: 'Create Job',
          onClick: () => router.push('/dashboard/jobs/new')
        }}
      />

      {/* Search & Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            label: 'Status',
            value: filters.status,
            options: statusOptions,
            onChange: (value) => setFilters(prev => ({ ...prev, status: value }))
          },
          {
            label: 'Modality',
            value: filters.modality,
            options: modalityOptions,
            onChange: (value) => setFilters(prev => ({ ...prev, modality: value }))
          }
        ]}
        showClear={hasActiveFilters}
        onClear={() => {
          setSearchQuery('')
          setFilters({ status: 'all', modality: 'all' })
        }}
      />

      {/* Results Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {jobs?.length || 0} jobs
        </p>
      )}

      {/* Loading State */}
      {isLoading && <SkeletonGrid count={6} columns={3} />}

      {/* Empty State */}
      {!isLoading && filteredJobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title={hasActiveFilters ? "No Jobs Found" : "No Jobs Yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Get started by creating your first interpreter assignment"
          }
          action={
            !hasActiveFilters
              ? { label: "Create Job", onClick: () => router.push('/dashboard/jobs/new') }
              : undefined
          }
        />
      )}

      {/* Jobs Grid */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const startTime = job.start_time ? new Date(job.start_time) : null
            const clientRequest = job.client_requests?.[0]
            const language = clientRequest?.language?.name || 'Unknown Language'
            const organization = job.location?.organization?.name || 'Unknown Organization'
            const interpreterName = job.interpreter
              ? `${job.interpreter.first_name} ${job.interpreter.last_name}`
              : 'Unassigned'
            const status = job.status || 'Initial'
            const modality = job.modality || 'TBD'

            // Status badge variant
            const statusVariant = {
              'Confirmed': 'default',
              'Pending': 'secondary',
              'Initial': 'outline',
              'Cancelled': 'destructive',
            }[status] as 'default' | 'secondary' | 'outline' | 'destructive' || 'outline'

            return (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={statusVariant}>{status}</Badge>
                    <Badge variant="outline">{modality}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mt-2">{language}</h3>
                </CardHeader>

                <CardContent className="flex-1 space-y-2 text-sm">
                  {startTime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(startTime, 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {startTime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{format(startTime, 'h:mm a')}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{organization}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className={interpreterName === 'Unassigned' ? 'italic' : ''}>
                      {interpreterName}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**Key Improvements:**
- ✅ Full shadcn/ui component adoption
- ✅ Card-based grid layout (responsive)
- ✅ Consistent loading/error/empty states
- ✅ Search + multi-filter capability
- ✅ Icon-text semantic pairing
- ✅ Tailwind typography (no custom classes)

### 8.2 Job Detail Page Redesign

**Current Issues:**
- Partial shadcn/ui adoption
- Custom `.card`, `.section-divider`, `.info-field` classes
- Mixed typography scales
- Collapsible `<details>` instead of Accordion

**Redesign Specification:**

#### Component Refactoring Strategy

**Step 1: Refactor `JobOverviewCard.tsx`**

```typescript
// components/jobs/JobOverviewCard.tsx (REFACTORED)
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Video } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useUpdateJob, useUpdateJobStatus, useDeleteJob } from '@/lib/hooks/useJob'
import type { JobWithDetails } from '@/types/database.types'

interface JobOverviewCardProps {
  job: JobWithDetails
}

const STATUS_OPTIONS = ['Initial', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
const MODALITY_OPTIONS = ['Zoom', 'In-Person', 'Phone', 'TBD']

export function JobOverviewCard({ job }: JobOverviewCardProps) {
  const updateJob = useUpdateJob()
  const updateStatus = useUpdateJobStatus()
  const deleteJob = useDeleteJob()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const startTime = job.start_time ? new Date(job.start_time) : null
  const endTime = job.end_time ? new Date(job.end_time) : null
  const durationMinutes = job.duration || 0
  const durationHours = Math.round(durationMinutes / 60 * 10) / 10

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus.mutateAsync({
      jobId: job.id,
      newStatus,
      oldStatus: job.status || 'Initial',
    })
  }

  const handleModalityChange = async (newModality: string) => {
    await updateJob.mutateAsync({
      jobId: job.id,
      updates: { modality: newModality },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Commitment Details</CardTitle>
          <Select value={job.status || 'Initial'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date & Time */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Date & Time
          </label>
          {startTime ? (
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(startTime, 'EEEE, MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(startTime, 'h:mm a')}
                  {endTime && ` - ${format(endTime, 'h:mm a')}`}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Not scheduled</p>
          )}
        </div>

        {/* Duration (if > 2 hours) */}
        {durationHours > 2 && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Duration
            </label>
            <p className="text-sm font-medium mt-1">
              {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
            </p>
          </div>
        )}

        {/* Modality */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Modality
          </label>
          <Select value={job.modality || 'TBD'} onValueChange={handleModalityChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map(modality => (
                <SelectItem key={modality} value={modality}>{modality}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Request Details */}
        {job.client_requests && job.client_requests.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Client Requests
              </label>
              <Button variant="ghost" size="sm">+ Add</Button>
            </div>

            {job.client_requests.map((request) => (
              <div key={request.id} className="mb-3 last:mb-0 p-3 rounded-lg bg-muted/50">
                <p className="font-semibold text-sm">{request.client_name}</p>
                {request.case_number && request.meeting_type && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.case_number} — {request.meeting_type}
                  </p>
                )}
                {request.charges && (
                  <p className="text-xs text-muted-foreground mt-1">{request.charges}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 items-stretch">
        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Job
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={async () => {
                await deleteJob.mutateAsync(job.id)
              }}
              disabled={deleteJob.isPending}
            >
              {deleteJob.isPending ? 'Deleting...' : 'Confirm Delete'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
```

**Step 2: Replace `<details>` with shadcn/ui Accordion**

```typescript
// Before (HTML details)
<details className="bg-white rounded-lg shadow-sm border p-6">
  <summary className="cursor-pointer font-semibold">Email Composer</summary>
  <div className="mt-4">
    <EmailComposer job={job} />
  </div>
</details>

// After (shadcn/ui Accordion)
<Accordion type="single" collapsible>
  <AccordionItem value="email">
    <AccordionTrigger>Email Composer</AccordionTrigger>
    <AccordionContent>
      <EmailComposer job={job} />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Step 3: Standardize Page Layout**

```typescript
// app/(dashboard)/dashboard/jobs/[id]/page.tsx (REFACTORED)
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useJob } from '@/lib/hooks/useJob'
import { useInterpreterMatches } from '@/lib/hooks/useInterpreterMatches'
import { JobOverviewCard } from '@/components/jobs/JobOverviewCard'
import { OrganizationLocationCard } from '@/components/jobs/OrganizationLocationCard'
import { InterpreterManagement } from '@/components/jobs/InterpreterManagement'
import { JobNotesSection } from '@/components/jobs/JobNotesSection'
import { EmailComposer } from '@/components/jobs/EmailComposer'
import { SkeletonGrid } from '@/components/patterns/SkeletonGrid'
import { ErrorState } from '@/components/patterns/ErrorState'

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params?.id as string
  const { data: job, isLoading, error } = useJob(jobId)
  const { data: matchData } = useInterpreterMatches(job)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <SkeletonGrid count={2} columns={2} />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <ErrorState
          message={error instanceof Error ? error.message : 'Job not found'}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Navigation */}
      <Link href="/dashboard/jobs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs Board
        </Button>
      </Link>

      {/* Job Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {job.client_requests?.[0]?.language?.name || 'Unknown Language'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {job.interpreter
            ? `${job.interpreter.first_name} ${job.interpreter.last_name}`
            : 'Unassigned'
          } — {job.modality || 'TBD'}
        </p>
      </div>

      {/* Two-Column Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <JobOverviewCard job={job} />
        <OrganizationLocationCard job={job} />
      </div>

      {/* Interpreter Management */}
      <InterpreterManagement job={job} />

      {/* Job Notes */}
      <JobNotesSection jobId={job.id} />

      {/* Collapsible Sections */}
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="email">
          <AccordionTrigger>Email Composer</AccordionTrigger>
          <AccordionContent>
            <EmailComposer job={job} />
          </AccordionContent>
        </AccordionItem>

        {matchData && matchData.unavailable.length > 0 && (
          <AccordionItem value="unavailable">
            <AccordionTrigger>
              Unavailable Interpreters ({matchData.unavailable.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {matchData.unavailable.map(({ interpreter, reason }) => (
                  <div
                    key={interpreter.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm">
                      {interpreter.first_name} {interpreter.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}
```

### 8.3 Interpreters Page Redesign

**Current Issues:**
- Heaviest custom CSS usage (`.container`, `.heading-1`, `.input`, `.loading`)
- Inline CSS variable styles
- Custom `.select` class
- InterpreterCard uses custom classes

**Redesign Specification:**

**Step 1: Refactor InterpreterCard Component**

```typescript
// components/interpreters/InterpreterCard.tsx (REFACTORED)
'use client'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, MapPin, Mail, Phone, Building } from 'lucide-react'
import type { InterpreterWithLanguages } from '@/types/database.types'
import { getHighestCertification } from '@/lib/hooks/useInterpreterFilters'

interface InterpreterCardProps {
  interpreter: InterpreterWithLanguages
  onClick?: () => void
}

export function InterpreterCard({ interpreter, onClick }: InterpreterCardProps) {
  const highestCert = getHighestCertification(interpreter)
  const languages = interpreter.interpreter_languages || []
  const displayLanguages = languages.slice(0, 3)
  const remainingCount = languages.length - 3

  const initials = `${interpreter.first_name?.[0] || ''}${interpreter.last_name?.[0] || ''}`.toUpperCase()

  const certVariant = {
    'Certified': 'default',
    'Registered': 'secondary',
    'Non-certified': 'outline',
  }[highestCert] as 'default' | 'secondary' | 'outline'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Toast notification
  }

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {initials}
          </div>

          {/* Name + Certification */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {interpreter.first_name} {interpreter.last_name}
            </h3>
            {highestCert !== 'Non-certified' && (
              <Badge variant={certVariant} className="mt-1">
                {highestCert}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Languages
            </label>
            <ul className="mt-1 space-y-1">
              {displayLanguages.map((il) => (
                <li key={il.id} className="text-sm flex items-center gap-2">
                  <span>🌐</span>
                  <span>
                    {il.language?.name}
                    {il.certification && (
                      <span className="text-muted-foreground ml-1">
                        ({il.certification})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{remainingCount} more
              </p>
            )}
          </div>
        )}

        {/* Location */}
        {(interpreter.city || interpreter.state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {interpreter.city}
              {interpreter.city && interpreter.state && ', '}
              {interpreter.state}
              {interpreter.is_local && (
                <Badge variant="outline" className="ml-2 text-xs">Local</Badge>
              )}
            </span>
          </div>
        )}

        {/* Contact */}
        <div className="space-y-2 pt-4 border-t">
          {interpreter.email && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm truncate">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{interpreter.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(interpreter.email!)
                }}
              >
                Copy
              </Button>
            </div>
          )}

          {interpreter.phone && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{interpreter.phone}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(interpreter.phone!)
                }}
              >
                Copy
              </Button>
            </div>
          )}
        </div>

        {/* Agency */}
        {interpreter.is_agency && interpreter.agency_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
            <Building className="h-4 w-4" />
            <span>Agency: {interpreter.agency_name}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {interpreter.email && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `mailto:${interpreter.email}`
            }}
          >
            Email
          </Button>
        )}
        {interpreter.phone && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `tel:${interpreter.phone}`
            }}
          >
            Call
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

**Step 2: Refactor Main Page**

```typescript
// app/(dashboard)/dashboard/interpreters/page.tsx (REFACTORED)
'use client'

import { useState, useMemo } from 'react'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/patterns/PageHeader'
import { SearchFilterBar } from '@/components/patterns/SearchFilterBar'
import { SkeletonGrid } from '@/components/patterns/SkeletonGrid'
import { EmptyState } from '@/components/patterns/EmptyState'
import { ErrorState } from '@/components/patterns/ErrorState'
import { InterpreterCard } from '@/components/interpreters/InterpreterCard'
import { useInterpreters } from '@/lib/hooks/useInterpreters'

type FilterState = {
  language: string
  city: string
  certification: string
}

export default function InterpretersPage() {
  const { data: interpreters, isLoading, error, refetch } = useInterpreters()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    language: 'all',
    city: 'all',
    certification: 'all',
  })

  // Extract unique values
  const availableLanguages = useMemo(() => {
    if (!interpreters) return []
    const languageMap = new Map<string, { id: string; name: string }>()
    interpreters.forEach(interp => {
      interp.interpreter_languages?.forEach((il: any) => {
        if (il.language_id && il.language?.name) {
          languageMap.set(il.language_id, {
            id: il.language_id,
            name: il.language.name,
          })
        }
      })
    })
    return [
      { label: 'All Languages', value: 'all' },
      ...Array.from(languageMap.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(l => ({ label: l.name, value: l.id }))
    ]
  }, [interpreters])

  const availableCities = useMemo(() => {
    if (!interpreters) return []
    const citySet = new Set<string>()
    interpreters.forEach(interp => {
      if (interp.city?.trim()) citySet.add(interp.city.trim())
    })
    return [
      { label: 'All Cities', value: 'all' },
      ...Array.from(citySet).sort().map(c => ({ label: c, value: c }))
    ]
  }, [interpreters])

  const certificationOptions = [
    { label: 'All Certifications', value: 'all' },
    { label: 'Certified', value: 'Certified' },
    { label: 'Registered', value: 'Registered' },
    { label: 'Non-certified', value: 'Non-certified' },
  ]

  // Filtered interpreters
  const filteredInterpreters = useMemo(() => {
    let result = interpreters || []

    // Language filter
    if (filters.language !== 'all') {
      result = result.filter(interp =>
        interp.interpreter_languages?.some((il: any) => il.language_id === filters.language)
      )
    }

    // City filter
    if (filters.city !== 'all') {
      result = result.filter(interp => interp.city === filters.city)
    }

    // Certification filter
    if (filters.certification !== 'all') {
      result = result.filter(interp => {
        const highestCert = getHighestCertification(interp)
        return highestCert === filters.certification
      })
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(interp => {
        const fullName = `${interp.first_name} ${interp.last_name}`.toLowerCase()
        const email = interp.email?.toLowerCase() || ''
        const city = interp.city?.toLowerCase() || ''
        const languages = interp.interpreter_languages
          ?.map((il: any) => il.language?.name.toLowerCase())
          .join(' ') || ''

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          city.includes(query) ||
          languages.includes(query)
        )
      })
    }

    return result
  }, [interpreters, filters, searchQuery])

  const hasActiveFilters =
    searchQuery ||
    filters.language !== 'all' ||
    filters.city !== 'all' ||
    filters.certification !== 'all'

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Interpreter Directory" />
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load interpreters'}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Interpreter Directory"
        description="Manage your network of certified and registered interpreters"
      />

      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            label: 'Language',
            value: filters.language,
            options: availableLanguages,
            onChange: (value) => setFilters(prev => ({ ...prev, language: value }))
          },
          {
            label: 'City',
            value: filters.city,
            options: availableCities,
            onChange: (value) => setFilters(prev => ({ ...prev, city: value }))
          },
          {
            label: 'Certification',
            value: filters.certification,
            options: certificationOptions,
            onChange: (value) => setFilters(prev => ({ ...prev, certification: value }))
          }
        ]}
        showClear={hasActiveFilters}
        onClear={() => {
          setSearchQuery('')
          setFilters({ language: 'all', city: 'all', certification: 'all' })
        }}
      />

      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredInterpreters.length} of {interpreters?.length || 0} interpreters
        </p>
      )}

      {isLoading && <SkeletonGrid count={8} columns={4} />}

      {!isLoading && filteredInterpreters.length === 0 && (
        <EmptyState
          icon={Users}
          title={hasActiveFilters ? "No Interpreters Found" : "No Interpreters Yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Get started by adding your first interpreter to the directory"
          }
        />
      )}

      {!isLoading && filteredInterpreters.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredInterpreters.map((interpreter) => (
            <InterpreterCard
              key={interpreter.id}
              interpreter={interpreter}
              onClick={() => {
                // Future: Navigate to interpreter detail page
                console.log('Clicked:', interpreter.id)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 9. Implementation Roadmap

### 9.1 Phase 1: Foundation & Data Hooks (Week 1)

**Goal:** Establish reusable component patterns, install missing shadcn/ui components, and create comprehensive data fetching hooks

#### Tasks

**1. Install Missing shadcn/ui Components**
   ```bash
   npx shadcn@latest add table
   npx shadcn@latest add skeleton
   npx shadcn@latest add alert
   npx shadcn@latest add accordion
   npx shadcn@latest add dialog
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add tabs
   ```

**2. Create Comprehensive Data Hooks**
   - [ ] `lib/hooks/useJobWithFullDetails.ts` - Full job query with all nested relations
   - [ ] `lib/hooks/useJobCommunications.ts` - Job email communications
   - [ ] `lib/hooks/useJobStatusHistory.ts` - Status change audit trail
   - [ ] `lib/hooks/useJobVersionHistory.ts` - GCal sync version history
   - [ ] `lib/hooks/useInterpreterWithFullDetails.ts` - Interpreter with unavailability
   - [ ] `lib/hooks/useInterpreterUnavailability.ts` - Unavailability CRUD operations
   - [ ] Update `types/database.types.ts` with comprehensive nested types

**3. Create Advanced Component Patterns**
   - [ ] `components/jobs/AssignmentAttemptList.tsx` (Section 7.1)
   - [ ] `components/jobs/CommunicationHistory.tsx` (Section 7.2)
   - [ ] `components/jobs/AuditTimeline.tsx` (Section 7.3)
   - [ ] `components/jobs/VersionHistory.tsx` (Section 7.4)
   - [ ] `components/interpreters/UnavailabilityCalendar.tsx` (Section 7.5)
   - [ ] `components/jobs/ClientRequestList.tsx` (Section 7.6)

**4. Create Basic Pattern Components** (from original blueprint)
   - [ ] `components/patterns/PageHeader.tsx`
   - [ ] `components/patterns/SearchFilterBar.tsx`
   - [ ] `components/patterns/SkeletonGrid.tsx`
   - [ ] `components/patterns/EmptyState.tsx`
   - [ ] `components/patterns/ErrorState.tsx`
   - [ ] `components/patterns/ResultsCount.tsx`

**5. Migrate Organizations Page to TanStack Query**
   - [ ] Create `lib/hooks/useOrganizations.ts`
   - [ ] Create `lib/hooks/useOrganizationMutations.ts`
   - [ ] Update organizations page to use hooks
   - [ ] Test data fetching and mutations

**6. Document Patterns**
   - [ ] Update `ARCHITECTURAL-BLUEPRINT-UI-COHESION.md` (this document)
   - [ ] Create `docs/component-patterns.md`
   - [ ] Create `docs/data-fetching-patterns.md`

**Deliverables:**
- ✅ All shadcn/ui components installed
- ✅ 6 advanced component patterns (assignment, communication, audit, version, unavailability, multi-request)
- ✅ 6 basic pattern components
- ✅ 10+ comprehensive data hooks
- ✅ Updated TypeScript types
- ✅ Organizations page using TanStack Query
- ✅ Pattern documentation

### 9.2 Phase 2: Jobs Board Redesign (Week 2)

**Goal:** Establish reusable component patterns and install missing shadcn/ui components

#### Tasks
1. **Install Missing shadcn/ui Components**
   ```bash
   npx shadcn@latest add table
   npx shadcn@latest add skeleton
   npx shadcn@latest add alert
   npx shadcn@latest add accordion
   npx shadcn@latest add dialog
   npx shadcn@latest add dropdown-menu
   ```

2. **Create Pattern Components**
   - [ ] `components/patterns/PageHeader.tsx`
   - [ ] `components/patterns/SearchFilterBar.tsx`
   - [ ] `components/patterns/SkeletonGrid.tsx`
   - [ ] `components/patterns/EmptyState.tsx`
   - [ ] `components/patterns/ErrorState.tsx`
   - [ ] `components/patterns/ResultsCount.tsx`

3. **Migrate Organizations Page to TanStack Query**
   - [ ] Create `lib/hooks/useOrganizations.ts`
   - [ ] Create `lib/hooks/useOrganizationMutations.ts`
   - [ ] Update organizations page to use hooks
   - [ ] Test data fetching and mutations

4. **Document Patterns**
   - [ ] Create `docs/component-patterns.md`
   - [ ] Add Storybook stories for pattern components (optional)

**Deliverables:**
- ✅ All shadcn/ui components installed
- ✅ 5 reusable pattern components
- ✅ Organizations page using TanStack Query
- ✅ Pattern documentation

### 9.2 Phase 2: Jobs Board Redesign (Week 2)

**Goal:** Transform jobs board from table-based to card-based layout

#### Tasks
1. **Create New JobCard Component**
   - [ ] `components/jobs/JobCard.tsx` (shadcn/ui Card-based)
   - [ ] Display job metadata (date, time, language, org, interpreter)
   - [ ] Status and modality badges
   - [ ] View details button

2. **Refactor Jobs Board Page**
   - [ ] Replace table with card grid
   - [ ] Implement PageHeader pattern
   - [ ] Implement SearchFilterBar pattern
   - [ ] Add status and modality filters
   - [ ] Use SkeletonGrid for loading
   - [ ] Use EmptyState for no results
   - [ ] Remove all custom CSS classes

3. **Update Data Hooks**
   - [ ] Verify `useJobs()` hook structure
   - [ ] Add `useJobFilters()` hook for client-side filtering

4. **Testing & Validation**
   - [ ] Test responsive behavior (mobile, tablet, desktop)
   - [ ] Test search functionality
   - [ ] Test filter combinations
   - [ ] Test loading and error states

**Deliverables:**
- ✅ JobCard component
- ✅ Redesigned jobs board page (card grid)
- ✅ Full shadcn/ui adoption (0 custom classes)
- ✅ Responsive design validation

### 9.3 Phase 3: Job Detail Page Redesign with New Components (Weeks 3-4)

**Goal:** Completely redesign job detail page to display all schema features using new component patterns

**CRITICAL:** This is now the most complex phase due to database schema features

#### Tasks

**1. Update JobOverviewCard to Handle Multi-Client Requests**
   - [ ] Replace with `ClientRequestList` component (Section 7.6)
   - [ ] Support multiple client requests per job
   - [ ] Display all languages (not just first one)
   - [ ] Show request_received status per request

**2. Add Assignment Workflow Section**
   - [ ] Integrate `AssignmentAttemptList` component (Section 7.1)
   - [ ] Show pending, declined, confirmed attempts
   - [ ] Add action buttons for status updates
   - [ ] Connect to existing `useJobAssignmentTracker` hook

**3. Add Communication History Section**
   - [ ] Integrate `CommunicationHistory` component (Section 7.2)
   - [ ] Display REQ/CONF/REM email timeline
   - [ ] Expandable accordion for email bodies
   - [ ] Create `useJobCommunications` hook

**4. Add Audit Trail Section**
   - [ ] Integrate `AuditTimeline` component (Section 7.3)
   - [ ] Display status change history
   - [ ] Show who changed what when
   - [ ] Create `useJobStatusHistory` hook

**5. Add Version History Section (Accordion)**
   - [ ] Integrate `VersionHistory` component (Section 7.4)
   - [ ] Display GCal sync changes
   - [ ] Show field-level diffs
   - [ ] Create `useJobVersionHistory` hook

**6. Add Modality-Specific Instructions**
   - [ ] Display organization zoom_instructions when modality = "Zoom"
   - [ ] Display organization in_person_instructions when modality = "In-Person"
   - [ ] Display organization phone_instructions when modality = "Phone"
   - [ ] Dynamic rendering based on job.modality

**7. Update Data Fetching**
   - [ ] Replace `useJob()` with `useJobWithFullDetails()`
   - [ ] Load all nested relations in single query
   - [ ] Implement selective loading for performance
   - [ ] Add pagination for large communication lists

**8. Refactor Existing Components**
   - [ ] Update `JobOverviewCard` to shadcn/ui structure
   - [ ] Update `OrganizationLocationCard` to shadcn/ui
   - [ ] Replace `<details>` with Accordion components
   - [ ] Remove all custom CSS classes

**9. Page Layout Restructure**
```typescript
Job Detail Page Structure (NEW):
├── Back Navigation + Job Title
├── Two-Column Grid
│   ├── Left Column
│   │   ├── JobOverviewCard (status, modality, time)
│   │   └── ClientRequestList (multiple requests)
│   └── Right Column
│       ├── OrganizationLocationCard
│       └── Modality Instructions (dynamic)
├── Assignment Workflow Section
│   └── AssignmentAttemptList (pending/declined/confirmed)
├── InterpreterManagement (existing, refactored)
├── JobNotesSection (existing)
└── Accordion Sections (collapsible)
    ├── Communication History
    ├── Status Audit Trail
    ├── Version History (GCal sync)
    └── Email Composer (existing)
```

**10. Testing & Validation**
   - [ ] Test with jobs having multiple client requests
   - [ ] Test with jobs having assignment attempt history
   - [ ] Test with jobs having communication history
   - [ ] Test modality-specific instruction display
   - [ ] Test version history diff view
   - [ ] Verify performance with large datasets

**Deliverables:**
- ✅ Fully refactored job detail page
- ✅ All 6 new advanced components integrated
- ✅ Comprehensive data hooks implemented
- ✅ Multi-client request support
- ✅ Full assignment workflow visibility
- ✅ Complete audit trail display
- ✅ Performance-optimized data fetching

### 9.4 Phase 4: Interpreters Page Redesign (Week 5)

**Goal:** Standardize job detail page with consistent component architecture

#### Tasks
1. **Refactor JobOverviewCard**
   - [ ] Convert to shadcn/ui Card structure
   - [ ] Replace custom CSS classes with Tailwind
   - [ ] Use Select for status/modality dropdowns
   - [ ] Improve date/time display with icons
   - [ ] Add edit modals using Dialog component

2. **Refactor OrganizationLocationCard**
   - [ ] Convert to shadcn/ui Card structure
   - [ ] Standardize typography and spacing
   - [ ] Add location icon indicators

3. **Replace Details with Accordion**
   - [ ] Convert email composer to Accordion
   - [ ] Convert unavailable interpreters to Accordion
   - [ ] Add more collapsible sections if needed

4. **Improve Navigation**
   - [ ] Add breadcrumb navigation
   - [ ] Standardize back button with icon

5. **Testing & Validation**
   - [ ] Test all interactive elements
   - [ ] Test modal functionality
   - [ ] Test accordion behavior
   - [ ] Verify data mutations

**Deliverables:**
- ✅ Refactored JobOverviewCard
- ✅ Refactored OrganizationLocationCard
- ✅ Accordion-based collapsible sections
- ✅ Consistent page header and navigation

### 9.4 Phase 4: Interpreters Page Redesign with Unavailability (Week 5)

**Goal:** Complete UI cohesion with fully redesigned interpreters page, including unavailability management

#### Tasks

**1. Refactor InterpreterCard**
   - [ ] Convert to shadcn/ui Card structure
   - [ ] Replace all custom classes with Tailwind
   - [ ] Display dual ranking (proficiency_rank + preference_rank)
   - [ ] Show preference_rank as priority indicator (⭐ = rank 1)
   - [ ] Add certification badges per language
   - [ ] Add proper contact action buttons

**2. Create Interpreter Detail Page (NEW)**
   - [ ] Create `app/(dashboard)/dashboard/interpreters/[id]/page.tsx`
   - [ ] Use `useInterpreterWithFullDetails()` hook
   - [ ] Display full interpreter profile
   - [ ] Integrate `UnavailabilityCalendar` component (Section 7.5)
   - [ ] Show assignment history (optional)
   - [ ] Language list with dual ranking display

**3. Refactor Main Page**
   - [ ] Implement PageHeader pattern
   - [ ] Implement SearchFilterBar with 3 filters (language, city, certification)
   - [ ] Add preference_rank filter (High/Medium/Low priority)
   - [ ] Replace custom loading spinner with SkeletonGrid
   - [ ] Use EmptyState for no results
   - [ ] Remove inline CSS variable styles

**4. Improve Filtering Logic**
   - [ ] Create `useInterpreterFilter()` hook
   - [ ] Support multi-language filter
   - [ ] Support city filter
   - [ ] Support certification filter
   - [ ] Support preference_rank filter
   - [ ] Optimize performance with useMemo

**5. Add Unavailability Management**
   - [ ] Create add unavailability modal
   - [ ] Create edit unavailability modal
   - [ ] Implement delete confirmation
   - [ ] Connect to `useInterpreterUnavailability` hook
   - [ ] Validate time ranges (end_time > start_time)

**6. Testing & Validation**
   - [ ] Test card grid responsiveness
   - [ ] Test all filter combinations
   - [ ] Test search across multiple fields
   - [ ] Test unavailability calendar functionality
   - [ ] Test preference_rank display and filtering
   - [ ] Verify contact button functionality

**Deliverables:**
- ✅ Refactored InterpreterCard with dual ranking
- ✅ NEW Interpreter detail page
- ✅ UnavailabilityCalendar component integrated
- ✅ Advanced filtering system (4 filters)
- ✅ Preference rank display and filtering
- ✅ Complete shadcn/ui adoption

### 9.5 Phase 5: CSS Cleanup & Documentation (Week 6)

**Goal:** Remove legacy CSS and document the new design system

#### Tasks
1. **CSS Audit & Removal**
   - [ ] Search codebase for custom CSS classes
   - [ ] Remove unused `.heading-*`, `.body-*`, `.caption` classes
   - [ ] Remove custom `.card`, `.button`, `.badge` classes
   - [ ] Remove inline CSS variable styles
   - [ ] Update `globals.css` to remove legacy definitions

2. **Tailwind Config Cleanup**
   - [ ] Remove unused color definitions (e.g., `secondary-teal`)
   - [ ] Standardize to shadcn/ui color tokens only
   - [ ] Document custom Tailwind extensions

3. **Create Design System Documentation**
   - [ ] `docs/design-system.md` (typography, colors, spacing)
   - [ ] `docs/component-catalog.md` (all shadcn/ui components used)
   - [ ] `docs/pattern-library.md` (reusable patterns)
   - [ ] Add usage examples for each pattern

4. **Performance Optimization**
   - [ ] Analyze bundle size
   - [ ] Remove unused dependencies
   - [ ] Optimize image loading
   - [ ] Implement code splitting if needed

5. **Accessibility Audit**
   - [ ] Test keyboard navigation
   - [ ] Test screen reader compatibility
   - [ ] Add ARIA labels where missing
   - [ ] Ensure sufficient color contrast

**Deliverables:**
- ✅ Clean CSS (no legacy classes)
- ✅ Design system documentation
- ✅ Performance optimization report
- ✅ Accessibility compliance

### 9.6 Success Criteria

**Quantitative Metrics:**
- [ ] 100% shadcn/ui component adoption across dashboard pages
- [ ] 0 custom CSS classes (`.heading-*`, `.card`, `.button`, etc.)
- [ ] 0 inline CSS variable styles
- [ ] <5% bundle size increase
- [ ] All pages pass accessibility audit (WCAG 2.1 AA)
- [ ] All 6 new advanced components implemented
- [ ] All 10+ data hooks implemented
- [ ] Multi-table joins working efficiently (<500ms query time)

**Qualitative Metrics:**
- [ ] Consistent visual design across all pages
- [ ] Responsive behavior on all breakpoints
- [ ] Smooth loading and error states
- [ ] Intuitive search and filter UX
- [ ] Professional, cohesive appearance
- [ ] Assignment workflow fully visible and manageable
- [ ] Communication history accessible and readable
- [ ] Audit trails provide compliance-ready data
- [ ] Unavailability calendar easy to use
- [ ] Multi-client request display clear and organized

**New Feature Completeness:**
- [ ] Job assignment workflow tracking (contacted → pending → declined/confirmed)
- [ ] Communication history timeline (REQ/CONF/REM emails)
- [ ] Status change audit trail
- [ ] Version history with field-level diffs
- [ ] Interpreter unavailability calendar
- [ ] Multi-client request support
- [ ] Dual language ranking (proficiency + preference)
- [ ] Modality-specific organization instructions

### 9.7 Updated Timeline Estimate

**Original Estimate:** 5 weeks
**Revised Estimate:** 6 weeks (due to schema complexity)

| Phase | Duration | Complexity Increase |
|-------|----------|---------------------|
| Phase 1: Foundation & Data Hooks | Week 1 | +40% (new hooks) |
| Phase 2: Jobs Board Redesign | Week 2 | Same |
| Phase 3: Job Detail Redesign | Weeks 3-4 | +100% (6 new components) |
| Phase 4: Interpreters Redesign | Week 5 | +50% (unavailability) |
| Phase 5: CSS Cleanup & Documentation | Week 6 | Same |

**Critical Path Dependencies:**
1. Phase 1 must complete ALL data hooks before Phase 3 can start
2. Advanced components in Phase 1 are prerequisites for Phase 3
3. Job detail page (Phase 3) is now the bottleneck due to complexity

**Quantitative Metrics:**
- [ ] 100% shadcn/ui component adoption across dashboard pages
- [ ] 0 custom CSS classes (`.heading-*`, `.card`, `.button`, etc.)
- [ ] 0 inline CSS variable styles
- [ ] <5% bundle size increase
- [ ] All pages pass accessibility audit (WCAG 2.1 AA)

**Qualitative Metrics:**
- [ ] Consistent visual design across all pages
- [ ] Responsive behavior on all breakpoints
- [ ] Smooth loading and error states
- [ ] Intuitive search and filter UX
- [ ] Professional, cohesive appearance

---

## 10. Technical Risks & Mitigation

### 10.1 Risk: Breaking Existing Functionality

**Probability:** Medium
**Impact:** High

**Mitigation Strategy:**
1. **Incremental Migration:** Redesign one page at a time, not all at once
2. **Feature Parity Testing:** Ensure all existing features work after redesign
3. **Parallel Development:** Use feature branches, not direct main commits
4. **User Acceptance Testing:** Get stakeholder approval before deploying
5. **Rollback Plan:** Keep old components until new ones are fully validated

### 10.2 Risk: Performance Degradation from Complex Joins

**Probability:** HIGH (increased from Low)
**Impact:** High

**New Concerns:**
- Deep nested joins (up to 4 levels: commitment_blocks → location → organization)
- Multiple one-to-many relationships (assignment_attempts, communications, version_history)
- Large payloads for job detail page (could exceed 50KB per job)

**Mitigation Strategy:**
1. **Selective Loading Pattern** (Section 4.3)
   - Load basic job data first
   - Load audit trails on-demand when user expands accordion
   - Use `enabled` option in TanStack Query

2. **Pagination for Historical Data**
   ```typescript
   // Limit communications to last 50 by default
   useJobCommunications(jobId, { limit: 50 })

   // Load more on scroll/button click
   loadMoreCommunications({ offset: 50, limit: 50 })
   ```

3. **Query Optimization**
   - Add database indexes for foreign keys (already exist)
   - Use Supabase RPC functions for complex aggregations
   - Cache aggressively (10-minute stale time for historical data)

4. **Bundle Optimization**

**Probability:** Low
**Impact:** Medium

**Mitigation Strategy:**
1. **Bundle Analysis:** Monitor bundle size with `@next/bundle-analyzer`
2. **Code Splitting:** Lazy load modal components and heavy dependencies
3. **Memoization:** Use `useMemo` and `useCallback` for expensive operations
4. **Image Optimization:** Use Next.js Image component
5. **Database Indexing:** Ensure Supabase queries are optimized

### 10.3 Risk: Design Inconsistency

**Probability:** Medium
**Impact:** Medium

**Mitigation Strategy:**
1. **Pattern Components:** Create reusable patterns (already planned)
2. **Design Tokens:** Strictly use Tailwind/shadcn/ui tokens only
3. **Code Reviews:** Enforce design system compliance in PRs
4. **Storybook (Optional):** Visual component library for reference
5. **Design System Docs:** Clear documentation of approved patterns

### 10.4 Risk: TanStack Query Complexity

**Probability:** Low
**Impact:** Medium

**Mitigation Strategy:**
1. **Standard Hook Pattern:** Use consistent query/mutation structure
2. **Error Handling:** Implement robust error boundaries
3. **Loading States:** Always provide skeleton/loading UI
4. **Cache Management:** Document cache invalidation strategy
5. **DevTools:** Use React Query DevTools for debugging

### 10.5 Risk: Data Consistency in Multi-Table Updates

**Probability:** Medium (NEW RISK)
**Impact:** High

**Concern:** When confirming an interpreter, TWO tables must be updated atomically:
1. `job_assignment_attempts` (status → 'confirmed')
2. `commitment_blocks` (interpreter_id assigned)

**Mitigation Strategy:**
1. **Transaction-Like Pattern**
   ```typescript
   // In useMarkConfirmed mutation:
   // Update attempt first
   await supabase.from('job_assignment_attempts').update(...)

   // Then update job (if this fails, we have inconsistent state)
   await supabase.from('commitment_blocks').update(...)

   // Better: Use Supabase RPC function with transaction
   await supabase.rpc('confirm_interpreter_assignment', {
     p_job_id: jobId,
     p_interpreter_id: interpreterId
   })
   ```

2. **Optimistic Updates with Rollback**
   ```typescript
   onMutate: async (variables) => {
     // Cancel ongoing queries
     await queryClient.cancelQueries(['jobAssignmentAttempts', jobId])

     // Snapshot previous data
     const previousData = queryClient.getQueryData(['jobAssignmentAttempts', jobId])

     // Optimistically update
     queryClient.setQueryData(['jobAssignmentAttempts', jobId], (old) => {
       // ... update logic
     })

     return { previousData }
   },
   onError: (err, variables, context) => {
     // Rollback on error
     queryClient.setQueryData(['jobAssignmentAttempts', jobId], context.previousData)
   }
   ```

3. **Database Constraints**
   - Rely on existing UNIQUE constraint (job_id, interpreter_id) in job_assignment_attempts
   - Prevents duplicate attempts
   - Foreign key constraints ensure referential integrity

### 10.6 Risk: Accessibility Regressions

**Probability:** Medium
**Impact:** High

**Mitigation Strategy:**
1. **Semantic HTML:** Use proper heading hierarchy
2. **ARIA Labels:** Add to all icon-only buttons
3. **Keyboard Navigation:** Test tab order and focus states
4. **Screen Reader Testing:** Use NVDA/JAWS/VoiceOver
5. **Automated Testing:** Integrate axe-core or Lighthouse CI

---

## Appendix A: Component Migration Checklist

Use this checklist when refactoring each component:

### Pre-Migration
- [ ] Read current component code
- [ ] Identify custom CSS classes used
- [ ] Identify inline styles used
- [ ] Map to equivalent shadcn/ui components
- [ ] Plan data prop structure

### During Migration
- [ ] Replace custom classes with Tailwind utilities
- [ ] Replace custom components with shadcn/ui equivalents
- [ ] Remove inline CSS variable styles
- [ ] Update typography to standard scale
- [ ] Ensure proper semantic HTML structure
- [ ] Add ARIA labels to icons
- [ ] Test responsive behavior

### Post-Migration
- [ ] Remove old component file (if fully replaced)
- [ ] Update imports in parent components
- [ ] Test all interactive features
- [ ] Verify loading/error states
- [ ] Check accessibility with keyboard
- [ ] Review in browser DevTools
- [ ] Get design approval

---

## Appendix B: shadcn/ui Component Reference

Quick reference for commonly used shadcn/ui components:

### Layout
- **Card:** Primary container for content sections
- **CardHeader:** Top section with title/description
- **CardContent:** Main content area
- **CardFooter:** Bottom section with actions

### Interactive
- **Button:** All clickable actions (variants: default, outline, ghost, destructive)
- **Input:** Text input fields
- **Select:** Dropdown menus
- **Accordion:** Collapsible sections
- **Dialog:** Modal windows

### Display
- **Badge:** Status indicators (variants: default, secondary, outline, destructive)
- **Alert:** Important messages
- **Skeleton:** Loading placeholders
- **Table:** Tabular data (use sparingly, prefer cards)

### Icons
- **lucide-react:** Icon library (Search, User, Calendar, etc.)

---

## Appendix C: Tailwind Utility Quick Reference

### Typography
```
text-3xl font-bold tracking-tight        // Page titles
text-2xl font-semibold                   // Section titles
text-lg font-semibold                    // Card titles
text-base font-semibold                  // Subsection titles
text-sm                                  // Body text
text-sm text-muted-foreground            // Muted text
text-xs text-muted-foreground uppercase tracking-wide  // Labels
```

### Spacing
```
space-y-2    // 8px vertical stack
space-y-4    // 16px vertical stack
space-y-6    // 24px vertical stack
gap-4        // 16px grid gap
p-6          // 24px padding (card default)
```

### Layout
```
container mx-auto                        // Page container
grid gap-4 md:grid-cols-2 lg:grid-cols-3  // Responsive grid
flex items-center justify-between        // Flex row
flex flex-col                            // Flex column
```

---

## Conclusion

This revised architectural blueprint provides a comprehensive roadmap for achieving UI cohesion across the Interlingo web application **with full awareness of the underlying database schema complexity**.

### Key Updates in Version 2.0

**Critical Schema Features Integrated:**
1. ✅ Job assignment workflow tracking (job_assignment_attempts)
2. ✅ Communication history (job_communications)
3. ✅ Audit trails (job_status_history + job_version_history)
4. ✅ Interpreter unavailability management
5. ✅ Multi-client request support (one-to-many relationship)
6. ✅ Dual language ranking (proficiency + preference)
7. ✅ Modality-specific organization instructions
8. ✅ Complex join patterns (up to 4 levels deep)

**New Component Patterns Added:**
1. `AssignmentAttemptList` - Assignment workflow visualization
2. `CommunicationHistory` - Email timeline with expandable details
3. `AuditTimeline` - Status change history
4. `VersionHistory` - Field-level diff view for GCal syncs
5. `UnavailabilityCalendar` - Calendar/schedule management
6. `ClientRequestList` - Multi-client request display

**Architectural Improvements:**
- Comprehensive data hooks for nested queries
- Performance optimization strategies for complex joins
- Selective loading patterns for audit data
- Transaction-safe multi-table updates
- Enhanced TypeScript types for nested relations

### Implementation Complexity Changes

| Original Estimate | Revised Estimate | Reason |
|-------------------|------------------|--------|
| 5 weeks | **6 weeks** | Database schema complexity |
| ~10 components | **~16 components** | 6 new advanced patterns |
| Simple queries | **Complex multi-table joins** | Up to 4 levels deep |
| Direct useState | **TanStack Query with caching** | Required for audit trails |

### What Changed From Version 1.0

**Version 1.0 Assumptions (INCOMPLETE):**
- ❌ Jobs have single client request (WRONG: one-to-many)
- ❌ Job detail shows current interpreter only (WRONG: shows full assignment history)
- ❌ No communication tracking (WRONG: comprehensive email audit trail)
- ❌ No version history (WRONG: GCal sync creates versions)
- ❌ No unavailability management (WRONG: critical for matching)
- ❌ Simple table queries (WRONG: requires multi-table joins)

**Version 2.0 Reality (COMPLETE):**
- ✅ Jobs have 1-to-many client_requests relationship
- ✅ Jobs have full assignment attempt workflow tracking
- ✅ Jobs have complete communication history (REQ/CONF/REM)
- ✅ Jobs have dual audit trails (status + version history)
- ✅ Interpreters have unavailability calendar
- ✅ Interpreters have dual ranking system (proficiency + preference)
- ✅ Complex queries require nested joins and performance optimization

### Critical Success Factors

**Technical:**
1. Implement ALL comprehensive data hooks in Phase 1 (foundation)
2. Use selective loading pattern to prevent performance issues
3. Add pagination for historical data (communications, versions)
4. Use Supabase RPC functions for transaction-safe updates

**Process:**
1. Phase 1 is now CRITICAL PATH (must complete before Phase 3)
2. Job detail page (Phase 3) is the most complex component
3. Weekly architectural reviews to prevent scope creep
4. Performance testing after each phase

**Quality:**
1. All 6 advanced component patterns must be production-ready
2. TypeScript types must accurately reflect nested structures
3. Error handling for failed joins and large payloads
4. Accessibility maintained across new complex components

### Next Steps

1. **Immediate:** Review this updated blueprint with stakeholders
2. **Week 1:** Approve the revised 6-week implementation roadmap
3. **Week 1:** Begin Phase 1 (Foundation + Advanced Components)
4. **Weekly:** Progress reviews focusing on data hook completion
5. **Post-Phase 1:** Designer agent visual refinement of new components
6. **Phase 3:** Intensive focus on job detail page complexity

### Questions or Concerns

- **Architectural Guidance:** Atlas (Principal Software Architect)
- **Visual Design Decisions:** Designer agent
- **Database Schema Questions:** Refer to `Supabase-Schema.md`
- **Implementation Support:** Development team
- **Performance Concerns:** Discuss selective loading strategies in Section 4.3

---

**Document Status:** Updated for Review (Schema Integration)
**Approval Required From:** Product Owner, Lead Developer, Designer, Database Administrator
**Previous Review:** 2026-02-02 (Version 1.0)
**Next Review Date:** 2026-02-10
**Change Summary:** Added 6 advanced component patterns, 10+ data hooks, revised timeline from 5 to 6 weeks due to schema complexity
