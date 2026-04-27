'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Flame, Clock, CheckCircle2, 
  AlertTriangle, Filter, LayoutGrid,
  ChevronRight, Timer, Play, 
  Pause, MoreVertical, Bell,
  BarChart3, Settings2, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function KDSV2Page() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeStation, setActiveStation] = useState<string | null>(null);

  const { data: feed, isLoading } = useQuery({
    queryKey: ['kds-feed', activeStation],
    queryFn: async () => {
      const { data } = await api.get(`/orders/kds/feed${activeStation ? `?station=${activeStation}` : ''}`);
      return data.data;
    },
    refetchInterval: 5000 // Real-time poll
  });

  const { data: stations } = useQuery({
    queryKey: ['kds-load'],
    queryFn: async () => {
      const { data } = await api.get('/orders/kds/load');
      return data.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string, status: string }) => {
      await api.patch(`/orders/kds/items/${itemId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-feed'] });
      toast({ title: "Order Updated", description: "Status synced to KDS." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse bg-slate-950 min-h-screen">
    <div className="h-12 w-64 bg-white/5 rounded-xl mb-10" />
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem]" />)}
    </div>
  </div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 space-y-10">
      {/* KDS Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-widest text-xs">
            <Flame className="h-4 w-4" /> Thermal Operations
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Kitchen Command Center <span className="text-white/20">V2.0</span></h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
           <Button 
             variant="ghost" 
             onClick={() => setActiveStation(null)}
             className={cn("rounded-xl font-bold h-10 px-6", !activeStation && "bg-white/10 text-white")}
           >
              All Stations
           </Button>
           {stations?.map((s: any) => (
             <Button 
               key={s.station}
               variant="ghost"
               onClick={() => setActiveStation(s.station)}
               className={cn("rounded-xl font-bold h-10 px-6", activeStation === s.station && "bg-orange-500 text-white")}
             >
                {s.station} <Badge className="ml-2 bg-white/20 border-none text-[9px]">{s.active_orders}</Badge>
             </Button>
           ))}
           <div className="h-6 w-px bg-white/10 mx-2" />
           <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/10">
              <Settings2 className="h-5 w-5 text-white/40" />
           </Button>
        </div>
      </div>

      {/* Live Order Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {feed?.map((item: any) => {
           const waitMins = Math.round(item.wait_time_minutes);
           const isCritical = waitMins > 15;
           const isWarning = waitMins > 10;

           return (
             <Card key={item.id} className={cn(
               "border-none shadow-2xl rounded-[2.5rem] bg-white/5 transition-all overflow-hidden group",
               item.status === 'preparing' ? "ring-2 ring-orange-500/50" : "",
               isCritical ? "bg-red-500/10 ring-2 ring-red-500/50" : ""
             )}>
                <CardContent className="p-0">
                   {/* Card Header: Order Info */}
                   <div className={cn(
                     "p-6 flex justify-between items-start",
                     item.status === 'preparing' ? "bg-orange-500/10" : "bg-white/5"
                   )}>
                      <div>
                         <h4 className="text-xs font-black uppercase tracking-widest text-white/40">#{item.order_number} • {item.table_name || 'DELIVERY'}</h4>
                         <h3 className="text-xl font-black tracking-tight mt-1 truncate max-w-[180px]">{item.item_name}</h3>
                      </div>
                      <Badge className={cn(
                        "h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest",
                        item.status === 'preparing' ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                      )}>
                         {item.status}
                      </Badge>
                   </div>

                   {/* Modifiers & Notes */}
                   <div className="p-6 space-y-4">
                      {item.modifiers_json?.length > 0 && (
                        <div className="space-y-1">
                           {item.modifiers_json.map((mod: any, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 text-xs font-bold text-orange-400">
                                <ChevronRight className="h-3 w-3" /> {mod.name}
                             </div>
                           ))}
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="p-3 bg-white/5 rounded-xl text-[10px] font-bold text-white/60 uppercase italic">
                           Note: {item.notes}
                        </div>
                      )}
                   </div>

                   {/* Card Footer: Timers & Actions */}
                   <div className="p-6 pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Timer className={cn(
                           "h-5 w-5",
                           isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-orange-400" : "text-white/20"
                         )} />
                         <span className={cn(
                           "text-2xl font-black tracking-tighter",
                           isCritical ? "text-red-500" : isWarning ? "text-orange-400" : "text-white"
                         )}>{waitMins}m</span>
                      </div>
                      
                      {item.status === 'pending' ? (
                        <Button 
                          onClick={() => updateStatus.mutate({ itemId: item.id, status: 'preparing' })}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-10 px-6"
                        >
                           <Play className="h-3 w-3 mr-2" /> Start
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => updateStatus.mutate({ itemId: item.id, status: 'ready' })}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-10 px-6"
                        >
                           <CheckCircle2 className="h-3 w-3 mr-2" /> Done
                        </Button>
                      )}
                   </div>
                   
                   {/* Progress Bar */}
                   <div className="h-1 w-full bg-white/10">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          isCritical ? "bg-red-500" : "bg-orange-500"
                        )} 
                        style={{ width: `${Math.min((waitMins / 15) * 100, 100)}%` }}
                      />
                   </div>
                </CardContent>
             </Card>
           );
         })}

         {feed?.length === 0 && (
            <div className="col-span-full h-96 flex flex-col items-center justify-center text-white/10 gap-4">
               <CheckCircle2 className="h-20 w-20" />
               <p className="text-xl font-black uppercase tracking-[0.2em]">Kitchen Clear</p>
            </div>
         )}
      </div>

      {/* Station Load Analytics Overlay */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-10 shadow-2xl z-50">
         <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">Load Analytics</span>
         </div>
         <div className="flex gap-10">
            {stations?.map((s: any) => (
              <div key={s.station} className="flex flex-col items-center gap-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{s.station}</p>
                 <p className="text-sm font-black text-white">{Math.round(s.avg_wait_time)}m Avg</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
