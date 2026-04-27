'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Users, Heart, Zap, ShieldAlert,
  ArrowUpRight, Mail, MessageSquare, 
  Sparkles, Brain, History, Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOutletProfile } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export default function CRMPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['crm-insights'],
    queryFn: async () => {
      const { data } = await api.get('/crm/insights');
      return data.data;
    },
  });

  const runSegmentation = useMutation({
    mutationFn: async () => {
      await api.post('/crm/segmentation/run');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-insights'] });
      toast({ title: "Intelligence Updated", description: "Customer segments refreshed based on behavior." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Brain className="h-4 w-4" /> Marketing Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Advanced CRM Dashboard</h1>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-glow"
          onClick={() => runSegmentation.mutate()}
          disabled={runSegmentation.isPending}
        >
          <Sparkles className="h-4 w-4 mr-2 fill-current" /> Refresh Behavioral Segments
        </Button>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Users className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reach</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {insights?.segments.reduce((acc: any, s: any) => acc + parseInt(s.count), 0) || 0}
              </span>
           </CardContent>
        </Card>
        
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <Zap className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention Rate</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {insights?.retentionRate.toFixed(1)}%
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-indigo-600 text-white overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <Heart className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">VIP Customers</span>
              <span className="text-4xl font-black tracking-tighter">
                 {insights?.segments.find((s: any) => s.segment === 'vip')?.count || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-amber-500 text-white overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">At-Risk (30d+)</span>
              <span className="text-4xl font-black tracking-tighter">
                 {insights?.segments.find((s: any) => s.segment === 'at_risk')?.count || 0}
              </span>
           </CardContent>
        </Card>
      </div>

      {/* Campaigns Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Automated Flows</h2>
            <div className="space-y-4">
               {[
                 { title: 'Birthday Surprise', desc: 'Gift 500 points on birth date', icon: Gift, color: 'bg-pink-500', active: true },
                 { title: 'Win-Back Sequence', desc: 'SMS if inactive for 45 days', icon: Zap, color: 'bg-amber-500', active: false },
                 { title: 'VIP Exclusive', desc: 'Invite to secret menu if spend > 10k', icon: CrownIcon, color: 'bg-indigo-600', active: true }
               ].map((f, i) => (
                 <Card key={i} className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden group hover:scale-[1.01] transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white", f.color)}>
                             <f.icon className="h-7 w-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-foreground uppercase tracking-tight">{f.title}</h4>
                             <p className="text-[11px] font-bold text-slate-500">{f.desc}</p>
                          </div>
                       </div>
                       <Badge className={cn("h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest", f.active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-400")}>
                          {f.active ? 'Running' : 'Paused'}
                       </Badge>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Smart Engagement</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-card h-full flex flex-col items-center justify-center p-12 text-center border border-border">
               <div className="h-20 w-20 bg-secondary rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-primary" />
               </div>
               <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase mb-2">Campaign Blast Tool</h3>
               <p className="text-slate-500 font-medium text-sm mb-8 max-w-sm">
                  Send personalized WhatsApp or SMS updates to specific segments (e.g., "Alert all VIPs about new Lobster menu").
               </p>
               <Button className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs bg-foreground text-background hover:bg-slate-800">
                  Compose Message
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
}
