'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Users, Timer, Bell, 
  CheckCircle2, XCircle, Sparkles,
  RefreshCcw, ShieldCheck, ArrowRight,
  UserPlus, Phone, Utensils,
  AlertCircle, MessageSquare, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function WaitlistPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: queue, isLoading } = useQuery({
    queryKey: ['waitlist-active'],
    queryFn: async () => {
      const { data } = await api.get('/waitlist/active');
      return data.data;
    },
  });

  const callMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/waitlist/${id}/call`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-active'] });
      toast({ title: "Guest Notified", description: "Table ready alert sent via SMS." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Sparkles className="h-4 w-4" /> Predictive Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">AI Waitlist Management</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">
              <Clock className="h-4 w-4 mr-2" /> Global Wait: 24 min
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow" onClick={() => setShowAddForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Add to Queue
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Live Queue */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Active Queue ({queue?.length || 0})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {queue?.map((entry: any, idx: number) => (
                 <Card key={entry.id} className={cn(
                   "border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all relative",
                   entry.status === 'called' ? "ring-2 ring-emerald-500" : ""
                 )}>
                    <CardContent className="p-8 space-y-6">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center font-black text-xl text-slate-400">
                                {idx + 1}
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate max-w-[150px]">{entry.customer_name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.phone}</p>
                             </div>
                          </div>
                          <Badge className="bg-secondary text-slate-400 border-none font-black text-[9px] uppercase tracking-widest">
                             {entry.party_size} Guests
                          </Badge>
                       </div>

                       <div className="flex items-center justify-between border-y border-border py-4">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Est. Wait</p>
                             <p className="text-xl font-black text-primary">{entry.estimated_wait_minutes} <span className="text-xs opacity-40">MIN</span></p>
                          </div>
                          <div className="text-right space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual In-Queue</p>
                             <p className="text-sm font-bold">12m 45s</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          {entry.status === 'called' ? (
                             <Button className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-glow-emerald">
                                <Utensils className="h-4 w-4 mr-2" /> Seat Now
                             </Button>
                          ) : (
                             <Button 
                               onClick={() => callMutation.mutate(entry.id)}
                               disabled={callMutation.isPending}
                               className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-glow"
                             >
                                <Bell className="h-4 w-4 mr-2" /> Notify Ready
                             </Button>
                          )}
                          <Button variant="outline" className="h-12 w-12 rounded-xl border-border">
                             <XCircle className="h-5 w-5 text-red-400" />
                          </Button>
                       </div>
                    </CardContent>
                    
                    {entry.status === 'called' && (
                       <div className="absolute top-0 right-0 p-4">
                          <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-widest animate-pulse">
                             Notified
                          </Badge>
                       </div>
                    )}
                 </Card>
               ))}
            </div>
         </div>

         {/* Predictive Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Queue Intelligence</h2>
            
            <Card className="border-none shadow-soft rounded-[3rem] bg-slate-900 text-white p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Timer className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Expected Releases</h3>
                  <p className="text-white/60 text-sm font-medium">Tables predicted to be free soon.</p>
               </div>

               <div className="space-y-4 relative z-10">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center font-black">T{i*4}</div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Main Hall</span>
                       </div>
                       <span className="text-emerald-400 font-black text-sm">~ {i*5 + 2}m</span>
                    </div>
                  ))}
               </div>

               <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-white/90 relative z-10 shadow-glow">
                  Optimize Seating Chart
               </Button>
            </Card>

            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-10 space-y-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Queue Flow Analysis</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest">Accuracy</span>
                     <span className="text-emerald-500 font-black">98% Precise</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[98%]" />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter leading-relaxed">
                     Your predictive accuracy is up by 12% today. Wait time estimates are within 3 minutes of actual seating times.
                  </p>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
