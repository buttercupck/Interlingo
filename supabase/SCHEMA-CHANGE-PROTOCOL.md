---
created_datetime: 2025-11-26T13:10:19-08:00
last_edited_datetime: 2025-12-05T12:55:51-08:00
---
# Schema Change Protocol

**Purpose:** Prevent documentation drift when making manual database schema changes via Supabase dashboard.

---

## When You Manually Change Database Schema

**Manual changes are allowed** (sometimes you need speed), but they trigger a mandatory documentation workflow.

When you add/modify tables, columns, constraints, or indexes via the Supabase dashboard:

### Step 1: Tell Chavvo Immediately

Say: **"I'm manually adding [X] to the database"**

Example: "I'm manually adding a `preference_rank` column to `interpreter_languages` table as INTEGER"

### Step 2: Chavvo's Mandatory Checklist

When you report a manual schema change, Chavvo will:

1. **Ask for details:**
   - What tables/columns are affected?
   - What's the data type and any constraints?
   - What's the purpose/business logic?

2. **Update `Supabase-Schema.md`:**
   - Add the new column/table to the schema documentation
   - Include data type, constraints, and comments

3. **Create retroactive migration file:**
   - Write the SQL migration that *would have* created the change
   - Save it as `migrations/XXX_descriptive_name.sql`
   - Even though the change is already live, this documents intent and allows schema recreation

4. **Update `Project Status.md`:**
   - Log what changed and why
   - Add to behavioral observations or session notes
   - Create paper trail for future sessions

5. **Verify TypeScript types (if applicable):**
   - Check if `types/database.types.ts` needs regeneration
   - Flag if type generation is broken and needs fixing

### Step 3: Move Forward

Once documentation is complete, continue development knowing the change is tracked.

---

## Why This Protocol Exists

**Problem:** Manual database changes create invisible drift between production schema and local documentation. Code breaks, team members get confused, and debugging becomes archaeological work.

**Solution:** Documentation-first protocol gives you speed of manual changes without sacrificing traceability.

---

## Examples

### Good Example

**You:** "I'm manually adding `preference_rank` INTEGER column to `interpreter_languages` via Supabase dashboard"

**Chavvo:**
- Updates `Supabase-Schema.md` to include `preference_rank integer`
- Creates `migrations/005_add_preference_rank.sql` with ALTER TABLE statement
- Logs change in `Project Status.md` under current session
- Notes: "Business preference ranking for interpreter assignment (distinct from proficiency_rank)"

**Result:** Change is live, documented, and traceable.

### Bad Example (Don't Do This)

**You:** [Silently adds column via dashboard, doesn't mention it]

**Later:** "Why is the sync script throwing 'column not found' errors?"

**Chavvo:** [Has to debug for 30 minutes to discover undocumented schema change]

**Result:** Wasted time, frustration, invisible technical debt.

---

## Protocol Exceptions

**When to skip this protocol:**
- Data changes (inserting/updating rows) - protocol only applies to schema changes
- RLS policy changes - document in session notes, but no migration file needed
- Index creation for performance - optional documentation (nice to have, not required)

---

## Future Expansion

This protocol is currently Interlingo-specific. As other projects grow in complexity, consider adopting similar patterns for:
- JPeptics (if schema complexity increases)
- Any project with shared database access
- Projects with multiple developers

---

**Last Updated:** 2025-11-26
**Status:** Active Protocol
