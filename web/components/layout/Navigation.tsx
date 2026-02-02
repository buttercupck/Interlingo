'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Jobs Board',
    href: '/dashboard/jobs',
    icon: '📋',
  },
  {
    name: 'Interpreters',
    href: '/dashboard/interpreters',
    icon: '👥',
  },
  {
    name: 'Organizations',
    href: '/dashboard/organizations',
    icon: '🏛️',
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: '📅',
  },
  {
    name: 'Communications',
    href: '/dashboard/communications',
    icon: '✉️',
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-primary text-white">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="heading-3 mb-0 font-secondary">Interlingo</span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors body-small',
                  isActive
                    ? 'bg-primary-light text-white font-medium'
                    : 'text-primary-lighter hover:bg-primary-light hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-lighter flex items-center justify-center text-primary">
            <span className="font-bold body-small">I</span>
          </div>
          <div>
            <p className="caption font-medium">Itza</p>
            <p className="caption text-primary-lighter text-[10px]">Super Admin</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
