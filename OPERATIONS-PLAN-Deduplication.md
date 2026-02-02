# Interlingo Operations Plan: Full System Deployment

**Created:** 2026-02-02
**Status:** Draft - Awaiting Council Review
**Priority:** High - 20+ daily reminders affected

---

## Executive Summary

Investigation revealed that we've been fixing symptoms (N8N workflow bugs) instead of deploying the actual solution: **Interlingo as the complete end-to-end system**. The full Interlingo stack (GCal → Supabase → Web App → Reminders) already exists and solves ALL current issues: duplicates, missing case data, missing court addresses, and template bugs. The path forward is deploying Interlingo, not patching N8N.

---

## Problem Statement

### Current Pain Points (N8N Legacy System)
1. **Duplicate jobs** - When jobs are updated/appended, new records created instead of UPSERT
2. **Missing case data** - Email placeholders `[Client Name]`, `[Case Number]` instead of actual values
3. **Missing court addresses** - In-person instructions not showing (e.g., Puyallup)
4. **Template documentation bleeding** - Config docs appearing in reminder emails
5. **Manual workarounds** - User creates new jobs instead of correcting to avoid errors
6. **20+ daily reminders** - High volume, brittle system, constant firefighting

### The Realization
**We've been fixing N8N symptoms instead of deploying the solution.**

Interlingo already exists as a complete system:
- ✅ Supabase schema (proper tables, constraints, fingerprint_hash)
- ✅ Web frontend (Next.js app for job management)
- ✅ Renderer service (email generation)
- ✅ GCal integration capability
- ✅ Fingerprint-based deduplication logic

**All current bugs disappear when using Interlingo instead of N8N.**

### Why We Got Sidetracked
1. Started with "test Interlingo on the droplet"
2. Found bugs in N8N workflows (template docs, networking)
3. Fixed those bugs instead of asking: "Why are we using N8N at all?"
4. Council debate on deduplication strategy
5. Discovered inactive workflow with correct logic
6. User insight: "All those issues are solved with full Interlingo deployment"

---

## Technical Findings

### Database Schema Analysis

**Current Structure (Correct and Sufficient):**

```sql
-- commitment_blocks = The job/appointment timeslot
CREATE TABLE commitment_blocks (
  id uuid PRIMARY KEY,
  interpreter_id uuid,  -- NULLABLE, MUTABLE (assignment, not identity)
  location_id uuid,     -- Links to org via locations table
  start_time timestamptz,
  end_time timestamptz,
  modality text,
  fingerprint_hash text UNIQUE,  -- ✅ UNIQUE constraint exists (migration 007)
  gcal_event_id text,            -- Unreliable, informational only
  version integer,
  -- ... other fields
);

-- client_requests = Case details (1:1 with commitment_block)
CREATE TABLE client_requests (
  id uuid PRIMARY KEY,
  commitment_block_id uuid FK,
  language_id uuid,              -- ✅ Language is here
  client_name text,
  case_number text,
  -- ... other fields
);

-- locations = Where job happens
CREATE TABLE locations (
  id uuid PRIMARY KEY,
  org_id uuid,                   -- ✅ Organization is here
  -- ... other fields
);
```

**Natural Key Identified:**
- Language (from `client_requests.language_id`)
- Organization (from `locations.org_id` via `commitment_blocks.location_id`)
- Exact timestamp (from `commitment_blocks.start_time`)

**Key Insight:** `interpreter_id` should NOT be part of natural key because interpreters are frequently reassigned. The interpreter is WHO covers the job, not part of the job's identity.

### Fingerprint Algorithm (Already Correct)

**From inactive workflow `gcal-to-interlingo-upsert`:**

```javascript
const fingerprintRaw = `${startTime}|${orgAbbrev}|${language}`;
const fingerprintHash = simpleHash(fingerprintRaw);

function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
```

**This is EXACTLY the natural key we identified.**

### N8N Workflow Analysis

**Active Workflows:**
- ✅ `event.notion.gcal` (Active: true) - Currently running, NO deduplication
- ✅ `reminder.renderer.webhook` (Active: true) - Sends reminders
- ❌ `gcal-to-interlingo-upsert` (Active: false) - Has fingerprint logic, NOT running

**The Gap:**
The active workflow syncing GCal events to Supabase doesn't use the fingerprint column or UPSERT logic. Every event creates a new record.

---

## Council Debate Summary

### Round 1-2: Natural Key Discussion
- **Architect**: Proposed event_id as stable identifier
- **Engineer**: Suggested composite key (interpreter + org + time)
- **Researcher**: Recommended stable source IDs and blue-green deployment
- **Database Specialist**: Proposed (interpreter_id, org_id, scheduled_datetime) composite

### Round 3: After "No Stable ID" Constraint Revealed
- **Researcher**: Synthetic fingerprint hash (content-based)
- **Database Specialist**: Time rounding to 15-minute intervals
- **Architect**: Exact timestamps, accept duplicates, add UI merge tool
- **Engineer**: Daily grain composite key, ship in 2 hours

### Resolution
**All approaches were based on the false assumption that deduplication logic didn't exist.** The fingerprint approach (Researcher's recommendation) is already implemented and waiting to be activated.

---

## Additional Bugs Identified

### Fixed During Investigation
1. ✅ **Template documentation in emails** - Regex in `decisionTree.ts:74` wasn't stopping at "Reminder Content Format" sections
2. ✅ **Docker networking issue** - N8N couldn't reach renderer at localhost:3001, changed to 172.17.0.1:3001

### Outstanding Issues
1. ⚠️ **Missing case data** - Emails show `[Client Name]`, `[Case Number]` placeholders instead of actual data
2. ⚠️ **Missing court addresses** - In-person instructions not showing for Puyallup and other courts
3. ⚠️ **Incomplete organization configs** - Bremerton and others mentioned in error logs

---

## Deployment Paths

### Option 1: Full Interlingo Deployment (Recommended)
**Action:** Deploy Interlingo web app, deprecate N8N workflows entirely

**The Complete Flow:**
```
GCal Event Created
    ↓
[GCal Webhook/Polling] → Supabase Job Creation
    ↓
Interlingo Web App
    ↓
View/Edit Job Details
    ↓
Generate Reminder (using renderer)
    ↓
Send Email
```

**What This Solves:**
- ✅ Duplicates (fingerprint-based UPSERT in Interlingo)
- ✅ Case data (proper GCal description parsing)
- ✅ Court addresses (fetched from court DB)
- ✅ Template bugs (doesn't use N8N approach)
- ✅ Organization configs (rendered correctly)
- ✅ Workflow clarity (single system, not N8N patchwork)

**Dependencies to Check:**
1. How does Interlingo trigger from GCal events?
2. Is the web app deployment-ready?
3. Does reminder generation work end-to-end?
4. What's the auth/access model?

**Risk:** Low - Using the actual solution instead of workarounds

### Option 2: Hybrid Approach (Transitional)
**Action:** Use N8N for GCal sync, Interlingo for job management/reminders

**Flow:**
```
GCal Event → N8N (with fingerprint) → Supabase
                                        ↓
                            Interlingo Web App
                                        ↓
                                  Reminders
```

**Pros:**
- Keeps working GCal integration from N8N
- Adds Interlingo UI and reminder logic
- Gradual migration path

**Cons:**
- Still maintaining N8N (complexity)
- Two systems instead of one
- Doesn't fully solve the problem

**Risk:** Medium - Technical debt remains

### Option 3: Fix N8N Only (Not Recommended)
**Action:** Activate `gcal-to-interlingo-upsert` workflow, patch remaining bugs

**Why This Is Wrong:**
- Fixes symptoms, not root cause
- N8N is the legacy/transitional system
- Interlingo is the actual solution
- We'd still have missing case data, court addresses, etc.
- Continued technical debt

**Risk:** High - Wasted effort on deprecated approach

---

## Interlingo Deployment Strategy

### Phase 0: Discovery & Validation (Now)
**Questions to Answer:**
1. How does Interlingo handle GCal event ingestion?
   - Webhook subscription?
   - Polling?
   - Manual entry with GCal as reference?

2. What's the current state of Interlingo web app?
   - Deployed anywhere?
   - Build successfully?
   - Missing features?

3. How does reminder generation work in Interlingo?
   - Uses the renderer service?
   - Different approach?
   - Email sending configured?

4. What's blocking full deployment?
   - Technical gaps?
   - Missing integrations?
   - Data migration needed?

### Phase 1: Deploy Interlingo to New Droplet
1. **Build and deploy web app** (Next.js → port 3000?)
2. **Configure Supabase connection** (already have credentials)
3. **Set up GCal integration** (webhook or polling)
4. **Test job creation flow** (GCal event → Supabase → UI)
5. **Configure renderer** (already running on port 3001)
6. **Test reminder generation** (Interlingo → renderer → email)

### Phase 2: Parallel Testing
1. **Old system (N8N) continues** - 20+ daily reminders unchanged
2. **New system (Interlingo) shadows** - Same events, parallel processing
3. **Compare outputs** - Job data, reminder content, delivery
4. **Fix gaps** - Any missing features or data in Interlingo
5. **48-hour validation** - Ensure parity

### Phase 3: Cutover
1. **Switch GCal webhooks** to Interlingo instead of N8N
2. **Deactivate N8N workflows** (keep as read-only reference)
3. **Monitor first 24 hours** - All 20+ reminders successful?
4. **7-day safety net** - Can roll back to N8N if critical issue
5. **Full migration** - Deprecate N8N entirely after validation

### Phase 4: Cleanup
1. **Archive N8N workflows** (export to git for history)
2. **Document Interlingo architecture** (replace N8N docs)
3. **Train on Interlingo UI** (job management, manual entry)
4. **Remove N8N dependencies** (container, API keys)

---

## Questions for Council Review

### Architecture & Integration
1. **How does Interlingo ingest GCal events?**
   - Direct webhook subscription?
   - Polling API?
   - N8N as bridge (hybrid approach)?
   - Manual entry only?

2. **What's the current state of the web app?**
   - Feature complete?
   - Missing job management capabilities?
   - Auth/access control implemented?
   - Multi-user ready or single-user only?

3. **How does reminder generation work?**
   - Uses existing renderer service?
   - Different email generation approach?
   - Where's the template logic?
   - Sending configured (SMTP/SendGrid)?

### Migration & Testing
4. **What's the deployment sequence?**
   - Deploy web app first, then switch GCal?
   - Parallel systems during validation?
   - Phased rollout or hard cutover?

5. **How to handle existing N8N data?**
   - Jobs already in Supabase from N8N
   - Backfill fingerprint_hash for old records?
   - Data cleanup needed?

6. **Testing strategy before cutover?**
   - Shadow N8N with Interlingo?
   - Isolated test events?
   - What's the validation criteria?

### Operational
7. **What breaks when we turn off N8N?**
   - Only job creation, or other workflows too?
   - Dependencies on N8N for other processes?
   - Risk assessment?

8. **Training & documentation needed?**
   - How to use Interlingo UI for job management?
   - Manual job entry workflow?
   - Troubleshooting guide?

---

## Success Criteria

### Immediate (Week 1)
- ✅ Zero duplicate jobs created from GCal sync
- ✅ Manual job duplication (user creates) becomes idempotent UPSERT
- ✅ Interpreter reassignments update existing record, don't create new one
- ✅ 20+ daily reminders continue without interruption

### Short-term (Month 1)
- ✅ Case data populates correctly (no placeholders)
- ✅ Court addresses show for all in-person appointments
- ✅ All organization configs complete

### Long-term (Quarter 1)
- ✅ System ready for multi-user deployment
- ✅ Interlingo web app becomes primary intake method
- ✅ GCal becomes secondary/legacy input

---

## Constraints & Requirements

### Hard Requirements
- ✅ **GCal intake MUST stay** - Client won't change workflow
- ✅ **Working system NOW** - Not future-perfect state
- ✅ **Single user currently** - But plan for multi-user
- ✅ **No disruption to daily reminders** - 20+ going out daily

### Operational Context
- User manually duplicates jobs daily (creates new GCal entries)
- Clinton edits from another calendar server (not GCal directly)
- No stable event_id from source
- Manual error correction preferred over automatic updates

---

## Recommended Action Plan

### Immediate Next Steps (Discovery Phase)

1. **Inspect Interlingo web app codebase**
   - Read `/web` directory structure
   - Identify GCal integration code
   - Find reminder generation logic
   - Check for missing features vs requirements

2. **Test local build**
   - `bun install` and `bun run dev`
   - Can we access the UI?
   - Does it connect to Supabase?
   - Can we view jobs from database?

3. **Identify deployment gaps**
   - What works vs what's missing?
   - GCal webhook setup needed?
   - Email sending configuration?
   - Environment variables required?

4. **Council roundtable discussion**
   - Review findings from inspection
   - Decide on deployment path (full vs hybrid)
   - Create detailed implementation plan
   - Assign testing responsibilities

5. **Document Interlingo architecture**
   - How it SHOULD work end-to-end
   - Current vs ideal state
   - Migration checklist

### Council Agenda Items

1. **Interlingo Deployment Path**
   - Full deployment vs hybrid (N8N bridge)
   - Timeline and dependencies
   - Risk mitigation

2. **GCal Integration Strategy**
   - Webhook vs polling vs manual
   - How to transition from N8N
   - Parallel testing approach

3. **Testing & Validation**
   - What needs to work before cutover?
   - Comparison methodology (N8N vs Interlingo output)
   - Acceptance criteria

4. **Migration Execution**
   - Deployment sequence
   - Rollback plan
   - Communication plan (who needs to know what when)

5. **Post-Migration Operations**
   - N8N deprecation timeline
   - Training on Interlingo UI
   - Documentation updates

---

## Appendix: Technical References

### Files Modified
- `INCOME/Interlingo/supabase/Supabase-Schema.md` - Updated with migration 008
- `/root/interlingo-renderer/decisionTree.ts:74` - Fixed regex for template extraction

### API Endpoints
- N8N: `https://auto.rnrrecruiting.com/api/v1/workflows`
- Renderer: `http://172.17.0.1:3001/render` (from N8N container)
- Supabase: `https://anqfdvyhexpxdpgbkgmd.supabase.co`

### Droplet Details
- IP: 137.184.124.88
- User: root
- N8N: Docker container `root-n8n-1`
- Renderer: `/root/interlingo-renderer/` (bun server, port 3001)

---

## Key Insight

**We've been fixing the wrong system.** N8N is the legacy/transitional approach. Interlingo is the actual solution. All current bugs (duplicates, missing data, template issues) disappear when using Interlingo end-to-end.

**The question isn't "how do we fix N8N?"**
**The question is "what's blocking Interlingo deployment?"**

---

**Next Action:** Council roundtable to answer: What does Interlingo need to replace N8N completely?
