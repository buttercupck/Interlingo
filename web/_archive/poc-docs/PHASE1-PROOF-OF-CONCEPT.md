---
created_datetime: 2025-10-28T15:31:49-07:00
last_edited_datetime: 2025-10-28T15:31:49-07:00
---
# Phase 1 Proof of Concept - Complete ✓

## What We Built

We've successfully implemented a **single-source-of-truth configuration system** for Kent Municipal Court as a proof of concept. This demonstrates how organization-specific instructions can be managed dynamically without code deployments.

## Implementation Summary

### 1. Database Schema ✓
- Added `config` JSONB column to `organizations` table
- Created GIN index for efficient JSON queries
- Structured config format for zoom/in-person instructions

**Files Created:**
- `supabase/migrations/001_add_org_config.sql`

### 2. Service Layer ✓
Created a service that handles loading and formatting organization instructions:

**Files Created:**
- `lib/services/organizationInstructions.ts`

**Functions:**
- `getOrgInstructions()` - Fetches org config from database
- `formatZoomInstructions()` - Formats Zoom instructions for email
- `formatInPersonInstructions()` - Formats in-person instructions for email
- `getFormattedInstructions()` - Convenience function for any modality

### 3. Dynamic Email Composer ✓
Refactored EmailComposer to use database config instead of hardcoded logic:

**Files Modified:**
- `components/jobs/EmailComposer.tsx`

**Changes:**
- Removed hardcoded `if (orgName === 'Kent Municipal Court')` logic
- Added React Query hook to fetch org config dynamically
- Uses service layer to format instructions

### 4. TypeScript Types ✓
Updated database types to include the new config field:

**Files Modified:**
- `types/database.types.ts`

---

## How To Complete Setup

### Step 1: Run the Database Migration

You need to apply the SQL migration to your Supabase database. Here are two options:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/anqfdvyhexpxdpgbkgmd/sql
2. Open the file: `supabase/migrations/001_add_org_config.sql`
3. Copy the entire SQL content
4. Paste into the SQL Editor
5. Click "Run"

#### Option B: Via Supabase CLI (If you have it installed)

```bash
cd INCOME/intercom/Interlingo/web
supabase db push
```

### Step 2: Verify the Migration

After running the migration, verify it worked:

1. Go to: https://supabase.com/dashboard/project/anqfdvyhexpxdpgbkgmd/editor
2. Open the `organizations` table
3. Look for "Kent Municipal Court"
4. Check that the `config` column contains the JSON data

You should see:
```json
{
  "zoom_instructions": {
    "check_in_required": true,
    "chat_message_on_join": "Language Interpreter present",
    "chat_message_on_leave": "Language Interpreter finished",
    "name_format": "{LANGUAGE} — {FIRST_NAME} {LAST_NAME}",
    "special_notes": "Kent Municipal Court requires you to check in and out using the chat."
  },
  "in_person_instructions": {
    "check_in_location": "Courtroom clerk",
    "seating": "Jury box",
    "special_notes": "For Jury Readiness: Please check in with the courtroom clerk and then sit in the jury box. Check out with the courtroom clerk before you leave."
  }
}
```

### Step 3: Test the System

1. Start your dev server:
   ```bash
   cd INCOME/intercom/Interlingo/web
   bun run dev
   ```

2. Navigate to a job that has:
   - Organization: Kent Municipal Court
   - Modality: Zoom

3. Go to the Job Detail page
4. Open the Email Composer
5. Select "CONF" (Confirmation) email type
6. Verify that the email includes Kent Court's check-in/check-out instructions

**Expected Result:**
The email body should contain:
```
**IMPORTANT:**
**_Kent Municipal Court requires you to check in and out using the chat._**
(1) AS SOON AS you log on, please chat Everyone on Zoom:
**Language Interpreter present**
(2) Before you log off, please chat Everyone on Zoom:
**Language Interpreter finished**
(3) Please double-check that your name on Zoom appears as:
**SPANISH — First and Last Name**
```

---

## How It Works Now

### Before (Hardcoded):
```typescript
// ❌ Old way - hardcoded in EmailComposer.tsx
if (orgName === 'Kent Municipal Court' && job.modality === 'Zoom') {
  body += `**IMPORTANT:**...Kent-specific instructions...`;
}
```

**Problem:** Changing Kent Court's instructions required:
1. Edit EmailComposer.tsx code
2. Test the change
3. Deploy to production
4. Hope you didn't break anything

### After (Dynamic):
```typescript
// ✅ New way - loaded from database
const { data: orgConfig } = useQuery({
  queryKey: ['orgInstructions', orgId],
  queryFn: () => getOrgInstructions(orgId!),
});

if (job.modality === 'Zoom' && orgConfig?.zoom_instructions) {
  body += formatZoomInstructions(orgConfig.zoom_instructions, language);
}
```

**Solution:** Changing Kent Court's instructions now requires:
1. Update the `config` field in Supabase Admin Panel
2. Done.

No code changes. No deployments. Instant updates.

---

## Testing the Single-Source-of-Truth

### Test 1: Change Instructions

1. Go to Supabase dashboard → organizations table
2. Find Kent Municipal Court
3. Edit the `config` column
4. Change `chat_message_on_join` to something new:
   ```json
   "chat_message_on_join": "TEST: Interpreter has joined the call"
   ```
5. Save
6. Refresh your Interlingo web app
7. Generate a new email for Kent Court
8. **Result:** The new message appears instantly in the email

### Test 2: Add New Organization

1. Go to Supabase dashboard → organizations table
2. Find another organization (e.g., "Puyallup Municipal Court")
3. Add a `config` with zoom_instructions:
   ```json
   {
     "zoom_instructions": {
       "check_in_required": false,
       "name_format": "{LANGUAGE} INTERPRETER — {FIRST_NAME} {LAST_NAME}"
     }
   }
   ```
4. Create a Zoom job for that organization in Interlingo
5. Generate an email
6. **Result:** Puyallup's custom name format appears in the email

---

## What's Next: Phase 2

After testing and validating Phase 1, we can expand to:

1. **Migrate All Organizations**
   - Add configs for all 10+ organizations
   - Document each org's specific requirements

2. **Add Admin UI**
   - Build a settings page in Interlingo
   - Allow editing org configs without touching Supabase directly
   - Add validation and preview

3. **Expand to Other Email Types**
   - REQ (Request) emails
   - REM (Reminder) emails
   - Add org-specific customizations for each type

4. **Template Variables System**
   - Support more complex variable substitution
   - Add conditional logic in templates
   - Store templates in database too

5. **Migration Helper Tool**
   - Script to parse all markdown org files
   - Automatically populate database from markdown
   - One-time migration for all organizations

---

## Files Created/Modified

### New Files:
- ✅ `supabase/migrations/001_add_org_config.sql`
- ✅ `lib/services/organizationInstructions.ts`
- ✅ `PHASE1-PROOF-OF-CONCEPT.md` (this file)

### Modified Files:
- ✅ `components/jobs/EmailComposer.tsx`
- ✅ `types/database.types.ts`

---

## Success Metrics for Phase 1

- [x] Database schema supports org-specific configs
- [x] Service layer loads configs dynamically
- [x] Email composer uses dynamic configs for Kent Court
- [x] TypeScript types are up to date
- [ ] Migration applied to production database
- [ ] Tested with real Kent Court job
- [ ] Confirmed instructions match markdown documentation

---

## Questions?

If you have any questions about this implementation or want to proceed to Phase 2, let me know!

**Your single-source-of-truth vision is now a reality for Kent Municipal Court. 🎉**
