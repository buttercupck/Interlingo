# Interlingo Database Schema Design Specifications

**Date:** 2026-02-02
**Schema Reference:** `/Users/intercomlanguageservices/bcck_vault/INCOME/Interlingo/supabase/Supabase-Schema.md`
**Base Design System:** Organizations Page (`shadcn/ui`)

---

## Executive Summary

This document extends the Interlingo design system to account for critical database features discovered in the schema analysis. These features require new UI components and patterns for:

1. **Job Assignment Workflow** - Multi-interpreter contact attempts with status tracking
2. **Communication History** - Email timeline for REQ/CONF/REM tracking
3. **Audit Trails** - Status changes and version history visualization
4. **Unavailability Management** - Calendar view for interpreter time blocks
5. **Complex Relational Data** - Multi-table joins and relationships

All designs follow the established shadcn/ui design system from the Organizations page.

---

## 🎯 Design Principle: Live Environment First

All components designed here are intended to be:
- **Tested in Chrome DevTools** before finalization
- **Iteratively refined** based on actual browser rendering
- **Responsive** across mobile, tablet, and desktop
- **Accessible** with proper ARIA labels and keyboard navigation

---

# Part 1: Job Assignment Workflow UI

## Database Schema Context

```sql
CREATE TABLE public.job_assignment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id),
  interpreter_id UUID NOT NULL REFERENCES public.interpreters(id),
  status TEXT NOT NULL CHECK (status IN ('contacted', 'pending', 'declined', 'confirmed')),
  contacted_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, interpreter_id)
);
```

**Status Flow:** `contacted` → `pending` → `declined` or `confirmed`

## Visual Design: Assignment Status Board

### Component Structure

```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User, Clock, CheckCircle2, XCircle,
  AlertCircle, Mail, MessageSquare
} from "lucide-react"
```

### Wireframe: Assignment Attempts Panel

```
┌─────────────────────────────────────────────────────────────┐
│ [Card] Assignment Attempts                                  │
│                                                             │
│ [H2] Interpreter Assignment History                        │
│ [Text] 5 interpreters contacted • 2 pending • 1 confirmed  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Timeline View                                         │  │
│ │                                                       │  │
│ │ ●━━━━━━● [Confirmed] John Doe                        │  │
│ │ │       [Badge: Confirmed] ✓                         │  │
│ │ │       [Clock] Contacted: Mar 1, 9:00 AM            │  │
│ │ │       [CheckCircle] Confirmed: Mar 1, 10:30 AM     │  │
│ │ │       [MessageSquare] "Available for this job"     │  │
│ │ │                                                     │  │
│ │ ●━━━━━━● [Pending] Maria Smith                       │  │
│ │ │       [Badge: Pending] ○                           │  │
│ │ │       [Clock] Contacted: Mar 1, 9:15 AM            │  │
│ │ │       [AlertCircle] Awaiting response              │  │
│ │ │       [Button: Resend] [Button: Mark Declined]     │  │
│ │ │                                                     │  │
│ │ ●━━━━━━● [Declined] Tom Wilson                       │  │
│ │ │       [Badge: Declined] ✗                          │  │
│ │ │       [Clock] Contacted: Feb 28, 4:00 PM           │  │
│ │ │       [XCircle] Declined: Feb 28, 5:20 PM          │  │
│ │ │       [MessageSquare] "Schedule conflict"          │  │
│ │ │                                                     │  │
│ │ ●━━━━━━● [Contacted] Anna Rodriguez                  │  │
│ │         [Badge: Contacted] ●                         │  │
│ │         [Clock] Contacted: Mar 1, 11:00 AM           │  │
│ │         [Button: Mark Pending] [Button: Remove]      │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ [Button: + Contact Another Interpreter]                    │
└─────────────────────────────────────────────────────────────┘
```

### Code Implementation Pattern

```tsx
interface AssignmentAttempt {
  id: string;
  interpreter: {
    id: string;
    first_name: string;
    last_name: string;
  };
  status: 'contacted' | 'pending' | 'declined' | 'confirmed';
  contacted_at: string;
  responded_at?: string;
  notes?: string;
}

function AssignmentAttemptsPanel({ attempts }: { attempts: AssignmentAttempt[] }) {
  const statusConfig = {
    contacted: {
      variant: 'secondary',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Contacted'
    },
    pending: {
      variant: 'outline',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Pending Response'
    },
    declined: {
      variant: 'destructive',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Declined'
    },
    confirmed: {
      variant: 'default',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Confirmed'
    }
  };

  const summary = {
    total: attempts.length,
    pending: attempts.filter(a => a.status === 'pending').length,
    confirmed: attempts.filter(a => a.status === 'confirmed').length
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Interpreter Assignment History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.total} interpreters contacted • {summary.pending} pending • {summary.confirmed} confirmed
            </p>
          </div>
          <Button>
            <User className="mr-2 h-4 w-4" />
            Contact Interpreter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {attempts.map((attempt, index) => {
            const config = statusConfig[attempt.status];
            const Icon = config.icon;
            const isLast = index === attempts.length - 1;

            return (
              <div key={attempt.id} className="relative">
                {/* Timeline connector line */}
                {!isLast && (
                  <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />
                )}

                {/* Timeline dot */}
                <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-2 ${config.bgColor} border-current ${config.color}`} />

                {/* Content */}
                <div className="pl-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {attempt.interpreter.first_name} {attempt.interpreter.last_name}
                        </h3>
                        <Badge variant={config.variant as any} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>

                      {/* Timestamps */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Contacted: {format(new Date(attempt.contacted_at), 'MMM d, h:mm a')}</span>
                        </div>

                        {attempt.responded_at && (
                          <div className="flex items-center gap-2">
                            <Icon className="h-3 w-3" />
                            <span>
                              {attempt.status === 'confirmed' ? 'Confirmed' : 'Declined'}:
                              {' '}{format(new Date(attempt.responded_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        )}

                        {!attempt.responded_at && attempt.status === 'pending' && (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>Awaiting response</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {attempt.notes && (
                        <div className="mt-2 p-2 rounded-md bg-muted">
                          <div className="flex items-start gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <p className="italic">{attempt.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {attempt.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <Mail className="mr-2 h-3 w-3" />
                            Resend Request
                          </Button>
                          <Button variant="ghost" size="sm">
                            Mark as Declined
                          </Button>
                        </div>
                      )}

                      {attempt.status === 'contacted' && (
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            Mark as Pending
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add interpreter button */}
        {attempts.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Contact Another Interpreter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Empty State

```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <User className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">No Assignment Attempts Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start contacting interpreters for this job
        </p>
      </div>
      <Button>
        <User className="mr-2 h-4 w-4" />
        Contact First Interpreter
      </Button>
    </div>
  </CardContent>
</Card>
```

### Key Design Decisions

1. **Timeline View** - Visual progression showing status flow
2. **Status Badges** - Color-coded with icons for quick scanning
3. **Timestamps** - Clear contacted/responded times
4. **Action Buttons** - Context-specific actions per status
5. **Notes Display** - Inline notes with message icon
6. **Empty State** - Encourages first action

### Responsive Behavior

- **Mobile**: Stack all content vertically, full-width buttons
- **Tablet**: Same layout, slightly wider timeline
- **Desktop**: Full layout as shown

---

# Part 2: Communication History Panel

## Database Schema Context

```sql
CREATE TABLE public.job_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id),
  communication_type TEXT NOT NULL CHECK (communication_type IN ('REQ', 'CONF', 'REM')),
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT,
  marked_sent BOOLEAN DEFAULT false
);
```

**Communication Types:**
- `REQ` - Request email to interpreter
- `CONF` - Confirmation email
- `REM` - Reminder email

## Visual Design: Communication Timeline

### Wireframe: Communications Panel

```
┌─────────────────────────────────────────────────────────────┐
│ [Card] Email Communications                                 │
│                                                             │
│ [H2] Communication History                                  │
│ [Text] 4 emails sent • Last: 2 hours ago                    │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Timeline View (Most recent first)                     │  │
│ │                                                       │  │
│ │ ●━━━ [Badge: REM] Reminder                           │  │
│ │ │    [Mail] reminder@interlingo.com → john@email.com │  │
│ │ │    [Clock] Sent: Today at 2:30 PM                  │  │
│ │ │    [User] Sent by: Sarah Johnson                   │  │
│ │ │    [Badge: Sent] ✓                                 │  │
│ │ │    [Button: View Email] [Button: Resend]           │  │
│ │ │                                                     │  │
│ │ ●━━━ [Badge: CONF] Confirmation                      │  │
│ │ │    [Mail] confirm@interlingo.com → john@email.com  │  │
│ │ │    [Clock] Sent: Mar 1 at 10:45 AM                 │  │
│ │ │    [User] Sent by: System                          │  │
│ │ │    [Badge: Sent] ✓                                 │  │
│ │ │    [Collapsible: ▼ View Email Content]             │  │
│ │ │                                                     │  │
│ │ ●━━━ [Badge: REQ] Request                            │  │
│ │ │    [Mail] request@interlingo.com → john@email.com  │  │
│ │ │    [Clock] Sent: Feb 28 at 4:15 PM                 │  │
│ │ │    [User] Sent by: Mike Davis                      │  │
│ │ │    [Badge: Sent] ✓                                 │  │
│ │ │                                                     │  │
│ │ ●━━━ [Badge: REQ] Request                            │  │
│ │      [Mail] request@interlingo.com → maria@email.com│  │
│ │      [Clock] Draft saved: Feb 28 at 3:00 PM          │  │
│ │      [Badge: Unsent] ○                               │  │
│ │      [Button: Edit Draft] [Button: Send Now]         │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ [Button: + Compose New Email]                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Implementation Pattern

```tsx
import {
  Mail, Clock, User, Send, Edit,
  CheckCircle2, Circle, FileText
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface Communication {
  id: string;
  communication_type: 'REQ' | 'CONF' | 'REM';
  recipient_email: string;
  subject: string;
  body: string;
  sent_at: string;
  sent_by: string;
  marked_sent: boolean;
}

function CommunicationHistoryPanel({ communications }: { communications: Communication[] }) {
  const typeConfig = {
    REQ: {
      label: 'Request',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Mail
    },
    CONF: {
      label: 'Confirmation',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2
    },
    REM: {
      label: 'Reminder',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock
    }
  };

  const sentCount = communications.filter(c => c.marked_sent).length;
  const lastSent = communications
    .filter(c => c.marked_sent)
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Communication History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {sentCount} emails sent
              {lastSent && ` • Last: ${formatDistance(new Date(lastSent.sent_at), new Date(), { addSuffix: true })}`}
            </p>
          </div>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Compose Email
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {communications
            .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
            .map((comm, index) => {
              const config = typeConfig[comm.communication_type];
              const TypeIcon = config.icon;
              const isLast = index === communications.length - 1;

              return (
                <div key={comm.id} className="relative">
                  {/* Timeline connector */}
                  {!isLast && (
                    <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-2 w-4 h-4 rounded-full ${
                    comm.marked_sent ? 'bg-green-500' : 'bg-gray-300'
                  } border-2 border-background`} />

                  {/* Content */}
                  <div className="pl-8">
                    <div className="space-y-2">
                      {/* Type badge */}
                      <div className="flex items-center gap-2">
                        <Badge className={config.color}>
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                        <Badge variant={comm.marked_sent ? 'default' : 'outline'}>
                          {comm.marked_sent ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Sent
                            </>
                          ) : (
                            <>
                              <Circle className="mr-1 h-3 w-3" />
                              Unsent
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Email details */}
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{comm.recipient_email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {comm.marked_sent ? 'Sent' : 'Draft saved'}:
                            {' '}{format(new Date(comm.sent_at), 'MMM d \'at\' h:mm a')}
                          </span>
                        </div>

                        {comm.sent_by && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>Sent by: {comm.sent_by}</span>
                          </div>
                        )}
                      </div>

                      {/* Subject */}
                      <div className="font-medium text-sm pt-1">
                        {comm.subject}
                      </div>

                      {/* Expandable email body */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8">
                            <FileText className="mr-2 h-3 w-3" />
                            View Email Content
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 p-3 rounded-md bg-muted text-sm whitespace-pre-wrap">
                            {comm.body}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        {comm.marked_sent ? (
                          <Button variant="outline" size="sm">
                            <Send className="mr-2 h-3 w-3" />
                            Resend
                          </Button>
                        ) : (
                          <>
                            <Button variant="default" size="sm">
                              <Send className="mr-2 h-3 w-3" />
                              Send Now
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-3 w-3" />
                              Edit Draft
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Compose button */}
        {communications.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Compose New Email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Empty State

```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <Mail className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">No Communications Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Send your first email for this job
        </p>
      </div>
      <Button>
        <Mail className="mr-2 h-4 w-4" />
        Compose First Email
      </Button>
    </div>
  </CardContent>
</Card>
```

### Key Design Decisions

1. **Timeline Format** - Chronological display (newest first)
2. **Type Badges** - Color-coded REQ/CONF/REM for quick identification
3. **Sent Status** - Clear visual difference between sent/unsent
4. **Expandable Content** - Collapsible email body to save space
5. **Action Buttons** - Context-aware (resend vs send now)
6. **Timestamps** - Both absolute and relative time

---

# Part 3: Audit Trail Components

## Database Schema Context

```sql
-- Status changes
CREATE TABLE public.job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.commitment_blocks(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Version changes from GCal sync
CREATE TABLE public.job_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_block_id UUID NOT NULL REFERENCES public.commitment_blocks(id),
  version_number INTEGER NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_source TEXT NOT NULL, -- 'gcal_sync', 'manual_edit', 'api'
  changed_fields JSONB NOT NULL,
  previous_values JSONB NOT NULL,
  new_values JSONB NOT NULL
);
```

## Visual Design: Audit Trail Timeline

### Wireframe: Audit Trail Panel

```
┌─────────────────────────────────────────────────────────────┐
│ [Card] Audit Trail                                          │
│                                                             │
│ [Tabs]                                                      │
│   [Active: Status Changes] [Version History]               │
│                                                             │
│ ┌─STATUS CHANGES TAB──────────────────────────────────────┐ │
│ │                                                         │ │
│ │ ●━━━ Initial → Confirmed                               │ │
│ │ │    [Clock] Mar 1, 2026 at 10:45 AM                   │ │
│ │ │    [User] Changed by: Sarah Johnson                  │ │
│ │ │    [Badge: Initial] → [Badge: Confirmed]             │ │
│ │ │                                                       │ │
│ │ ●━━━ Created                                            │ │
│ │      [Clock] Feb 28, 2026 at 4:00 PM                   │ │
│ │      [User] Created by: System (GCal Sync)             │ │
│ │      [Badge: Initial]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─VERSION HISTORY TAB─────────────────────────────────────┐ │
│ │                                                         │ │
│ │ ●━━━ Version 3 (Current)                               │ │
│ │ │    [Clock] Mar 1, 2026 at 11:20 AM                   │ │
│ │ │    [Badge: gcal_sync] Google Calendar Sync           │ │
│ │ │                                                       │ │
│ │ │    [FieldChange] start_time:                         │ │
│ │ │      [Diff] 9:00 AM → 9:30 AM                        │ │
│ │ │                                                       │ │
│ │ │    [FieldChange] end_time:                           │ │
│ │ │      [Diff] 11:00 AM → 11:30 AM                      │ │
│ │ │                                                       │ │
│ │ ●━━━ Version 2                                          │ │
│ │ │    [Clock] Mar 1, 2026 at 9:00 AM                    │ │
│ │ │    [Badge: manual_edit] Manual Edit                  │ │
│ │ │                                                       │ │
│ │ │    [FieldChange] modality:                           │ │
│ │ │      [Diff] "Zoom" → "In-Person"                     │ │
│ │ │                                                       │ │
│ │ │    [FieldChange] location_id:                        │ │
│ │ │      [Diff] "Remote" → "Court Room A"                │ │
│ │ │                                                       │ │
│ │ ●━━━ Version 1                                          │ │
│ │      [Clock] Feb 28, 2026 at 4:00 PM                   │ │
│ │      [Badge: gcal_sync] Initial Import                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Code Implementation Pattern

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, GitBranch, Edit3, Calendar as CalendarIcon } from "lucide-react"

interface StatusChange {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

interface VersionChange {
  id: string;
  version_number: number;
  changed_at: string;
  change_source: 'gcal_sync' | 'manual_edit' | 'api';
  changed_fields: string[];
  previous_values: Record<string, any>;
  new_values: Record<string, any>;
}

function AuditTrailPanel({
  statusChanges,
  versionChanges
}: {
  statusChanges: StatusChange[];
  versionChanges: VersionChange[];
}) {
  const sourceConfig = {
    gcal_sync: {
      label: 'Google Calendar Sync',
      color: 'bg-blue-100 text-blue-800',
      icon: CalendarIcon
    },
    manual_edit: {
      label: 'Manual Edit',
      color: 'bg-purple-100 text-purple-800',
      icon: Edit3
    },
    api: {
      label: 'API Update',
      color: 'bg-gray-100 text-gray-800',
      icon: GitBranch
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-lg">Audit Trail</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete history of changes and updates
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">
              Status Changes ({statusChanges.length})
            </TabsTrigger>
            <TabsTrigger value="version">
              Version History ({versionChanges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-6">
            <div className="space-y-6">
              {statusChanges
                .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                .map((change, index) => {
                  const isLast = index === statusChanges.length - 1;

                  return (
                    <div key={change.id} className="relative">
                      {!isLast && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />
                      )}

                      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                      <div className="pl-8">
                        <div className="space-y-2">
                          {/* Status transition */}
                          <div className="flex items-center gap-2">
                            {change.old_status ? (
                              <>
                                <Badge variant="secondary">{change.old_status}</Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="default">{change.new_status}</Badge>
                              </>
                            ) : (
                              <Badge variant="default">{change.new_status}</Badge>
                            )}
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(change.changed_at), 'MMM d, yyyy \'at\' h:mm a')}</span>
                          </div>

                          {/* Changed by */}
                          {change.changed_by && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>Changed by: {change.changed_by}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="version" className="mt-6">
            <div className="space-y-6">
              {versionChanges
                .sort((a, b) => b.version_number - a.version_number)
                .map((version, index) => {
                  const isLast = index === versionChanges.length - 1;
                  const isCurrent = version.version_number === Math.max(...versionChanges.map(v => v.version_number));
                  const config = sourceConfig[version.change_source];
                  const SourceIcon = config.icon;

                  return (
                    <div key={version.id} className="relative">
                      {!isLast && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />
                      )}

                      <div className={`absolute left-0 top-2 w-4 h-4 rounded-full ${
                        isCurrent ? 'bg-green-500' : 'bg-gray-400'
                      } border-2 border-background`} />

                      <div className="pl-8">
                        <div className="space-y-2">
                          {/* Version header */}
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              Version {version.version_number}
                              {isCurrent && <span className="ml-2 text-xs text-green-600">(Current)</span>}
                            </h3>
                          </div>

                          {/* Source badge */}
                          <Badge className={config.color}>
                            <SourceIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>

                          {/* Timestamp */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(version.changed_at), 'MMM d, yyyy \'at\' h:mm a')}</span>
                          </div>

                          {/* Changed fields */}
                          <div className="mt-3 space-y-2">
                            {version.changed_fields.map((field) => (
                              <div key={field} className="p-2 rounded-md bg-muted">
                                <div className="text-xs font-mono font-semibold text-muted-foreground mb-1">
                                  {field}:
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="line-through text-red-600">
                                    {formatFieldValue(version.previous_values[field])}
                                  </span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="text-green-600 font-medium">
                                    {formatFieldValue(version.new_values[field])}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function formatFieldValue(value: any): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'object') return JSON.stringify(value);
  if (value instanceof Date) return format(value, 'MMM d, h:mm a');
  return String(value);
}
```

### Key Design Decisions

1. **Tabbed Interface** - Separate status changes from version history
2. **Timeline Format** - Chronological display (newest first)
3. **Visual Diff** - Clear before/after comparison for changes
4. **Source Badges** - Color-coded gcal_sync/manual_edit/api
5. **Current Version Indicator** - Green dot for active version
6. **Field-Level Changes** - Individual field diffs in version history

---

# Part 4: Unavailability Calendar

## Database Schema Context

```sql
CREATE TABLE public.interpreter_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpreter_id UUID NOT NULL REFERENCES public.interpreters(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Helper function
CREATE OR REPLACE FUNCTION public.is_interpreter_available(
  p_interpreter_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN
```

**Purpose:** Track time blocks when interpreters are unavailable. Used by matching algorithm to exclude unavailable interpreters.

## Visual Design: Unavailability Calendar

### Wireframe: Calendar View

```
┌─────────────────────────────────────────────────────────────┐
│ [Card] Unavailability Schedule                              │
│                                                             │
│ [H2] Time Off & Unavailable Blocks                         │
│ [Text] 3 upcoming blocks • Next: Mar 5-7 (Vacation)        │
│                                                             │
│ ┌─CALENDAR VIEW────────────────────────────────────────────┐│
│ │ [Button: ◀ Prev] March 2026 [Button: Next ▶]           ││
│ │                                                         ││
│ │ Sun  Mon  Tue  Wed  Thu  Fri  Sat                      ││
│ │  1    2    3    4   [5]  [6]  [7]  ← Vacation          ││
│ │                      ░░░  ░░░  ░░░                      ││
│ │  8    9   [10]  11   12   13   14   ← Personal Appt    ││
│ │            ▓▓▓                                          ││
│ │ 15   16    17   18   19   20   21                      ││
│ │                                                         ││
│ │ 22   23    24   25  [26] [27]  28   ← Conference       ││
│ │                      ▓▓▓  ▓▓▓                           ││
│ │ 29   30    31                                           ││
│ │                                                         ││
│ │ ░░░ = Full day unavailable                              ││
│ │ ▓▓▓ = Partial day unavailable                           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─UPCOMING BLOCKS──────────────────────────────────────────┐│
│ │                                                         ││
│ │ ● Mar 5-7, 2026 (3 days)                               ││
│ │   [Badge: Full Day] Vacation                           ││
│ │   [User] Created by: Sarah Johnson                     ││
│ │   [MessageSquare] "Annual family vacation"             ││
│ │   [Button: Edit] [Button: Delete]                      ││
│ │                                                         ││
│ │ ● Mar 10, 2026 (10:00 AM - 2:00 PM)                    ││
│ │   [Badge: Partial Day] Personal Appointment            ││
│ │   [User] Created by: System                            ││
│ │   [Button: Edit] [Button: Delete]                      ││
│ │                                                         ││
│ │ ● Mar 26-27, 2026 (2 days)                             ││
│ │   [Badge: Full Day] Conference                         ││
│ │   [User] Created by: Mike Davis                        ││
│ │   [MessageSquare] "Attending medical conference"       ││
│ │   [Button: Edit] [Button: Delete]                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Button: + Add Unavailable Time]                           │
└─────────────────────────────────────────────────────────────┘
```

### Alternative Design: List View

```
┌─────────────────────────────────────────────────────────────┐
│ [Card] Unavailability Schedule                              │
│                                                             │
│ [Tabs]                                                      │
│   [Active: List View] [Calendar View]                      │
│                                                             │
│ ┌─LIST VIEW────────────────────────────────────────────────┐│
│ │                                                         ││
│ │ ● Mar 5-7, 2026                                         ││
│ │   ┌─────────────────────────────────────────────────┐  ││
│ │   │ [Badge: Vacation] Full Day                      │  ││
│ │   │                                                 │  ││
│ │   │ [Calendar] Thu, Mar 5 - Sat, Mar 7             │  ││
│ │   │ [Clock] All day (3 days)                        │  ││
│ │   │                                                 │  ││
│ │   │ [MessageSquare] Annual family vacation          │  ││
│ │   │                                                 │  ││
│ │   │ [User] Created by: Sarah Johnson                │  ││
│ │   │ [Clock] Created: Feb 28 at 3:00 PM              │  ││
│ │   │                                                 │  ││
│ │   │ [Button: Edit] [Button: Delete]                 │  ││
│ │   └─────────────────────────────────────────────────┘  ││
│ │                                                         ││
│ │ ● Mar 10, 2026                                          ││
│ │   ┌─────────────────────────────────────────────────┐  ││
│ │   │ [Badge: Personal] Partial Day                   │  ││
│ │   │                                                 │  ││
│ │   │ [Calendar] Tue, Mar 10                          │  ││
│ │   │ [Clock] 10:00 AM - 2:00 PM (4 hours)            │  ││
│ │   │                                                 │  ││
│ │   │ [User] Created by: System                       │  ││
│ │   │ [Clock] Created: Mar 1 at 9:00 AM               │  ││
│ │   │                                                 │  ││
│ │   │ [Button: Edit] [Button: Delete]                 │  ││
│ │   └─────────────────────────────────────────────────┘  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Button: + Add Unavailable Time]                           │
└─────────────────────────────────────────────────────────────┘
```

### Code Implementation Pattern

```tsx
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, Clock, MessageSquare, Trash2, Edit2, CalendarOff } from "lucide-react"

interface UnavailabilityBlock {
  id: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes: string;
  created_by: string;
  created_at: string;
}

function UnavailabilityPanel({
  blocks,
  interpreterId
}: {
  blocks: UnavailabilityBlock[];
  interpreterId: string;
}) {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Group blocks by date for calendar view
  const blockedDates = blocks.reduce((acc, block) => {
    const start = new Date(block.start_time);
    const end = new Date(block.end_time);

    // Add all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = format(d, 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = [];
      acc[key].push(block);
    }

    return acc;
  }, {} as Record<string, UnavailabilityBlock[]>);

  // Helper: Check if date is fully or partially blocked
  const getDateStatus = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const dayBlocks = blockedDates[key] || [];

    if (dayBlocks.length === 0) return null;

    const hasFullDay = dayBlocks.some(block => {
      const start = new Date(block.start_time);
      const end = new Date(block.end_time);
      return (
        format(start, 'yyyy-MM-dd') === key &&
        format(end, 'yyyy-MM-dd') === key &&
        differenceInHours(end, start) >= 8
      );
    });

    return hasFullDay ? 'full' : 'partial';
  };

  // Sort blocks by start time
  const sortedBlocks = [...blocks].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const upcomingBlocks = sortedBlocks.filter(
    b => new Date(b.start_time) >= new Date()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Unavailability Schedule</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingBlocks.length} upcoming blocks
              {upcomingBlocks[0] && ` • Next: ${format(new Date(upcomingBlocks[0].start_time), 'MMM d')}`}
            </p>
          </div>
          <AddUnavailabilityDialog interpreterId={interpreterId}>
            <Button>
              <CalendarOff className="mr-2 h-4 w-4" />
              Add Unavailable Time
            </Button>
          </AddUnavailabilityDialog>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <div className="space-y-4">
              {/* Calendar component */}
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  blocked: (date) => getDateStatus(date) !== null
                }}
                modifiersClassNames={{
                  blocked: 'bg-red-100 text-red-900 font-semibold'
                }}
                className="rounded-md border"
              />

              {/* Legend */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
                  <span>Unavailable</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {sortedBlocks.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-1">No Unavailability Blocks</h3>
                  <p className="text-sm text-muted-foreground">
                    This interpreter has no scheduled unavailable time
                  </p>
                </div>
              ) : (
                sortedBlocks.map((block) => {
                  const start = new Date(block.start_time);
                  const end = new Date(block.end_time);
                  const duration = differenceInHours(end, start);
                  const isMultiDay = !isSameDay(start, end);
                  const isPast = end < new Date();

                  return (
                    <Card key={block.id} className={isPast ? 'opacity-60' : ''}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Header with badge */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={block.reason === 'Vacation' ? 'default' : 'secondary'}>
                                {block.reason || 'Unavailable'}
                              </Badge>
                              {isMultiDay && (
                                <Badge variant="outline">Multi-day</Badge>
                              )}
                              {isPast && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Past
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Date and time */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {isMultiDay ? (
                                <span>
                                  {format(start, 'EEE, MMM d')} - {format(end, 'EEE, MMM d, yyyy')}
                                </span>
                              ) : (
                                <span>{format(start, 'EEE, MMM d, yyyy')}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {duration >= 24 ? (
                                <span>All day ({Math.round(duration / 24)} days)</span>
                              ) : (
                                <span>
                                  {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                                  {' '}({duration} hours)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {block.notes && (
                            <div className="flex items-start gap-2 p-2 rounded-md bg-muted text-sm">
                              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <p className="italic">{block.notes}</p>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>Created by: {block.created_by}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Created: {format(new Date(block.created_at), 'MMM d \'at\' h:mm a')}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {!isPast && (
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit2 className="mr-2 h-3 w-3" />
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Add unavailability dialog
function AddUnavailabilityDialog({
  interpreterId,
  children
}: {
  interpreterId: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Unavailable Time</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Start Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Select date...
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <CalendarComponent />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Select date...
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <CalendarComponent />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" placeholder="e.g., Vacation, Personal, Conference" />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">Add Block</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Key Design Decisions

1. **Dual View** - Both calendar and list views for different use cases
2. **Past/Future Distinction** - Visual dimming of past blocks
3. **Multi-day Handling** - Clear indication of multi-day blocks
4. **Duration Display** - Show both absolute times and durations
5. **Quick Actions** - Edit/delete buttons for active blocks
6. **Add Dialog** - Modal for creating new unavailability

---

# Part 5: Updated Job Detail Page Wireframes

## Complete Job Detail Layout

Now integrating all new database-driven components into a comprehensive job detail page.

### Full Page Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│ CONTAINER (p-6, space-y-6)                                    │
│                                                               │
│ [Button: ← Back to Jobs Board]                                │
│                                                               │
│ ┌─HEADER─────────────────────────────────────────────────────┐│
│ │ [H1] Spanish — John Doe In-Person                         ││
│ │ [Subtitle] Job ID: abc-123 • Created: Feb 28, 2026        ││
│ │ [Badge: Confirmed] [Badge: Version 3]                     ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌─TWO COLUMN GRID (md:grid-cols-2, gap-6)──────────────────┐ │
│ │ ┌─JOB OVERVIEW────┐  ┌─ORGANIZATION & LOCATION──────────┐││
│ │ │ Date/Time       │  │ Superior Court A                │││
│ │ │ Modality        │  │ 123 Main St                     │││
│ │ │ Status          │  │ Contact info                    │││
│ │ │ Language        │  │ Instructions                    │││
│ │ │ Duration        │  └─────────────────────────────────┘││
│ │ └─────────────────┘                                      ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌─ASSIGNMENT ATTEMPTS (NEW)──────────────────────────────────┐│
│ │ [H2] Interpreter Assignment History                       ││
│ │ Timeline of contact attempts with status                  ││
│ │ • John Doe - Confirmed ✓                                  ││
│ │ • Maria Smith - Pending ○                                 ││
│ │ • Tom Wilson - Declined ✗                                 ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌─COMMUNICATION HISTORY (NEW)────────────────────────────────┐│
│ │ [H2] Email Communications                                 ││
│ │ Timeline of all emails sent/drafted                       ││
│ │ • REM - Reminder (Sent today)                             ││
│ │ • CONF - Confirmation (Sent Mar 1)                        ││
│ │ • REQ - Request (Sent Feb 28)                             ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌─AUDIT TRAIL (NEW)──────────────────────────────────────────┐│
│ │ [Tabs: Status Changes | Version History]                  ││
│ │                                                           ││
│ │ Status tab: Status transitions timeline                   ││
│ │ Version tab: Field-level changes from GCal sync           ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌─INTERPRETER MANAGEMENT─────────────────────────────────────┐│
│ │ Current interpreter + Quick assign table                  ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌─COLLAPSIBLE SECTIONS──────────────────────────────────────┐│
│ │ ▼ Email Composer                                          ││
│ │ ▼ Internal Notes                                          ││
│ │ ▼ Unavailable Interpreters                                ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Complete Component Structure

```tsx
// Job Detail Page Component
export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { job, loading, error } = useJob(params.id);
  const { assignments } = useAssignmentAttempts(params.id);
  const { communications } = useCommunications(params.id);
  const { statusHistory, versionHistory } = useAuditTrail(params.id);

  if (loading) return <JobDetailSkeleton />;
  if (error) return <JobDetailError error={error} />;
  if (!job) return <JobNotFound />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/jobs')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs Board
      </Button>

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {job.language} — {job.interpreter_name} {job.modality}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-muted-foreground">
            Job ID: {job.id.slice(0, 8)} • Created: {format(new Date(job.created_at), 'MMM d, yyyy')}
          </p>
          <Badge variant="default">{job.status}</Badge>
          {job.version > 1 && (
            <Badge variant="outline">Version {job.version}</Badge>
          )}
        </div>
      </div>

      {/* Two-column grid: Overview + Organization */}
      <div className="grid gap-6 md:grid-cols-2">
        <JobOverviewCard job={job} />
        <OrganizationLocationCard job={job} />
      </div>

      {/* Assignment attempts panel - NEW */}
      <AssignmentAttemptsPanel attempts={assignments} jobId={params.id} />

      {/* Communication history - NEW */}
      <CommunicationHistoryPanel communications={communications} jobId={params.id} />

      {/* Audit trail - NEW */}
      <AuditTrailPanel
        statusChanges={statusHistory}
        versionChanges={versionHistory}
      />

      {/* Interpreter management */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg">Interpreter Management</h2>
        </CardHeader>
        <CardContent>
          <InterpreterManagement job={job} />
        </CardContent>
      </Card>

      {/* Collapsible sections */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold text-lg">
                <Mail className="inline-block mr-2 h-5 w-5" />
                Email Composer
              </h2>
              <ChevronDown className="h-4 w-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <EmailComposer job={job} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold text-lg">
                <FileText className="inline-block mr-2 h-5 w-5" />
                Internal Notes
              </h2>
              <ChevronDown className="h-4 w-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <JobNotesPanel jobId={params.id} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
```

### Loading Skeleton for Job Detail

```tsx
function JobDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="h-10 w-32 bg-muted animate-pulse rounded" />

      <div className="space-y-2">
        <div className="h-10 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>

      {/* More skeleton cards */}
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

# Part 6: Updated Interpreters Page

## Interpreter Languages Display

### Database Schema for Languages

```sql
CREATE TABLE public.interpreter_languages (
  id UUID PRIMARY KEY,
  interpreter_id UUID REFERENCES public.interpreters(id),
  language_id UUID REFERENCES public.languages(id),
  proficiency_rank INTEGER,
  certification TEXT,
  preference_rank INTEGER  -- Business preference (1 = highest)
);
```

### Enhanced Interpreter Card with Languages Grid

```
┌─────────────────────────────────────────────────────────┐
│ [Card] Interpreter Detail                               │
│                                                         │
│ ┌─HEADER───────────────────────────────────────────────┐│
│ │ [Avatar: JD] John Doe                               ││
│ │ [Badge: Certified ⭐]                                ││
│ │ [Badge: Local 📍]                                    ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─LANGUAGES SECTION─────────────────────────────────────┐│
│ │ [H3] Languages (5)                                   ││
│ │                                                      ││
│ │ ┌─LANGUAGE CARD─────────┬─LANGUAGE CARD──────────┐  ││
│ │ │ 🌐 Spanish            │ 🌐 English             │  ││
│ │ │ [Badge: Certified]    │ [Badge: Registered]    │  ││
│ │ │ Proficiency: 5/5      │ Proficiency: 5/5       │  ││
│ │ │ [Badge: 🔥 Priority 1]│ Preference: 2          │  ││
│ │ └───────────────────────┴────────────────────────┘  ││
│ │                                                      ││
│ │ ┌─LANGUAGE CARD─────────┬─LANGUAGE CARD──────────┐  ││
│ │ │ 🌐 French             │ 🌐 Portuguese          │  ││
│ │ │ [Badge: Non-cert]     │ [Badge: Non-cert]      │  ││
│ │ │ Proficiency: 3/5      │ Proficiency: 4/5       │  ││
│ │ │ Preference: 3         │ Preference: 4          │  ││
│ │ └───────────────────────┴────────────────────────┘  ││
│ │                                                      ││
│ │ + 1 more language                                    ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─UNAVAILABILITY SECTION────────────────────────────────┐│
│ │ [H3] Upcoming Unavailable Time (2 blocks)            ││
│ │                                                      ││
│ │ ● Mar 5-7 - Vacation (3 days)                        ││
│ │ ● Mar 10 - Personal (10 AM - 2 PM)                   ││
│ │                                                      ││
│ │ [Button: View Full Calendar]                         ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─CONTACT INFO──────────────────────────────────────────┐│
│ │ [Mail] john@example.com [Button: Copy]               ││
│ │ [Phone] (555) 123-4567 [Button: Copy]                ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ [Button: Email] [Button: Call] [Button: View Jobs]     │
└─────────────────────────────────────────────────────────┘
```

### Code Implementation

```tsx
interface InterpreterLanguage {
  id: string;
  language: {
    id: string;
    name: string;
  };
  proficiency_rank: number;
  certification: string;
  preference_rank: number;
}

interface InterpreterWithDetails extends Interpreter {
  languages: InterpreterLanguage[];
  unavailability: UnavailabilityBlock[];
}

function InterpreterDetailCard({ interpreter }: { interpreter: InterpreterWithDetails }) {
  const certificationConfig = {
    'Certified': {
      variant: 'default',
      icon: Star,
      label: 'Certified'
    },
    'Registered': {
      variant: 'secondary',
      icon: Check,
      label: 'Registered'
    },
    'Non-certified': {
      variant: 'outline',
      icon: null,
      label: 'Non-certified'
    }
  };

  // Sort languages by preference rank
  const sortedLanguages = [...interpreter.languages].sort(
    (a, b) => (a.preference_rank || 999) - (b.preference_rank || 999)
  );

  const displayLanguages = sortedLanguages.slice(0, 4);
  const remainingCount = sortedLanguages.length - 4;

  const upcomingUnavailability = interpreter.unavailability.filter(
    block => new Date(block.end_time) >= new Date()
  ).slice(0, 3);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        {/* Avatar and basic info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {getInitials(interpreter.first_name, interpreter.last_name)}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {interpreter.first_name} {interpreter.last_name}
            </h3>

            <div className="flex flex-wrap gap-2 mt-2">
              {interpreter.highestCert && (
                <Badge variant={certificationConfig[interpreter.highestCert].variant as any}>
                  {certificationConfig[interpreter.highestCert].icon && (
                    <Star className="mr-1 h-3 w-3" />
                  )}
                  {interpreter.highestCert}
                </Badge>
              )}

              {interpreter.is_local && (
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3 w-3" />
                  Local
                </Badge>
              )}

              {interpreter.is_agency && (
                <Badge variant="secondary">Agency</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Languages grid */}
        {sortedLanguages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">
              Languages ({sortedLanguages.length})
            </h4>

            <div className="grid gap-3 md:grid-cols-2">
              {displayLanguages.map((lang) => {
                const config = certificationConfig[lang.certification] || certificationConfig['Non-certified'];
                const isTopPreference = lang.preference_rank === 1;

                return (
                  <div key={lang.id} className="p-3 rounded-md border bg-card">
                    <div className="space-y-2">
                      {/* Language name */}
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{lang.language.name}</span>
                      </div>

                      {/* Certification badge */}
                      <Badge variant={config.variant as any} className="text-xs">
                        {config.icon && <config.icon className="mr-1 h-3 w-3" />}
                        {config.label}
                      </Badge>

                      {/* Proficiency rank */}
                      {lang.proficiency_rank && (
                        <div className="text-xs text-muted-foreground">
                          Proficiency: {lang.proficiency_rank}/5
                        </div>
                      )}

                      {/* Business preference */}
                      {isTopPreference && (
                        <Badge variant="destructive" className="text-xs">
                          🔥 Top Priority
                        </Badge>
                      )}
                      {lang.preference_rank && !isTopPreference && (
                        <div className="text-xs text-muted-foreground">
                          Preference: {lang.preference_rank}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {remainingCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{remainingCount} more {remainingCount === 1 ? 'language' : 'languages'}
              </p>
            )}
          </div>
        )}

        {/* Unavailability preview */}
        {upcomingUnavailability.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">
                Upcoming Unavailable Time ({upcomingUnavailability.length})
              </h4>
            </div>

            <div className="space-y-2">
              {upcomingUnavailability.map((block) => {
                const start = new Date(block.start_time);
                const end = new Date(block.end_time);
                const isMultiDay = !isSameDay(start, end);

                return (
                  <div key={block.id} className="flex items-start gap-2 text-sm">
                    <CalendarOff className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      {isMultiDay ? (
                        <span>
                          {format(start, 'MMM d')}-{format(end, 'd')} - {block.reason}
                          {' '}({differenceInDays(end, start) + 1} days)
                        </span>
                      ) : (
                        <span>
                          {format(start, 'MMM d')} - {block.reason}
                          {' '}({format(start, 'h:mm a')} - {format(end, 'h:mm a')})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" size="sm" className="w-full mt-3">
              View Full Calendar
            </Button>
          </div>
        )}

        {/* Contact information */}
        <div className="pt-4 border-t space-y-2">
          {interpreter.email && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm truncate">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{interpreter.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(interpreter.email!)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {interpreter.phone && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{interpreter.phone}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(interpreter.phone!)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {interpreter.city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{interpreter.city}, {interpreter.state}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {interpreter.email && (
          <Button variant="default" size="sm" className="flex-1" asChild>
            <a href={`mailto:${interpreter.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
        )}

        {interpreter.phone && (
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={`tel:${interpreter.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </a>
          </Button>
        )}

        <Button variant="ghost" size="sm">
          View Jobs
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

# Part 7: Multi-Table Relational Data Patterns

## Design Pattern: Jobs from Joined Tables

### Schema Relationship

```sql
-- Jobs come from TWO tables joined:
commitment_blocks (time, interpreter, status, location)
  +
client_requests (language, client, case details)

-- Join pattern:
SELECT
  cb.*,
  cr.language_id,
  cr.client_name,
  cr.case_number,
  l.name as language_name,
  i.first_name,
  i.last_name,
  org.name as organization_name
FROM commitment_blocks cb
JOIN client_requests cr ON cr.commitment_block_id = cb.id
LEFT JOIN languages l ON cr.language_id = l.id
LEFT JOIN interpreters i ON cb.interpreter_id = i.id
LEFT JOIN locations loc ON cb.location_id = loc.id
LEFT JOIN organizations org ON loc.org_id = org.id
```

### Visual Pattern: Displaying Joined Data

```
┌─────────────────────────────────────────────────────────┐
│ [Card] Job Detail (Multi-table data)                    │
│                                                         │
│ ┌─FROM: commitment_blocks──────────────────────────────┐│
│ │ [Calendar] Date: Mar 15, 2026                       ││
│ │ [Clock] Time: 9:00 AM - 11:00 AM                    ││
│ │ [Badge: Confirmed] Status                           ││
│ │ [User] Interpreter: John Doe                        ││
│ │ [MapPin] Location: Court Room A                     ││
│ │ [Badge: Version 3] Last synced: 2 hours ago         ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─FROM: client_requests─────────────────────────────────┐│
│ │ [Languages] Language: Spanish                       ││
│ │ [User] Client: Maria Rodriguez                      ││
│ │ [FileText] Case #: CR-2026-1234                     ││
│ │ [Building] Meeting Type: Arraignment                ││
│ │ [Badge: Request Received ✓]                         ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─RELATED DATA (via foreign keys)──────────────────────┐│
│ │ [Building2] Organization: Superior Court            ││
│ │ [Tag] Program: Criminal Division                    ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Code Pattern: Type-Safe Joined Data

```tsx
// Type definition for joined job data
interface JobWithDetails {
  // From commitment_blocks
  id: string;
  interpreter_id: string;
  start_time: string;
  end_time: string;
  status: string;
  modality: string;
  location_id: string;
  version: number;
  last_synced_at: string;

  // From client_requests
  language_id: string;
  client_name: string;
  case_number: string;
  meeting_type: string;
  request_received: boolean;

  // From joins
  language: {
    id: string;
    name: string;
  };
  interpreter: {
    id: string;
    first_name: string;
    last_name: string;
  };
  location: {
    id: string;
    name: string;
    organization: {
      id: string;
      name: string;
    };
  };
  program: {
    id: string;
    name: string;
  };
}

// Display component showing clear data source
function JobDetailOverview({ job }: { job: JobWithDetails }) {
  return (
    <div className="space-y-6">
      {/* Commitment block data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Schedule & Assignment</h3>
            <Badge variant="outline" className="text-xs font-mono">
              commitment_blocks
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(job.start_time), 'EEEE, MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(job.start_time), 'h:mm a')} -
              {format(new Date(job.end_time), 'h:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">{job.status}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{job.interpreter.first_name} {job.interpreter.last_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{job.location.name}</span>
          </div>

          {job.version > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              <span>
                Version {job.version} • Last synced: {formatDistance(new Date(job.last_synced_at), new Date(), { addSuffix: true })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client request data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Client Request Details</h3>
            <Badge variant="outline" className="text-xs font-mono">
              client_requests
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{job.language.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Client: {job.client_name}</span>
          </div>

          {job.case_number && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Case #{job.case_number}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{job.meeting_type}</span>
          </div>

          {job.request_received && (
            <Badge variant="secondary">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Request Received
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Related data via joins */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Organization & Program</h3>
            <Badge variant="outline" className="text-xs font-mono">
              via foreign keys
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{job.location.organization.name}</span>
          </div>

          {job.program && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{job.program.name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Key Design Decisions for Multi-Table Data

1. **Clear Source Attribution** - Badge showing which table data comes from
2. **Logical Grouping** - Separate cards for commitment_blocks vs client_requests
3. **Visual Hierarchy** - Primary data (schedule) before secondary (case details)
4. **Join Clarity** - Explicit labeling of related data via foreign keys
5. **Type Safety** - Comprehensive TypeScript interfaces
6. **Null Handling** - Graceful display of optional joined data

---

## Summary: Design System Integration

All new components follow the established shadcn/ui design system:

### ✅ Component Library
- Card, CardHeader, CardContent, CardFooter
- Badge with semantic variants
- Button with size and variant options
- Tabs for multi-view interfaces
- Collapsible for expandable sections
- Dialog for modals
- Popover for date/time pickers
- Calendar component

### ✅ Color System
- Semantic tokens (primary, secondary, muted, destructive)
- No hardcoded colors
- Consistent badge colors for status types

### ✅ Typography
- Tailwind utilities (text-3xl, font-semibold, etc.)
- Consistent hierarchy (H1 → H2 → H3)
- Muted text for secondary information

### ✅ Icons
- Lucide icons throughout
- Consistent sizing (h-4 w-4 for content, h-3 w-3 for badges)
- Semantic icon choices

### ✅ Spacing
- Container: `container mx-auto p-6 space-y-6`
- Cards: `gap-4` or `gap-6`
- Content: `space-y-2` or `space-y-3`

### ✅ Responsive
- Mobile-first grid layouts
- Breakpoints: md:grid-cols-2, lg:grid-cols-3
- Touch-friendly buttons and targets

### ✅ Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states

---

## Implementation Checklist

### Phase 1: Job Assignment Features
- [ ] Create AssignmentAttemptsPanel component
- [ ] Add assignment attempt CRUD API
- [ ] Integrate into job detail page
- [ ] Add status update actions
- [ ] Test timeline visualization

### Phase 2: Communication History
- [ ] Create CommunicationHistoryPanel component
- [ ] Add email tracking API
- [ ] Integrate into job detail page
- [ ] Add send/resend functionality
- [ ] Test expandable email content

### Phase 3: Audit Trails
- [ ] Create AuditTrailPanel with tabs
- [ ] Add status history API
- [ ] Add version history API
- [ ] Integrate into job detail page
- [ ] Test diff visualization

### Phase 4: Unavailability Calendar
- [ ] Create UnavailabilityPanel component
- [ ] Add unavailability CRUD API
- [ ] Integrate shadcn/ui Calendar
- [ ] Add to interpreter detail view
- [ ] Test multi-day block handling

### Phase 5: Enhanced Displays
- [ ] Update InterpreterCard with languages grid
- [ ] Add language preference display
- [ ] Integrate unavailability preview
- [ ] Update job cards with version info
- [ ] Test multi-table data joins

---

**Document Version:** 1.0
**Last Updated:** 2026-02-02
**Companion Documents:**
- DESIGN-SYSTEM-AUDIT.md
- DESIGN-WIREFRAMES.md
- DESIGN-COMPARISON.md
- Supabase-Schema.md

