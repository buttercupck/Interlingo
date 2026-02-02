---
type: readme
created: 2025-10-28
last-updated: 2026-01-22
---
# Interlingo — Interpretation Job Management System

**Status:** Phase 1 Complete + Design System Implemented
**Current Sprint:** UI Polish & Testing
**Last Updated:** 2025-10-29

---

## 🎯 What Is Interlingo?

Interlingo is INTERCOM Language Services' internal web application for managing interpretation job requests. It replaces the manual workflow of Google Calendar → n8n → Notion with a unified Supabase-powered system.

**Core Functions:**
1. **Job Board** - View all interpretation requests in one place
2. **Interpreter Matching** - Auto-suggest interpreters based on language, certification, modality
3. **Email Generation** - Create Request/Confirmation/Reminder emails with org-specific instructions
4. **Unavailability Tracking** - Block interpreters from overlapping time slots when they decline
5. **Communication History** - Track all sent emails and status changes

---

## 🔗 Relationship to Intercom Operations

Interlingo is the **software project** being built to automate Intercom Language Services operations. It is a **sibling project** to the Intercom operational folder.

**Separation of Concerns:**
- **`[[../Intercom/README|Intercom]]` folder:** How to do the scheduling coordinator job TODAY (employer context)
  - Organization configs, email templates, workflows, n8n automation, onboarding docs
- **Interlingo folder (this project):** Software to automate the job (development context)
  - Next.js application, Supabase database, UI components, system logic

**Data Flow:**
- Interlingo **reads** organization configs from `[[../Intercom/instructions/organizations/]]`
- Interlingo **reads** email templates from `[[../Intercom/templates/]]`
- Interlingo **uses** this data to generate emails and merge org-specific instructions

**Key Links:**
- `[[../Intercom/README]]` - Employer operational context overview
- `[[../Intercom/project-status]]` - Current employer job tasks and priorities
- `[[../Intercom/CHANGELOG]]` - Employer operational changes log

---

## 📍 Current Status

### ✅ Phase 1: Job Detail Page Foundation (COMPLETED)
**What Was Built:**
- Database migration with 4 new tables (job_communications, interpreter_unavailability, job_notes, job_status_history)
- JobOverviewCard component with dynamic title: `{language} — {interpreter} {modality}`
- OrganizationLocationCard displaying org info, courtroom, zoom/address
- InterpreterAssignmentCard with suggested matches and certification badges
- JobNotesSection with add/view interface (save pending Phase 6)
- Refactored job detail page layout to card-based design

**Testing Checklist:** `PHASE1-TESTING-GUIDE.md`

### ✅ Design System Implementation (COMPLETED)
**What Was Built:**
- **Complete CSS Design System** - Expanded `globals.css` from 57 to 446 lines with full design system
  - Typography classes (`.heading-1` through `.heading-4`, `.body-base`, `.body-small`, `.caption`)
  - Component classes (`.card`, `.button`, `.badge`, `.input`, `.alert-*`)
  - CSS custom properties for colors, spacing, shadows, and typography
  - Google Fonts integration (Inter, Poppins)
- **Component Conversion** - 10+ components updated to use design system classes:
  - UI components: `ActionButton`, `StatCard`
  - Job components: `JobOverviewCard`, `OrganizationLocationCard`, `InterpreterAssignmentCard`, `JobNotesSection`, `EmailComposer`
  - Layout components: `Header`, `Navigation`
  - Pages: Jobs Board, Dashboard
- **Layout Restructure:**
  - Navigation moved from left sidebar to horizontal top bar
  - Header simplified to display only today's date
  - Dashboard stats display in single row (4 columns)
  - Quick Actions positioned left, Upcoming Jobs right

**Impact:** Consistent styling across entire application using documented design system patterns.

### ⏳ What's Next

**Phase 2: Auto-Save Dropdowns**
- Status dropdown with instant save and optimistic updates
- Modality dropdown with instant save
- Audit logging for status changes

**Phase 3: Interpreter Unavailability**
- "Mark Unavailable" UI when interpreter declines
- Update matching algorithm to exclude blocked time slots
- Unavailability management interface

**Phase 4: HTML Email System**
- HTML email generation (replace plain text)
- Bold formatting for org-specific instructions
- "Mark Sent" button with auto-status update
- Email history view

**Phase 5: Template System**
- Extend org config to include email templates
- Template selector dropdown
- Merge fields with org-specific data

**Phase 6: Notes Persistence**
- Job notes CRUD API operations
- Connect JobNotesSection to database
- User attribution for notes

---

## 🚀 Quick Start

### Dev Server
```bash
cd web/
PORT=3001 bun run dev
```
Visit: http://localhost:3001/dashboard/jobs

### Database
**Supabase Dashboard:** https://supabase.com/dashboard/project/anqfdvyhexpxdpgbkgmd

**Apply Migrations:**
```bash
cd web/
bun run supabase/scripts/run-migration.ts
```

### Current Branch
```bash
git status
git log --oneline -5
```

---

## 📂 Key Files

### Documentation
- `ROADMAP.md` - Full project roadmap with all phases
- `supabase/Supabase-Schema.md` - Database schema reference
- `docs/PHASE1-TESTING-GUIDE.md` - Current phase testing checklist
- `docs/PAI-Integration-Proposal.md` - Aspirational PAI integration architecture

### Design
- `design/Job-detail-changes.md` - Complete job detail redesign spec
- `design/Interlingo Design System CSS.md` - Design system variables and patterns
- `design/Email-Interface-Design.md` - Email composer UI specs

### Business Logic
- `system_logic/ASSIGN - Filter - Language.md` - Language matching rules
- `system_logic/ASSIGN - Prioritization - Certification.md` - Cert-based ranking
- `system_logic/REQ - SPANISH - Logic.md` - Spanish interpreter request workflow

### Related Projects

**Intercom Operations (Sibling Folder):**
- `[[../Intercom/README]]` - Employer operational context overview
- `[[../Intercom/instructions/organizations/]]` - Organization configs (21 orgs) - **SOURCE DATA**
- `[[../Intercom/instructions/standard/]]` - Universal modality instructions
- `[[../Intercom/templates/]]` - Email templates (REQ/CONF/REM) - **SOURCE DATA**
- `[[../Intercom/workflows/]]` - Operational process documentation

**Note:** Organization configs and email templates live in the Intercom folder. Interlingo reads these files as source data for email generation and org-specific instruction merging.

---

## 🧑‍💼 Your Workflow Context

**Your Role:** Scheduling Assistant at INTERCOM Language Services

**Current Process:**
1. Receive job request from organization (court/law office)
2. Find available interpreter (language, certification, modality)
3. Send Request email to interpreter
4. Upon acceptance, send Confirmation to interpreter + organization
5. Send Reminder 24 hours before job
6. Track everything in GCal + Notion

**Interlingo's Goal:**
Replace GCal + Notion with unified system where all job data, interpreter matching, email generation, and communication tracking happens in one place.

---

## 🔄 Active Migrations

**Latest Migration:** `002_job_detail_enhancements.sql`
**Status:** Ready to apply (duplicate PRIMARY KEY constraints fixed)
**Tables Created:**
- `job_communications` - Email tracking (REQ/CONF/REM)
- `interpreter_unavailability` - Time-block system
- `job_notes` - Internal notes
- `job_status_history` - Audit trail

---

## 🐛 Known Issues

**None at the moment!**

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase migration was applied
3. Run `bun run build` to check TypeScript errors
4. Clear `.next` cache: `rm -rf web/.next`

---

## 💡 Next Session Checklist

**Before You Start:**
- [ ] Pull latest changes: `git pull origin main`
- [ ] Check if dev server is running: `lsof -i :3001`
- [ ] Review current phase testing guide
- [ ] Check Supabase for any manual data changes

**At Session Start:**
- [ ] What phase are we in? (See "Current Status" above)
- [ ] Any blockers from last session?
- [ ] What's the priority today?

**At Session End:**
- [ ] Commit work: `git add . && git commit -m "..."`
- [ ] Update this README with progress
- [ ] Note any blockers or questions for next session
- [ ] Push to remote if ready: `git push origin <branch>`

---

## 📞 Key Contacts

**Clinton** - Owner, direct boss
**3rd** - Coworker, senior scheduling assistant
**You** - Scheduling assistant, system builder

---

## 🗺️ Project Vision

**Short-term (Phases 1-3):**
- Replace manual job tracking with unified web app
- Auto-match interpreters based on job requirements
- Generate emails with org-specific instructions

**Mid-term (Phases 4-6):**
- Full email template system with merge fields
- Interpreter unavailability management
- Job notes and communication history

**Long-term (Phases 7+):**
- Multi-user auth with role-based permissions
- Interpreter self-service portal
- Organization dashboard for status tracking
- Automated reminder scheduling
- Financial tracking and invoicing

---

**Last Updated by:** Chavvo
**Session Note:** Design system fully implemented across all components, layout restructured with top navigation, application ready for Phase 2
