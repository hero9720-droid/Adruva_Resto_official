'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ReceiptText,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  MonitorCheck,
  CalendarClock,
  Package,
  UserCircle,
  BarChart3,
  Wallet,
  Smartphone,
  Globe,
  ChefHat,
  MessageSquare,
  Bed,
} from 'lucide-react';
import { clearToken } from '@/lib/api';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
      { name: 'POS',          href: '/dashboard/pos',          icon: UtensilsCrossed },
      { name: 'KDS',          href: '/dashboard/kds',          icon: MonitorCheck },
      { name: 'Waiter App',   href: '/dashboard/waiter',       icon: Smartphone },
      { name: 'Online Orders',href: '/dashboard/online-orders',icon: Globe },
      { name: 'Bills',        href: '/dashboard/bills',        icon: ReceiptText },
      { name: 'Reservations', href: '/dashboard/reservations', icon: CalendarClock },
      { name: 'Rooms',        href: '/dashboard/rooms',        icon: Bed },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Menu',         href: '/dashboard/menu',         icon: BookOpen },
      { name: 'Recipes',      href: '/dashboard/recipes',      icon: ChefHat },
      { name: 'Inventory',    href: '/dashboard/inventory',    icon: Package },
      { name: 'Staff',        href: '/dashboard/staff',        icon: Users },
      { name: 'Customers',    href: '/dashboard/customers',    icon: UserCircle },
      { name: 'Feedback',     href: '/dashboard/feedback',     icon: MessageSquare },
      { name: 'Expenses',     href: '/dashboard/expenses',     icon: Wallet },
    ],
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics',    href: '/dashboard/analytics',    icon: BarChart3 },
      { name: 'Settings',     href: '/dashboard/settings',     icon: Settings },
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
    <div className="flex flex-col h-full bg-[#0b132b] border-r border-[#1e293b] w-72 select-none font-sans text-slate-200">
      {/* Logo */}
      <div className="p-8 pb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="text-white font-black text-2xl">A</span>
          </div>
          <div>
            <p className="font-black text-xl leading-tight tracking-tighter text-white">AdruvaResto</p>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">Outlet Command</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-glow'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
                    {isActive && <ChevronRight className="h-4 w-4 text-indigo-300 relative z-10" />}
                    
                    {/* Hover Effect Layer */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-6 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-4 text-sm font-black text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl w-full transition-all group"
        >
          <div className="p-2 bg-slate-800 group-hover:bg-transparent rounded-xl transition-colors">
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
          </div>
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
