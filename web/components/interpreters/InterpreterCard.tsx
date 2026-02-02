'use client';

import type { InterpreterWithLanguages } from '@/types/database.types';
import { getHighestCertification } from '@/lib/hooks/useInterpreterFilters';
import { cn } from '@/lib/utils';

interface InterpreterCardProps {
  interpreter: InterpreterWithLanguages;
  onClick?: () => void;
  className?: string;
}

export function InterpreterCard({
  interpreter,
  onClick,
  className,
}: InterpreterCardProps) {
  const highestCert = getHighestCertification(interpreter);
  const languages = interpreter.interpreter_languages || [];
  const displayLanguages = languages.slice(0, 3);
  const remainingCount = languages.length - 3;

  // Get initials for avatar
  const initials = `${interpreter.first_name?.[0] || ''}${
    interpreter.last_name?.[0] || ''
  }`.toUpperCase();

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification when toast system is implemented
    console.log(`Copied ${label}: ${text}`);
  };

  return (
    <article
      className={cn(
        'card',
        'group',
        'cursor-pointer',
        'transition-all duration-200',
        'hover:border-primary',
        'hover:shadow-lg',
        'hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
      role="article"
      aria-labelledby={`interp-name-${interpreter.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header: Avatar + Name + Certification */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar Circle */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: 'var(--primary-blue)' }}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Name + Certification Badge */}
        <div className="flex-1 min-w-0">
          <h3
            id={`interp-name-${interpreter.id}`}
            className="heading-4 truncate"
          >
            {interpreter.first_name} {interpreter.last_name}
          </h3>

          {/* Certification Badge */}
          {highestCert !== 'Non-certified' && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  'badge',
                  highestCert === 'Certified' ? 'badge-success' : 'badge-info'
                )}
                aria-label={`${highestCert} certification`}
              >
                {highestCert === 'Certified' ? '⭐ Certified' : '✓ Registered'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Languages Section */}
      {languages.length > 0 && (
        <div className="mb-4">
          <h4 className="caption mb-2" style={{ color: 'var(--gray-600)' }}>
            Languages
          </h4>
          <ul className="space-y-1" aria-label="Languages spoken">
            {displayLanguages.map((il: any) => (
              <li
                key={il.id}
                className="body-small flex items-center gap-2"
                style={{ color: 'var(--gray-700)' }}
              >
                <span className="text-base">🌐</span>
                <span>
                  {il.language?.name}
                  {il.certification && (
                    <span
                      className="ml-2"
                      style={{ color: 'var(--gray-500)' }}
                    >
                      ({il.certification})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {remainingCount > 0 && (
            <p className="caption mt-2" style={{ color: 'var(--gray-500)' }}>
              +{remainingCount} more {remainingCount === 1 ? 'language' : 'languages'}
            </p>
          )}
        </div>
      )}

      {/* Location */}
      {(interpreter.city || interpreter.state) && (
        <div className="mb-4">
          <p className="body-small flex items-center gap-2" style={{ color: 'var(--gray-600)' }}>
            <span className="text-base">📍</span>
            <span>
              {interpreter.city}
              {interpreter.city && interpreter.state && ', '}
              {interpreter.state}
              {interpreter.is_local && (
                <span
                  className="ml-2 badge badge-info"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Local
                </span>
              )}
            </span>
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="space-y-2 mb-4 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
        {interpreter.email && (
          <div className="flex items-center justify-between gap-2">
            <p className="body-small truncate" style={{ color: 'var(--gray-700)' }}>
              ✉️ {interpreter.email}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(interpreter.email!, 'Email');
              }}
              className="button-ghost px-2 py-1 text-xs flex-shrink-0"
              aria-label={`Copy email address for ${interpreter.first_name} ${interpreter.last_name}`}
              title="Copy email"
            >
              📋
            </button>
          </div>
        )}

        {interpreter.phone && (
          <div className="flex items-center justify-between gap-2">
            <p className="body-small" style={{ color: 'var(--gray-700)' }}>
              ☎️ {interpreter.phone}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(interpreter.phone!, 'Phone');
              }}
              className="button-ghost px-2 py-1 text-xs flex-shrink-0"
              aria-label={`Copy phone number for ${interpreter.first_name} ${interpreter.last_name}`}
              title="Copy phone"
            >
              📋
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
        {interpreter.email && (
          <a
            href={`mailto:${interpreter.email}`}
            onClick={(e) => e.stopPropagation()}
            className="button button-secondary flex-1 text-center text-sm"
            aria-label={`Send email to ${interpreter.first_name} ${interpreter.last_name}`}
          >
            Email
          </a>
        )}

        {interpreter.phone && (
          <a
            href={`tel:${interpreter.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="button button-outline flex-1 text-center text-sm"
            aria-label={`Call ${interpreter.first_name} ${interpreter.last_name}`}
          >
            Call
          </a>
        )}
      </div>

      {/* Agency Badge (if applicable) */}
      {interpreter.is_agency && interpreter.agency_name && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
          <p className="caption" style={{ color: 'var(--gray-500)' }}>
            Agency: {interpreter.agency_name}
          </p>
        </div>
      )}
    </article>
  );
}
