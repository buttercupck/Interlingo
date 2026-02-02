# Interlingo Pain Points Tracker

**Purpose:** Document friction points encountered during manual Intercom work to inform Interlingo feature requirements.

---

## Pain Point #1: Puyallup Municipal Court Email Composition Failure

**Date:** 2025-11-18
**Severity:** High
**Workflow:** Confirmation email to interpreter

### Problem Description

When replying to a terp for Puyallup Municipal Court (In-Person then Zoom hybrid), the manual workflow via Notion → Gmail draft produced an inadequate email. The draft was missing critical information:

1. **3-hour minimum + mileage instructions** - Required for in-person portion
2. **Court-specific arrival instructions** - Where to sit, paperwork procedures
3. **Zoom component instructions** - If applicable.

### Current Manual Workaround

- Copy from Notion
- Click "confirmed"
- Get draft in Gmail
- Manually look up court address on Google (every single time)
- Manually add 3-hour-min and mileage line items
- Manually add court-specific instructions

### Interlingo Solution Requirements

The system needs to:
- [ ] Detect "In-Person" or "Zoom" modality for Puyallup
- [ ] Auto-inject 3-hour minimum billing line
- [ ] Auto-inject mileage instructions
- [ ] Auto-inject court-specific instructions from `Client Specifics - Puyallup Municipal Court`
- [ ] Present complete, ready-to-send email (no Google lookups needed)

### Reference Files

- `system_logic/REM - Puyallup Municipal Court - In Person.md` - Existing logic spec
- `Client Specifics - Puyallup Municipal Court` - Court-specific instructions

---

## Pain Point #2: GCal Data Getting Stuck at Entry Point

**Date:** 2025-12-17
**Severity:** Medium
**Workflow:** GCal → Interlingo data ingestion

### Problem Description

Some copies from GCal are getting stuck somewhere in the entry point pipeline. Jobs are being created in GCal but not appearing in Interlingo or appearing incomplete/delayed.

### Current Manual Workaround

Unknown - need to investigate where the data is getting stuck in the n8n workflow or Supabase ingestion.

### Interlingo Solution Requirements

- [ ] Add logging/monitoring to identify where GCal data drops
- [ ] Implement retry mechanism for failed ingestions
- [ ] Create visibility into the sync status (dashboard or alerts)
- [ ] Debug the specific entry point causing the bottleneck

### Related Files

- `n8n/` - Workflow configurations
- `GCal-to-Supabase-Mapping.md` - Data mapping spec

---

## Pain Point #3: Client Instruction Files Data Integrity Risk

**Date:** 2025-12-22
**Severity:** Critical
**Workflow:** Vault → Interlingo email generation

### Problem Description

Client Specifics files in `Organization Specific Instructions/` are the source of truth for interpreter instructions. If these files contain incorrect or outdated information, Interlingo will send wrong instructions to interpreters—potentially causing:
- Interpreters calling wrong numbers
- Interpreters waiting wrong amounts of time
- Interpreters missing appointments
- Client complaints and business impact

**Discovered when:** Stein, Lotzkar & Starr file had template-variable placeholder text instead of actual instructions. The wrong content was committed to git at some point and persisted through merges undetected.

### Current Manual Workaround

- Manually verify each Client Specifics file content is correct
- Hope someone catches errors before they cause problems
- No automated detection of incorrect/changed instructions

### Interlingo Solution Requirements

- [ ] Audit all Client Specifics files immediately to verify correct content
- [ ] Add change detection for `Organization Specific Instructions/` folder
- [ ] Consider making Supabase the source of truth (edits through app UI, vault becomes documentation)
- [ ] Add version/last-verified date to each instruction file
- [ ] Create validation step before merging changes to instruction files

### Related Files

- `Organization Specific Instructions/Client Specifics - *.md` (all files)
- Any sync mechanism between vault and Supabase/app

---

## Pain Point #4

**Date:**
**Severity:**
**Workflow:**

### Problem Description

[To be filled as you encounter more issues]

### Current Manual Workaround

### Interlingo Solution Requirements

---
