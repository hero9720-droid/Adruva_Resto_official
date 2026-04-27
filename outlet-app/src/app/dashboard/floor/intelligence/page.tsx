'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BrainCircuit, Users, Clock, 
  Crown, Calendar, Info, 
  ChevronRight, Timer, AlertCircle,
  Zap, Map as MapIcon, Table
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function TableIntelligencePage() {
  const { toast } = useToast();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['table-predictions'],
    queryFn: async () => {
      const { data } = await api.get('/reservations/smart/availability');
      return data.data;
    },
    refetchInterval: 10000
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-4 gap-6">
       {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-40 bg-secondary rounded-[2.5rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs">
            <BrainCircuit className="h-4 w-4" /> Predictive Analytics
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Table Turn Intelligence</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Occupancy Heatmap</Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 rounded-xl px-8 shadow-glow">
              <Zap className="h-4 w-4 mr-2" /> Run Optimizer
           </Button>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {predictions?.map((table: any) => (
           <Card key={table.id} className={cn(
             "border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group transition-all",
             table.status === 'occupied' ? "hover:shadow-xl" : "opacity-50"
           )}>
              <CardContent className="p-8 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center">
                       <Table className="h-6 w-6 text-slate-400" />
                    </div>
                    <Badge className={cn(
                      "h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest",
                      table.status === 'occupied' ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                       {table.status}
                    </Badge>
                 </div>

                 <div>
                    <h4 className="text-2xl font-black tracking-tighter uppercase">{table.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity: {table.capacity} Pax</p>
                 </div>

                 {table.status === 'occupied' ? (
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Release</span>
                         <span className="text-lg font-black text-indigo-600">{table.predicted_minutes_left} Mins</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-indigo-500 transition-all duration-1000" 
                           style={{ width: `${Math.max(10, 100 - (table.predicted_minutes_left / 60) * 100)}%` }}
                         />
                      </div>
                   </div>
                 ) : (
                   <div className="h-10 flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase italic">
                      <Info className="h-4 w-4" /> Ready for Walk-in
                   </div>
                 )}
              </CardContent>
           </Card>
         ))}
      </div>

      {/* VIP Booking Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <Card className="lg:col-span-2 border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Crown className="h-40 w-40" />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase tracking-tight">VIP Arrival Alert</h3>
                  <p className="text-white/60 text-sm font-medium">Customer "Vikram Malhotra" (Tier: Diamond) arriving in 25 mins.</p>
               </div>
               
               <div className="p-6 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-amber-400 rounded-xl flex items-center justify-center font-black text-indigo-900">VM</div>
                        <div>
                           <p className="text-sm font-bold uppercase">Table 12 (Reserved)</p>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Preference: Window Side, Dry Red Wine</p>
                        </div>
                     </div>
                     <Button className="h-10 rounded-xl bg-white text-indigo-900 font-black uppercase text-[10px] tracking-widest hover:bg-white/90">
                        Prepare Greeting
                     </Button>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="border-none shadow-soft rounded-[3rem] bg-card p-10 space-y-8">
            <div className="space-y-1">
               <h3 className="text-xl font-black uppercase tracking-tight">Turn Performance</h3>
               <p className="text-slate-400 text-xs font-medium">Avg duration today: 52 mins</p>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fastest Turn</span>
                  <span className="text-sm font-black">28m (Table 4)</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slowest Turn</span>
                  <span className="text-sm font-black">94m (Table 18)</span>
               </div>
               <div className="flex items-center justify-between text-indigo-600">
                  <span className="text-[10px] font-black uppercase tracking-widest">Projected Rev</span>
                  <span className="text-sm font-black">+18% Efficiency</span>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
