import Link from 'next/link';
import { StatCard, JobItem, ActionButton, CommunicationItem } from '@/components/ui';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Open Jobs"
          value="12"
          change="+3 from yesterday"
          trend="up"
          icon="📋"
        />
        <StatCard
          title="Confirmed Jobs"
          value="45"
          change="This week"
          trend="neutral"
          icon="✅"
        />
        <StatCard
          title="Active Interpreters"
          value="28"
          change="Available today"
          trend="up"
          icon="👥"
        />
        <StatCard
          title="Pending Emails"
          value="5"
          change="Needs attention"
          trend="down"
          icon="✉️"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="heading-3">Quick Actions</h2>
          <div className="space-y-3">
            <ActionButton
              title="Create New Job"
              description="Add a new interpreter assignment"
              icon="➕"
              variant="primary"
            />
            <ActionButton
              title="Import from Calendar"
              description="Sync GCAL events to jobs"
              icon="📥"
            />
            <ActionButton
              title="Send Reminders"
              description="Send email reminders for tomorrow"
              icon="⏰"
            />
            <ActionButton
              title="View Calendar"
              description="See all scheduled jobs"
              icon="📅"
            />
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="card">
          <h2 className="heading-3">
            Upcoming Jobs Today
          </h2>
          <div className="space-y-4">
            <JobItem
              time="9:00 AM"
              client="Kent Municipal Court"
              language="Spanish"
              interpreter="Maria Garcia"
              modality="Zoom"
              status="confirmed"
            />
            <JobItem
              time="11:30 AM"
              client="Yakima Superior Court"
              language="Somali"
              interpreter="Ahmed Hassan"
              modality="In-Person"
              status="confirmed"
            />
            <JobItem
              time="2:00 PM"
              client="Puyallup Municipal Court"
              language="Vietnamese"
              interpreter="Unassigned"
              modality="Zoom"
              status="pending"
            />
          </div>
          <Link
            href="/dashboard/jobs"
            className="mt-4 inline-block text-secondary-teal hover:underline font-medium"
          >
            View All Jobs →
          </Link>
        </div>
      </div>

      {/* Recent Communications */}
      <div className="card">
        <h2 className="heading-3">
          Recent Communications
        </h2>
        <div className="space-y-3">
          <CommunicationItem
            type="CONF"
            recipient="Maria Garcia"
            subject="Confirmation: Spanish - Kent Municipal Court"
            time="2 hours ago"
          />
          <CommunicationItem
            type="REM"
            recipient="Ahmed Hassan"
            subject="Reminder: Tomorrow - Yakima Superior Court"
            time="5 hours ago"
          />
          <CommunicationItem
            type="REQ"
            recipient="5 Interpreters"
            subject="Request: Vietnamese - Puyallup Municipal Court"
            time="Yesterday"
          />
        </div>
        <Link
          href="/dashboard/communications"
          className="mt-4 inline-block text-secondary-teal hover:underline font-medium"
        >
          View All Communications →
        </Link>
      </div>
    </div>
  );
}
