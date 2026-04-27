'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Crown, Star, Award, 
  Zap, Gift, ChevronRight,
  ShieldCheck, Info, Sparkles,
  Timer, Users, MapPin, 
  CreditCard, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

export default function LoyaltyPage() {
  const { data: pass, isLoading } = useQuery({
    queryKey: ['loyalty-pass'],
    queryFn: async () => {
      const { data } = await api.get('/loyalty/my-pass');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-6 animate-pulse space-y-6">
    <div className="h-64 bg-secondary rounded-[2.5rem]" />
    <div className="space-y-4">
       {[1,2,3].map(i => <div key={i} className="h-20 bg-secondary rounded-2xl" />)}
    </div>
  </div>;

  const tierColors: any = {
    bronze: "from-orange-500 via-orange-400 to-orange-500",
    silver: "from-slate-400 via-slate-200 to-slate-400",
    gold: "from-amber-400 via-amber-200 to-amber-400",
    platinum: "from-indigo-600 via-purple-500 to-indigo-600"
  };

  const progress = pass?.next_tier_min ? (Number(pass.lifetime_spend_paise) / Number(pass.next_tier_min)) * 100 : 100;

  return (
    <div className="p-6 space-y-8 pb-32 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Your Rewards</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Membership ID: AD-{pass?.id?.slice(0, 8)}</p>
      </div>

      {/* Dynamic Membership Card */}
      <Card className={cn(
        "border-none shadow-glow-indigo rounded-[2.5rem] p-1 overflow-hidden relative group",
        `bg-gradient-to-br ${tierColors[pass?.tier] || tierColors.bronze}`
      )}>
         <CardContent className="bg-white/5 backdrop-blur-xl rounded-[2.3rem] p-8 space-y-8 relative z-10 text-white">
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
               </div>
               <Badge className="bg-white text-indigo-900 border-none font-black text-[10px] uppercase tracking-widest px-4 h-7">
                  {pass?.tier} Member
               </Badge>
            </div>

            <div className="space-y-1">
               <p className="text-sm font-bold uppercase text-white/60">Points Balance</p>
               <h2 className="text-5xl font-black tracking-tighter">{pass?.loyalty_points?.toLocaleString()} <span className="text-xl opacity-40">PTS</span></h2>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Next Tier Progress</span>
                  <span className="text-xs font-bold">{Math.round(progress)}%</span>
               </div>
               <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
               </div>
               {pass?.next_tier_min && (
                 <p className="text-[9px] font-medium text-white/40 italic">
                    Spend {formatCurrency(Number(pass.next_tier_min) - Number(pass.lifetime_spend_paise))} more to reach next tier.
                 </p>
               )}
            </div>
         </CardContent>

         {/* Card Decoration */}
         <div className="absolute top-0 right-0 p-10 opacity-10 -mr-10 -mt-10">
            <Sparkles className="h-40 w-40 text-white" />
         </div>
      </Card>

      {/* Perks List */}
      <div className="space-y-4">
         <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Gift className="h-5 w-5 text-indigo-500" /> Current Perks
         </h3>
         <div className="grid grid-cols-1 gap-3">
            {pass?.perks_json?.map((perk: string, idx: number) => (
              <div key={idx} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                       <Award className="h-5 w-5 text-indigo-500" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight">{perk}</span>
                 </div>
                 <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-emerald-500 border-emerald-100 bg-emerald-50">Active</Badge>
              </div>
            ))}
         </div>
      </div>

      {/* Recent Points */}
      <div className="space-y-4">
         <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Timer className="h-5 w-5 text-indigo-500" /> Activity
         </h3>
         <Card className="border-none shadow-soft rounded-[2rem] bg-secondary/20 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
               </div>
               <div>
                  <p className="text-sm font-black uppercase">Dinner at Outlet #12</p>
                  <p className="text-[10px] font-medium text-slate-400">Earned +142 Points</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-xs font-black text-indigo-600">x{pass?.points_multiplier} Multiplier</p>
            </div>
         </Card>
      </div>

      <Button className="w-full h-16 rounded-[2rem] bg-foreground text-background font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-glow">
         Redeem Points
      </Button>

    </div>
  );
}
