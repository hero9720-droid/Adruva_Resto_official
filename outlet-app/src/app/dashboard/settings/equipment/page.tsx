'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Zap, Thermometer, ShieldAlert, 
  CheckCircle2, XCircle, Sparkles,
  RefreshCcw, Settings, ArrowRight,
  HardDrive, Activity, Calendar,
  Wrench, AlertTriangle, Clock,
  Microchip, Radio
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function EquipmentHealthPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment-health'],
    queryFn: async () => {
      const { data } = await api.get('/equipment/health');
      return data.data;
    },
    refetchInterval: 10000, // Real-time pulse every 10s
  });

  const ticketMutation = useMutation({
    mutationFn: async ({ id, desc }: { id: string, desc: string }) => {
      await api.post('/equipment/maintenance/tickets', { 
        equipment_id: id, 
        description: desc,
        scheduled_at: new Date().toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-health'] });
      toast({ title: "Maintenance Scheduled", description: "Technician has been notified." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[1,2,3,4,5,6].map(i => <div key={i} className="h-60 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Radio className="h-4 w-4 animate-pulse" /> Asset Telemetry Live
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Equipment Health Bridge</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">
              Inventory Assets
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Activity className="h-4 w-4 mr-2" /> Run System Diagnostic
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {equipment?.map((item: any) => (
           <Card key={item.id} className={cn(
             "border-none shadow-soft rounded-[3rem] bg-card overflow-hidden group hover:shadow-xl transition-all relative",
             item.status === 'down' ? "ring-2 ring-red-500" : item.status === 'warning' ? "ring-2 ring-amber-500" : ""
           )}>
              <CardContent className="p-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                       {item.type === 'fridge' ? <Thermometer className="h-8 w-8 text-blue-400" /> : <Zap className="h-8 w-8 text-amber-400" />}
                    </div>
                    <Badge className={cn(
                      "font-black text-[9px] uppercase tracking-widest border-none px-3 h-6",
                      item.status === 'operational' ? "bg-emerald-500/10 text-emerald-500" : 
                      item.status === 'warning' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                    )}>
                       {item.status}
                    </Badge>
                 </div>

                 <div className="space-y-1">
                    <h4 className="text-2xl font-black text-foreground uppercase tracking-tight italic">{item.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">S/N: {item.id.substring(0, 8).toUpperCase()}</p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Metrics</span>
                       <div className="flex items-center gap-4">
                          {item.recent_telemetry?.map((t: any, idx: number) => (
                            <div key={idx} className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              t.status === 'normal' ? "bg-emerald-500" : t.status === 'warning' ? "bg-amber-500" : "bg-red-500"
                            )} />
                          ))}
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Telemetry</span>
                       <span className="text-sm font-bold text-foreground">
                          {item.recent_telemetry?.[0]?.metric_value || 0}°C
                       </span>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <Button 
                      className="flex-1 h-12 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest shadow-glow"
                      onClick={() => ticketMutation.mutate({ id: item.id, desc: `Preventive maintenance for ${item.name}` })}
                    >
                       <Wrench className="h-4 w-4 mr-2" /> Schedule Service
                    </Button>
                    <Button variant="outline" className="h-12 w-12 rounded-2xl border-border">
                       <Settings className="h-5 w-5" />
                    </Button>
                 </div>
              </CardContent>
              
              {item.status === 'down' && (
                 <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                    <div className="bg-red-500 text-white p-4 rounded-full animate-bounce">
                       <ShieldAlert className="h-8 w-8" />
                    </div>
                 </div>
              )}
           </Card>
         ))}
      </div>

      {/* Maintenance Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="border-none shadow-soft rounded-[3rem] bg-slate-900 text-white p-12 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Calendar className="h-40 w-40" />
            </div>
            <div className="space-y-2 relative z-10">
               <h3 className="text-2xl font-black uppercase italic tracking-tight">Maintenance Pipeline</h3>
               <p className="text-white/40 text-sm font-medium">Scheduled services for the next 30 days.</p>
            </div>
            <div className="space-y-4 relative z-10">
               {[1,2].map(i => (
                 <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center font-black">M{i}</div>
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight">Walk-in Freezer A</p>
                          <p className="text-[10px] font-medium text-white/40">Quarterly Compressor Check</p>
                       </div>
                    </div>
                    <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase">May 12</Badge>
                 </div>
               ))}
            </div>
         </Card>

         <Card className="border-none shadow-soft rounded-[3rem] bg-card p-12 space-y-8">
            <div className="flex items-center gap-3">
               <AlertTriangle className="h-6 w-6 text-amber-500" />
               <h3 className="text-xl font-black uppercase tracking-tight italic">AI Health Insights</h3>
            </div>
            <div className="space-y-6">
               <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-2">
                  <p className="text-xs font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                     <Microchip className="h-3 w-3" /> Predictive Warning
                  </p>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Fryer #3 shows erratic power consumption patterns over the last 48 hours. This typically indicates a failing heating element. Service recommended within 7 days.
                  </p>
               </div>
               <Button variant="link" className="p-0 h-auto text-primary font-black uppercase text-[10px] tracking-widest">
                  View Technical Logs <ArrowRight className="h-3 w-3 ml-1" />
               </Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
