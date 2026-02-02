'use client';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-3">
      <div className="flex items-center">
        <p className="body-small text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </header>
  );
}
