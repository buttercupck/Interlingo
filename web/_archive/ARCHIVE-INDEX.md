---
created_datetime: 2026-02-01T20:00:00-08:00
last_edited_datetime: 2026-02-01T20:00:00-08:00
---
# Archive Index

This directory contains files that have been archived from the Interlingo web project root. These files served important purposes during development but are no longer needed in the active codebase.

## Archive Organization

### design-references/
Visual design comparison tools and CSS reference guides used during Phase 1 development.

**Files:**
- `card-comparison-guide.html` - Side-by-side comparison of production vs mockup card styling
- `phase1-color-reference.html` - Complete CSS consolidation and color system reference

**Context:** These HTML files were created to ensure design consistency between mockups and production. The design system is now stable and documented in production config files.

### poc-docs/
Proof of concept documentation for features that have been successfully integrated into production.

**Files:**
- `PHASE1-PROOF-OF-CONCEPT.md` - Single-source-of-truth configuration system POC

**Context:** Documents the implementation of dynamic organization-specific instructions managed through database config. The feature was successfully implemented and is now in production.

**Key Innovation:** Replaced hardcoded organization logic with database-driven configuration, enabling no-code updates to organization-specific email templates and instructions.

### debug-notes/
Temporary debugging documentation capturing point-in-time development challenges.

**Files:**
- `DEBUG.md` - TypeScript type system issues and Supabase type generation debugging

**Context:** Documents challenges with Supabase CLI type generation and missing authentication. These notes were valuable during development but represent resolved historical issues.

## How to Use This Archive

1. **Reference Only** - Files in this archive are for historical reference and should not be modified
2. **Context Preservation** - Helps understand the evolution of the project and decisions made
3. **Learning Resource** - POC documentation shows how features were initially conceived and validated

## Archive Date

All files in this archive were moved on February 1, 2026, as part of a comprehensive codebase cleanup.

## See Also

- `/CLEANUP-REPORT.md` - Detailed report of the cleanup process and rationale
- `/README.md` - Current project documentation
- `/CLAUDE.md` - Claude AI interaction guidelines

---

**Note:** If you find yourself regularly referencing these files, consider whether they should be integrated into current documentation or represent knowledge that should be captured elsewhere.
