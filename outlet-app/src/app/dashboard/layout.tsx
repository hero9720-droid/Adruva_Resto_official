'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border shadow-sm z-30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-card-foreground">AdruvaResto</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
