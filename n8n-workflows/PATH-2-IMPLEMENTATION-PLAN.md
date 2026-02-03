# Path 2 Implementation Plan: Normalized Lookup Logic

**Goal:** Convert text fields from GCal events to UUID foreign keys by querying reference tables

**Timeline:** 4-5 days

**Status:** Planning

---

## Overview

The current workflow parses GCal events into text fields (language="Spanish", interpreter="Ma M", org_abbreviation="ENUMCLAW"). The database schema expects UUID foreign keys (language_id, interpreter_id, location_id). This plan adds lookup nodes to bridge the gap.

---

## Node Architecture

### Current Flow
```
Google Calendar Trigger
  → Parse Event (splits languages)
  → Query Existing Job (check fingerprint)
  → Check Job Exists
  → [Branch: Exists] Compare Changes → Update or Touch
  → [Branch: New] Create New Job
```

### New Flow with Lookups
```
Google Calendar Trigger
  → Parse Event (splits languages)
  → **Lookup Language ID** (NEW)
  → **Lookup Organization/Location ID** (NEW)
  → **Lookup Interpreter ID** (NEW - optional)
  → **Parse Case Notes** (NEW)
  → Query Existing Job (check fingerprint)
  → Check Job Exists
  → [Branch: Exists] Compare Changes → Update or Touch
  → [Branch: New] **Create Commitment Block** (MODIFIED)
  → **Create Client Request** (NEW)
```

---

## Lookup Nodes

### 1. Lookup Language ID

**Node Type:** Supabase (Get All)

**Purpose:** Convert language name ("Spanish", "Mam") to language_id UUID

**Configuration:**
```json
{
  "operation": "getAll",
  "tableId": "languages",
  "limit": 1,
  "filterType": "string",
  "filterString": "name=eq.{{ $json.language }}"
}
```

**Output:**
- If found: `language_id` (UUID)
- If not found: Error → log for manual review

**Error Handling:**
- Add "If" node after lookup to check if result exists
- If no match: Route to "Log Missing Language" node
- Missing languages are critical errors (block job creation)

---

### 2. Lookup Organization/Location ID

**Node Type:** Code + Supabase (2 nodes)

**Purpose:** Convert organization abbreviation ("ENUMCLAW") to location_id UUID

**Step 2a: Extract Org Name (Code Node)**
```javascript
// Current workflow extracts: "ENUMCLAW" from "ENUMCLAW MUNICIPAL COURT"
const orgAbbrev = $json.org_abbreviation; // Already extracted in Parse Event

// For lookup, we may need to reverse this or use fuzzy matching
// Option 1: Direct lookup by abbreviation
// Option 2: Fuzzy match against organization.name
// Option 3: Maintain org_abbreviations table

return [{
  json: {
    ...($json),
    org_lookup_value: orgAbbrev
  }
}];
```

**Step 2b: Lookup Location (Supabase Node)**
```json
{
  "operation": "getAll",
  "tableId": "locations",
  "limit": 1,
  "filterType": "string",
  "filterString": "organization_id=in.(SELECT id FROM organizations WHERE abbreviation=eq.{{ $json.org_lookup_value }})"
}
```

**Note:** This assumes organizations table has `abbreviation` column. If not, we need:
- Add `abbreviation` column to organizations table
- OR maintain separate org_abbreviations lookup table
- OR use fuzzy string matching

**Output:**
- If found: `location_id` (UUID)
- If not found: Error → log for manual review

**Error Handling:**
- Same as language lookup
- Missing organizations are critical errors

---

### 3. Lookup Interpreter ID (Optional)

**Node Type:** Code + Supabase (2 nodes)

**Purpose:** Convert interpreter alias ("Ma M") to interpreter_id UUID

**Step 3a: Clean Interpreter Name (Code Node)**
```javascript
const interpreterRaw = $json.interpreter || null;

if (!interpreterRaw || interpreterRaw.trim() === '') {
  // No interpreter assigned
  return [{
    json: {
      ...($json),
      interpreter_id: null,
      interpreter_lookup_needed: false
    }
  }];
}

// Clean the name (remove extra spaces, normalize)
const interpreterClean = interpreterRaw.trim();

return [{
  json: {
    ...($json),
    interpreter_clean: interpreterClean,
    interpreter_lookup_needed: true
  }
}];
```

**Step 3b: Lookup via Aliases (Supabase Node)**
```json
{
  "operation": "getAll",
  "tableId": "interpreter_aliases",
  "limit": 1,
  "filterType": "string",
  "filterString": "alias=eq.{{ $json.interpreter_clean }}"
}
```

**Output:**
- If found: `interpreter_id` (UUID)
- If not found: NULL (acceptable - shows "Unassigned" in UI)

**Error Handling:**
- Use "If" node to check lookup result
- If found: Use interpreter_id
- If not found: Set interpreter_id to NULL (don't block job creation)
- Optionally: Log unknown aliases for later review

---

### 4. Parse Case Notes

**Node Type:** Code

**Purpose:** Extract structured fields from case_notes text blob

**Configuration:**
```javascript
const caseNotes = $json.case_notes || '';

// Pattern 1: Client name (typically first line, all caps, comma format)
// "BRAVO ALTAMIRANO , JILVER"
const clientNameMatch = caseNotes.match(/^([A-Z\s,]+)/);
const clientName = clientNameMatch ? clientNameMatch[1].trim() : null;

// Pattern 2: Case number (alphanumeric with spaces)
// "4A0045471 ENP CTPTR"
const caseNumberMatch = caseNotes.match(/\n([A-Z0-9\s]+)/);
const caseNumber = caseNumberMatch ? caseNumberMatch[1].trim() : null;

// Pattern 3: Charges (everything after case number until end or next section)
// "DUI\n4A0045474 ENP IT\nOP MOT VEH W/OUT INSURANCE\nand FL RENEW EXPIRED REG > 2 MTHS"
const chargesStart = caseNotes.indexOf('\n', caseNotes.indexOf('\n') + 1);
const charges = chargesStart > 0 ? caseNotes.substring(chargesStart).trim() : null;

// Also extract meeting_type from event context
// This might need to come from event summary or description patterns
// For now, default to "Court Hearing"
const meetingType = 'Court Hearing';

return [{
  json: {
    ...($json),
    client_name: clientName,
    case_number: caseNumber,
    charges: charges,
    meeting_type: meetingType
  }
}];
```

**Note:** This regex pattern is preliminary. Real case_notes have inconsistent formats. May need:
- Multiple regex patterns with fallbacks
- Machine learning for extraction (future enhancement)
- Manual review queue for unparsable cases

**Output:**
- `client_name` (text, required)
- `case_number` (text, optional)
- `charges` (text, optional)
- `meeting_type` (text, required)

**Error Handling:**
- If client_name extraction fails: Use "Unknown Client"
- If case_number/charges fail: NULL is acceptable
- Log unparsable case_notes for pattern improvement

---

## Modified Create Nodes

### 5. Create Commitment Block (Modified)

**Node Type:** Supabase (Insert)

**Purpose:** Create commitment_blocks record with UUID foreign keys

**Configuration:**
```json
{
  "operation": "insert",
  "tableId": "commitment_blocks",
  "useCustomSchema": true,
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "gcal_event_id",
        "fieldValue": "={{ $json.gcal_event_id }}"
      },
      {
        "fieldId": "interpreter_id",
        "fieldValue": "={{ $json.interpreter_id }}"
      },
      {
        "fieldId": "location_id",
        "fieldValue": "={{ $json.location_id }}"
      },
      {
        "fieldId": "modality",
        "fieldValue": "={{ $json.modality }}"
      },
      {
        "fieldId": "start_time",
        "fieldValue": "={{ $json.start_time }}"
      },
      {
        "fieldId": "end_time",
        "fieldValue": "={{ $json.end_time }}"
      },
      {
        "fieldId": "fingerprint_hash",
        "fieldValue": "={{ $json.fingerprint_hash }}"
      },
      {
        "fieldId": "version",
        "fieldValue": "1"
      }
    ]
  }
}
```

**Changes from current:**
- **Removed:** language, interpreter, org_abbreviation, case_notes, fingerprint_raw (text fields)
- **Added:** interpreter_id (UUID, nullable), location_id (UUID, required)
- **Kept:** gcal_event_id, modality, start_time, end_time, fingerprint_hash, version

**Output:**
- Returns created commitment_blocks record with `id` (UUID)
- This `id` is needed for creating client_requests record

---

### 6. Create Client Request (NEW)

**Node Type:** Supabase (Insert)

**Purpose:** Create client_requests record linked to commitment_blocks

**Configuration:**
```json
{
  "operation": "insert",
  "tableId": "client_requests",
  "useCustomSchema": true,
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "commitment_block_id",
        "fieldValue": "={{ $('Create Commitment Block').item.json.id }}"
      },
      {
        "fieldId": "language_id",
        "fieldValue": "={{ $json.language_id }}"
      },
      {
        "fieldId": "client_name",
        "fieldValue": "={{ $json.client_name }}"
      },
      {
        "fieldId": "case_number",
        "fieldValue": "={{ $json.case_number }}"
      },
      {
        "fieldId": "charges",
        "fieldValue": "={{ $json.charges }}"
      },
      {
        "fieldId": "meeting_type",
        "fieldValue": "={{ $json.meeting_type }}"
      }
    ]
  }
}
```

**Dependencies:**
- Must run AFTER "Create Commitment Block" to get commitment_block_id
- Cannot use parallel execution - must be sequential

**Output:**
- Returns created client_requests record
- Completes the 1:1 relationship between commitment_blocks and client_requests

---

## Update Flow

The "Update Existing Job" and "Compare Changes" nodes will need modifications to handle:
1. Changes to interpreter_id (lookup may resolve differently)
2. Changes to case information (client_name, case_number, charges)
3. Version history logging for client_requests changes

**Proposed approach:**
- Compare Changes node checks both commitment_blocks AND client_requests fields
- Update flow updates BOTH tables if needed
- Version history logs changes to both tables

**Detailed update flow specification:** TBD (implement after create flow is working)

---

## Data Migration Considerations

### Missing Reference Data

**Problem:** GCal events may reference languages/orgs/interpreters that don't exist in reference tables yet.

**Solutions:**

1. **Languages** - Pre-populate common languages:
   - Spanish, Mam, Ukrainian, Russian, Vietnamese, Arabic, etc.
   - Run one-time script to extract all unique languages from existing GCal events
   - Add missing languages to languages table before workflow activation

2. **Organizations** - Pre-populate from existing data:
   - Extract unique organization names from existing GCal location fields
   - Create organizations and locations records
   - Add abbreviation mappings

3. **Interpreters** - More complex:
   - Extract unique interpreter names from existing GCal events
   - Need to manually verify these are real interpreters vs. placeholders
   - Create interpreters records with proper aliases
   - Some may be "TBD" or temporary - handle as NULL

**Migration Script Location:** `INCOME/Interlingo/supabase/migrations/seed-reference-data.sql`

---

## Testing Plan

### Phase 1: Unit Testing (Individual Nodes)

**Test each lookup node independently:**

1. **Lookup Language ID**
   - Test with known language: "Spanish" → should return UUID
   - Test with unknown language: "Klingon" → should error/log
   - Test with null: should error

2. **Lookup Organization/Location ID**
   - Test with known org: "ENUMCLAW" → should return UUID
   - Test with unknown org: "GOTHAM" → should error/log
   - Test with null: should error

3. **Lookup Interpreter ID**
   - Test with known alias: "Ma M" → should return UUID
   - Test with unknown alias: "John Doe" → should return NULL
   - Test with null: should return NULL

4. **Parse Case Notes**
   - Test with well-formatted case notes
   - Test with missing client name
   - Test with missing case number
   - Test with empty case notes

### Phase 2: Integration Testing (Full Flow)

**Test complete workflow with pinned GCal events:**

1. **Existing test event:** "Spanish/Mam - Ma M ZOOM" at ENUMCLAW
   - Should create 2 commitment_blocks (one per language)
   - Should create 2 client_requests (one per language)
   - Should have proper foreign keys for language_id, location_id, interpreter_id

2. **New test event:** Single language, no interpreter
   - Should create 1 commitment_block with NULL interpreter_id
   - Should create 1 client_request

3. **Duplicate event:** Re-process same event
   - Should detect existing fingerprint_hash
   - Should route to compare/update flow
   - Should not create duplicate records

### Phase 3: Load Testing (Real Data)

**Process 20+ real GCal events:**

1. Collect 20 recent events from production GCal
2. Pin as test data in workflow
3. Execute workflow in test mode
4. Review results in Supabase:
   - All commitment_blocks created correctly?
   - All client_requests linked properly?
   - Any lookup failures? (check logs)
   - Any parsing errors? (check case_notes quality)

5. Manual review:
   - Compare UI display (Jobs Board) to original GCal events
   - Verify all data visible and correct
   - Check for any data loss or corruption

---

## Rollback Plan

**If Path 2 implementation fails:**

1. **Keep existing workflow active** - Don't deactivate current working version until new version is fully tested
2. **Database rollback** - All changes are inserts (no schema changes yet), can delete test records
3. **Schema changes** - If we add columns (like abbreviation to organizations), document for rollback
4. **Workflow export** - Export working version before making changes

**Rollback trigger:** If testing reveals >10% failure rate or critical data loss

---

## Open Questions

### 1. Organization Abbreviation Lookup

**Question:** How should we map "ENUMCLAW" (extracted from GCal location) to organizations table?

**Options:**
- **A.** Add `abbreviation` column to organizations table
- **B.** Create separate org_abbreviations lookup table
- **C.** Use fuzzy string matching against organization.name
- **D.** Manual mapping table (gcal_location_text → organization_id)

**Recommendation:** Start with Option A (add abbreviation column). If that proves insufficient, add Option B for multi-alias support.

### 2. Case Notes Parsing Accuracy

**Question:** How do we handle unparsable case_notes?

**Options:**
- **A.** Store entire case_notes blob in client_requests.charges if parsing fails
- **B.** Create manual review queue for unparsable cases
- **C.** Use LLM/AI to extract structured data from free text
- **D.** Accept data loss for unparsable cases (log for later improvement)

**Recommendation:** Start with Option A (fallback to blob), log unparsable cases for pattern analysis, consider Option C as future enhancement.

### 3. Fingerprint Hash with Normalized Data

**Question:** Current fingerprint uses text: `${startTime}|${orgAbbrev}|${language}`. Should we change to UUIDs?

**Options:**
- **A.** Keep text-based fingerprint: `${startTime}|${orgAbbrev}|${language}`
- **B.** Change to UUID-based: `${startTime}|${location_id}|${language_id}`
- **C.** Hybrid: Use text for generation, UUIDs for storage

**Recommendation:** Keep Option A (text-based). Fingerprint is for deduplication detection, not relational integrity. Text is more stable (UUID changes if org record is recreated).

### 4. Update Flow Complexity

**Question:** When GCal event updates, how do we handle changes that affect lookups?

**Example:** Event changes from "Spanish" → "Ukrainian"
- Current: Compare text fields, update if different
- Path 2: Re-run language lookup, get new language_id, update client_requests.language_id

**Recommendation:** Handle in Phase 2 (after create flow is working). Update flow should:
1. Re-run all lookups on incoming data
2. Compare resulting UUIDs (not text)
3. Update both commitment_blocks and client_requests if needed

---

## Implementation Checklist

### Pre-Implementation
- [ ] Read this plan with user and get approval
- [ ] Decide on organization abbreviation lookup method (Question 1)
- [ ] Decide on case notes parsing fallback (Question 2)
- [ ] Run migration script to seed reference data (languages, organizations, locations)
- [ ] Export current working workflow as backup

### Day 1-2: Lookup Nodes
- [ ] Create "Lookup Language ID" node
- [ ] Create "Lookup Organization/Location ID" node (with abbreviation method)
- [ ] Create "Lookup Interpreter ID" node
- [ ] Create "Parse Case Notes" node
- [ ] Add error handling "If" nodes for critical lookups
- [ ] Add logging nodes for lookup failures
- [ ] Unit test each lookup node independently

### Day 3: Create Flow
- [ ] Modify "Create New Job" → "Create Commitment Block" (UUID fields)
- [ ] Create "Create Client Request" node
- [ ] Wire up sequential flow (commitment_block → client_request)
- [ ] Test create flow with pinned test event
- [ ] Verify data in Supabase tables

### Day 4: Integration Testing
- [ ] Test dual-language event (Spanish/Mam)
- [ ] Test single-language event
- [ ] Test event with no interpreter (NULL handling)
- [ ] Test duplicate event detection
- [ ] Review Jobs Board UI with test data

### Day 5: Load Testing & Refinement
- [ ] Process 20+ real GCal events
- [ ] Review lookup failure logs
- [ ] Refine case notes parsing patterns
- [ ] Add missing reference data (new languages, orgs, interpreters)
- [ ] Final UI verification
- [ ] User acceptance testing

### Post-Implementation
- [ ] Document new workflow in README
- [ ] Update QUICK-START-CHECKLIST.md with new node structure
- [ ] Plan Phase 2: Update flow implementation
- [ ] Monitor workflow for first week of production use

---

## Success Criteria

**Path 2 implementation is successful if:**

1. ✅ 95%+ of GCal events successfully create commitment_blocks with valid foreign keys
2. ✅ 95%+ of client_requests successfully link to commitment_blocks
3. ✅ Jobs Board UI displays all job information correctly
4. ✅ Duplicate events are properly detected and updated (no duplicates in Supabase)
5. ✅ Lookup failures are logged and can be resolved manually
6. ✅ Case notes parsing extracts client_name in 80%+ of cases
7. ✅ Workflow execution time < 10 seconds per event

**Failure criteria:**

- ❌ >10% of events fail to create commitment_blocks
- ❌ Critical data loss (missing language, organization, time data)
- ❌ Duplicate records created despite fingerprint matching
- ❌ UI cannot display jobs due to missing foreign key data

---

**Next Steps:** Review this plan, answer open questions, then begin implementation Day 1.
