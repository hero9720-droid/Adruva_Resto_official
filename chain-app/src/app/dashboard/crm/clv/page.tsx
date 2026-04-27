'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BrainCircuit, TrendingUp, Users, 
  Target, AlertCircle, Sparkles,
  RefreshCcw, ShieldCheck, ArrowRight,
  Gem, Anchor, Hourglass, 
  DollarSign, MessageSquare, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useState } from 'react';

export default function CLVAnalyticsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: segments, isLoading: loadingSegments } = useQuery({
    queryKey: ['clv-segments'],
    queryFn: async () => {
      const { data } = await api.get('/crm/clv/segments');
      return data.data;
    },
  });

  const { data: atRisk, isLoading: loadingRisk } = useQuery({
    queryKey: ['clv-at-risk'],
    queryFn: async () => {
      const { data } = await api.get('/crm/clv/at-risk');
      return data.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      await api.post('/crm/clv/sync');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clv-segments'] });
      queryClient.invalidateQueries({ queryKey: ['clv-at-risk'] });
      toast({ title: "Predictive Models Synced", description: "Customer CLV and Churn risks recalculated." });
    }
  });

  if (loadingSegments || loadingRisk) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-4 gap-6">
       {[1,2,3,4].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  const getSegmentIcon = (s: string) => {
    if (s === 'WHALE') return <Gem className="h-8 w-8 text-indigo-500" />;
    if (s === 'LOYAL') return <Heart className="h-8 w-8 text-emerald-500" />;
    if (s === 'AT_RISK') return <Anchor className="h-8 w-8 text-amber-500" />;
    return <Hourglass className="h-8 w-8 text-slate-400" />;
  };

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs">
            <BrainCircuit className="h-4 w-4" /> Predictive Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Customer Lifetime Value</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6" onClick={() => syncMutation.mutate()}>
              <RefreshCcw className={cn("h-4 w-4 mr-2", syncMutation.isPending && "animate-spin")} /> Run CLV Engine
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 rounded-xl px-8 shadow-glow">
              <Target className="h-4 w-4 mr-2" /> Marketing Automation
           </Button>
        </div>
      </div>

      {/* Segment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {segments?.map((seg: any) => (
           <Card key={seg.segment} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
              <CardContent className="p-8 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center">
                       {getSegmentIcon(seg.segment)}
                    </div>
                    <Badge className="bg-secondary text-slate-400 border-none font-black text-[9px] uppercase tracking-widest">
                       {seg.count} Users
                    </Badge>
                 </div>
                 <div>
                    <h4 className="text-2xl font-black tracking-tighter uppercase">{seg.segment}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Impact: {formatCurrency(seg.total_monetary)}</p>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* At Risk Whales */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Revenue at Risk (High-Value Churners)</h2>
            <div className="space-y-4">
               {atRisk?.map((customer: any, idx: number) => (
                 <Card key={idx} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                             <Anchor className="h-8 w-8" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{customer.name}</h4>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                   <AlertCircle className="h-3 w-3" /> Churn Risk: {(customer.churn_probability * 100).toFixed(0)}%
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                   <DollarSign className="h-3 w-3" /> Total Spend: {formatCurrency(customer.rfm_monetary)}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <Button variant="outline" className="h-12 w-12 rounded-xl border-border"><MessageSquare className="h-5 w-5" /></Button>
                          <Button className="h-12 px-6 rounded-xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-glow">
                             Send "Miss You" Offer
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         {/* Growth Insights Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Growth Intelligence</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Sparkles className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">AI Prediction Summary</h3>
                  <p className="text-white/60 text-sm font-medium">Your predicted CLV for next quarter is up 18%.</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Retained Value</p>
                     <p className="text-2xl font-black mt-1">₹4.2M</p>
                  </div>
                  <div className="p-6 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Acquisition Efficiency</p>
                     <p className="text-2xl font-black mt-1">94% Optimal</p>
                  </div>
               </div>

               <Button className="w-full h-14 rounded-2xl bg-white text-indigo-900 font-black uppercase tracking-widest text-xs hover:bg-white/90 relative z-10 shadow-glow">
                  Execute Win-Back Sequence
               </Button>
            </Card>
         </div>

      </div>
    </div>
  );
}
