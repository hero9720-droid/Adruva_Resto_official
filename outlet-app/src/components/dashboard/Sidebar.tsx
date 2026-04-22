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
  Cloud,
  Clock,
  CircleCheck,
  ShieldAlert
} from 'lucide-react';
import { clearToken } from '@/lib/api';
import { useState, useEffect } from 'react';

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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleSignOut() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-72 select-none font-sans text-foreground">
      {/* Logo */}
      <div className="p-8 pb-6 border-b border-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-2xl">A</span>
          </div>
          <div>
            <p className="font-black text-xl leading-tight tracking-tighter text-foreground uppercase">Adruva</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Systems v2.0</p>
          </div>
        </div>

        {/* Intelligence Widget */}
        <div className="bg-secondary rounded-2xl p-4 border border-border">
           <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outlet Online</span>
              </div>
              <Cloud className="h-3 w-3 text-slate-400" />
           </div>
           <div className="flex items-end justify-between">
              <div>
                 <p className="text-2xl font-black text-foreground tracking-tighter">
                   {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Local System Time</p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-primary">28°C</p>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Andheri, Mumbai</p>
              </div>
           </div>
        </div>
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
                                        {/* Hover Effect Layer */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out */}
       <div className="p-6 border-t border-border space-y-4">
        <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-2xl border border-border">
           <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <UserCircle className="h-6 w-6" />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate">ADRUVA ADMIN</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Master Access</p>
           </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-4 text-sm font-black text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-2xl w-full transition-all group"
        >
          <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
