---
type: changelog
created: 2026-01-05
last-updated: 2026-01-22
---

# Interlingo Project Changelog

**Purpose:** Track significant architectural decisions, feature implementations, and system changes for the Interlingo software project

**Format:** Append-only, newest entries at top

**Scope:** Software development decisions, technical architecture, feature implementations

**Note:** For employer operational changes (workflows, instructions, n8n automation), see `[[../Intercom/CHANGELOG]]`.

---

## 2026-01-22

### Changed: Intercom/Interlingo Folder Separation

**What Changed:** Restructured from nested to sibling folder architecture

**Context:** Interlingo folder contained mix of employer operational data (instructions/, templates/) and software project code (web/, supabase/). This created confusion about what belongs in the software project vs employer operations.

**Restructuring:**
- **Before:** `INCOME/intercom/Interlingo/` (nested, mixed content)
- **After:** `INCOME/Intercom/` (employer ops) and `INCOME/Interlingo/` (software only)

**Moved OUT of Interlingo (to Intercom):**
- `instructions/` → Employer operational data (organization configs, standard instructions, workflows)
- `templates/` → Email templates (REQ/CONF/REM)
- `BEFORE-STANDARDS-WORKFLOW.md`, `INSTRUCTION-SYSTEM-EXPLAINED.md`, `INSTRUCTION-SYSTEM-DIAGRAM.md`, `PROBLEMS-SECTION-REVISED.md` → Employer onboarding docs

**Moved INTO Interlingo (from parent):**
- `CONFIG-ARCHITECTURE.md` → Technical documentation about system architecture

**Rationale:**
- **Clear boundaries:** Software vs operations
- **Clinton/Third onboarding:** Instructions folder is "how to do the job TODAY" (independent of Interlingo launch)
- **Software focus:** Interlingo now contains only: web/, supabase/, design/, docs/, system_logic/
- **Graph-view architecture:** Siblings connected by wikilinks, not nested parent-child

**Impact:**
- ✅ Clear separation between employer context (Intercom) and software project (Interlingo)
- ✅ CHANGELOGs split by domain (operational vs development)
- ✅ Project-status files focused on their scope (job tasks vs dev tasks)
- ✅ Wikilinks updated to reflect new structure: `[[../Intercom/instructions/...]]`

**Files Changed:** 156 files renamed via `git mv` (history preserved)

**Reference:** `[[../Intercom/MIGRATION-PLAN]]` - Complete migration documentation

---

## 2026-01-21

### Fixed: Duplicate Project-Status Files - Merged and Renamed

**What Changed:** Merged two conflicting project-status files into single lowercase `project-status.md` following system naming conventions

**Context:** Two project-status files existed with different purposes:
- `Project Status.md` (uppercase, 6,964 bytes) - Session-based narrative format (recent sessions, what was completed, what needs work)
- `project-status.md` (lowercase, 50,445 bytes) - Task checklist format (long-term milestones, organized by category)

This violated graph-view architecture's "one home per file" principle and created confusion about which file was canonical.

**Key Changes:**

**1. Merged Content Structure:**
- **Recent Sessions section** (from uppercase file) - Session logs at top for chronological narrative
- **Active Tasks section** (from lowercase file) - Categorized task checklists for milestone tracking
- **Project Context** (combined) - Stack info, key files, current challenges
- **Next Steps** (combined) - Immediate priorities and ongoing work

**2. File Organization:**
- Kept lowercase `project-status.md` as canonical file (follows naming convention)
- Deleted uppercase `Project Status.md` duplicate
- Updated last_updated frontmatter to 2026-01-21

**Why:**
- **Naming convention compliance:** Lowercase with hyphens matches system-wide standard
- **Single source of truth:** One file eliminates confusion about which is current
- **Best of both:** Session logs provide context, task checklists track milestones
- **Graph-view architecture:** Respects "one home per file" principle

**Impact:**
- Single authoritative project status file
- Combined session narrative with task tracking
- Clearer project overview for development work
- Follows vault-wide naming conventions

**Files Changed:**
- Merged: `Project Status.md` + `project-status.md` → `project-status.md`
- Deleted: `Project Status.md` (uppercase duplicate)

---

## 2026-01-12

### Changed: Folder Cleanup - Instructions Consolidation & Template Merge

**What Changed:** Removed duplicates, collapsed orphaned folders, consolidated instructions

**Context:** Project had accumulated orphaned folders, duplicate files, and unclear organization

**Changes:**
- Deleted 2 duplicate templates (assets/ versions older than templates/ versions)
- Consolidated instructions: `organization-specific-instructions/` + `standard-modality-instructions/` → `instructions/organizations/` + `instructions/standard/`
- Moved Competency Evaluation.md: types-instructions/ → docs/
- Removed orphaned folders: assets/, types-instructions/, external/
- Moved PAI-Integration-Proposal.md to docs/ (aspirational, not operational)
- Moved add-frontmatter-dates.ts to .claude/scripts/ (system-wide utility)
- Moved archive.zip to parent intercom/archive/

**Why:** Eliminate folder clutter, follow graph-view iron rules (max 3 levels, one home per file)

**Impact:**
- Root level: Now 5 files + 7 folders (down from previous clutter)
- Clear organization hierarchy
- No duplicate content

**Files Deleted:** 4 (2 duplicate templates, gitignore.md reference, 2 empty folders)

**Folders Renamed:** 2 directories consolidated under instructions/ (NOTE: instructions/ later moved to Intercom in 2026-01-22 migration)

---

## 2026-01-05

### Added: Complete Folder Restructuring (5-Phase Cleanup)

**What Changed:** Comprehensive reorganization of Interlingo project to align with graph-view architecture

**Why:** Eliminate orphaned files, remove duplicates, establish consistent naming, create clear information architecture

**Impact:**
- Root directory now contains only hub files (README, project-status, CHANGELOG, ROADMAP) plus organized subdirectories
- All documentation consolidated in logical locations (n8n/, supabase/, docs/, design/)
- Consistent lowercase-with-hyphens naming across all folders
- Legacy content preserved in `_ARCHIVE/` with categorical organization
- Pain points tracker moved to `docs/` for development planning visibility

**Phase 1: Three-File Pattern**
- Created `CHANGELOG.md` (this file)
- Renamed `Project Status.md` → `project-status.md`

**Phase 2: Remove Duplicates**
- Deleted `N8N-SETUP-GUIDE.md` (duplicate of n8n/ content)
- Deleted `Supabase-Schema.md` (duplicate of supabase/ content)

**Phase 3: Organize Orphaned Files**
- Created `docs/` folder
- Moved `PAIN-POINTS-TRACKER.md` → `docs/` (requirements tracking)
- Moved `PHASE1-TESTING-GUIDE.md` → `docs/` (testing documentation)
- Moved `CSS-AUDIT-AND-REMEDIATION-PLAN.md` → `docs/` (technical planning)
- Moved 3 N8N workflow files → `n8n/` (GCal-to-Supabase-Mapping, workflow JSON, UPSERT-WORKFLOW-SCAFFOLD)
- Moved 2 Supabase files → `supabase/` (populate-reference-data.ts, REFERENCE-DATA.sql)
- Moved 2 design screenshots → `design/` (job-detail-full.png, jobs-board-full.png)

**Phase 4: Archive Legacy Content**
- Created `_ARCHIVE/deprecated-plans/` subdirectory
- Moved `Intercom-State-of-Silo.md` → `_ARCHIVE/deprecated-docs/` (legacy documentation from 2025-09-16)
- Moved `1005 - jobs-page-changes-examples.md` → `_ARCHIVE/deprecated-plans/` (Oct 2024 plan)
- Moved `1204-Job-Detail-Redesign.md` → `_ARCHIVE/deprecated-plans/` (Dec 2024 completed plan)

**Phase 5: Folder Naming Standardization**
- Renamed `Organization Specific Instructions` → `organization-specific-instructions`
- Renamed `Standard Modality Instructions` → `standard-modality-instructions`
- Renamed `Templates` → `templates`
- Renamed `types_instructions` → `types-instructions`
- Renamed `X T E R N A L` → `external`

**Files Created:**
- `docs/` folder (documentation consolidation)
- `_ARCHIVE/deprecated-plans/` folder (completed plan archive)

**Files Moved:** 13 orphaned files relocated to proper subdirectories
**Files Deleted:** 2 duplicate files removed
**Folders Renamed:** 5 directories standardized to lowercase-hyphen convention

**Reference:** SYSTEM/project-status.md - Vault-wide graph-view architecture standards

---

### Added: Graph-View Architecture Compliance (Initial Setup)

**What Changed:** Established three-file pattern with proper naming conventions

**Why:** Align Interlingo with vault-wide graph-view architecture standards

**Impact:**
- Renamed `Project Status.md` → `project-status.md` (lowercase naming convention)
- Created `CHANGELOG.md` (this file) to track decision history
- Maintains `README.md` as hub note
- All three files now follow consistent naming: lowercase with hyphens

**Files Created:**
- `CHANGELOG.md` (infrastructure decision tracking)

**Files Renamed:**
- `Project Status.md` → `project-status.md`

**Reference:** SYSTEM/changelog.md - Vault-wide graph-view architecture implementation

---

## 2025-12-29

### Added: GCal-to-Supabase Fingerprint-Based Upsert Workflow

**What Changed:** Created N8N workflow `gcal-to-interlingo-upsert` (ID: 7dUIkjJbDE6gPpmx) with fingerprint-based deduplication

**Why:** Prevent duplicate job creation from repeated calendar event triggers; maintain single source of truth

**Impact:**
- Database migration 007: Added `fingerprint_hash`, `version`, `gcal_event_id`, `last_synced_at` to `commitment_blocks`
- Created `job_version_history` table for audit trail
- Workflow queries by fingerprint before creating/updating jobs
- Solved N8N empty query output issue with `$('NodeName').first().json` expression pattern

**Technical Discovery:**
- N8N Merge node with `combineByPosition` fails when one input is empty
- Solution: Reach back to earlier node output in same execution using expression syntax
- All nodes set `alwaysOutputData: true` to handle empty query results

**Reference:** project-status.md - Session 2025-12-29

---

## 2025-12-05

### Changed: Project Folder Organization ("Cleanup Fridays")

**What Changed:** Restructured Interlingo root folder with logical grouping and archive system

**Why:** Reduce root folder clutter, improve navigation, preserve historical context

**Impact:**
- Created `_ARCHIVE/` with subdirectories (deprecated-mockups, deprecated-plans, deprecated-docs)
- Created `n8n/` folder and moved all N8N infrastructure files
- Created `supabase/` folder and moved schema documentation
- Moved plan file from `.claude/plans/` to project root for accessibility
- Renamed plan: `mossy-crafting-nygaard.md` → `1204-Job-Detail-Redesign.md`

**Archive Structure Created:**
```
_ARCHIVE/
├── deprecated-mockups/ (3 old HTML design mockups)
├── deprecated-plans/ (empty, pending verification)
├── deprecated-components/ (pending investigation)
└── deprecated-docs/ (3 obsolete documentation files)
```

**Organizational Improvements:**
- Root folder cleaner with logical grouping
- Main plan file accessible at project root instead of buried
- Archive preserves historical context with comprehensive documentation
- Clear separation between active and deprecated files

**Reference:** project-status.md - Session 2025-12-05

---

## Earlier Changes

### 2025-11-05: Multi-Language Job Support
Implemented comprehensive multi-language job functionality including full client request edit/add workflow with modal components.

### 2025-10-29: Design System Implementation
Expanded `globals.css` from 57 to 446 lines with complete design system including typography classes, component classes, and CSS custom properties.

---

**How to Use This File:**
1. Add new entries at the TOP (newest first)
2. Never edit past entries - only append
3. Link to relevant session logs and project files
4. Include "Why" reasoning for every change
5. Document architectural decisions with impact analysis
