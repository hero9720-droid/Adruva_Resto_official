'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

import GlobalHeader from '@/components/dashboard/GlobalHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-500 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border shadow-sm z-30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-lg">A</span>
            </div>
            <span className="font-black text-foreground tracking-tighter uppercase">Adruva Chain</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="h-12 w-12 rounded-xl hover:bg-secondary">
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
        </header>

        {/* Global Desktop Header */}
        <GlobalHeader />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto p-8 md:p-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
