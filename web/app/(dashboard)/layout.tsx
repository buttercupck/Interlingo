import { Navigation } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <Header />
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
