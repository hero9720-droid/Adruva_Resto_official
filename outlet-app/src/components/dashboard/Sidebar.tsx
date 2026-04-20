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
} from 'lucide-react';
import { clearToken } from '@/lib/api';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
      { name: 'POS',          href: '/dashboard/pos',          icon: UtensilsCrossed },
      { name: 'KDS',          href: '/dashboard/kds',          icon: MonitorCheck },
      { name: 'Bills',        href: '/dashboard/bills',        icon: ReceiptText },
      { name: 'Reservations', href: '/dashboard/reservations', icon: CalendarClock },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Menu',         href: '/dashboard/menu',         icon: BookOpen },
      { name: 'Inventory',    href: '/dashboard/inventory',    icon: Package },
      { name: 'Staff',        href: '/dashboard/staff',        icon: Users },
      { name: 'Customers',    href: '/dashboard/customers',    icon: UserCircle },
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="flex flex-col h-full bg-[#ffffff] border-r border-[#f0ecf9] w-72 select-none font-sans">
      {/* Logo */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#1b1b24] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1b1b24]/20">
            <span className="text-[#ffffff] font-black text-2xl">A</span>
          </div>
          <div>
            <p className="font-black text-xl leading-tight tracking-tighter text-[#1b1b24]">AdruvaResto</p>
            <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mt-0.5">Outlet Command</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black text-[#a09eb1] uppercase tracking-[0.2em] px-2 mb-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-[#1b1b24] text-[#ffffff] shadow-lg shadow-black/10'
                        : 'text-[#777587] hover:bg-[#fcf8ff] hover:text-[#1b1b24]'
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive ? 'text-[#ffffff]' : 'text-[#c7c4d8] group-hover:text-[#4f46e5]'
                        )}
                      />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-[#777587] relative z-10" />}
                    
                    {/* Hover Effect Layer */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f5f2ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-6 border-t border-[#f0ecf9]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-4 text-sm font-black text-[#777587] hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-2xl w-full transition-all group"
        >
          <div className="p-2 bg-[#f5f2ff] group-hover:bg-transparent rounded-xl transition-colors">
            <LogOut className="h-5 w-5 text-[#c7c4d8] group-hover:text-[#ba1a1a]" />
          </div>
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
