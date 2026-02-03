# n8n Workflows for Interlingo

Exported from: https://auto.rnrrecruiting.com
Date: 2026-02-02

## Workflows

### 1. gcal-to-interlingo-upsert.json (16KB)
**Status:** Inactive on old server (needs activation)
**Purpose:** Syncs Google Calendar events to Supabase with deduplication logic
**Key Feature:** Uses fingerprint algorithm to prevent duplicate jobs
**Fingerprint:** `${startTime}|${orgAbbrev}|${language}`

This is the workflow mentioned in OPERATIONS-PLAN-Deduplication.md that contains the correct deduplication logic. It was inactive on the old server but should be activated on the new instance.

### 2. reminder-renderer-webhook.json (62KB)
**Status:** Active on old server
**Purpose:** Handles reminder generation and rendering for interpreter jobs
**Integration:** Calls the renderer service to generate formatted reminders

This workflow processes reminder requests and generates the final output that gets sent to interpreters.

### 3. webhook-confirmation-interpreter.json (122KB)
**Status:** Active on old server
**Purpose:** Handles interpreter confirmation responses
**Integration:** Processes webhook callbacks when interpreters confirm/decline jobs

## How to Import

### Option 1: Via n8n UI
1. Log into https://n8n.interlingo.augeo.one
2. Click "Workflows" in the left sidebar
3. Click "Import from File" button
4. Select the JSON file to import
5. Review the workflow settings
6. Update any credentials or URLs that need to change
7. Activate the workflow

### Option 2: Via n8n API
```bash
# Set your new n8n API key
N8N_API_KEY="your-new-n8n-api-key"

# Import workflow
curl -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @gcal-to-interlingo-upsert.json \
  https://n8n.interlingo.augeo.one/api/v1/workflows
```

## Configuration Checklist

After importing, verify and update these settings:

### 1. Supabase Credentials
- [ ] Update Supabase URL to: https://anqfdvyhexpxdpgbkgmd.supabase.co
- [ ] Add Supabase service role key (from GCP Secret Manager)
- [ ] Test database connection

### 2. Google Calendar Integration
- [ ] Configure Google OAuth credentials
- [ ] Set up domain-wide delegation (if needed)
- [ ] Test calendar read/write access

### 3. Webhook URLs
- [ ] Update callback URLs to point to new Interlingo instance
- [ ] Verify webhook endpoints are accessible
- [ ] Test webhook delivery

### 4. Renderer Integration
- [ ] Configure renderer service URL
- [ ] Verify renderer is deployed and accessible
- [ ] Test reminder generation

### 5. Activation
- [ ] Activate gcal-to-interlingo-upsert (this one is currently inactive)
- [ ] Verify reminder-renderer-webhook is active
- [ ] Verify webhook-confirmation-interpreter is active

## Migration Strategy

1. **Test Phase:**
   - Import workflows to new n8n instance
   - Configure with test credentials
   - Run test jobs through the system
   - Verify deduplication works correctly

2. **Parallel Run:**
   - Keep old n8n running
   - Activate new workflows
   - Monitor both systems for 24-48 hours
   - Compare outputs

3. **Cutover:**
   - Switch GCal webhooks to new instance
   - Deactivate old workflows
   - Monitor for 7 days
   - Full migration after validation

## Important Notes

- **Fingerprint Logic:** The gcal-to-interlingo-upsert workflow has the correct deduplication logic that was missing from the active workflow on the old server
- **Credentials:** All credentials need to be reconfigured in the new n8n instance
- **Testing:** Test with non-production data first before switching live traffic
- **Rollback Plan:** Keep old n8n accessible for 7 days in case rollback is needed
