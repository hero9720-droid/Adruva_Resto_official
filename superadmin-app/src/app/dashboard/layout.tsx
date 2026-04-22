'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import GlobalHeader from '@/components/dashboard/GlobalHeader';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${theme}`}>
      {/* Premium Sidebar */}
      <Sidebar />

      {/* Main Command Center */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        <GlobalHeader />
        
        <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
