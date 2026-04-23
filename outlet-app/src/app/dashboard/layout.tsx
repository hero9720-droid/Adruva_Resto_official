'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import GlobalHeader from '@/components/dashboard/GlobalHeader';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 flex items-center justify-between p-4 bg-card/80 backdrop-blur-md border-b border-border shadow-sm z-30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-lg">A</span>
            </div>
            <span className="font-black text-foreground tracking-tighter uppercase">Adruva</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="h-12 w-12 rounded-xl hover:bg-secondary">
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
        </header>

        {/* Global Desktop Header */}
        <div className="sticky top-0 z-40">
          <GlobalHeader />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
