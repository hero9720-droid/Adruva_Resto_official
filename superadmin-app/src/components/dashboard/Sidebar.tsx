'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShieldCheck,
  Globe,
  Database,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Zap,
  Server,
  Key
} from 'lucide-react';
import { clearToken } from '@/lib/api';
import { motion } from 'framer-motion';

const navGroups = [
  {
    label: 'Main Command',
    items: [
      { name: 'Dashboard',       href: '/dashboard',          icon: LayoutDashboard },
      { name: 'Revenue HQ',      href: '/dashboard/revenue',  icon: CreditCard },
      { name: 'Live Monitor',    href: '/dashboard/monitor',   icon: Activity },
      { name: 'System Health',   href: '/dashboard/health',    icon: ShieldCheck },
    ],
  },
  {
    label: 'Governance',
    items: [
      { name: 'Chain Network',   href: '/dashboard/chains',    icon: Globe },
      { name: 'Identity CRM',    href: '/dashboard/crm',       icon: Users },
      { name: 'Global Storage',  href: '/dashboard/storage',   icon: Database },
    ],
  },
  {
    label: 'Platform',
    items: [
      { name: 'Plans & Billing', href: '/dashboard/plans',     icon: CreditCard },
      { name: 'HQ Settings',     href: '/dashboard/settings',  icon: Settings },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border-r border-white/10 w-72 select-none font-sans overflow-hidden">
      {/* Premium Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-black text-lg leading-none tracking-tight text-white uppercase italic">ADRUVA<span className="text-indigo-400">HQ</span></p>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">SuperAdmin v2.5</p>
          </div>
        </div>

        {/* Small Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Network Active</span>
        </div>
      </div>

      {/* Optimized Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon
                        className={cn(
                          'h-4.5 w-4.5 transition-colors',
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'
                        )}
                      />
                      <span className={cn(
                        "tracking-tight transition-all",
                        isActive ? "font-bold" : "font-medium"
                      )}>{item.name}</span>
                    </div>
                    {isActive && (
                       <ChevronRight className="h-4 w-4 text-white/50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Clean Footer */}
       <div className="p-6 border-t border-white/5">
          <div className="mb-4 px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Level 5</span>
             </div>
             <Key className="h-3 w-3 text-indigo-500" />
          </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3.5 text-[11px] font-black text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl w-full transition-all group uppercase tracking-widest"
        >
          <LogOut className="h-4 w-4" />
          Logout Session
        </button>
      </div>
    </div>
  );
}
