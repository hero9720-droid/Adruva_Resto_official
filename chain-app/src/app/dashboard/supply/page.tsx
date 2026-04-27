'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Truck, Package, Factory, 
  ArrowRightLeft, AlertCircle, CheckCircle2,
  Boxes, Calendar, MapPin, Search,
  ChevronRight, Plus, Filter, ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CentralSupplyDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: supply, isLoading } = useQuery({
    queryKey: ['central-supply-overview'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/supply/overview');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Truck className="h-4 w-4" /> Internal Logistics
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Central Supply Hub</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Logistics Network</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Factory className="h-4 w-4 mr-2" /> New Production Batch
           </Button>
        </div>
      </div>

      {/* Supply KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Boxes className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Indents</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {supply?.indents.length || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-indigo-600 text-white overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <Factory className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">In Production</span>
              <span className="text-4xl font-black tracking-tighter">
                 {supply?.activeBatches.length || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <MapPin className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Kitchens</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {supply?.kitchens.length || 0}
              </span>
           </CardContent>
        </Card>
      </div>

      {/* Main Supply Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Pending Requests */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Satellite Requests</h2>
            <div className="space-y-4">
               {supply?.indents.map((indent: any) => (
                 <Card key={indent.id} className="border-none shadow-soft rounded-[2.5rem] bg-card hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between gap-6">
                       <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                             <Package className="h-7 w-7 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-black text-foreground uppercase tracking-tight truncate">{indent.item_name}</h4>
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest">From: {indent.requesting_outlet}</p>
                          </div>
                       </div>
                       
                       <div className="text-right shrink-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Required</p>
                          <p className="text-xl font-black text-foreground">{indent.quantity} Units</p>
                       </div>

                       <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-secondary">
                          <ChevronRight className="h-5 w-5 text-slate-300" />
                       </Button>
                    </CardContent>
                 </Card>
               ))}
               {supply?.indents.length === 0 && (
                 <div className="h-40 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 gap-2">
                    <ClipboardList className="h-8 w-8" />
                    <p className="text-xs font-black uppercase tracking-widest">No pending indents</p>
                 </div>
               )}
            </div>
         </div>

         {/* Production Planning */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Live Production Batches</h2>
            <div className="space-y-4">
               {supply?.activeBatches.map((batch: any) => (
                 <Card key={batch.id} className="border-none shadow-soft rounded-[2.5rem] bg-card p-1">
                    <div className="bg-secondary/20 p-8 rounded-[2.4rem] space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{batch.item_name}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Batch ID: {batch.id.split('-')[0]}</p>
                          </div>
                          <Badge className={cn(
                            "h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest shadow-sm",
                            batch.status === 'in_production' ? "bg-amber-500 text-white" : "bg-indigo-500 text-white"
                          )}>
                             {batch.status}
                          </Badge>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span>Progress</span>
                             <span>75%</span>
                          </div>
                          <div className="h-3 bg-white rounded-full overflow-hidden border border-border">
                             <div className="h-full bg-primary w-3/4 shadow-glow-sm" />
                          </div>
                       </div>

                       <div className="flex justify-between items-end">
                          <div className="flex gap-6">
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned</p>
                                <p className="text-lg font-black text-foreground">{batch.quantity_planned} {batch.unit}</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Started</p>
                                <p className="text-lg font-black text-foreground">10:30 AM</p>
                             </div>
                          </div>
                          <Button className="h-10 px-6 rounded-xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest">
                             Dispatch Batch
                          </Button>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
}
