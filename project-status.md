---
project: Interlingo
client: Intercom Language Services
status: in-progress
last_updated: 2026-01-22
---

# Interlingo Project Status

**Current Focus:** Job Detail Redesign (1204) and system architecture improvements

---

## Recent Development Sessions

### 2026-01-22 - Intercom/Interlingo Folder Separation

**What Was Completed:**

✅ **Architecture Restructure:**
- Separated employer operational data (moved to `[[../Intercom/]]`) from software project
- Interlingo now contains only: web/, supabase/, design/, docs/, system_logic/
- Moved instructions/ and templates/ to Intercom (employer context)
- Moved CONFIG-ARCHITECTURE.md from parent into Interlingo/ (technical documentation)
- 156 files renamed via `git mv` with history preserved

✅ **CHANGELOG Split:**
- Created software-focused CHANGELOG.md
- Separated employer operational changes (moved to `[[../Intercom/CHANGELOG]]`)
- Clear separation between development decisions and employer process changes

**Files Changed:**
- Updated `CHANGELOG.md` to focus on software development only
- Updated wikilinks to reflect new sibling structure: `[[../Intercom/...]]`

---

### 2026-01-21 - Duplicate Project Status Merge

**What Was Completed:**

✅ **Merged Conflicting Project Status Files:**
- Combined two project-status files (uppercase and lowercase) into single canonical file
- Merged session-based narrative format with task checklist format
- Followed lowercase naming convention: `project-status.md`

---

### 2026-01-12 - Folder Cleanup & Instructions Consolidation

**What Was Completed:**

✅ **Folder Organization:**
- Removed duplicate files and orphaned folders
- Consolidated instructions: `organization-specific-instructions/` + `standard-modality-instructions/` → `instructions/`
- Moved Competency Evaluation.md to docs/
- Moved archive.zip to parent intercom/archive/
- Root level: 5 files + 7 folders (improved clarity)

**Note:** Instructions folder later moved to Intercom in 2026-01-22 migration

---

### 2025-12-29 - GCal-to-Supabase Fingerprint-Based Upsert Workflow

**What Was Completed:**

✅ **N8N Workflow Created:**
- Workflow ID: `gcal-to-interlingo-upsert` (7dUIkjJbDE6gPpmx)
- Fingerprint-based deduplication prevents duplicate job creation
- Database migration 007: Added `fingerprint_hash`, `version`, `gcal_event_id`, `last_synced_at` to `commitment_blocks`
- Created `job_version_history` table for audit trail

✅ **Technical Discovery:**
- N8N Merge node with `combineByPosition` fails when one input is empty
- Solution: `$('NodeName').first().json` expression pattern to reach back to earlier node output
- All nodes set `alwaysOutputData: true` to handle empty query results

---

### 2025-12-05 - Database Migration & Project Folder Organization

**What Was Completed:**

✅ **1204-1: Database Migration:**
- Added `request_received` field to `client_requests` table
- Job Detail Redesign Phase 1 database changes complete

✅ **Project Folder Cleanup:**
- Created `_ARCHIVE/` with subdirectories (deprecated-mockups, deprecated-plans, deprecated-docs)
- Created `n8n/` folder for infrastructure files
- Created `supabase/` folder for schema documentation
- Renamed plan: `mossy-crafting-nygaard.md` → `1204-Job-Detail-Redesign.md`
- Root folder cleaner with logical grouping

---

## Active Development Tasks

### 1204 - Job Detail Redesign Implementation

**Plan:** `1204-Job-Detail-Redesign.md` (root of Interlingo folder)
**Mockup:** `web/phase1-color-reference.html`

- [x] **1204-1:** Database Migration - Add `request_received` field to `client_requests` table ✅ (completed 2025-12-05)
- [ ] **1204-2:** CSS Consolidation - Replace remaining CSS variable utilities (~15 instances remaining)
- [ ] **1204-3:** Create Modal Components - EditDateTimeModal and AddNoteModal
- [ ] **1204-4:** Update Existing Components - JobOverviewCard, OrganizationLocationCard, JobNotesSection
- [ ] **1204-5:** Fix InterpreterManagement Component - Rewrite to match reference mockup (structural and styling issues)
- [ ] **1204-6:** Update Job Detail Page Layout (restructure to match approved mockup)
- [ ] **1204-7:** Final Testing & Cleanup

### System Architecture & Infrastructure

- [x] Separate Intercom/ (employer context) from Interlingo/ (software project) ✅ (completed 2026-01-22)
- [x] Move employer operational data to `[[../Intercom/]]` ✅ (completed 2026-01-22)
- [x] Keep Interlingo software project isolated with clear boundaries ✅ (completed 2026-01-22)
- [ ] Complete gcal-to-interlingo-upsert workflow (missing FK fields, language lookup, client_requests)

### Code Quality & Maintenance

- [ ] Audit web components to identify unused files for archiving (QuickAssignTable, JobAssignmentTracker, InterpretersCard, etc.)
- [ ] Create STYLING-GUIDE.md documentation (when to use design system vs Tailwind)
- [ ] Fix pre-existing TypeScript error (InterpreterFilters type export in interpreters/page.tsx)
- [ ] Visually test interpreter dashboard filter dropdowns in browser
- [ ] Test filter combinations to verify OR/AND logic
- [ ] Fix {{LANGUAGE}} template variable bug from Nov 12 session
- [ ] Commit interpreter dashboard files once visual testing complete
- [x] ~~Implement design system improvements (status dropdowns, styled dropdowns, email tab labels)~~ (completed 2025-12-01)
- [x] ~~Resolve Supabase schema cache issue for preference_rank column sync~~ (completed 2025-11-26)
- [x] ~~Update interpreter matching query to sort by preference_rank ASC~~ (completed 2025-11-26)
- [x] ~~Build job creation infrastructure (useCreateJob hook, ICS generator)~~ (completed 2025-11-25)
- [x] ~~Import all 179 Spanish interpreters from Excel Master List~~ (completed 2025-11-25)
- [x] ~~Build preference ranking sync script~~ (completed 2025-11-25)

---

## Project Context

**Stack:** Next.js + Supabase (PostgreSQL) + N8N (workflow automation)

**Key Directories:**
- `web/` - Next.js application (Interlingo UI)
- `supabase/` - Database schema, migrations, SQL scripts
- `design/` - UI mockups and design references
- `docs/` - Technical documentation
- `system_logic/` - System architecture and logic documentation

**Key Files:**
- `CHANGELOG.md` - Software development decision log
- `README.md` - Project overview and architecture
- `1204-Job-Detail-Redesign.md` - Active redesign plan
- `CONFIG-ARCHITECTURE.md` - Technical system architecture

**Related Projects:**
- `[[../Intercom/README]]` - Employer operational context (instructions, templates, workflows)
- `[[../Intercom/instructions/organizations/]]` - Organization configs (data source for Interlingo)
- `[[../Intercom/templates/]]` - Email templates (data source for Interlingo)

---

## Next Steps

**Immediate Priority:**
1. Continue 1204 Job Detail Redesign - CSS consolidation (Step 2)
2. Build modal components (EditDateTimeModal, AddNoteModal)
3. Update existing components to match approved mockup

**Ongoing:**
- Complete gcal-to-interlingo-upsert workflow for automated calendar sync
- Component audit and archiving
- TypeScript error fixes
- Design system documentation
