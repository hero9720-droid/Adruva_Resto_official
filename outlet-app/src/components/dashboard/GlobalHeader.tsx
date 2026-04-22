'use client';

import { Search, Bell, Plus, Zap, ShieldCheck, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme/ThemeProvider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export default function GlobalHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <header className="hidden md:flex items-center justify-between h-20 px-10 bg-background border-b border-border shrink-0 z-20">
      
      {/* Universal Search */}
      <div className="flex-1 max-w-2xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search Orders, Bills, or Guests... (Ctrl + K)" 
          className="w-full h-12 pl-12 bg-secondary/50 border-none rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-foreground"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-card border border-border rounded-lg text-[9px] font-black text-slate-400 shadow-sm">
           CTRL K
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-6 ml-10">
        
        {/* Connection Status */}
         <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cloud Synced</span>
         </div>

         <div className="flex items-center gap-3 border-l border-border pl-6">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-secondary hover:text-primary transition-all">
                    <Palette className="h-5 w-5" />
                 </Button>
              </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-border shadow-2xl bg-card">
                  <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-border mb-2">Interface Theme</div>
                  <DropdownMenuItem onClick={() => (setTheme as any)('elite-pulse')} className="rounded-xl p-3 font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-secondary">
                     <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-lg bg-[#4f46e5]" /> Elite Pulse
                     </div>
                     {theme === 'elite-pulse' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => (setTheme as any)('midnight-gold')} className="rounded-xl p-3 font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-secondary">
                     <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-lg bg-[#D4AF37]" /> Midnight Gold
                     </div>
                     {theme === 'midnight-gold' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => (setTheme as any)('cyber-neon')} className="rounded-xl p-3 font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-secondary">
                     <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-lg bg-[#39FF14]" /> Cyber Neon
                     </div>
                     {theme === 'cyber-neon' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => (setTheme as any)('nature-zen')} className="rounded-xl p-3 font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-secondary">
                     <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-lg bg-[#2d5a27]" /> Nature Zen
                     </div>
                     {theme === 'nature-zen' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
               </DropdownMenuContent>
           </DropdownMenu>

           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-secondary hover:text-primary transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
           </Button>

           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Quick Action
                 </Button>
              </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border shadow-2xl bg-card">
                  <DropdownMenuItem onClick={() => router.push('/dashboard/pos')} className="rounded-xl p-3 font-bold text-sm flex items-center gap-3 cursor-pointer hover:bg-secondary">
                     <Zap className="h-4 w-4 text-amber-500" /> New POS Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/reservations')} className="rounded-xl p-3 font-bold text-sm flex items-center gap-3 cursor-pointer hover:bg-secondary">
                     <ShieldCheck className="h-4 w-4 text-primary" /> Book Table
                  </DropdownMenuItem>
               </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

    </header>
  );
}
