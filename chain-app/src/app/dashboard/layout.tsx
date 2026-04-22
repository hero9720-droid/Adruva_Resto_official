'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-500 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="hidden md:flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black text-slate-900">System Online</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-rose-500 border-2 border-white rounded-full" />
             </button>
             <div className="h-10 w-px bg-slate-200/50 mx-2" />
             <div className="flex items-center gap-4 group cursor-pointer">
                <div className="flex flex-col items-end">
                   <span className="text-sm font-black text-slate-900">Brand Admin</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Owner</span>
                </div>
                <div className="h-12 w-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                   A
                </div>
             </div>
          </div>
        </header>

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
