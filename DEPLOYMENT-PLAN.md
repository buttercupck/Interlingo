# Interlingo Production Deployment Plan
## interlingo.augeo.one

**Created:** 2026-02-02
**Status:** Security Council Approved
**Timeline:** Phase 1 (48 hours) + Phase 2 (14 days)
**Presenting To:** Interlingo Operations Council

---

## Roundtable Summary (5-Minute Overview)

### The Plan

Deploy Interlingo Jobs Dashboard + n8n workflow automation to a new production server with security-first approach in two phases:

**Phase 1 (48 Hours):** MVP security baseline
- New DigitalOcean droplet ($12/month) on business email account
- Domains: interlingo.augeo.one + n8n.interlingo.augeo.one
- Fix build error, apply 8 database migrations
- Deploy Interlingo with PM2 process manager
- Deploy n8n in Docker container (ONLY Interlingo workflows - Google Calendar, Gmail integration)
- nginx reverse proxy + SSL certificates for both domains
- Security: SSH keys only, fail2ban, UFW firewall, GCP Secret Manager
- **Deliverable:** Functioning Jobs dashboard + n8n workflow interface, both accessible via HTTPS

**Phase 2 (14 Days):** Production hardening
- Comprehensive audit logging (track all security events)
- Encrypted backups to GCP Cloud Storage
- Weekly security scans (Trivy, OWASP ZAP)
- Penetration testing checklist
- **Deliverable:** Production-grade security suitable for client data

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| **New Droplet** (not migrate existing) | Clean slate on business email, old droplet keeps non-Interlingo workflows |
| **Two n8n Instances** | Separate Interlingo workflows from general automation, risk isolation |
| **PM2 for App** (not Docker) | Simpler maintenance for Next.js, can containerize later if needed |
| **Docker for n8n** | Isolation, easy updates, standard n8n deployment method |
| **Basic $12/month** | Just dev testing initially, can resize live later (2GB RAM sufficient) |
| **GCP Secret Manager** | No plaintext credentials on server (security council requirement) |
| **Workload Identity** | No JSON keys that can be stolen (security council requirement) |
| **Phased Security** | Ship quickly with baseline protection, harden over 14 days |

### Architecture

- **Existing Server:** Keeps current n8n instance with all NON-Interlingo workflows (Renderer, general automation, etc.)
- **New Server:**
  - Interlingo Next.js app (PM2) - Jobs dashboard and API
  - n8n (Docker) - ONLY Interlingo-specific workflows (Google Calendar, Gmail, interpreter scheduling)
  - Communication: n8n workflows call Interlingo API via localhost (same server, faster + more secure)
- **Database:** Supabase managed PostgreSQL (already has data, 8 migrations)
- **Secrets:** GCP Secret Manager (Supabase URLs, Redis password, n8n credentials)

### What Needs Approval

1. **Budget:** $12/month droplet + GCP Secret Manager (free tier sufficient)
2. **Timeline:** 48 hours for Phase 1, 14 days for Phase 2
3. **Approach:** Guided installation with Dev Patel agent assisting
4. **Risk Acceptance:** Phased security (MVP baseline first, full hardening second)

### Success Criteria

**Phase 1 Complete When:**
- [ ] https://interlingo.augeo.one shows Jobs dashboard
- [ ] https://n8n.interlingo.augeo.one shows n8n interface
- [ ] SSL certificates active and valid for both domains
- [ ] Build errors fixed, application stable
- [ ] n8n Docker container running and communicates with app
- [ ] 15-item security checklist complete (SSH keys, firewall, secrets, Docker isolation)

**Phase 2 Complete When:**
- [ ] Audit logging captures all security events
- [ ] Encrypted backups running daily
- [ ] Security scans show no critical vulnerabilities
- [ ] Penetration testing completed

### Open Questions for Roundtable

1. **Approval to proceed?** Are there concerns about the phased security approach?
2. **Budget sign-off?** $12/month droplet is negligible, but want confirmation
3. **Timeline expectations?** 48 hours realistic for Phase 1, or should we extend?
4. **Who reviews Phase 2?** Should security hardening be audited before declaring complete?

---

## Executive Summary

This deployment plan implements a **two-phase security approach** recommended by the technical council:
- **Phase 1:** Deploy with MVP security baseline (48 hours)
- **Phase 2:** Complete production hardening sprint (14 days)

**Critical Insight:** Security isn't binary. This phased approach protects users from day one while allowing practical deployment timelines for a single-developer operation.

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE ARCHITECTURE              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  EXISTING DROPLET (Not Business Email)             │    │
│  │  ├── n8n (Docker) - General Workflows             │    │
│  │  ├── Renderer Server                               │    │
│  │  └── Other Automation                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  NEW DROPLET (Business Email - interlingo.augeo.one) │  │
│  │  Size: Basic $12/month (2GB RAM, 1 vCPU, 50GB)   │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ Interlingo Next.js App (PM2) - Port 3000   │  │    │
│  │  │ └── Jobs Dashboard + API Endpoints         │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │           ▲                          │              │    │
│  │           │ localhost                │              │    │
│  │           ▼                          ▼              │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ n8n (Docker) - Port 5678                    │  │    │
│  │  │ └── ONLY Interlingo Workflows               │  │    │
│  │  │     ├── Google Calendar Integration         │  │    │
│  │  │     ├── Gmail Automation                    │  │    │
│  │  │     └── Interpreter Scheduling              │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │           ▲                                        │    │
│  │           │                                        │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ nginx (Reverse Proxy + SSL)                 │  │    │
│  │  │ ├── interlingo.augeo.one → App :3000       │  │    │
│  │  │ └── n8n.interlingo.augeo.one → n8n :5678   │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ Redis (Session Storage)                     │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │ Security Layer                              │  │    │
│  │  │ ├── UFW Firewall (22/80/443/5678)          │  │    │
│  │  │ ├── fail2ban (SSH Protection)              │  │    │
│  │  │ ├── SSH Keys Only                           │  │    │
│  │  │ └── Docker Isolation                        │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ Connection Pooling                │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Supabase (Managed PostgreSQL)                     │    │
│  │  └── 8 Migrations Applied                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  GCP Secret Manager                                 │    │
│  │  ├── Supabase Credentials                         │    │
│  │  ├── Redis Password                               │    │
│  │  └── n8n Encryption Key                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### What is PM2?

**PM2** is a production process manager for Node.js applications. Think of it as an automatic babysitter for your web app:

**What PM2 Does:**
- ✅ Keeps your app running 24/7 (auto-restarts if it crashes)
- ✅ Starts your app automatically when the server reboots
- ✅ Shows you logs when something goes wrong
- ✅ Monitors memory usage and restarts if it gets too high
- ✅ Allows zero-downtime deployments (reload without stopping)

**Without PM2:**
- ❌ If app crashes, it stays dead until you manually restart it
- ❌ Server reboot = app stays offline until you SSH in and start it
- ❌ No logs saved automatically
- ❌ Deployment = downtime

**Why Not Docker (Initially):**
The security council recommended PM2 first because:
1. Simpler to set up and maintain for single-developer operations
2. Lower operational overhead (no container orchestration)
3. Easier debugging (direct log access, no container layers)
4. Can migrate to Docker later without data loss

**Migration Path:** Phase 1 uses PM2. If you need Docker later (multiple services, microservices), we containerize in a future sprint with zero data loss.

---

## Installation Approach

### Guided Setup with Dev Patel (Intern Agent)

**Methodology:** Interactive, step-by-step installation with human verification at each stage.

**How It Works:**
1. **You create the DigitalOcean droplet** (Basic $12/month, Ubuntu 24.04)
2. **Spawn Dev Patel agent** to guide installation
3. **Dev Patel explains each command** before you run it
4. **You copy-paste commands** one at a time
5. **Dev Patel verifies** each step completed successfully
6. **You can ask questions** at any point

**Benefits of This Approach:**
- ✅ Learn what each command does (not just blindly copying)
- ✅ Catch issues immediately (verify at each step)
- ✅ Build confidence with server administration
- ✅ Create a record of what was done (for troubleshooting later)
- ✅ Agent can adapt to issues as they arise

**When to Spawn Dev Patel:**
After roundtable approval, when you're ready to create the droplet and start installation.

---

## Pre-Deployment: Fix Build Errors

### Build Failure Analysis

**Error Location:** `components/jobs/AddLanguageRequestModal.tsx:81`

**Issue:**
```typescript
// Line 66 computes willUpdateDuration
const willUpdateDuration = job.client_requests && job.client_requests.length === 1 && currentDuration < 180;
// Returns: boolean | null | undefined

// Line 81 passes to mutation
updateDuration: willUpdateDuration,
// Expects: boolean | undefined
```

**Fix Required:**
```typescript
// Change line 66 to:
const willUpdateDuration = !!(job.client_requests && job.client_requests.length === 1 && currentDuration < 180);
// Now returns: boolean
```

**Verification:**
```bash
cd /Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/web
bun run build
# Must succeed before proceeding
```

---

## Phase 1: MVP Security Baseline (48 Hours)

### Step 1: Provision New DigitalOcean Droplet

**Specifications:**
- **Account:** Business email (not personal)
- **Size:** To be determined (user will assist with sizing)
- **OS:** Ubuntu 24.04 LTS
- **Region:** Closest to user base
- **Networking:** Enable IPv6, Private networking

**Initial Setup:**
```bash
# SSH into new droplet as root
ssh root@<DROPLET_IP>

# Update system
apt update && apt upgrade -y

# Set hostname
hostnamectl set-hostname interlingo-prod

# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Configure SSH for deploy user
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
# Copy your SSH public key to /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

---

### Step 2: SSH Hardening (CRITICAL)

**Security Council Requirement:** Key-only authentication, no passwords.

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM no

# Restart SSH
sudo systemctl restart sshd

# IMPORTANT: Test SSH connection in NEW terminal before closing current session
# If locked out, use DigitalOcean console to fix
```

---

### Step 3: Install fail2ban

**Purpose:** Protect against SSH brute-force attacks.

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Create local config
sudo nano /etc/fail2ban/jail.local
```

**jail.local contents:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
```

```bash
# Start and enable fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verify status
sudo fail2ban-client status sshd
```

---

### Step 4: Configure UFW Firewall

**Security Council Decision:** Deny all incoming by default, allow specific services.

```bash
# Reset UFW to defaults
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL - do this first!)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
sudo ufw --force enable

# Verify rules
sudo ufw status verbose
```

---

### Step 5: Install Node.js and Bun Runtime

```bash
# Install Node.js 20 LTS (Next.js requirement)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installations
node --version
bun --version
```

---

### Step 6: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd -u deploy --hp /home/deploy

# Run the command PM2 outputs (it will generate a sudo command)
```

---

### Step 7: Install and Configure nginx

```bash
# Install nginx
sudo apt install nginx -y

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create Interlingo site configuration
sudo nano /etc/nginx/sites-available/interlingo
```

**nginx configuration:**
```nginx
# Main application server
server {
    listen 80;
    server_name interlingo.augeo.one;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name interlingo.augeo.one;

    # SSL certificates (Certbot will add these)
    # ssl_certificate /etc/letsencrypt/live/interlingo.augeo.one/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/interlingo.augeo.one/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# n8n workflow automation server
server {
    listen 80;
    server_name n8n.interlingo.augeo.one;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name n8n.interlingo.augeo.one;

    # SSL certificates (Certbot will add these)
    # ssl_certificate /etc/letsencrypt/live/n8n.interlingo.augeo.one/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/n8n.interlingo.augeo.one/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to n8n Docker container
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # n8n webhook support
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/interlingo /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

### Step 8: Install Docker

**Purpose:** Run n8n in an isolated container for workflow automation.

```bash
# Install Docker dependencies
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Log out and back in for group changes to take effect
# Or run: newgrp docker

# Verify Docker installation
docker --version
docker compose version

# Test Docker
docker run hello-world
```

---

### Step 9: Install and Configure n8n (Docker)

**Purpose:** Set up n8n workflow automation for Interlingo-specific workflows (Google Calendar, Gmail integration, interpreter scheduling).

#### 9.1: Create n8n Directory Structure

```bash
# Create n8n data directory
mkdir -p /home/deploy/n8n-data
cd /home/deploy/n8n-data

# Create .env file for n8n
nano .env
```

**n8n .env file:**
```bash
# n8n Configuration
N8N_HOST=n8n.interlingo.augeo.one
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.interlingo.augeo.one/

# Security
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<generate-strong-password>

# Encryption key (generate with: openssl rand -hex 32)
N8N_ENCRYPTION_KEY=<your-encryption-key>

# Timezone
GENERIC_TIMEZONE=America/Los_Angeles

# Database (SQLite for simplicity, can upgrade to PostgreSQL later)
DB_TYPE=sqlite
DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite

# Execution mode
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600
```

#### 9.2: Store n8n Secrets in GCP Secret Manager

```bash
# Generate encryption key
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
echo -n "$N8N_ENCRYPTION_KEY" | gcloud secrets create n8n-encryption-key --data-file=-

# Generate strong password for n8n
N8N_PASSWORD=$(openssl rand -base64 24)
echo -n "$N8N_PASSWORD" | gcloud secrets create n8n-admin-password --data-file=-

# Display password (save this!)
echo "n8n Admin Password: $N8N_PASSWORD"
```

#### 9.3: Create Docker Compose File

```bash
nano /home/deploy/n8n-data/docker-compose.yml
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-interlingo
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - N8N_BASIC_AUTH_ACTIVE=${N8N_BASIC_AUTH_ACTIVE}
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - DB_TYPE=${DB_TYPE}
      - DB_SQLITE_DATABASE=${DB_SQLITE_DATABASE}
      - EXECUTIONS_MODE=${EXECUTIONS_MODE}
      - EXECUTIONS_TIMEOUT=${EXECUTIONS_TIMEOUT}
      - EXECUTIONS_TIMEOUT_MAX=${EXECUTIONS_TIMEOUT_MAX}
    volumes:
      - n8n_data:/home/node/.n8n
      - /home/deploy/n8n-data/shared:/data/shared
    networks:
      - interlingo-network

volumes:
  n8n_data:
    driver: local

networks:
  interlingo-network:
    driver: bridge
```

#### 9.4: Start n8n Container

```bash
cd /home/deploy/n8n-data

# Start n8n
docker compose up -d

# Verify n8n is running
docker ps
docker logs n8n-interlingo

# Test n8n locally
curl http://localhost:5678/healthz
# Should return: {"status":"ok"}
```

#### 9.5: Configure n8n Auto-Start on Boot

```bash
# Create systemd service for Docker Compose
sudo nano /etc/systemd/system/n8n-interlingo.service
```

**n8n-interlingo.service:**
```ini
[Unit]
Description=n8n Interlingo Workflows
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deploy/n8n-data
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=deploy

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable n8n-interlingo
sudo systemctl start n8n-interlingo

# Check status
sudo systemctl status n8n-interlingo
```

---

### Step 10: Configure DNS for n8n Subdomain (name.com)

**Action Required:** Log into name.com and configure DNS for BOTH domains.

1. Go to name.com DNS management for `augeo.one`

2. Add A Records:

   **For Interlingo App:**
   - **Type:** A
   - **Host:** interlingo
   - **Answer:** `<DROPLET_IP>`
   - **TTL:** 300 (5 minutes for testing)

   **For n8n Subdomain:**
   - **Type:** A
   - **Host:** n8n.interlingo
   - **Answer:** `<DROPLET_IP>`
   - **TTL:** 300 (5 minutes for testing)

3. Wait for DNS propagation (5-30 minutes):
```bash
# Test DNS resolution for both domains
dig interlingo.augeo.one +short
dig n8n.interlingo.augeo.one +short
# Both should return your droplet IP
```

---

### Step 11: Update UFW Firewall for n8n

```bash
# Allow n8n port (only from localhost, nginx will proxy)
# No external firewall rule needed since n8n binds to 127.0.0.1:5678

# Verify firewall rules
sudo ufw status verbose
# Should show: 22/tcp, 80/tcp, 443/tcp ALLOW
```

---

### Step 12: Install Certbot and Configure SSL

**Security Council Requirement:** HTTPS with HSTS enabled for BOTH domains.

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificates for both domains
sudo certbot --nginx -d interlingo.augeo.one -d n8n.interlingo.augeo.one

# Follow prompts:
# - Enter email for renewal notifications
# - Agree to Terms of Service
# - Choose to redirect HTTP to HTTPS (recommended)

# Certbot will automatically configure nginx with SSL certificates

# Verify SSL certificates
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal timer (already configured by package)
sudo systemctl status certbot.timer
```

**Monitor Certificate Expiration:**
- Certificates expire every 90 days
- Auto-renewal runs twice daily
- Alert if certificate expiry < 30 days for either domain

**Verify SSL Working:**
```bash
# Test Interlingo app
curl -I https://interlingo.augeo.one

# Test n8n
curl -I https://n8n.interlingo.augeo.one

# Both should return HTTP/2 200 with SSL headers
```

---

### Step 13: Set Up GCP Secret Manager (CRITICAL SECURITY)

**Security Council Decision:** No plaintext credentials in environment variables or filesystem.

#### 10.1: Create GCP Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `interlingo-production`
3. Enable Secret Manager API
4. Enable Cloud Resource Manager API

#### 10.2: Install gcloud CLI on Droplet

```bash
# Add Google Cloud SDK repo
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Install gcloud
sudo apt update && sudo apt install google-cloud-cli -y

# Authenticate (follow interactive prompts)
gcloud auth login

# Set project
gcloud config set project interlingo-production
```

#### 10.3: Store Secrets in Secret Manager

```bash
# Supabase URL (public, but store for consistency)
echo -n "https://anqfdvyhexpxdpgbkgmd.supabase.co" | gcloud secrets create supabase-url --data-file=-

# Supabase Anon Key (public key, safe to store)
echo -n "sb_publishable_tS0dwo2QOhYByaw_BUzBRg_Y4831mZn" | gcloud secrets create supabase-anon-key --data-file=-

# Supabase Pooled Connection URL (SENSITIVE)
# Get from Supabase Dashboard > Settings > Database > Connection Pooling
echo -n "postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true" | gcloud secrets create supabase-database-url --data-file=-

# Supabase Direct Connection URL (SENSITIVE - migrations only)
# Get from Supabase Dashboard > Settings > Database > Connection String
echo -n "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" | gcloud secrets create supabase-direct-url --data-file=-

# Verify secrets stored
gcloud secrets list
```

#### 10.4: Configure Workload Identity (No JSON Keys!)

**Security Council Requirement:** Use Workload Identity Federation instead of service account JSON keys.

```bash
# Create service account
gcloud iam service-accounts create interlingo-app \
    --description="Interlingo application service account" \
    --display-name="Interlingo App"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding interlingo-production \
    --member="serviceAccount:interlingo-app@interlingo-production.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Create workload identity pool
gcloud iam workload-identity-pools create "interlingo-pool" \
    --location="global" \
    --description="Workload identity pool for Interlingo"

# Create workload identity provider
gcloud iam workload-identity-pools providers create-oidc "interlingo-provider" \
    --location="global" \
    --workload-identity-pool="interlingo-pool" \
    --issuer-uri="https://accounts.google.com" \
    --allowed-audiences="interlingo-production"

# Allow service account to impersonate workload identity
gcloud iam service-accounts add-iam-policy-binding \
    interlingo-app@interlingo-production.iam.gserviceaccount.com \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/interlingo-pool/*"
```

---

### Step 11: Install Redis for Session Management

**Purpose:** Persistent sessions that survive PM2 restarts.

```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis for local-only access
sudo nano /etc/redis/redis.conf

# Ensure these settings:
# bind 127.0.0.1 ::1
# protected-mode yes
# requirepass <generate-strong-password>

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG

# Store Redis password in Secret Manager
echo -n "your-redis-password" | gcloud secrets create redis-password --data-file=-
```

---

### Step 12: Clone Repository and Install Dependencies

```bash
# Clone repository (adjust URL to your repo)
cd /home/deploy
git clone <your-repo-url> interlingo
cd interlingo/web

# Install dependencies
bun install

# Apply build fix (if not already in repo)
# Edit components/jobs/AddLanguageRequestModal.tsx line 66:
nano components/jobs/AddLanguageRequestModal.tsx
# Change to: const willUpdateDuration = !!(job.client_requests && job.client_requests.length === 1 && currentDuration < 180);
```

---

### Step 13: Create Environment Variables Script

**Security Note:** Fetch secrets from GCP Secret Manager at runtime.

```bash
# Create secrets loader script
nano ~/load-secrets.sh
```

**load-secrets.sh:**
```bash
#!/bin/bash
export NEXT_PUBLIC_SUPABASE_URL=$(gcloud secrets versions access latest --secret="supabase-url")
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(gcloud secrets versions access latest --secret="supabase-anon-key")
export DATABASE_URL=$(gcloud secrets versions access latest --secret="supabase-database-url")
export DIRECT_URL=$(gcloud secrets versions access latest --secret="supabase-direct-url")
export REDIS_PASSWORD=$(gcloud secrets versions access latest --secret="redis-password")
export NODE_ENV=production
```

```bash
# Make script executable
chmod +x ~/load-secrets.sh

# Test secret loading
source ~/load-secrets.sh
echo $NEXT_PUBLIC_SUPABASE_URL
# Should print Supabase URL
```

---

### Step 14: Apply Supabase Migrations

**Security Council Requirement:** Verify Row Level Security policies before applying.

```bash
# Review all migrations for RLS policies
cd /home/deploy/interlingo/web/supabase/migrations
ls -la
# Should show 8 migration files

# Check for RLS policies in migrations
grep -r "ENABLE ROW LEVEL SECURITY" .
grep -r "CREATE POLICY" .

# Apply migrations (requires DIRECT_URL)
source ~/load-secrets.sh
cd /home/deploy/interlingo/web

# Use Supabase CLI to apply migrations
npx supabase db push --db-url "$DIRECT_URL"

# Verify migrations applied
npx supabase db diff --db-url "$DIRECT_URL"
# Should show no pending changes
```

---

### Step 15: Build Next.js Application

```bash
cd /home/deploy/interlingo/web

# Load secrets
source ~/load-secrets.sh

# Build production bundle
bun run build

# Verify build succeeded
ls -la .next/
# Should see production build artifacts
```

---

### Step 16: Configure PM2 Ecosystem File

```bash
# Create PM2 ecosystem config
nano /home/deploy/interlingo/web/ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'interlingo',
    script: 'bun',
    args: 'run start',
    cwd: '/home/deploy/interlingo/web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/deploy/logs/interlingo-error.log',
    out_file: '/home/deploy/logs/interlingo-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

```bash
# Create logs directory
mkdir -p /home/deploy/logs
```

---

### Step 17: Start Application with PM2

```bash
cd /home/deploy/interlingo/web

# Load secrets into environment
source ~/load-secrets.sh

# Start app with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Verify app running
pm2 status
pm2 logs interlingo --lines 50

# Test local connection
curl http://localhost:3000/health
# Should return: healthy
```

---

### Step 18: Verify SSL and Public Access

```bash
# Test HTTPS access
curl -I https://interlingo.augeo.one

# Should return:
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff
```

**Browser Test:**
1. Open https://interlingo.augeo.one
2. Verify green padlock (valid SSL)
3. Check certificate details (should be Let's Encrypt)
4. Test Jobs dashboard functionality

---

### Step 19: Configure Basic Monitoring

```bash
# Install monitoring script
nano ~/monitor-interlingo.sh
```

**monitor-interlingo.sh:**
```bash
#!/bin/bash
# Basic health monitoring

# Check PM2 app status
pm2 status interlingo | grep -q "online"
if [ $? -ne 0 ]; then
    echo "ALERT: Interlingo app is DOWN"
    # Add notification logic here (email, ntfy, etc.)
fi

# Check SSL certificate expiry
DAYS=$(echo | openssl s_client -servername interlingo.augeo.one -connect interlingo.augeo.one:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2 | xargs -I {} date -d {} +%s)
NOW=$(date +%s)
DAYS_LEFT=$(( ($DAYS - $NOW) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
    echo "ALERT: SSL certificate expires in $DAYS_LEFT days"
fi

# Check disk space
DISK=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK -gt 80 ]; then
    echo "ALERT: Disk usage at ${DISK}%"
fi

# Check Redis
redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ALERT: Redis is DOWN"
fi
```

```bash
# Make executable
chmod +x ~/monitor-interlingo.sh

# Add to crontab (run every 5 minutes)
crontab -e
# Add line:
# */5 * * * * /home/deploy/monitor-interlingo.sh >> /home/deploy/logs/monitor.log 2>&1
```

---

### Step 20: Document Rollback Procedure

**Create rollback playbook:**

```bash
nano ~/ROLLBACK.md
```

**ROLLBACK.md:**
```markdown
# Interlingo Rollback Procedure

## Quick Rollback (Application Issue)

1. SSH into server:
   ```bash
   ssh deploy@interlingo.augeo.one
   ```

2. Stop current app:
   ```bash
   pm2 stop interlingo
   ```

3. Checkout previous working commit:
   ```bash
   cd /home/deploy/interlingo/web
   git log --oneline -5
   git checkout <previous-commit-hash>
   ```

4. Rebuild and restart:
   ```bash
   source ~/load-secrets.sh
   bun install
   bun run build
   pm2 restart interlingo
   ```

5. Verify:
   ```bash
   curl https://interlingo.augeo.one/health
   pm2 logs interlingo
   ```

## Database Rollback (Migration Issue)

**WARNING:** Only if migrations corrupted database.

1. Restore from Supabase backup:
   - Go to Supabase Dashboard > Database > Backups
   - Select most recent pre-migration backup
   - Click "Restore"

2. Re-apply known-good migrations only

## Emergency Maintenance Mode

If app completely broken, show maintenance page:

```bash
sudo nano /etc/nginx/sites-available/interlingo
```

Comment out proxy_pass, add:
```nginx
return 503 "Maintenance in progress. Back soon.";
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Contact

If rollback fails, escalate immediately.
```

---

## Phase 1 Go/No-Go Checklist

**Before declaring MVP deployment complete:**

**Security:**
- [ ] SSH password authentication disabled
- [ ] fail2ban configured and blocking SSH brute-force
- [ ] UFW firewall active (deny incoming default, allow 22/80/443)
- [ ] GCP Secret Manager storing all credentials (no plaintext)
- [ ] Workload Identity Federation configured (no JSON keys on disk)

**Database:**
- [ ] Supabase RLS policies verified in migrations
- [ ] All 8 Supabase migrations applied successfully
- [ ] Redis session storage configured and tested

**SSL/Certificates:**
- [ ] SSL certificates active for interlingo.augeo.one
- [ ] SSL certificates active for n8n.interlingo.augeo.one
- [ ] Auto-renewal tested with certbot --dry-run

**Applications:**
- [ ] Interlingo app accessible via https://interlingo.augeo.one
- [ ] Jobs dashboard and job details page functional
- [ ] No build errors in production logs
- [ ] PM2 process running and auto-starting on reboot

**n8n Workflow Automation:**
- [ ] n8n accessible via https://n8n.interlingo.augeo.one
- [ ] n8n Docker container running and auto-starting on reboot
- [ ] n8n admin credentials stored in GCP Secret Manager
- [ ] n8n can communicate with Interlingo app via localhost

**Monitoring & Recovery:**
- [ ] Monitoring script configured in crontab
- [ ] Rollback procedure documented and tested

---

## Phase 2: Production Hardening Sprint (14 Days)

### Week 1: Comprehensive Audit Logging

**Goal:** Track all security-relevant events.

#### 1. Enable Supabase Audit Logging

```sql
-- Connect to Supabase SQL Editor
-- Enable audit logging for sensitive tables

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_commitment_blocks
    AFTER INSERT OR UPDATE OR DELETE ON commitment_blocks
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_client_requests
    AFTER INSERT OR UPDATE OR DELETE ON client_requests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

#### 2. Implement Structured Logging (GCP Cloud Logging)

```bash
# Install winston logger
cd /home/deploy/interlingo/web
bun add winston @google-cloud/logging-winston

# Create logging middleware
nano lib/logger.ts
```

**lib/logger.ts:**
```typescript
import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const loggingWinston = new LoggingWinston({
  projectId: 'interlingo-production',
  keyFilename: '/home/deploy/.config/gcloud/application_default_credentials.json'
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    loggingWinston,
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log security events
export function logSecurityEvent(event: string, details: any) {
  logger.warn('SECURITY_EVENT', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
}
```

#### 3. Define Security Event Triggers

Events to monitor:
- Failed SSH attempts (> 5 in 10 minutes)
- Database connection pool exhaustion
- SSL certificate expiry (< 30 days)
- Unusual query patterns (> 1000 queries/min)
- Failed authentication attempts
- Privilege escalation attempts
- Suspicious API rate patterns

---

### Week 2: Backup Encryption & Penetration Testing

#### 4. Encrypted Backup Strategy

```bash
# Install GPG for backup encryption
sudo apt install gnupg -y

# Generate encryption key
gpg --full-generate-key
# Choose: RSA and RSA, 4096 bits, no expiration
# Passphrase stored in GCP Secret Manager

# Create backup script
nano ~/backup-interlingo.sh
```

**backup-interlingo.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup Supabase database (via pg_dump)
source ~/load-secrets.sh
pg_dump "$DIRECT_URL" | gpg --encrypt --recipient "interlingo-backup" > "$BACKUP_DIR/db_$DATE.sql.gpg"

# Backup application files (config, uploads if any)
tar czf - /home/deploy/interlingo/web/.env.production | gpg --encrypt --recipient "interlingo-backup" > "$BACKUP_DIR/app_$DATE.tar.gz.gpg"

# Upload to GCP Cloud Storage
gsutil cp "$BACKUP_DIR/db_$DATE.sql.gpg" gs://interlingo-backups/
gsutil cp "$BACKUP_DIR/app_$DATE.tar.gz.gpg" gs://interlingo-backups/

# Cleanup local backups older than 7 days
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x ~/backup-interlingo.sh

# Schedule daily backups at 3 AM
crontab -e
# Add line:
# 0 3 * * * /home/deploy/backup-interlingo.sh >> /home/deploy/logs/backup.log 2>&1
```

#### 5. Test Restore Procedure

```bash
# Test backup restoration monthly
nano ~/test-restore.sh
```

**test-restore.sh:**
```bash
#!/bin/bash
# Test restoration of most recent backup

LATEST_BACKUP=$(gsutil ls gs://interlingo-backups/db_*.sql.gpg | sort | tail -1)
gsutil cp "$LATEST_BACKUP" /tmp/test-restore.sql.gpg

# Decrypt
gpg --decrypt /tmp/test-restore.sql.gpg > /tmp/test-restore.sql

# Test restore to temporary database
# (Requires test database setup)
psql "$TEST_DATABASE_URL" < /tmp/test-restore.sql

# Verify data integrity
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) FROM commitment_blocks;"

# Cleanup
rm /tmp/test-restore.sql*

echo "Restore test completed successfully"
```

#### 6. Security Scanning Setup

```bash
# Install Trivy (container/filesystem scanner)
sudo apt install wget apt-transport-https gnupg lsb-release -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt update
sudo apt install trivy -y

# Scan application for vulnerabilities
trivy fs /home/deploy/interlingo/web --severity HIGH,CRITICAL

# Schedule weekly scans
crontab -e
# Add line:
# 0 2 * * 0 trivy fs /home/deploy/interlingo/web --severity HIGH,CRITICAL >> /home/deploy/logs/security-scan.log 2>&1
```

#### 7. Penetration Testing Checklist

**Manual testing required:**

- [ ] SQL injection testing on all API endpoints
- [ ] XSS testing on all user input fields
- [ ] Authentication bypass attempts
- [ ] Session hijacking attempts
- [ ] CSRF token validation
- [ ] Rate limiting enforcement
- [ ] Privilege escalation testing
- [ ] File upload vulnerabilities (if applicable)
- [ ] API authentication token leakage
- [ ] Supabase RLS policy bypass attempts

**Tools:**
- OWASP ZAP for automated scanning
- Burp Suite for manual testing
- sqlmap for SQL injection testing

---

## Phase 2 Production-Ready Checklist

**Before handling real client data:**

- [ ] Comprehensive audit logging active (Supabase + GCP Cloud Logging)
- [ ] Encrypted backups running daily
- [ ] Restore procedure tested and verified
- [ ] Backup encryption keys stored in Secret Manager
- [ ] Weekly security scans scheduled (Trivy)
- [ ] Penetration testing completed with no critical findings
- [ ] All High/Critical vulnerabilities remediated
- [ ] Monitoring alerts configured (failed SSH, cert expiry, disk space)
- [ ] Incident response playbook documented
- [ ] 90-day secret rotation schedule established

---

## Google Service Account for n8n Workflows

**Security Council Requirement:** Workload Identity Federation, not JSON keys.

### Setup for n8n GCal/Gmail Integration

**Note:** This is for your existing n8n server (not Interlingo), but following same security principles.

#### Option 1: Service Account with Domain-Wide Delegation (Recommended)

```bash
# On your n8n server
gcloud iam service-accounts create n8n-workflows \
    --description="n8n automation service account" \
    --display-name="n8n Workflows"

# Grant Calendar/Gmail API access
gcloud projects add-iam-policy-binding <project-id> \
    --member="serviceAccount:n8n-workflows@<project-id>.iam.gserviceaccount.com" \
    --role="roles/calendar.editor"

gcloud projects add-iam-policy-binding <project-id> \
    --member="serviceAccount:n8n-workflows@<project-id>.iam.gserviceaccount.com" \
    --role="roles/gmail.admin"
```

**Configure Domain-Wide Delegation:**
1. Go to Google Workspace Admin Console
2. Security > API Controls > Domain-wide Delegation
3. Add n8n service account client ID
4. Grant OAuth scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.modify`

**Store Credentials Securely:**
```bash
# On n8n server, use environment variables (not files)
export GOOGLE_SERVICE_ACCOUNT_EMAIL="n8n-workflows@<project>.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="<private-key-from-json>"
```

#### Option 2: OAuth with 90-Day Rotation (If Required)

If you MUST use OAuth tokens:

```bash
# Use refresh tokens with automated rotation
# Store refresh token in secure location
# Set up cron job to rotate every 85 days (before 90-day expiry)

nano ~/rotate-oauth-tokens.sh
```

**rotate-oauth-tokens.sh:**
```bash
#!/bin/bash
# Refresh OAuth tokens before expiry

CLIENT_ID="<your-client-id>"
CLIENT_SECRET="<your-client-secret>"
REFRESH_TOKEN="<your-refresh-token>"

# Get new access token
NEW_TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d "grant_type=refresh_token" | jq -r '.access_token')

# Update n8n credentials (adjust based on n8n setup)
# Option: Use n8n API to update credentials
# Option: Update environment variables and restart n8n

echo "OAuth token refreshed: $(date)"
```

**Recommendation:** Use Service Account with Domain-Wide Delegation. It doesn't expire and is more secure than OAuth tokens.

---

## Maintenance & Ongoing Security

### Daily

- [ ] Check PM2 app status: `pm2 status`
- [ ] Review application logs: `pm2 logs interlingo --lines 100`
- [ ] Verify SSL certificate health
- [ ] Check disk space usage

### Weekly

- [ ] Review security scan results (Trivy)
- [ ] Check fail2ban ban list: `sudo fail2ban-client status sshd`
- [ ] Review audit logs for suspicious activity
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`

### Monthly

- [ ] Test backup restoration procedure
- [ ] Review and rotate SSH keys if needed
- [ ] Audit user access and permissions
- [ ] Review firewall rules for accuracy

### Quarterly (90 Days)

- [ ] Rotate all secrets in GCP Secret Manager
- [ ] Full penetration testing assessment
- [ ] Review and update security policies
- [ ] Disaster recovery drill

---

## Emergency Contacts & Escalation

**If deployment fails or security incident detected:**

1. **Stop deployment immediately**
2. **Enable maintenance mode** (see Rollback procedure)
3. **Review logs** for root cause
4. **Document incident** in audit log
5. **Escalate to council** if needed

---

## Appendix A: Droplet Sizing

**DECISION:** Basic $12/month Droplet

**Specifications:**
- **RAM:** 2 GB
- **CPU:** 1 vCPU
- **Storage:** 50 GB SSD
- **Transfer:** 2 TB
- **Region:** Closest to user base

**Rationale:**
- Single developer testing only (no production load initially)
- Next.js + PM2 footprint: ~500 MB RAM
- Redis: ~50 MB RAM
- nginx: ~10 MB RAM
- **Total Usage:** ~560 MB RAM (leaves 1.4 GB headroom)
- Can resize to Professional ($24/month) later if needed

**When to Upgrade:**
Monitor these metrics via PM2 and system logs:
- CPU usage consistently > 70% → Professional tier
- Memory usage > 80% → Professional tier
- Response time p99 > 500ms → Professional tier
- Concurrent users > 10 → Professional tier

**Upgrade Path:**
DigitalOcean allows live resizing with ~30 seconds downtime. No data loss, no reconfiguration needed.

---

## Appendix B: Security Decision Matrix

| Security Concern | Council Decision | Alternative Rejected | Rationale |
|-----------------|------------------|----------------------|-----------|
| Secrets Storage | GCP Secret Manager | Environment variables in .env | Credentials exposed in process memory |
| Google Auth | Workload Identity Federation | JSON key files | Eliminates credential theft vector |
| Session Storage | Redis | In-memory | Survives PM2 restarts |
| Firewall | UFW deny-all with allows | Open ports | Reduces attack surface |
| SSH Auth | Key-only | Password | Eliminates brute-force vector |
| Backups | Encrypted with GPG | Plaintext | PII protection requirement |
| SSL | Certbot auto-renewal | Manual certs | Prevents expiration incidents |
| Monitoring | Security + UX events | Server metrics only | Detects both threats and user impact |

---

## Document Version History

- **v1.0** - 2026-02-02 - Initial deployment plan (Security Council approved)

---

**End of Deployment Plan**

This document should be reviewed and approved by the Interlingo Operations Council before execution.
