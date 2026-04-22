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
  Server,
  Zap
} from 'lucide-react';
import { clearToken } from '@/lib/api';

const navGroups = [
  {
    label: 'SaaS HQ',
    items: [
      { name: 'System Overview', href: '/dashboard',          icon: LayoutDashboard },
      { name: 'Cloud Monitor',   href: '/dashboard/monitor',   icon: Activity },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { name: 'Multi-Tenancy',   href: '/dashboard/chains',    icon: Globe },
      { name: 'Platform Health', href: '/dashboard/health',    icon: ShieldCheck },
      { name: 'Global Storage',  href: '/dashboard/storage',   icon: Database },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Subscriptions',   href: '/dashboard/plans',     icon: CreditCard },
      { name: 'Enterprise CRM',  href: '/dashboard/crm',       icon: Users },
      { name: 'System Settings', href: '/dashboard/settings',  icon: Settings },
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
    <div className="flex flex-col h-full bg-card border-r border-border w-72 select-none font-sans text-foreground">
      {/* Brand Logo */}
      <div className="p-8 pb-6 border-b border-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-black text-xl leading-tight tracking-tighter text-foreground uppercase">Adruva HQ</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Global Admin v2.0</p>
          </div>
        </div>
        
        {/* Intelligence Widget */}
        <div className="bg-secondary/50 rounded-2xl p-5 border border-border shadow-inner">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Sync</span>
              </div>
              <Zap className="h-3 w-3 text-primary animate-pulse" />
           </div>
           <div className="flex items-end justify-between">
              <div>
                 <p className="text-3xl font-black text-foreground tracking-tighter">
                   100%
                 </p>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uptime Metric</p>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-12 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 mb-5">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center justify-between px-5 py-4 text-sm font-bold rounded-2xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-glow border border-primary/20'
                        : 'text-slate-500 hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive ? 'text-primary-foreground' : 'text-slate-500 group-hover:text-primary'
                        )}
                      />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-primary-foreground/50 relative z-10" />}
                    
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out Section */}
       <div className="p-8 border-t border-border space-y-6">
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 shadow-inner">
            <div className="flex items-center gap-3 mb-4">
               <div className="h-2 w-2 rounded-full bg-primary" />
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Authorization</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full rounded-full" />
               </div>
               <span className="text-[9px] font-black text-primary">L5</span>
            </div>
          </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-5 py-5 text-[11px] font-black text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl w-full transition-all group border border-transparent hover:border-rose-500/20 uppercase tracking-widest"
        >
          <LogOut className="h-5 w-5 transition-colors" />
          Terminate Session
        </button>
      </div>
    </div>
  );
}
