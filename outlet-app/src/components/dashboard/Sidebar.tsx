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
import { useCurrentStatus } from '@/hooks/useStaff';
import { clearToken } from '@/lib/api';
import { useState, useEffect } from 'react';

const navGroups = [
  {
    label: 'Service',
    items: [
      { name: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard, roles: ['admin', 'manager', 'outlet_manager', 'cashier'] },
      { name: 'POS',          href: '/dashboard/pos',          icon: UtensilsCrossed, roles: ['admin', 'manager', 'outlet_manager', 'cashier', 'waiter', 'captain'] },
      { name: 'KDS',          href: '/dashboard/kds',          icon: MonitorCheck,    roles: ['admin', 'manager', 'outlet_manager', 'waiter', 'captain', 'chef', 'kitchen_staff'] },
      { name: 'Bills',        href: '/dashboard/bills',        icon: ReceiptText,     roles: ['admin', 'manager', 'outlet_manager', 'cashier'] },
      { name: 'Feedback',     href: '/dashboard/feedback',     icon: MessageSquare,   roles: ['admin', 'manager', 'outlet_manager'] },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { name: 'Menu',         href: '/dashboard/menu',         icon: BookOpen,        roles: ['admin', 'manager', 'outlet_manager'] },
      { name: 'Spaces',       href: '/dashboard/spaces',       icon: Bed,             roles: ['admin', 'manager', 'outlet_manager', 'waiter', 'captain'] },
      { name: 'Reservations', href: '/dashboard/reservations', icon: CalendarClock,    roles: ['admin', 'manager', 'outlet_manager', 'captain'] },
      { name: 'Staff Hub',    href: '/dashboard/staff',        icon: Users,           roles: ['admin', 'manager', 'outlet_manager', 'cashier'] },
    ],
  },
  {
    label: 'Back Office',
    items: [
      { name: 'Inventory',    href: '/dashboard/inventory',    icon: Package,         roles: ['admin', 'manager', 'outlet_manager', 'chef', 'kitchen_staff'] },
      { name: 'Recipes',      href: '/dashboard/recipes',      icon: ChefHat,         roles: ['admin', 'manager', 'outlet_manager', 'chef'] },
      { name: 'Expenses',     href: '/dashboard/expenses',     icon: Wallet,          roles: ['admin', 'manager', 'outlet_manager', 'cashier'] },
      { name: 'Payroll',      href: '/dashboard/payroll',      icon: Wallet,          roles: ['admin', 'manager', 'outlet_manager'] },
      { name: 'Compliance',   href: '/dashboard/compliance',   icon: ShieldAlert,     roles: ['admin', 'manager', 'outlet_manager'] },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Online Inbox', href: '/dashboard/online-orders',icon: Globe,           roles: ['admin', 'manager', 'outlet_manager', 'cashier'] },
      { name: 'Customers',    href: '/dashboard/customers',    icon: UserCircle,      roles: ['admin', 'manager', 'outlet_manager', 'cashier'] },
      { name: 'Academy',      href: '/dashboard/training',     icon: CircleCheck,     roles: ['admin', 'manager', 'outlet_manager'] },
      { name: 'Analytics',    href: '/dashboard/analytics',    icon: BarChart3,       roles: ['admin', 'manager', 'outlet_manager'] },
      { name: 'Settings',     href: '/dashboard/settings',     icon: Settings,        roles: ['admin', 'manager', 'outlet_manager'] },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: staffStatus } = useCurrentStatus();

  const userRole = staffStatus?.staff?.role?.toLowerCase() || 'admin'; // Defaulting to admin for now if not set
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
      <div className="p-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl">A</span>
          </div>
          <div>
            <p className="font-black text-lg leading-tight tracking-tighter text-foreground uppercase">Adruva</p>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Systems v2.0</p>
          </div>
        </div>

        {/* Intelligence Widget */}
        <div className="bg-secondary rounded-xl p-3 border border-border">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Outlet Online</span>
              </div>
              <Cloud className="h-3 w-3 text-slate-400" />
           </div>
           <div className="flex items-end justify-between">
              <div>
                 <p className="text-lg font-black text-foreground tracking-tighter">
                   {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Local Time</p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-primary">28°C</p>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Mumbai</p>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar">
        {navGroups.map((group) => {

          return (
            <div key={group.label}>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item: any) => {
                  if (item.roles && !item.roles.includes(userRole)) return null;
                  const isActive = item.href === '/dashboard' 
                    ? pathname === item.href 
                    : (pathname === item.href || pathname.startsWith(item.href + '/'));
                  return (
                     <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all group relative overflow-hidden',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-glow border border-primary/20'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                       <div className="flex items-center gap-3 relative z-10">
                        <item.icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                          )}
                        />
                        {item.name}
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/50 relative z-10" />}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sign Out */}
       <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 p-2.5 bg-secondary/50 rounded-xl border border-border">
           <div className="h-9 w-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary shadow-inner">
              <UserCircle className="h-5 w-5" />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate uppercase">{staffStatus?.staff?.name || 'ADRUVA ADMIN'}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{staffStatus?.staff?.role || 'Master Access'}</p>
           </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-3 text-sm font-black text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl w-full transition-all group"
        >
          <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400" />
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
