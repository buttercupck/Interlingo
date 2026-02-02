---
created_datetime: 2025-10-27T15:02:31-07:00
last_edited_datetime: 2025-10-27T15:02:31-07:00
---
# Interlingo Web Application

AI-powered interpreter scheduling and management system.

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (to be implemented)
- **Package Manager**: Bun

## Project Structure

```
web/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Dashboard route group
│   │   ├── dashboard/       # Main dashboard page
│   │   └── layout.tsx       # Dashboard layout with nav
│   ├── login/               # Login page
│   ├── globals.css          # Global styles & design tokens
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── layout/              # Layout components
│   │   ├── Navigation.tsx   # Sidebar navigation
│   │   └── Header.tsx       # Dashboard header
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── supabase/            # Supabase client utilities
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware
│   └── utils.ts             # Utility functions
└── middleware.ts            # Next.js middleware
```

## Getting Started

### Prerequisites

- Bun 1.2.22 or higher
- Node.js 18+ (for compatibility)
- Supabase account

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the development server:
```bash
bun run dev
```

The application will be available at http://localhost:3001 (default port 3000 if available).

## Design System

The application follows the Interlingo design system with these key colors:

- **Primary Blue**: `#1B365C` - Main brand color
- **Secondary Teal**: `#0D7377` - Accent color
- **Secondary Green**: `#14A085` - Success states
- **System Colors**: Success, Warning, Danger, Info

Typography:
- **Primary Font**: Inter (body text)
- **Secondary Font**: Poppins (headings)

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### Current Implementation Status

✅ **Completed (v0.1.0)**:
- Next.js 16 setup with Turbopack
- Tailwind CSS with Interlingo design tokens
- Supabase client configuration
- Base layout with sidebar navigation
- Dashboard home page with mock data
- Login page placeholder

🚧 **Next Steps**:
- Implement Supabase authentication
- Connect to real Supabase data
- Build Jobs Board page
- Build Interpreters page
- Implement email template system
- Add GCAL import workflow

## Pages

- `/` - Landing page
- `/login` - Login page (authentication to be implemented)
- `/dashboard` - Main dashboard with stats and quick actions
- `/dashboard/jobs` - Jobs board (to be implemented)
- `/dashboard/interpreters` - Interpreter management (to be implemented)
- `/dashboard/calendar` - Calendar view (to be implemented)
- `/dashboard/communications` - Communication logs (to be implemented)

## Notes

- The middleware file uses the deprecated "middleware" convention. This can be updated to "proxy" in future versions.
- Authentication is not yet implemented - all pages are currently accessible without login.
- The dashboard currently uses mock data. Real data integration will be added once Supabase tables are set up.

## License

Private - INTERCOM Language Services
