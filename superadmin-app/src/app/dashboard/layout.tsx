'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import GlobalHeader from '@/components/dashboard/GlobalHeader';
import { useTheme } from '@/components/theme/ThemeProvider';

import { useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname === '/') {
      router.replace('/login');
    }
  }, [pathname, router]);

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
