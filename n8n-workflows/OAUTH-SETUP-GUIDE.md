# OAuth Configuration Guide for n8n.interlingo.augeo.one

**Created:** 2026-02-02
**Instance:** https://n8n.interlingo.augeo.one
**Purpose:** Configure OAuth credentials for Interlingo workflows

---

## Overview

The Interlingo n8n workflows require 3 credentials to function:

1. **Google Calendar OAuth2** - Read calendar events
2. **Supabase API** - Query organization and interpreter data
3. **Gmail OAuth2** - Send reminder emails

OAuth setup must be done through the n8n UI (cannot be automated via API).

---

## Prerequisites

Before starting, have ready:
- [ ] Google Cloud Console access (for OAuth credentials)
- [ ] Supabase dashboard access (for API key)
- [ ] Gmail account to authorize sending emails
- [ ] Google Calendar account to authorize reading events

---

## Step 1: Google Calendar OAuth2

### 1.1: Create Google Cloud OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **Application type**: Web application
6. Configure:
   - **Name**: "n8n Interlingo Calendar"
   - **Authorized redirect URIs**:
     ```
     https://n8n.interlingo.augeo.one/rest/oauth2-credential/callback
     ```
7. Click **CREATE**
8. Copy the **Client ID** and **Client Secret** (keep this tab open)

### 1.2: Enable Google Calendar API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **ENABLE**

### 1.3: Configure in n8n

1. Open https://n8n.interlingo.augeo.one
2. Click **Credentials** in left sidebar
3. Click **Add Credential** (top right)
4. Search for and select **"Google Calendar OAuth2 API"**
5. Fill in:
   - **Credential Name**: "Interlingo Google Calendar"
   - **Client ID**: [paste from step 1.1]
   - **Client Secret**: [paste from step 1.1]
6. Click **Connect my account**
7. Authorize in popup (select calendar account)
8. Click **Save**

**✓ Google Calendar OAuth2 configured**

---

## Step 2: Supabase API Credential

### 2.1: Get Supabase Service Role Key

From earlier work, your Supabase details are:
- **URL**: https://anqfdvyhexpxdpgbkgmd.supabase.co
- **Service Role Key**: Already in .env file

You can find it at:
```bash
cat /Users/intercomlanguageservices/bcck_vault/.claude/.env | grep SUPABASE_SERVICE_ROLE_KEY
```

Or get it from Supabase dashboard:
1. Go to https://supabase.com/dashboard
2. Select Interlingo project
3. **Settings** → **API**
4. Copy **service_role** key (not anon key!)

### 2.2: Configure in n8n

1. In n8n, click **Credentials** → **Add Credential**
2. Search for and select **"Supabase API"**
3. Fill in:
   - **Credential Name**: "Interlingo Supabase"
   - **Host**: `anqfdvyhexpxdpgbkgmd.supabase.co`
   - **Service Role Secret**: [paste service role key]
4. Click **Save**

**✓ Supabase API configured**

---

## Step 3: Gmail OAuth2

### 3.1: Use Same Google Cloud Project

The Gmail OAuth can use the same OAuth client from Step 1, or you can create a new one.

**If using same client:**
- Skip to Step 3.2
- Use same Client ID and Client Secret

**If creating new client:**
1. Google Cloud Console → **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: "n8n Interlingo Gmail"
5. **Authorized redirect URIs**:
   ```
   https://n8n.interlingo.augeo.one/rest/oauth2-credential/callback
   ```
6. Click **CREATE**

### 3.2: Enable Gmail API

1. Google Cloud Console → **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click **ENABLE**

### 3.3: Configure in n8n

1. In n8n, click **Credentials** → **Add Credential**
2. Search for and select **"Gmail OAuth2 API"**
3. Fill in:
   - **Credential Name**: "Interlingo Gmail"
   - **Client ID**: [paste OAuth client ID]
   - **Client Secret**: [paste OAuth client secret]
4. Click **Connect my account**
5. Authorize in popup (select Gmail account)
6. Click **Save**

**✓ Gmail OAuth2 configured**

---

## Step 4: Import Workflows

Now that credentials are configured, import the workflows:

### 4.1: Import via UI

1. In n8n, click **Workflows** in left sidebar
2. Click **Import from File** (top right)
3. Import each workflow:
   - `gcal-to-interlingo-upsert.json`
   - `reminder-renderer-webhook.json`
   - `webhook-confirmation-interpreter.json`

### 4.2: Assign Credentials to Nodes

For each imported workflow:

1. Open the workflow in editor
2. Click on nodes that need credentials (will show orange warning)
3. Assign the appropriate credential:
   - **Google Calendar nodes** → "Interlingo Google Calendar"
   - **Supabase nodes** → "Interlingo Supabase"
   - **Gmail nodes** → "Interlingo Gmail"
4. Click **Save** (top right)

---

## Step 5: Test Workflows

### Test 1: GCal to Interlingo

1. Create a test event in Google Calendar:
   ```
   Title: Spanish - ZOOM
   Location: PUYALLUP
   Description:
   Smith, John
   TEST001 - ARR
   1  DUI

   Start: Tomorrow at 9 AM
   End: Tomorrow at 10 AM
   ```

2. Open `gcal-to-interlingo-upsert` workflow in n8n
3. Click **Execute Workflow** button
4. Check output - should show:
   - Events fetched from GCal
   - Parsed correctly
   - Inserted into Supabase

5. Verify in Supabase:
   ```sql
   SELECT * FROM commitment_blocks
   WHERE created_at > NOW() - INTERVAL '5 minutes';
   ```

### Test 2: Reminder Renderer

**Note:** This requires the webhook server running locally.

If you don't have the webhook server yet, skip this test.

1. Open `reminder-renderer-webhook` workflow
2. Click **Execute Workflow**
3. Check if reminder generated and email sent

---

## Credential Management Best Practices

### Security

- [ ] Never commit OAuth credentials to git
- [ ] Use separate OAuth clients for dev/prod if possible
- [ ] Rotate service role keys periodically
- [ ] Monitor OAuth token usage in Google Cloud Console

### Organization

Create credential naming convention:
- Format: `[Project] [Service] [Environment]`
- Examples:
  - "Interlingo Google Calendar Prod"
  - "Interlingo Supabase Dev"
  - "Interlingo Gmail Prod"

### Backup

n8n stores credentials encrypted. To backup:
1. Document which credentials are configured
2. Keep OAuth client IDs in secure location
3. Test credential restore process

---

## Troubleshooting

### "Authorization failed" for Google OAuth

**Cause:** Redirect URI mismatch
**Fix:**
1. Verify redirect URI in Google Cloud Console matches:
   `https://n8n.interlingo.augeo.one/rest/oauth2-credential/callback`
2. No trailing slash
3. Exact match (https, not http)

### "Invalid API key" for Supabase

**Cause:** Using anon key instead of service_role key
**Fix:**
1. Get service_role key from Supabase dashboard
2. Update credential in n8n
3. Service role key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### "Insufficient permissions" for Gmail

**Cause:** Gmail API not enabled or scope too restrictive
**Fix:**
1. Enable Gmail API in Google Cloud Console
2. Re-authorize Gmail OAuth in n8n
3. Grant all requested permissions

### Workflow nodes show orange warning

**Cause:** Credentials not assigned to nodes
**Fix:**
1. Click on each orange node
2. Select credential from dropdown
3. Save workflow

---

## Next Steps

After OAuth configuration:

1. [ ] All 3 credentials configured in n8n
2. [ ] All 3 workflows imported
3. [ ] Credentials assigned to workflow nodes
4. [ ] Test workflows manually
5. [ ] Activate workflows
6. [ ] Monitor first executions
7. [ ] Set up error notifications

---

## Quick Reference

| Credential | Type | Used By |
|------------|------|---------|
| Interlingo Google Calendar | OAuth2 | gcal-to-interlingo-upsert, reminder-renderer-webhook |
| Interlingo Supabase | API Key | All workflows (database queries) |
| Interlingo Gmail | OAuth2 | reminder-renderer-webhook (email sending) |

| Workflow | Status After Import | Needs Activation? |
|----------|-------------------|------------------|
| gcal-to-interlingo-upsert | Inactive | Yes (after testing) |
| reminder-renderer-webhook | Inactive | Yes (after webhook server setup) |
| webhook-confirmation-interpreter | Inactive | Yes (after testing) |

---

**Ready to start?** Follow steps 1-5 in order, checking off each task as you complete it.
