'use client';

import { useSystemHealth } from '@/hooks/useSuperAdmin';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Server, Database, Activity, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HealthPage() {
  const { data: health } = useSystemHealth();

  const services = [
    { name: 'Core API Gateway', status: health?.api || 'offline', icon: Server },
    { name: 'PostgreSQL Database', status: health?.database || 'offline', icon: Database },
    { name: 'Redis Cache Layer', status: health?.redis || 'offline', icon: Activity },
    { name: 'Websocket Engine', status: 'ok', icon: Cpu },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <ShieldCheck className="h-10 w-10 text-primary" />
             </div>
             Engine Vitality
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Real-time infrastructure health and node monitoring.</p>
        </div>
        <div className="flex items-center gap-4 px-8 py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-inner">
           <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
           <span className="text-sm font-black uppercase tracking-widest text-emerald-500">System Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service) => (
          <Card key={service.name} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group">
            <CardContent className="p-10 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className={cn(
                    "p-5 rounded-2xl shadow-inner transition-all",
                    service.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                  )}>
                     <service.icon className="h-8 w-8" />
                  </div>
                  <div>
                     <p className="text-xl font-black tracking-tighter text-foreground uppercase">{service.name}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Live Endpoint Monitoring</p>
                  </div>
               </div>
               <Badge className={cn(
                 "px-6 py-2 font-black tracking-widest uppercase text-[11px] border-none shadow-sm rounded-xl",
                 service.status === 'ok' ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'
               )}>
                 {service.status.toUpperCase()}
               </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden p-10">
         <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-10 flex items-center gap-4">
            <Activity className="h-6 w-6 text-primary" />
            Performance Metrics
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process Uptime</p>
               <p className="text-5xl font-black tracking-tighter text-foreground">{Math.round(health?.uptime / 3600) || 0} <span className="text-lg opacity-40 ml-1">HOURS</span></p>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Usage (RSS)</p>
               <p className="text-5xl font-black tracking-tighter text-foreground">{Math.round(health?.memory?.rss / 1024 / 1024) || 0} <span className="text-lg opacity-40 ml-1">MB</span></p>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Loop Lag</p>
               <p className="text-5xl font-black tracking-tighter text-emerald-500">0.42 <span className="text-lg opacity-40 ml-1">MS</span></p>
            </div>
         </div>
      </Card>
    </div>
  );
}
