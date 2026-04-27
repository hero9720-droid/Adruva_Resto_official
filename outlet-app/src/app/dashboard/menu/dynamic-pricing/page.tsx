'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Zap, TrendingUp, TrendingDown, 
  Clock, AlertCircle, Sparkles,
  RefreshCcw, Settings2, BarChart3,
  Info, ShieldCheck, ArrowRight,
  Target, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useState } from 'react';

export default function DynamicPricingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recs, isLoading } = useQuery({
    queryKey: ['price-recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/pricing/dynamic/recommendations');
      return data.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      await api.post('/pricing/dynamic/sync');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-recommendations'] });
      toast({ title: "Pricing Synced", description: "All enabled items updated to optimal prices." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
       {[1,2].map(i => <div key={i} className="h-96 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Zap className="h-4 w-4" /> AI Revenue Optimization
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Dynamic Pricing Engine</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Pricing Guardrails</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow" onClick={() => syncMutation.mutate()}>
              <RefreshCcw className={cn("h-4 w-4 mr-2", syncMutation.isPending && "animate-spin")} /> Sync Live Prices
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Live Recommendations */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Active Recommendations</h2>
            <div className="space-y-4">
               {recs?.recommendations?.map((rec: any, idx: number) => (
                 <Card key={idx} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                             <TrendingUp className="h-8 w-8 text-primary" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{rec.item}</h4>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                   <Zap className="h-3 w-3" /> Reason: {rec.reason}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                   <Clock className="h-3 w-3" /> Predicted Lift: +12%
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          <div className="flex items-center gap-3 justify-end mb-1">
                             <span className="text-sm font-bold text-slate-300 line-through">{formatCurrency(rec.current)}</span>
                             <ArrowRight className="h-4 w-4 text-slate-300" />
                             <span className="text-xl font-black text-emerald-500">{formatCurrency(rec.suggested)}</span>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest">
                             Optimal Margin
                          </Badge>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         {/* Configuration Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Engine Controls</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-slate-900 text-white p-10 space-y-8 h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Settings2 className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Active Rules</h3>
                  <p className="text-white/60 text-sm font-medium">Configure how the AI manages your revenue yield.</p>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold uppercase">Dinner Surge</span>
                     </div>
                     <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-tighter">1.2x</Badge>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between opacity-50">
                     <div className="flex items-center gap-4">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-bold uppercase">Cost Index</span>
                     </div>
                     <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-tighter">Margin</Badge>
                  </div>
               </div>

               <div className="p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20 relative z-10">
                  <div className="flex items-center gap-3 text-amber-400">
                     <ShieldCheck className="h-5 w-5" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Safety Guardrails On</p>
                  </div>
                  <p className="text-[9px] text-white/40 font-medium mt-1 uppercase tracking-tighter">
                     Prices will never exceed your set Dynamic Max (currently 150% of base).
                  </p>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
