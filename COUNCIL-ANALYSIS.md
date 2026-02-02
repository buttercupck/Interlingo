# Interlingo Deployment Plans: Council Analysis
**Date:** 2026-02-02
**Council Members:** Architect, Engineer, Security Specialist, Operations Lead
**Documents Analyzed:** OPERATIONS-PLAN-Deduplication.md, DEPLOYMENT-PLAN.md

---

## ROUND 1: Initial Positions

### 🏗️ ARCHITECT PERSPECTIVE

#### What Works Well

**Operations Plan:**
- ✅ **Strategic clarity** - Correctly identifies that Interlingo IS the solution, not N8N patches
- ✅ **Root cause analysis** - Traces all bugs back to using wrong system
- ✅ **Natural key identification** - (language, org, timestamp) is architecturally sound
- ✅ **Fingerprint hash approach** - Content-based deduplication already exists in inactive workflow
- ✅ **Component separation** - Clean boundaries: GCal → Supabase → Web App → Renderer

**Deployment Plan:**
- ✅ **Phased approach** - MVP security baseline (48h) + production hardening (14d)
- ✅ **Clean slate strategy** - New droplet avoids N8N contamination
- ✅ **Two n8n instances** - Separates Interlingo workflows from general automation
- ✅ **Technology choices** - PM2 for app (simplicity), Docker for n8n (isolation)

#### What Could Be Improved

**Operations Plan:**
- ⚠️ **Migration path unclear** - Three options presented but no decision
- ⚠️ **GCal integration vague** - "How does Interlingo ingest GCal events?" unanswered
- ⚠️ **Parallel testing undefined** - Phase 2 mentions shadowing but no concrete plan
- ⚠️ **N8N deprecation timeline** - No clear cutover criteria

**Deployment Plan:**
- ⚠️ **n8n architecture contradiction** - Deploys n8n for "ONLY Interlingo workflows" but Operations Plan questions if n8n needed at all
- ⚠️ **Build fix not applied** - AddLanguageRequestModal.tsx fix documented but not committed
- ⚠️ **Secrets loading in PM2** - ecosystem.config.js doesn't source load-secrets.sh
- ⚠️ **No data migration plan** - Existing N8N records in Supabase lack fingerprint_hash

#### Critical Gaps Both Plans Miss

1. **🚨 GCal Integration Architecture** - Neither plan defines HOW Interlingo receives GCal events:
   - Option A: Direct GCal webhook to Interlingo API endpoint
   - Option B: N8N as webhook bridge (hybrid approach)
   - Option C: Polling via GCal API
   - **This is the most critical architectural decision** and it's completely undefined

2. **🚨 Data Migration Strategy** - Existing N8N records need:
   - Backfill fingerprint_hash for all existing commitment_blocks
   - Verify no duplicates exist from N8N period
   - Migration script to clean/deduplicate before Interlingo takes over

3. **🚨 Interlingo Feature Completeness** - No assessment of:
   - Can Interlingo web app actually send reminders?
   - Is reminder generation logic complete?
   - Does it connect to renderer service?
   - Manual job entry workflow tested?

4. **Renderer Integration** - Deployment Plan mentions renderer on old server (172.17.0.1:3001) but new server needs its own renderer or network access

#### Recommended Path Forward

**Hybrid Deployment with Clear Handoffs:**

```
Phase 0: Pre-Deployment (FIX CRITICAL GAPS)
├── Decide GCal integration architecture
├── Test Interlingo reminder generation end-to-end locally
├── Apply build fix and commit
└── Create data migration script

Phase 1: Deploy Interlingo + n8n Bridge (48 hours)
├── Deploy per DEPLOYMENT-PLAN.md security baseline
├── n8n receives GCal webhooks (existing proven integration)
├── n8n calls Interlingo API to create jobs (with fingerprint)
├── Interlingo manages jobs and generates reminders
└── Parallel operation: N8N (old server) + Interlingo (new server)

Phase 2: Validation (7 days)
├── Compare outputs: old N8N vs new Interlingo
├── Verify deduplication works
├── Test reminder generation
└── Fix any gaps found

Phase 3: Cutover (1 day)
├── Switch GCal webhook target to new n8n
├── Deactivate old N8N workflows
└── Monitor 24 hours

Phase 4: Deprecate Bridge (30 days later)
├── Migrate from n8n bridge to direct GCal integration
├── Decommission n8n container if no longer needed
└── Clean architecture: GCal → Interlingo → Renderer
```

**Key Architectural Principle:** Deploy incrementally, maintain business continuity, prove each layer before removing previous one.

---

### 💻 ENGINEER PERSPECTIVE

#### What Works Well

**Operations Plan:**
- ✅ **Technical archaeology** - Excellent detective work finding inactive workflow with correct logic
- ✅ **Database schema analysis** - commitment_blocks structure is correct
- ✅ **Bug documentation** - Fixed template regex issue, networking issue
- ✅ **Constraint validation** - Verified UNIQUE constraint on fingerprint_hash exists (migration 007)

**Deployment Plan:**
- ✅ **Step-by-step instructions** - Clear, executable commands
- ✅ **Security hardening sequence** - SSH keys, fail2ban, UFW in correct order
- ✅ **Testing at each step** - Verification commands after each installation
- ✅ **Rollback procedure** - Documented emergency recovery
- ✅ **Monitoring scripts** - Basic health checks and alerts

#### What Could Be Improved

**Operations Plan:**
- ⚠️ **Option 3 framing** - "Fix N8N Only (Not Recommended)" wastes space, just remove it
- ⚠️ **Success criteria timing** - "Week 1" vs "Month 1" vs "Quarter 1" feels arbitrary
- ⚠️ **Council questions not answered** - Lists 8 questions but provides no answers

**Deployment Plan:**
- ⚠️ **PM2 environment loading** - ecosystem.config.js env section is static, doesn't run load-secrets.sh
- ⚠️ **Redis password in script** - monitor-interlingo.sh uses $REDIS_PASSWORD but where does it come from?
- ⚠️ **Certbot for two domains** - Single command may fail if DNS not propagated for both
- ⚠️ **n8n .env file** - Shows plaintext passwords, contradicts "no plaintext credentials" principle
- ⚠️ **Backup script uses direct connection** - Should use pooled connection for backups

#### Critical Gaps Both Plans Miss

1. **🚨 Renderer Deployment** - Neither plan addresses:
   - Does new droplet need its own renderer instance?
   - Can Interlingo on new server reach old renderer (172.17.0.1:3001)?
   - Network security implications of cross-server renderer calls
   - **This will break reminder generation if not resolved**

2. **🚨 Supabase Connection Pooling** - Deployment Plan uses pooled URL correctly but:
   - No connection pool size tuning
   - No monitoring of pool exhaustion
   - PM2 single instance + Redis sessions good, but no max_connections config

3. **🚨 Build Process in Deployment** - Step 15 runs `bun run build` but:
   - Build fix not applied before deployment
   - No CI/CD validation before deploying broken code
   - Build errors discovered in production

4. **🚨 n8n Workflow Migration** - How do existing n8n workflows transfer to new instance?
   - Export from old n8n
   - Import to new n8n
   - Reconnect to Interlingo API endpoint
   - **No migration script or procedure**

#### Recommended Path Forward

**Fix-First, Then Deploy:**

```
IMMEDIATE (Before Deployment):
1. Apply build fix to AddLanguageRequestModal.tsx
2. Test local build succeeds: bun run build
3. Commit fix to git
4. Deploy renderer to new droplet OR configure network access to old renderer
5. Test Interlingo → Renderer → Email generation locally
6. Export n8n workflows from old server
7. Create Interlingo API endpoint for n8n to call

DEPLOYMENT (Use DEPLOYMENT-PLAN.md with fixes):
1. Fix PM2 ecosystem.config.js to load secrets:
   script: 'bash',
   args: '-c "source ~/load-secrets.sh && bun run start"'

2. Fix n8n .env to reference Secret Manager:
   N8N_ENCRYPTION_KEY=$(gcloud secrets versions access latest --secret="n8n-encryption-key")

3. Split Certbot into two commands (DNS propagation timing):
   sudo certbot --nginx -d interlingo.augeo.one
   <wait 30 min>
   sudo certbot --nginx -d n8n.interlingo.augeo.one

4. Add connection pool monitoring to monitor-interlingo.sh

VALIDATION (Before Cutover):
1. Create test GCal event
2. Verify n8n webhook fires
3. Verify Interlingo creates job with fingerprint
4. Verify reminder generation works
5. Check duplicate handling (edit same event, verify UPSERT not INSERT)
```

**Key Engineering Principle:** Test locally, deploy incrementally, validate each integration point before cutover.

---

### 🔒 SECURITY SPECIALIST PERSPECTIVE

#### What Works Well

**Operations Plan:**
- ✅ **Security through simplicity** - Removing N8N reduces attack surface
- ✅ **Data integrity focus** - Deduplication prevents data quality issues
- ✅ **Rollback capability** - Maintains old system during validation

**Deployment Plan:**
- ✅ **GCP Secret Manager** - No plaintext credentials in files
- ✅ **Workload Identity Federation** - No JSON keys to steal
- ✅ **SSH key-only authentication** - Eliminates password attacks
- ✅ **fail2ban protection** - Automated brute-force blocking
- ✅ **UFW deny-all default** - Minimal attack surface
- ✅ **Encrypted backups with GPG** - PII protection
- ✅ **Phase 2 security hardening** - Audit logging, penetration testing, weekly scans

#### What Could Be Improved

**Operations Plan:**
- ⚠️ **No threat model** - What are we protecting against?
- ⚠️ **No access control discussion** - Who can access Interlingo? Authentication model?
- ⚠️ **No mention of PII handling** - Client names, case numbers, court addresses are sensitive

**Deployment Plan:**
- ⚠️ **n8n .env has plaintext secrets** - Step 9.1 contradicts "no plaintext credentials" requirement
- ⚠️ **Service account JSON key created** - Step 10.2 runs `gcloud secrets create` but how was the key generated?
- ⚠️ **Redis password weak generation** - `openssl rand -base64 24` good but no complexity validation
- ⚠️ **No rate limiting** - nginx config missing rate limiting on API endpoints
- ⚠️ **No WAF** - Web Application Firewall would add defense in depth
- ⚠️ **Audit logging delayed** - Phase 2 (14 days) but should be Phase 1 requirement

#### Critical Gaps Both Plans Miss

1. **🚨 Authentication & Authorization** - Neither plan addresses:
   - How do users authenticate to Interlingo web app?
   - OAuth? Email/password? SSO?
   - Supabase Auth configured?
   - Row Level Security policies tested?
   - **This is a blocking security issue**

2. **🚨 API Security** - Interlingo API endpoints need:
   - Authentication tokens (JWT from Supabase Auth?)
   - Rate limiting (prevent abuse)
   - Input validation (prevent injection attacks)
   - CORS configuration
   - **n8n calling Interlingo API = server-to-server auth required**

3. **🚨 Sensitive Data in Logs** - No discussion of:
   - PM2 logs contain client names, case numbers?
   - Audit log retention policy
   - Log redaction for PII
   - GDPR/HIPAA compliance if applicable

4. **🚨 Incident Response Plan** - Phase 2 mentions penetration testing but:
   - No incident response playbook
   - No breach notification procedure
   - No forensics collection process
   - **If compromised, what's the recovery process?**

#### Recommended Path Forward

**Security-First Deployment:**

```
PHASE 0: Security Prerequisites (BEFORE deployment)
1. Define threat model:
   - Threat: Unauthorized access to client PII
   - Threat: Denial of service on reminder system
   - Threat: Data exfiltration from Supabase
   - Threat: Compromised n8n credentials

2. Implement authentication:
   - Enable Supabase Auth (email/password minimum)
   - Configure RLS policies on all tables
   - Test that unauthenticated users cannot access data

3. Implement API security:
   - Interlingo API requires Bearer token
   - n8n uses service account token to call Interlingo
   - Store n8n API token in GCP Secret Manager

4. Configure audit logging:
   - Supabase audit log (from Phase 2 to Phase 1)
   - nginx access logs sent to GCP Cloud Logging
   - PM2 logs redact PII (regex filter)

PHASE 1: Deploy with MVP + Security Baseline
- All DEPLOYMENT-PLAN.md steps
- PLUS: Audit logging active from day 1
- PLUS: Rate limiting in nginx (10 req/sec per IP)
- PLUS: Supabase RLS policies verified

PHASE 2: Monitor & Harden (Parallel with operations)
- Continue with DEPLOYMENT-PLAN Phase 2
- Add WAF (Cloudflare or equivalent)
- Weekly vulnerability scans
- Penetration testing
- Incident response playbook
```

**Key Security Principle:** Security is not a Phase 2 activity. Authentication, authorization, and audit logging are Phase 1 requirements.

---

### 📊 OPERATIONS LEAD PERSPECTIVE

#### What Works Well

**Operations Plan:**
- ✅ **Business continuity focus** - Parallel testing maintains 20+ daily reminders
- ✅ **Constraint acknowledgment** - "GCal intake MUST stay" - respects client workflow
- ✅ **Realistic timeline** - Phased approach with validation periods
- ✅ **User behavior documentation** - "User manually duplicates jobs daily" - critical context

**Deployment Plan:**
- ✅ **Rollback procedure documented** - Quick recovery if deployment fails
- ✅ **Monitoring from day 1** - Health checks, SSL monitoring, disk space
- ✅ **Maintenance schedule** - Daily/weekly/monthly/quarterly tasks defined
- ✅ **Dev Patel guided installation** - Human-in-the-loop reduces error risk

#### What Could Be Improved

**Operations Plan:**
- ⚠️ **Timeline too ambitious** - "48-hour validation" for 20+ daily reminders is risky
- ⚠️ **No communication plan** - Who needs to know about cutover? User training?
- ⚠️ **Success criteria vague** - "Zero duplicate jobs" - how measured? Manual check?

**Deployment Plan:**
- ⚠️ **$12/month droplet sizing** - 2GB RAM tight for Next.js + n8n + Redis + nginx
- ⚠️ **No load testing** - What happens when 100 reminders fire simultaneously?
- ⚠️ **Maintenance schedule assumes 24/7 availability** - Single-developer operation
- ⚠️ **No escalation procedure** - "If rollback fails, escalate immediately" - to whom?

#### Critical Gaps Both Plans Miss

1. **🚨 Cutover Timing** - Neither plan specifies:
   - What day/time to switch GCal webhooks?
   - Low-traffic window (weekend vs weekday)?
   - Notification to users before/during/after?
   - **Random cutover = user confusion + potential missed reminders**

2. **🚨 Validation Metrics** - "Parallel testing" mentioned but no concrete metrics:
   - How to compare N8N output vs Interlingo output?
   - Automated comparison script or manual review?
   - What's the success threshold? 100% match? 95%?
   - **Without metrics, validation is subjective**

3. **🚨 Training & Documentation** - No plan for:
   - User training on Interlingo web interface
   - Admin documentation for troubleshooting
   - Runbook for common issues
   - **Deployment success ≠ operational success**

4. **🚨 Capacity Planning** - No analysis of:
   - Current load: 20+ reminders/day
   - Peak load: What if 50 reminders/day?
   - Database connection limits
   - Email sending rate limits
   - **$12 droplet may be undersized**

#### Recommended Path Forward

**Operations-Focused Deployment:**

```
PHASE 0: Operational Readiness
1. Create validation comparison script:
   - Export N8N reminder output (7 days)
   - Export Interlingo reminder output (same events, parallel)
   - Automated diff: subject, body, recipients, timing
   - Success = 100% content match

2. Document user-facing changes:
   - What stays the same: GCal workflow unchanged
   - What's new: Interlingo web interface for manual jobs
   - How to troubleshoot: Contact info, runbook

3. Size droplet correctly:
   - Load test locally: Simulate 50 concurrent reminders
   - Monitor RAM/CPU usage
   - Choose droplet size with 50% headroom
   - Recommendation: Professional $24/month (4GB RAM)

4. Plan cutover window:
   - Monday 6am PST (low traffic, full week to monitor)
   - Notify user 48 hours in advance
   - Have rollback ready

PHASE 1: Deploy & Validate (7 days)
Day 0: Deploy Interlingo per DEPLOYMENT-PLAN.md
Day 1-7: Parallel operation
  - Old N8N sends reminders (production)
  - New Interlingo shadows (validation)
  - Run comparison script daily
  - Fix any discrepancies immediately

PHASE 2: Cutover (Day 8)
6am PST:
  - Switch GCal webhook to new n8n
  - Monitor first 5 reminders manually
  - Check logs for errors
  - Compare output to previous day
12pm PST: Check-in (6 hours in)
  - Any issues? Rollback window still open
6pm PST: Final check
  - If stable, declare cutover successful

PHASE 3: Post-Cutover (Days 9-15)
  - Daily monitoring
  - Keep old N8N running (read-only) for 7 days
  - After 7 days stable, deprecate old system

PHASE 4: Long-term Operations
  - Weekly: Review logs, check disk space
  - Monthly: Test restore procedure
  - Quarterly: Review and optimize
```

**Key Operations Principle:** Measure everything, deploy with buffer, maintain rollback capability, train users.

---

## ROUND 2: Responses to Each Other

### 🏗️ ARCHITECT responds to other agents

**To Engineer:**
- ✅ Agree: Build fix must be applied before deployment (blocking issue)
- ✅ Agree: Renderer deployment is critical gap
- ⚠️ Disagree on PM2 env loading - `bash -c "source && run"` is fragile, better to use PM2 environment files with pre-start script
- ✅ Strongly agree: Test locally before deploying

**To Security:**
- ✅ **CRITICAL AGREEMENT:** Authentication/authorization is blocking - cannot deploy without RLS + auth
- ⚠️ Disagree on WAF timing - adds complexity, defer to Phase 3 after basic system proven
- ✅ Agree: Audit logging should be Phase 1 (easy to add, high security value)
- 🤔 Question: Service account for n8n → Interlingo API - what's the auth mechanism? JWT? API key?

**To Operations:**
- ✅ **CRITICAL AGREEMENT:** $12 droplet undersized - Professional $24 needed
- ✅ Agree: 48-hour validation too short, 7 days better
- ✅ Agree: Validation metrics script excellent idea
- ⚠️ Disagree on Monday 6am cutover - prefer Friday 6pm (weekend buffer for issues)

**Architect Revised Recommendation:**
```
PRE-DEPLOYMENT BLOCKERS (MUST RESOLVE):
1. Apply build fix
2. Implement Supabase Auth + RLS
3. Deploy renderer to new droplet OR prove network access
4. Create n8n → Interlingo API authentication mechanism
5. Size droplet to Professional $24/month (4GB RAM)

PHASE 1: Deploy with Security Baseline + Audit Logging
PHASE 2: Parallel validation (7 days) with automated comparison
PHASE 3: Cutover Friday 6pm PST (weekend buffer)
PHASE 4: Monitor week 2, deprecate old system if stable
```

---

### 💻 ENGINEER responds to other agents

**To Architect:**
- ✅ Agree: Pre-deployment blockers list is correct priority
- ⚠️ On renderer: Deploy local instance on new droplet (simpler than network access)
- ✅ Agree: Friday cutover better than Monday (more time to fix issues)
- 🤔 Question: PM2 environment files - where do secrets come from? Still need load-secrets.sh

**To Security:**
- ✅ **CRITICAL AGREEMENT:** Cannot deploy without auth/RLS - this is blocking
- ✅ Agree: Audit logging Phase 1
- ⚠️ Disagree on WAF - defer until after basic system working (complexity vs value)
- 🤔 Question: n8n API token - where stored? How rotated? GCP Secret Manager?

**To Operations:**
- ✅ **CRITICAL AGREEMENT:** Professional $24 droplet needed
- ✅ Agree: Validation comparison script necessary
- ✅ Agree: 7-day parallel validation
- ⚠️ Prefer Friday 6pm cutover (Architect's reasoning is sound)

**Engineer Revised Recommendation:**
```
IMMEDIATE ACTIONS (Before starting DEPLOYMENT-PLAN):
1. ✅ Apply build fix (AddLanguageRequestModal.tsx line 66)
2. ✅ Test build locally: bun run build
3. ✅ Commit to git
4. ✅ Configure Supabase Auth (email/password)
5. ✅ Verify RLS policies in migrations 001-008
6. ✅ Test RLS locally (unauthenticated user cannot read data)
7. ✅ Create Interlingo API endpoint: POST /api/jobs/create
8. ✅ Implement API key auth for n8n → Interlingo
9. ✅ Store n8n API key in GCP Secret Manager
10. ✅ Clone interlingo-renderer to new droplet
11. ✅ Test: Interlingo (new) → Renderer (new) → Email generation

DEPLOYMENT MODIFICATIONS:
- Change droplet size to Professional $24/month
- Add renderer deployment steps (port 3001)
- Fix PM2 ecosystem.config.js env loading
- Add audit logging setup to Phase 1
- Create validation comparison script

CUTOVER PLAN:
- Friday 6pm PST (not Monday 6am)
- 7-day parallel validation (not 48 hours)
- Automated comparison (not manual review)
- Rollback window: 72 hours
```

---

### 🔒 SECURITY responds to other agents

**To Architect:**
- ✅ Agree: Pre-deployment blockers correct
- ⚠️ Disagree on WAF defer - at minimum, use Cloudflare free plan (zero config, high value)
- ✅ Agree: Friday cutover better (more time to respond if breach detected)

**To Engineer:**
- ✅ Agree: Immediate actions list comprehensive
- ✅ Agree: API key auth for n8n → Interlingo (simple, secure)
- 🔒 **CRITICAL:** API key rotation schedule must be defined (quarterly minimum)
- 🔒 **CRITICAL:** API key in Secret Manager = good, but how does n8n load it? Environment variable?

**To Operations:**
- ✅ Agree: Professional droplet needed (security through reliability)
- ✅ Agree: Validation metrics critical (security = data integrity)
- ⚠️ Disagree on "declare cutover successful at 6pm" - need 24-hour observation period

**Security Revised Recommendation:**
```
PHASE 1 SECURITY REQUIREMENTS (NON-NEGOTIABLE):
1. ✅ Supabase Auth enabled
2. ✅ RLS policies tested and verified
3. ✅ API authentication (API key or JWT)
4. ✅ Audit logging active (Supabase + nginx)
5. ✅ Secrets in GCP Secret Manager
6. ✅ SSH key-only authentication
7. ✅ fail2ban active
8. ✅ UFW deny-all default
9. ✅ SSL certificates for both domains
10. ✅ Rate limiting in nginx (10 req/sec per IP)
11. ✅ PM2 logs redact PII (client names, case numbers)
12. ✅ Encrypted backups to GCP Cloud Storage

API KEY MANAGEMENT:
- Generate: openssl rand -hex 32
- Store: gcloud secrets create interlingo-api-key
- Load in n8n: Environment variable from Secret Manager
- Rotate: Every 90 days
- Rotation script: ~/rotate-api-key.sh

INCIDENT RESPONSE:
- If breach suspected: Immediate shutdown (maintenance mode)
- Forensics: Copy logs before investigation
- Notification: Document who to notify (compliance requirement)
- Recovery: Restore from encrypted backup
```

---

### 📊 OPERATIONS responds to other agents

**To Architect:**
- ✅ Agree: Pre-deployment blockers essential
- ⚠️ Neutral on cutover day - Friday 6pm OR Monday 6am both work if 7-day validation complete
- ✅ Agree: Professional $24 droplet needed

**To Engineer:**
- ✅ **STRONGLY AGREE:** Immediate actions list is the deployment checklist
- ✅ Agree: Renderer on new droplet simpler than network access
- ✅ Agree: 7-day validation gives confidence
- 🤔 Question: Who applies build fix? When? Before or during Phase 0?

**To Security:**
- ✅ **CRITICAL AGREEMENT:** Phase 1 security requirements are non-negotiable
- ⚠️ Disagree on 24-hour observation - 12 hours sufficient if validation script passes
- ✅ Agree: API key rotation schedule essential (put in maintenance calendar)

**Operations Final Recommendation:**
```
PHASE 0: PRE-DEPLOYMENT (2-3 days)
Owner: Engineer (with Security validation)
  ☐ Apply build fix, test, commit
  ☐ Configure Supabase Auth + RLS
  ☐ Create API endpoint + auth
  ☐ Deploy renderer locally
  ☐ Test end-to-end: GCal event → Interlingo → Renderer → Email
  ☐ Create validation comparison script
  ☐ Security review (all Phase 1 requirements met?)

PHASE 1: DEPLOY INFRASTRUCTURE (48 hours)
Owner: Engineer (following DEPLOYMENT-PLAN.md)
  ☐ Provision Professional $24 droplet
  ☐ Execute Steps 1-20 of DEPLOYMENT-PLAN
  ☐ Deploy renderer (port 3001)
  ☐ Add audit logging setup
  ☐ Run Phase 1 security checklist
  ☐ Test: Create manual job in Interlingo

PHASE 2: PARALLEL VALIDATION (7 days)
Owner: Operations (monitoring) + Engineer (fixes)
  Day 1-7:
    ☐ Old N8N runs production reminders
    ☐ New Interlingo shadows same events
    ☐ Run comparison script daily
    ☐ Fix any discrepancies immediately
    ☐ Monitor: logs, errors, performance
    ☐ Load test: Simulate 50 reminders

  Validation Metrics (MUST be 100%):
    - Reminder count match
    - Content match (subject, body, recipients)
    - Timing match (within 5 minutes)
    - Zero errors in logs
    - Deduplication working (no duplicate jobs created)

PHASE 3: CUTOVER (Friday 6pm PST)
Owner: Operations + Engineer on call
  6:00pm: Switch GCal webhook to new n8n
  6:05pm: Monitor first reminder fires correctly
  7:00pm: Check logs, verify no errors
  10:00pm: Final check before weekend

  Saturday-Sunday: Monitor remotely
    - Check logs 2x per day
    - Verify reminders still sending
    - Rollback if critical issue

  Monday 9am: Review weekend logs
    - If stable: Continue
    - If issues: Assess rollback vs fix

PHASE 4: POST-CUTOVER MONITORING (Days 8-15)
Owner: Operations
  ☐ Daily log review
  ☐ Keep old N8N available (read-only)
  ☐ Day 15: If stable, deprecate old system
  ☐ Document lessons learned
  ☐ Update runbook with actual issues encountered

MAINTENANCE SCHEDULE:
  Daily: Check PM2 status, disk space, logs
  Weekly: Security scan, fail2ban review
  Monthly: Test restore procedure, API key rotation check
  Quarterly: Rotate API keys, penetration test, review droplet size
```

---

## ROUND 3: Consensus & Final Recommendations

### Areas of Full Consensus

All four agents agree on:

1. ✅ **PRE-DEPLOYMENT BLOCKERS:**
   - Apply build fix to AddLanguageRequestModal.tsx
   - Implement Supabase Auth + RLS policies
   - Create API authentication for n8n → Interlingo
   - Deploy renderer to new droplet
   - Upgrade to Professional $24/month droplet (4GB RAM)

2. ✅ **PHASE 1 SECURITY BASELINE:**
   - GCP Secret Manager for all credentials
   - SSH key-only authentication
   - fail2ban + UFW firewall
   - SSL certificates for both domains
   - Audit logging active from day 1
   - Rate limiting in nginx

3. ✅ **VALIDATION APPROACH:**
   - 7-day parallel operation (not 48 hours)
   - Automated comparison script (not manual review)
   - 100% content match required before cutover
   - Keep rollback capability for 7-14 days

4. ✅ **DEPLOYMENT STRUCTURE:**
   - Use DEPLOYMENT-PLAN.md as implementation guide
   - Use Operations Plan's phased migration approach
   - Hybrid architecture initially (n8n bridge to Interlingo)
   - Gradual migration to direct GCal integration later

### Areas of Productive Disagreement

**Cutover Timing:**
- Architect + Engineer: Friday 6pm (weekend buffer)
- Operations: Monday 6am OR Friday 6pm (both acceptable)
- **Resolution:** Friday 6pm with weekend monitoring

**WAF Deployment:**
- Security: Phase 1 (Cloudflare free plan, zero config)
- Architect + Engineer: Phase 3 (after basic system proven)
- **Resolution:** Phase 2 compromise (add after 7-day validation passes)

**Cutover Declaration:**
- Security: 24-hour observation before "success"
- Operations: 12 hours sufficient if validation script passes
- **Resolution:** 12 hours minimum, extend to 24 if any anomalies

### Critical Gaps Identified by Council

1. **🚨 AUTHENTICATION ARCHITECTURE** (Mentioned by all agents)
   - How do users authenticate to Interlingo web app?
   - How does n8n authenticate to Interlingo API?
   - Are RLS policies tested?
   - **This is the #1 blocking issue**

2. **🚨 RENDERER DEPLOYMENT** (Engineer + Architect)
   - New droplet needs its own renderer instance
   - Interlingo must be able to reach renderer on localhost
   - **Reminders will fail without this**

3. **🚨 VALIDATION METRICS** (Operations + Engineer)
   - Automated comparison script required
   - Define success criteria (100% match)
   - **Subjective validation is insufficient**

4. **🚨 CAPACITY PLANNING** (Operations + Engineer)
   - $12 droplet undersized for Next.js + n8n + Redis + Renderer
   - Professional $24 needed (4GB RAM)
   - Load testing required
   - **System may crash under load without proper sizing**

### What Both Plans Missed

**High Priority:**
1. Authentication implementation details
2. Renderer deployment procedure
3. API security (rate limiting, authentication)
4. Validation comparison script
5. Droplet sizing analysis
6. n8n workflow export/import procedure
7. Data migration script (backfill fingerprint_hash)
8. Cutover communication plan

**Medium Priority:**
9. Load testing procedure
10. Training documentation for Interlingo UI
11. Incident response playbook
12. API key rotation schedule
13. Connection pool tuning
14. PII redaction in logs

**Low Priority:**
15. WAF configuration
16. Advanced monitoring (beyond health checks)
17. Cost optimization analysis
18. Multi-user scalability planning

---

## FINAL CONSOLIDATED PLAN

### Executive Summary

Both plans are **strategically sound but tactically incomplete**. The Operations Plan correctly identifies Interlingo as the solution (not N8N patches), and the Deployment Plan provides excellent infrastructure steps. However, **neither plan addresses authentication, API security, renderer deployment, or validation metrics** - all of which are blocking issues.

**Council Recommendation:** Combine both plans with the following modifications:

### PHASE 0: PRE-DEPLOYMENT (3-4 days)

**Blocking Tasks (MUST complete before deployment):**

1. **Apply Build Fix**
   ```bash
   # Edit file
   vim INCOME/Interlingo/web/components/jobs/AddLanguageRequestModal.tsx
   # Line 66: Change to
   const willUpdateDuration = !!(job.client_requests && job.client_requests.length === 1 && currentDuration < 180);

   # Test
   cd INCOME/Interlingo/web
   bun install
   bun run build  # Must succeed

   # Commit
   git add .
   git commit -m "Fix build error: willUpdateDuration type narrowing"
   ```

2. **Implement Authentication**
   ```bash
   # Enable Supabase Auth
   # In Supabase Dashboard: Authentication > Providers > Enable Email

   # Test RLS policies (in Supabase SQL Editor)
   -- Verify policies exist:
   SELECT * FROM pg_policies WHERE tablename IN ('commitment_blocks', 'client_requests', 'interpreters', 'locations');

   -- Test as unauthenticated user:
   SET ROLE anon;
   SELECT * FROM commitment_blocks;  -- Should return no rows or error
   RESET ROLE;
   ```

3. **Create API Authentication**
   ```typescript
   // File: web/app/api/jobs/create/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { createClient } from '@/lib/supabase/server';

   export async function POST(request: NextRequest) {
     // Verify API key from header
     const apiKey = request.headers.get('x-api-key');
     const expectedKey = process.env.INTERLINGO_API_KEY;

     if (!apiKey || apiKey !== expectedKey) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     // Parse request body
     const body = await request.json();
     const { fingerprint_hash, start_time, end_time, organization, language, ...rest } = body;

     // Create Supabase client
     const supabase = createClient();

     // UPSERT commitment_block with fingerprint
     const { data, error } = await supabase
       .from('commitment_blocks')
       .upsert({
         fingerprint_hash,
         start_time,
         end_time,
         ...rest
       }, {
         onConflict: 'fingerprint_hash'
       })
       .select();

     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }

     return NextResponse.json({ success: true, data });
   }
   ```

   ```bash
   # Generate API key
   openssl rand -hex 32

   # Store in GCP Secret Manager
   echo -n "<generated-key>" | gcloud secrets create interlingo-api-key --data-file=-
   ```

4. **Deploy Renderer to New Droplet**
   ```bash
   # Add to DEPLOYMENT-PLAN.md after Step 12

   # Step 12.5: Deploy Renderer
   cd /home/deploy
   git clone <interlingo-renderer-repo> interlingo-renderer
   cd interlingo-renderer
   bun install

   # Create PM2 config
   nano ecosystem.config.js
   ```

   ```javascript
   // Renderer ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'interlingo-renderer',
       script: 'bun',
       args: 'run server.ts',
       cwd: '/home/deploy/interlingo-renderer',
       instances: 1,
       autorestart: true,
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       }
     }]
   };
   ```

   ```bash
   # Start renderer
   pm2 start ecosystem.config.js
   pm2 save

   # Test renderer
   curl http://localhost:3001/health
   ```

5. **Create Validation Comparison Script**
   ```bash
   # File: ~/compare-outputs.sh
   #!/bin/bash

   # Compare N8N vs Interlingo reminder outputs

   OLD_LOGS="/path/to/old-n8n/reminder-logs"
   NEW_LOGS="/path/to/interlingo/reminder-logs"

   # Parse reminder emails from both systems
   # Compare: subject, body, recipients, timing
   # Output: Match percentage

   echo "Comparison Results:"
   echo "===================="
   echo "Total reminders (old): $(count_old)"
   echo "Total reminders (new): $(count_new)"
   echo "Content match: $(percentage)%"
   echo "Timing delta: $(avg_time_diff) minutes"

   # Exit 0 if 100% match, exit 1 otherwise
   ```

6. **Provision Professional Droplet**
   - Size: Professional $24/month (4GB RAM, 2 vCPU, 80GB SSD)
   - OS: Ubuntu 24.04 LTS
   - Account: Business email
   - Region: Closest to users

### PHASE 1: DEPLOY INFRASTRUCTURE (48 hours)

**Follow DEPLOYMENT-PLAN.md Steps 1-20 with these modifications:**

**Modified Step 9 (n8n Environment):**
```bash
# Instead of plaintext .env, load from Secret Manager:
nano ~/load-n8n-secrets.sh
```

```bash
#!/bin/bash
export N8N_ENCRYPTION_KEY=$(gcloud secrets versions access latest --secret="n8n-encryption-key")
export N8N_BASIC_AUTH_PASSWORD=$(gcloud secrets versions access latest --secret="n8n-admin-password")
```

**Modified Step 16 (PM2 Ecosystem):**
```javascript
// Load secrets before starting
module.exports = {
  apps: [{
    name: 'interlingo',
    script: 'bash',
    args: '-c "source ~/load-secrets.sh && bun run start"',
    cwd: '/home/deploy/interlingo/web',
    instances: 1,
    autorestart: true,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/deploy/logs/interlingo-error.log',
    out_file: '/home/deploy/logs/interlingo-out.log'
  }]
};
```

**Additional Step: Audit Logging (Phase 1, not Phase 2)**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply to sensitive tables
CREATE TRIGGER audit_commitment_blocks
  AFTER INSERT OR UPDATE OR DELETE ON commitment_blocks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

**Phase 1 Checklist:**
- [ ] All DEPLOYMENT-PLAN.md steps completed
- [ ] Renderer deployed and responding on port 3001
- [ ] Interlingo app accessible via https://interlingo.augeo.one
- [ ] n8n accessible via https://n8n.interlingo.augeo.one
- [ ] API endpoint /api/jobs/create responds to authenticated requests
- [ ] Audit logging active
- [ ] All Phase 1 security requirements met

### PHASE 2: PARALLEL VALIDATION (7 days)

**Day 0: Setup Parallel Testing**
```bash
# Configure n8n (new) to receive GCal webhooks in test mode
# Old n8n continues production reminders
# New Interlingo shadows same events
```

**Days 1-7: Monitor & Compare**
```bash
# Daily tasks:
1. Check both systems processed same events
2. Run comparison script: ~/compare-outputs.sh
3. Review logs for errors
4. Fix any discrepancies immediately
5. Document issues in VALIDATION-LOG.md

# Validation metrics (MUST be 100%):
- Reminder count match
- Content match (subject, body, recipients)
- Timing within 5 minutes
- Zero errors in logs
- Deduplication working (test by editing same event twice)
```

**Day 7: Load Testing**
```bash
# Simulate peak load (50 reminders in 1 hour)
# Monitor: CPU usage, RAM usage, response times
# Verify no errors under load
```

**Phase 2 Go/No-Go Criteria:**
- [ ] 7 consecutive days of 100% output match
- [ ] Zero errors in Interlingo logs
- [ ] Load test passed (50 reminders, no errors)
- [ ] Deduplication verified (UPSERT not INSERT)
- [ ] Renderer generating emails correctly
- [ ] Manual job entry in Interlingo UI works

### PHASE 3: CUTOVER (Friday 6pm PST)

**6:00pm - Switch GCal Webhook**
```bash
# In Google Calendar API Console:
# Change webhook URL from old n8n to new n8n
# https://n8n.interlingo.augeo.one/webhook/gcal
```

**6:05pm - Monitor First Reminder**
```bash
# Watch logs in real-time
pm2 logs interlingo --lines 100
docker logs -f n8n-interlingo

# Verify reminder sent correctly
```

**7:00pm - First Hour Check**
```bash
# Review logs for errors
grep -i error /home/deploy/logs/interlingo-error.log

# Verify reminders still sending
# Compare to expected count
```

**10:00pm - End of Day Check**
```bash
# Final verification before weekend
# Check PM2 status
pm2 status

# Check disk space
df -h

# Run comparison script
~/compare-outputs.sh
```

**Saturday-Sunday - Weekend Monitoring**
```
- Check logs 2x per day (morning, evening)
- Verify reminders sending
- Monitor for errors
- Rollback if critical issue
```

**Monday 9am - Post-Cutover Review**
```bash
# Review weekend logs
# If stable: Continue
# If issues: Assess rollback vs fix

# If rollback needed:
ssh deploy@interlingo.augeo.one
cd /home/deploy/interlingo/web
git log --oneline -5
git checkout <previous-commit>
bun run build
pm2 restart interlingo
```

### PHASE 4: POST-CUTOVER MONITORING (Days 8-15)

**Daily Tasks:**
- Review logs for errors
- Check PM2 status
- Monitor disk space
- Verify reminder count matches expected

**Day 15: Final Validation**
- If 15 days stable, deprecate old N8N
- Update documentation
- Document lessons learned
- Archive old N8N workflows

---

## IMPLEMENTATION CHECKLIST

### Pre-Deployment (Phase 0)
- [ ] Build fix applied and tested
- [ ] Supabase Auth enabled
- [ ] RLS policies verified
- [ ] API endpoint created
- [ ] API key generated and stored
- [ ] Renderer deployment procedure ready
- [ ] Validation script created
- [ ] Professional droplet provisioned ($24/month)

### Deployment (Phase 1)
- [ ] All DEPLOYMENT-PLAN.md steps completed
- [ ] Renderer deployed (port 3001)
- [ ] Interlingo app accessible (HTTPS)
- [ ] n8n accessible (HTTPS)
- [ ] API authentication working
- [ ] Audit logging active
- [ ] Security checklist 100% complete

### Validation (Phase 2)
- [ ] 7 days parallel operation
- [ ] Automated comparison passing
- [ ] Load test passed
- [ ] Deduplication verified
- [ ] Manual UI testing completed

### Cutover (Phase 3)
- [ ] GCal webhook switched
- [ ] First hour monitored
- [ ] Weekend monitoring completed
- [ ] Monday review passed

### Post-Cutover (Phase 4)
- [ ] 15 days stable operation
- [ ] Old N8N deprecated
- [ ] Documentation updated
- [ ] Lessons learned captured

---

## MAINTENANCE SCHEDULE

### Daily
- Check PM2 status: `pm2 status`
- Review logs: `pm2 logs interlingo --lines 100`
- Verify SSL health: `curl -I https://interlingo.augeo.one`
- Check disk space: `df -h`

### Weekly
- Security scan: `trivy fs /home/deploy/interlingo/web`
- Review fail2ban: `sudo fail2ban-client status sshd`
- Update system: `sudo apt update && sudo apt upgrade`
- Review audit logs for anomalies

### Monthly
- Test backup restoration
- Review API key rotation schedule
- Audit user access
- Review firewall rules
- Test rollback procedure

### Quarterly (90 Days)
- Rotate API keys
- Penetration testing
- Review security policies
- Disaster recovery drill
- Review droplet sizing (upgrade if needed)

---

## RISK MATRIX

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Build fix not applied | High | High | Include in Phase 0 checklist |
| Authentication missing | High | Critical | Blocking requirement Phase 0 |
| Renderer not deployed | High | High | Add to Phase 1 steps |
| Droplet undersized | Medium | High | Upgrade to Professional $24 |
| Validation metrics subjective | Medium | Medium | Automated comparison script |
| Cutover timing poor | Low | Medium | Friday 6pm with weekend buffer |
| Rollback needed | Low | High | Keep old system 15 days |
| Security breach | Low | Critical | Phase 1 security baseline + audit logs |

---

## CONCLUSION

**Council Verdict:** Both plans are necessary and complementary.

**Operations Plan provides:**
- Strategic understanding (Interlingo IS the solution)
- Problem statement (why N8N is wrong)
- Phased migration approach
- Business continuity focus

**Deployment Plan provides:**
- Tactical implementation steps
- Security hardening procedures
- Infrastructure configuration
- Monitoring and maintenance

**Council Additions:**
- Authentication implementation (blocking gap)
- Renderer deployment (critical missing piece)
- Validation metrics (automated comparison)
- Capacity planning (Professional droplet)
- API security (rate limiting, authentication)
- Phase 1 audit logging (not Phase 2)

**Ready to Deploy:** NO - Phase 0 blockers must be resolved first.

**Ready After Phase 0:** YES - With all four council members' recommendations integrated.

**Timeline:** 4 weeks total (3-4 days Phase 0 + 2 days Phase 1 + 7 days Phase 2 + 15 days Phase 4)

**Next Action:** Approve this consolidated plan, then begin Phase 0 immediate actions.

---

**End of Council Analysis**
