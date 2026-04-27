'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Trophy, TrendingUp, Zap, 
  Clock, DollarSign, Star,
  Award, ChevronRight, BarChart3,
  Search, Filter, RefreshCcw,
  Sparkles, Target, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function EPIDashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['staff-leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/staff/performance/leaderboard');
      return data.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      await api.post('/staff/performance/sync');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-leaderboard'] });
      toast({ title: "Index Refreshed", description: "EPI scores updated with latest data." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {[1,2,3].map(i => <div key={i} className="h-64 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Trophy className="h-4 w-4" /> Operational Excellence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Employee Performance Index</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6" onClick={() => syncMutation.mutate()}>
              <RefreshCcw className={cn("h-4 w-4 mr-2", syncMutation.isPending && "animate-spin")} /> Recalculate EPI
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Award className="h-4 w-4 mr-2" /> Recognition Program
           </Button>
        </div>
      </div>

      {/* Top Performers (Podium) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {topThree.map((staff: any, idx: number) => (
           <Card key={staff.id || idx} className={cn(
             "border-none shadow-soft rounded-[3rem] p-1 relative overflow-hidden",
             idx === 0 ? "bg-gradient-to-br from-amber-400 via-amber-200 to-amber-400" :
             idx === 1 ? "bg-gradient-to-br from-slate-400 via-slate-200 to-slate-400" :
             "bg-gradient-to-br from-orange-400 via-orange-200 to-orange-400"
           )}>
              <CardContent className="bg-card rounded-[2.8rem] p-8 space-y-6 h-full flex flex-col items-center text-center">
                 <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center font-black text-2xl text-slate-400">
                       {staff.name[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-card rounded-full flex items-center justify-center border-4 border-card shadow-soft">
                       {idx === 0 ? <Sparkles className="h-5 w-5 text-amber-500" /> : <Award className="h-5 w-5 text-slate-400" />}
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase">{staff.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.role}</p>
                 </div>

                 <div className="space-y-1">
                    <p className="text-4xl font-black text-primary tracking-tighter">{Number(staff.monthly_epi).toFixed(1)}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly EPI</p>
                 </div>

                 <div className="flex gap-2">
                    {[...Array(staff.achievement_count)].map((_, i) => (
                      <div key={i} className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center">
                         <Zap className="h-4 w-4 text-primary" />
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Leaderboard Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <Card className="lg:col-span-2 border-none shadow-soft rounded-[3rem] bg-card overflow-hidden">
            <CardContent className="p-0">
               <div className="p-8 border-b border-border">
                  <h3 className="text-xl font-black uppercase tracking-tight">EPI Rankings</h3>
               </div>
               <div className="divide-y divide-border/50">
                  {rest.map((staff: any, idx: number) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-all cursor-pointer group">
                       <div className="flex items-center gap-6">
                          <span className="text-sm font-black text-slate-300 w-4">#{idx + 4}</span>
                          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-black text-slate-400">
                             {staff.name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-black text-foreground uppercase tracking-tight">{staff.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.role}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-10">
                          <div className="text-right">
                             <p className="text-sm font-black text-foreground">{Number(staff.monthly_epi).toFixed(1)}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all" />
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Performance Insights Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Outlet Health</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <TrendingUp className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Performance Summary</h3>
                  <p className="text-white/60 text-sm font-medium">Overall staff efficiency is up by 12% this month.</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Avg Prep Speed</span>
                        <span className="text-emerald-400">8.4/10</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[84%]" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Punctuality</span>
                        <span className="text-amber-400">7.1/10</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[71%]" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Upsell Rate</span>
                        <span className="text-emerald-400">9.2/10</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[92%]" />
                     </div>
                  </div>
               </div>

               <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-white/90 relative z-10">
                  Download Full Report
               </Button>
            </Card>
         </div>

      </div>
    </div>
  );
}
