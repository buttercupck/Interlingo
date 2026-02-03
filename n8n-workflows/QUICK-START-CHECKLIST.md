# n8n Interlingo Quick Start Checklist

**Instance:** https://n8n.interlingo.augeo.one
**Goal:** Get Interlingo workflows operational
**Time:** ~30 minutes

---

## Phase 1: Configure Credentials (15 min)

### ☐ Step 1: Google Calendar OAuth2
- [ ] Create OAuth client in Google Cloud Console
- [ ] Enable Google Calendar API
- [ ] Configure redirect URI: `https://n8n.interlingo.augeo.one/rest/oauth2-credential/callback`
- [ ] Add credential in n8n UI
- [ ] Authorize account

**Details:** OAUTH-SETUP-GUIDE.md - Section 1

---

### ☐ Step 2: Supabase API
- [ ] Get service role key from .claude/.env or Supabase dashboard
- [ ] Add "Supabase API" credential in n8n
- [ ] Host: `anqfdvyhexpxdpgbkgmd.supabase.co`

**Details:** OAUTH-SETUP-GUIDE.md - Section 2

---

### ☐ Step 3: Gmail OAuth2
- [ ] Use same Google Cloud project (or create new OAuth client)
- [ ] Enable Gmail API
- [ ] Add credential in n8n UI
- [ ] Authorize account

**Details:** OAUTH-SETUP-GUIDE.md - Section 3

---

## Phase 2: Import Workflows (10 min)

### ☐ Step 4: Import Workflow Files
- [ ] In n8n → Workflows → Import from File
- [ ] Import: `gcal-to-interlingo-upsert.json`
- [ ] Import: `reminder-renderer-webhook.json`
- [ ] Import: `webhook-confirmation-interpreter.json`

**Location:** /INCOME/Interlingo/n8n-workflows/

---

## Phase 3: Configure & Test (5 min)

### ☐ Step 5: Assign Credentials to Nodes
For each workflow:
- [ ] Open in editor
- [ ] Click orange nodes (missing credentials)
- [ ] Assign appropriate credential
- [ ] Save workflow

**Credential mapping:**
- Google Calendar nodes → "Interlingo Google Calendar"
- Supabase nodes → "Interlingo Supabase"
- Gmail nodes → "Interlingo Gmail"

---

## Testing

### Test GCal Workflow
- [ ] Create test event in Google Calendar
- [ ] Execute `gcal-to-interlingo-upsert` workflow
- [ ] Verify data in Supabase

### Test Reminder Workflow (Optional)
- [ ] Requires webhook server running
- [ ] Execute `reminder-renderer-webhook`
- [ ] Check email sent

---

## Success Criteria

✓ All 3 credentials configured and authorized
✓ All 3 workflows imported
✓ No orange warning nodes in workflows
✓ Test execution successful
✓ Data appearing in Supabase

---

## Quick Commands

```bash
# View workflows directory
ls -la /Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/n8n-workflows/

# Get Supabase service role key
cat /Users/intercomlanguageservices/bcck_vault/.claude/.env | grep SUPABASE_SERVICE_ROLE_KEY

# Open n8n instance
open https://n8n.interlingo.augeo.one
```

---

## If You Get Stuck

| Issue | See |
|-------|-----|
| OAuth authorization fails | OAUTH-SETUP-GUIDE.md - Troubleshooting |
| Don't know where to find credentials | OAUTH-SETUP-GUIDE.md - Prerequisites |
| Workflow import fails | README.md - How to Import |
| Node shows orange warning | OAUTH-SETUP-GUIDE.md - Step 5.2 |

---

**Start here:** Step 1 → Google Calendar OAuth2
**Full guide:** OAUTH-SETUP-GUIDE.md
**Workflow details:** README.md
