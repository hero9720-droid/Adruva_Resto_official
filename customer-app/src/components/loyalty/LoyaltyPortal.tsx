'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Trophy, Share2, Star, 
  TrendingUp, Gift, Copy, 
  ChevronRight, Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function LoyaltyPortal() {
  const { toast } = useToast();
  const { data: loyalty, isLoading } = useQuery({
    queryKey: ['customer-loyalty'],
    queryFn: async () => {
      const { data } = await api.get('/customers/me/loyalty');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-10 animate-pulse bg-secondary/50 rounded-3xl h-64" />;

  const customer = loyalty?.customer;
  const tierColors: Record<string, string> = {
    bronze: 'from-orange-400 to-orange-700',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-indigo-400 to-indigo-700'
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(customer?.referral_code || '');
    toast({ title: 'Code Copied!', description: 'Share this with your friends to earn points.' });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* VIP Status Card */}
      <Card className={cn(
        "border-none rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-gradient-to-br",
        tierColors[customer?.tier || 'bronze']
      )}>
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Trophy className="h-40 w-40" />
        </div>
        <CardContent className="p-10 text-white relative z-10">
          <div className="flex justify-between items-start">
             <div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-black uppercase tracking-widest text-[10px] px-4 py-1.5 mb-4">
                   {customer?.tier} member
                </Badge>
                <h2 className="text-5xl font-black tracking-tighter uppercase">{customer?.loyalty_points} Points</h2>
                <p className="text-white/70 font-bold mt-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                   <TrendingUp className="h-4 w-4" /> 
                   Next Reward: 500 Points
                </p>
             </div>
             <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
                <Star className="h-10 w-10 fill-white" />
             </div>
          </div>
          
          <div className="mt-12 space-y-3">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/80">
                <span>Silver Tier</span>
                <span>Gold Tier</span>
             </div>
             <Progress value={45} className="h-3 bg-white/20" />
             <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/60">Spend ₹5,400 more to reach Gold</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="p-4 bg-primary/10 rounded-3xl w-fit">
               <Share2 className="h-8 w-8 text-primary" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Refer a Friend</h3>
               <p className="text-slate-500 font-medium text-sm mt-1">Get 500 points when they place their first order.</p>
            </div>
            <div className="flex items-center gap-3 bg-secondary rounded-2xl p-2 pr-4 border border-border">
               <div className="flex-1 px-4 font-black text-lg tracking-widest text-primary uppercase">
                  {customer?.referral_code}
               </div>
               <Button onClick={copyReferral} className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-glow p-0">
                  <Copy className="h-5 w-5" />
               </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-indigo-600 shadow-soft rounded-[2.5rem] overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
          <CardContent className="p-8 h-full flex flex-col justify-between text-white">
            <Sparkles className="h-10 w-10 text-white/30" />
            <div className="space-y-4">
               <div>
                  <h3 className="text-2xl font-black tracking-tight uppercase leading-tight">Exclusive Perks for you</h3>
                  <p className="text-white/70 font-medium text-sm mt-1">Check out rewards available for {customer?.tier} members.</p>
               </div>
               <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-full">
                  Explore Rewards <ChevronRight className="h-4 w-4" />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
         <h4 className="text-lg font-black text-foreground tracking-widest uppercase ml-4">Loyalty History</h4>
         <div className="space-y-4">
            {loyalty?.transactions?.map((t: any) => (
               <div key={t.id} className="flex items-center justify-between bg-card p-6 rounded-[2rem] shadow-soft border border-border group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-5">
                     <div className={cn(
                        "p-3 rounded-2xl",
                        t.type === 'earn' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                     )}>
                        {t.type === 'earn' ? <TrendingUp className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                     </div>
                     <div>
                        <p className="font-black text-foreground uppercase tracking-tight">{t.description || (t.type === 'earn' ? 'Order Earnings' : 'Points Redeemed')}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className={cn(
                     "text-xl font-black tracking-tighter",
                     t.type === 'earn' ? 'text-emerald-500' : 'text-primary'
                  )}>
                     {t.type === 'earn' ? '+' : '-'}{t.points}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
