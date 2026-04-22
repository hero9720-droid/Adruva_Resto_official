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
    <div className="flex flex-col h-full bg-[#0f172a] border-r border-slate-800/50 w-72 select-none font-sans text-slate-300">
      {/* Brand Logo */}
      <div className="p-8 pb-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(79,70,229,0.3)]">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-black text-xl leading-tight tracking-tighter text-white">AdruvaResto</p>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Chain HQ</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-white">
             <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
        )}
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
                      'flex items-center justify-between px-4 py-3.5 text-[13px] font-bold rounded-2xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'
                        )}
                      />
                      {item.name}
                    </div>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white relative z-10 shadow-[0_0_8px_#fff]" />}
                    
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out Section */}
      <div className="p-6 border-t border-slate-800/50">
         <div className="bg-slate-800/30 rounded-3xl p-4 mb-6 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
               <div className="h-2 w-2 rounded-full bg-indigo-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Plan</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 w-3/4 rounded-full" />
            </div>
         </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-4 text-[13px] font-black text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-2xl w-full transition-all group"
        >
          <div className="p-2.5 bg-slate-800/50 group-hover:bg-transparent rounded-xl transition-colors">
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-rose-400" />
          </div>
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
