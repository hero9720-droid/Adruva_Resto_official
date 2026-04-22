'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  RefreshCw,
  Target,
  Megaphone,
  CreditCard,
  Building2,
  Users2
} from 'lucide-react';
import { clearToken } from '@/lib/api';

const navGroups = [
  {
    label: 'Empire Control',
    items: [
      { name: 'Global Overview', href: '/dashboard',          icon: LayoutDashboard },
      { name: 'Outlets',         href: '/dashboard/outlets',   icon: Store },
    ],
  },
  {
    label: 'Brand Assets',
    items: [
      { name: 'Master Menu',    href: '/dashboard/menu',      icon: BookOpen },
      { name: 'Marketing',      href: '/dashboard/marketing', icon: Megaphone },
      { name: 'Global Staff',   href: '/dashboard/staff',     icon: Users2 },
    ],
  },
  {
    label: 'Performance',
    items: [
      { name: 'Aggregated ROI', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Billing & Plan', href: '/dashboard/billing',   icon: CreditCard },
      { name: 'Brand Settings', href: '/dashboard/settings',  icon: Settings },
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
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-black text-xl leading-tight tracking-tighter text-foreground uppercase">Adruva</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Chain HQ v2.0</p>
          </div>
        </div>
        
        {/* Intelligence Widget */}
        <div className="bg-secondary rounded-2xl p-4 border border-border">
           <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sync</span>
              </div>
              <RefreshCw className="h-3 w-3 text-slate-400" />
           </div>
           <div className="flex items-end justify-between">
              <div>
                 <p className="text-2xl font-black text-foreground tracking-tighter">
                   24 Outlets
                 </p>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Locations</p>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-10 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-3 mb-4">
              {group.label}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all group relative overflow-hidden',
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
       <div className="p-6 border-t border-border space-y-4">
          <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
               <div className="h-2 w-2 rounded-full bg-primary" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise Plan</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-primary w-3/4 rounded-full" />
            </div>
          </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-4 text-sm font-black text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-2xl w-full transition-all group"
        >
          <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
