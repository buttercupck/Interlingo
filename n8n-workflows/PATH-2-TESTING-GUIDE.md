# Path 2 Testing Guide

**Created:** 2026-02-02
**Workflow File:** `gcal-to-interlingo-upsert-path2.json`
**Status:** Ready for import and testing

---

## What Changed

### Before (Text Fields)
```
GCal Event → Parse → Create commitment_blocks with:
  - language: "Spanish" (text)
  - interpreter: "Ma M" (text)
  - org_abbreviation: "ENUMCLAW" (text)
  - case_notes: "BRAVO..." (text blob)
```

### After (UUID Foreign Keys)
```
GCal Event → Parse → Lookup Language → Lookup Org → Lookup Interpreter → Parse Case → Create commitment_blocks with:
  - language_id: uuid (FK to languages table)
  - location_id: uuid (FK to locations table via organizations)
  - interpreter_id: uuid (FK to interpreters table, nullable)

PLUS Create client_requests with:
  - commitment_block_id: uuid (links to commitment_blocks)
  - language_id: uuid (FK to languages table)
  - client_name: "BRAVO ALTAMIRANO, JILVER" (parsed)
  - case_number: "4A0045471 ENP CTPTR" (parsed)
  - charges: "DUI..." (parsed)
  - meeting_type: "Court Hearing" (default)
```

---

## New Nodes Added

### 1. Lookup Language ID
- **Type:** Supabase getAll on `languages` table
- **Query:** `name=eq.{{ $json.language }}`
- **Returns:** Language record with `id` field
- **Critical:** Blocks job creation if language not found

### 2. Process Language Lookup
- **Type:** Code node
- **Purpose:** Extract `language_id` from lookup result, detect errors
- **Outputs:**
  - Success: Adds `language_id` to data
  - Failure: Sets `error: true` with error details

### 3. Language Found?
- **Type:** If node
- **Condition:** `error === false`
- **True branch:** Continue to organization lookup
- **False branch:** Log missing language error

### 4. Log Missing Language
- **Type:** Code node
- **Purpose:** Log error to console for manual review
- **Stops workflow:** Critical error, job not created

### 5. Lookup Organization/Location ID
- **Type:** Supabase getAll on `locations` table
- **Query:** `organization_id=in.(SELECT id FROM organizations WHERE abbreviation=eq.{{ $json.org_abbreviation }})`
- **Returns:** Location record with `id` field
- **Critical:** Blocks job creation if organization not found

### 6. Process Org Lookup
- **Type:** Code node
- **Purpose:** Extract `location_id` from lookup result, detect errors
- **Outputs:**
  - Success: Adds `location_id` to data
  - Failure: Sets `error: true` with error details

### 7. Organization Found?
- **Type:** If node
- **Condition:** `error === false`
- **True branch:** Continue to interpreter lookup
- **False branch:** Log missing organization error

### 8. Log Missing Organization
- **Type:** Code node
- **Purpose:** Log error to console for manual review
- **Stops workflow:** Critical error, job not created

### 9. Lookup Interpreter ID
- **Type:** Supabase getAll on `interpreter_aliases` table
- **Query:** `alias=eq.{{ $json.interpreter }}`
- **Returns:** Alias record with `interpreter_id` field
- **Optional:** NULL is acceptable if interpreter not found

### 10. Process Interpreter Lookup
- **Type:** Code node
- **Purpose:** Extract `interpreter_id` from lookup result (or set to NULL)
- **Outputs:**
  - Success: Adds `interpreter_id` to data
  - Not found: Sets `interpreter_id: null` (acceptable)
  - Empty interpreter field: Sets `interpreter_id: null`

### 11. Parse Case Notes
- **Type:** Code node
- **Purpose:** Extract structured fields from case_notes text blob
- **Extracts:**
  - `client_name` (first line, all caps)
  - `case_number` (second line, alphanumeric)
  - `charges` (remaining lines)
  - `meeting_type` (default: "Court Hearing")
- **Fallback:** If parsing fails, stores entire case_notes in `charges` and sets `client_name: "Unknown Client"`

### 12. Create Commitment Block (Modified)
- **Type:** Supabase insert on `commitment_blocks` table
- **Changed fields:**
  - ❌ Removed: `language`, `interpreter`, `org_abbreviation`, `case_notes`, `fingerprint_raw`
  - ✅ Added: `interpreter_id` (UUID, nullable), `location_id` (UUID, required)
  - ✅ Kept: `gcal_event_id`, `modality`, `start_time`, `end_time`, `fingerprint_hash`, `version`
- **Returns:** Created record with `id` field (needed for client_requests)

### 13. Create Client Request (NEW)
- **Type:** Supabase insert on `client_requests` table
- **Fields:**
  - `commitment_block_id` (from Create Commitment Block output)
  - `language_id` (from lookup)
  - `client_name` (from Parse Case Notes)
  - `case_number` (from Parse Case Notes)
  - `charges` (from Parse Case Notes)
  - `meeting_type` (from Parse Case Notes)
- **Sequential:** Must run AFTER Create Commitment Block

---

## Testing Checklist

### Pre-Test: Verify Reference Data

Before importing the workflow, ensure reference tables have data:

```sql
-- Check languages exist
SELECT * FROM languages WHERE name IN ('Spanish', 'Mam', 'Ukrainian', 'Russian');

-- Check organizations exist with abbreviations
SELECT o.id, o.name, o.abbreviation, l.id as location_id
FROM organizations o
LEFT JOIN locations l ON l.organization_id = o.id
WHERE o.abbreviation IN ('ENUMCLAW', 'PUYALLUP', 'MILTON');

-- Check interpreter aliases exist
SELECT ia.alias, i.id as interpreter_id, i.first_name, i.last_name
FROM interpreter_aliases ia
JOIN interpreters i ON i.id = ia.interpreter_id
WHERE ia.alias IN ('Ma M', 'Ma F');
```

**If data is missing:**
- Add missing languages to `languages` table
- Add missing organizations to `organizations` table with `abbreviation` column
- Add missing interpreters and aliases to `interpreters` and `interpreter_aliases` tables

### Test 1: Import Workflow

1. Open n8n at https://n8n.interlingo.augeo.one
2. Go to Workflows → Import from File
3. Select `gcal-to-interlingo-upsert-path2.json`
4. Workflow should import successfully
5. All nodes should be connected (no orphans)

**Expected:** Workflow imports with no errors

### Test 2: Verify Credentials

1. Open imported workflow in editor
2. Check for orange warning nodes (missing credentials)
3. All Supabase nodes should use "Supabase account" credential
4. Google Calendar Trigger should use "Google Calendar account" credential

**Expected:** No orange warning nodes

### Test 3: Test with Pinned Data (Dual Language)

The workflow has pinned test data: "Spanish/Mam - Ma M ZOOM" at ENUMCLAW

1. Click "Execute Workflow" in editor
2. Workflow should process TWO items (one per language: Spanish, Mam)
3. Watch execution flow:
   - Parse Event: 2 outputs (Spanish, Mam)
   - Lookup Language ID: 2 queries (one per language)
   - Process Language Lookup: 2 successes
   - Language Found?: 2 true branches
   - Lookup Organization/Location ID: 2 queries (both ENUMCLAW)
   - Process Org Lookup: 2 successes
   - Organization Found?: 2 true branches
   - Lookup Interpreter ID: 2 queries (both "Ma M")
   - Process Interpreter Lookup: 2 results (interpreter_id or NULL)
   - Parse Case Notes: 2 parsed outputs
   - Query Existing Job: 2 queries (check fingerprints)
   - Create Commitment Block: 2 inserts (if new)
   - Create Client Request: 2 inserts (if new)

**Expected Results:**
- ✅ 2 commitment_blocks created (one Spanish, one Mam)
- ✅ 2 client_requests created (linked to commitment_blocks)
- ✅ Both have same `location_id` (ENUMCLAW)
- ✅ Both have same `interpreter_id` (Ma M) or NULL
- ✅ Different `language_id` (Spanish vs Mam)
- ✅ Different `fingerprint_hash` (includes language in fingerprint)
- ✅ Case data parsed: `client_name: "BRAVO ALTAMIRANO , JILVER"`
- ✅ Case data parsed: `case_number: "4A0045471 ENP CTPTR"`

### Test 4: Verify in Supabase

After Test 3 execution:

```sql
-- Find the commitment_blocks created
SELECT
  cb.id,
  cb.gcal_event_id,
  cb.start_time,
  cb.fingerprint_hash,
  cb.interpreter_id,
  cb.location_id,
  l.name as language_name,
  o.name as org_name,
  i.first_name || ' ' || i.last_name as interpreter_name
FROM commitment_blocks cb
LEFT JOIN locations loc ON loc.id = cb.location_id
LEFT JOIN organizations o ON o.id = loc.organization_id
LEFT JOIN interpreters i ON i.id = cb.interpreter_id
LEFT JOIN client_requests cr ON cr.commitment_block_id = cb.id
LEFT JOIN languages l ON l.id = cr.language_id
WHERE cb.gcal_event_id = '_8go3ig9g6os30b9o8l0jeb9k8gsk4b9o70p30ba26l2k2d226h2j6d9h8o'
ORDER BY cb.created_at DESC;

-- Find the client_requests created
SELECT
  cr.id,
  cr.commitment_block_id,
  cr.client_name,
  cr.case_number,
  cr.charges,
  cr.meeting_type,
  l.name as language
FROM client_requests cr
JOIN languages l ON l.id = cr.language_id
WHERE cr.commitment_block_id IN (
  SELECT id FROM commitment_blocks
  WHERE gcal_event_id = '_8go3ig9g6os30b9o8l0jeb9k8gsk4b9o70p30ba26l2k2d226h2j6d9h8o'
);
```

**Expected:**
- ✅ 2 rows in commitment_blocks
- ✅ 2 rows in client_requests
- ✅ All foreign keys are valid UUIDs (not NULL except interpreter_id)
- ✅ client_name = "BRAVO ALTAMIRANO , JILVER"
- ✅ case_number starts with "4A0045471"
- ✅ charges contains "DUI" and other case info

### Test 5: Test Single Language Event

Create a new pinned test event:

```json
{
  "summary": "Spanish - John Doe PHONE",
  "description": "SMITH , JANE\n5B1234567 CASE ABC\nSpeeding\nReckless Driving",
  "location": "PUYALLUP MUNICIPAL COURT",
  "start": {
    "dateTime": "2026-02-05T09:00:00-08:00"
  },
  "end": {
    "dateTime": "2026-02-05T11:00:00-08:00"
  },
  "id": "test-single-lang-001"
}
```

Execute workflow and verify:
- ✅ 1 commitment_block created (Spanish only)
- ✅ 1 client_request created
- ✅ modality = "Phone"
- ✅ client_name = "SMITH , JANE"
- ✅ case_number = "5B1234567 CASE ABC"

### Test 6: Test No Interpreter Event

Create pinned test event with no interpreter:

```json
{
  "summary": "Ukrainian - ZOOM",
  "description": "DOE , JOHN\nNO CASE NUMBER\nTraffic Violation",
  "location": "MILTON DISTRICT COURT",
  "start": {
    "dateTime": "2026-02-06T14:00:00-08:00"
  },
  "end": {
    "dateTime": "2026-02-06T16:00:00-08:00"
  },
  "id": "test-no-interpreter-001"
}
```

Execute workflow and verify:
- ✅ 1 commitment_block created
- ✅ `interpreter_id` is NULL
- ✅ 1 client_request created
- ✅ No errors in workflow execution

### Test 7: Test Missing Language Error

Create pinned test event with unknown language:

```json
{
  "summary": "Klingon - Ma M ZOOM",
  "description": "TEST CLIENT",
  "location": "ENUMCLAW",
  "start": {
    "dateTime": "2026-02-07T10:00:00-08:00"
  },
  "end": {
    "dateTime": "2026-02-07T12:00:00-08:00"
  },
  "id": "test-missing-language-001"
}
```

Execute workflow and verify:
- ✅ Workflow stops at "Language Found?" node
- ✅ Routes to "Log Missing Language" node
- ✅ Console log shows error: "Language 'Klingon' not found"
- ✅ No commitment_blocks or client_requests created

### Test 8: Test Missing Organization Error

Create pinned test event with unknown organization:

```json
{
  "summary": "Spanish - Ma M ZOOM",
  "description": "TEST CLIENT",
  "location": "GOTHAM MUNICIPAL COURT",
  "start": {
    "dateTime": "2026-02-08T10:00:00-08:00"
  },
  "end": {
    "dateTime": "2026-02-08T12:00:00-08:00"
  },
  "id": "test-missing-org-001"
}
```

Execute workflow and verify:
- ✅ Workflow stops at "Organization Found?" node
- ✅ Routes to "Log Missing Organization" node
- ✅ Console log shows error: "Organization 'GOTHAM' not found"
- ✅ No commitment_blocks or client_requests created

### Test 9: Test Duplicate Detection

Run Test 3 again (same pinned event: "Spanish/Mam - Ma M ZOOM")

Verify:
- ✅ Query Existing Job finds existing records (by fingerprint_hash)
- ✅ Routes to "Compare Changes" branch (not "Create New Job")
- ✅ If no changes: Routes to "Touch Last Synced"
- ✅ No duplicate commitment_blocks created
- ✅ No duplicate client_requests created

### Test 10: Verify Jobs Board UI

After creating test data:

1. Open https://interlingo.augeo.one/jobs
2. Verify jobs display correctly:
   - ✅ Language name shows (not UUID)
   - ✅ Organization name shows (not UUID)
   - ✅ Interpreter name shows (or "Unassigned")
   - ✅ Date/time correct
   - ✅ Modality correct

3. Click on a job to see details
4. Verify case information displays:
   - ✅ Client name
   - ✅ Case number
   - ✅ Charges

---

## Troubleshooting

### Error: "Language not found"

**Cause:** Language doesn't exist in `languages` table

**Fix:**
```sql
INSERT INTO languages (name, code) VALUES ('Spanish', 'es');
INSERT INTO languages (name, code) VALUES ('Mam', 'mam');
-- Add other languages as needed
```

### Error: "Organization not found"

**Cause:** Organization doesn't exist or `abbreviation` column missing

**Fix:**
```sql
-- Check if abbreviation column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'organizations' AND column_name = 'abbreviation';

-- If missing, add column
ALTER TABLE organizations ADD COLUMN abbreviation TEXT;

-- Update existing orgs with abbreviations
UPDATE organizations SET abbreviation = 'ENUMCLAW' WHERE name LIKE '%Enumclaw%';
UPDATE organizations SET abbreviation = 'PUYALLUP' WHERE name LIKE '%Puyallup%';
UPDATE organizations SET abbreviation = 'MILTON' WHERE name LIKE '%Milton%';

-- Or insert new organizations
INSERT INTO organizations (name, abbreviation) VALUES ('Enumclaw Municipal Court', 'ENUMCLAW');
-- Then create locations for each org
INSERT INTO locations (organization_id, address, city, state, zip)
SELECT id, '...', 'Enumclaw', 'WA', '98022' FROM organizations WHERE abbreviation = 'ENUMCLAW';
```

### Error: "Interpreter not found"

**Not an error** - This is acceptable. Workflow sets `interpreter_id` to NULL and logs a warning.

**To add interpreter:**
```sql
-- Insert interpreter
INSERT INTO interpreters (first_name, last_name, email, phone) VALUES ('Ma', 'M', 'mam@example.com', NULL);

-- Add alias
INSERT INTO interpreter_aliases (interpreter_id, alias)
SELECT id, 'Ma M' FROM interpreters WHERE first_name = 'Ma' AND last_name = 'M';
```

### Error: "Case notes not parsing correctly"

**Cause:** Unexpected case_notes format

**Current patterns:**
- Line 1: Client name (all caps, comma separated)
- Line 2: Case number (alphanumeric with spaces)
- Lines 3+: Charges

**If format doesn't match:**
- Workflow stores entire case_notes in `charges` field
- Sets `client_name: "Unknown Client"`
- Logs to console for manual review

**To improve parsing:**
1. Review console logs for unparsable patterns
2. Update "Parse Case Notes" node regex patterns
3. Test with new patterns

### Workflow not executing

**Checklist:**
1. ✅ All credentials assigned to nodes?
2. ✅ Workflow active status = true?
3. ✅ Google Calendar trigger configured correctly?
4. ✅ Using pinned data for testing?

### Jobs not appearing in UI

**Checklist:**
1. ✅ commitment_blocks records created in Supabase?
2. ✅ client_requests records created and linked?
3. ✅ Foreign keys are valid UUIDs (not NULL)?
4. ✅ UI querying correct tables with JOINs?
5. ✅ Check browser console for errors

---

## Performance Notes

**Execution time per event (single language):**
- Parse Event: ~10ms
- Lookup Language ID: ~50ms (Supabase query)
- Process Language Lookup: ~5ms
- Lookup Organization/Location ID: ~75ms (Supabase query with subquery)
- Process Org Lookup: ~5ms
- Lookup Interpreter ID: ~50ms (Supabase query)
- Process Interpreter Lookup: ~5ms
- Parse Case Notes: ~10ms
- Query Existing Job: ~50ms (Supabase query)
- Create Commitment Block: ~75ms (Supabase insert)
- Create Client Request: ~75ms (Supabase insert)

**Total:** ~410ms per language (~820ms for dual-language event)

**For 100 events/day:** ~41 seconds total processing time

**Acceptable performance** ✅

---

## Next Steps After Testing

1. ✅ Test all scenarios above
2. ✅ Fix any issues with reference data
3. ✅ Adjust case_notes parsing patterns if needed
4. ✅ Process 20+ real GCal events as load test
5. ✅ Review logs for lookup failures
6. ✅ Verify Jobs Board UI displays correctly
7. ✅ Get user approval
8. ✅ Deactivate old workflow (gcal-to-interlingo-upsert.json)
9. ✅ Activate new workflow (gcal-to-interlingo-upsert-path2.json)
10. ✅ Monitor first week of production use

---

**Test completion criteria:**
- All 10 test scenarios pass
- No lookup failures for common languages/orgs
- Case notes parsing extracts client_name in 80%+ of cases
- Jobs Board UI displays all data correctly
- Duplicate detection works (no duplicate records)
- Performance acceptable (<1 second per event)
