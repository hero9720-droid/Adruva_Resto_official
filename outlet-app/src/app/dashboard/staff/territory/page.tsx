'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Map, Globe, TrendingUp, 
  AlertTriangle, CheckSquare, ListTodo,
  ArrowUpRight, Users, Building, ClipboardCheck,
  Search, Filter, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function TerritoryDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: territory, isLoading } = useQuery({
    queryKey: ['territory-overview'],
    queryFn: async () => {
      const { data } = await api.get('/staff/territory/overview');
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
            <Globe className="h-4 w-4" /> Area Oversight
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Territory Command Center</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Schedule Visits</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <ClipboardCheck className="h-4 w-4 mr-2" /> New Field Audit
           </Button>
        </div>
      </div>

      {/* Territory KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Building className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed Units</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {territory?.outlets.length || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Territory Revenue (30d)</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {formatCurrency(territory?.summary.total_revenue || 0, 'INR', 'en-IN')}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                 <ListTodo className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Escalations</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 0
              </span>
           </CardContent>
        </Card>
      </div>

      {/* Outlet Performance List */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Cluster Performance Feed</h2>
        <div className="space-y-4">
          {territory?.outlets.map((outlet: any) => (
            <Card key={outlet.id} className="border-none shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all bg-card border border-transparent hover:border-primary/20">
              <CardContent className="p-8 flex items-center justify-between gap-8">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                    <Building className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight text-foreground uppercase truncate">{outlet.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Operational</p>
                  </div>
                </div>

                <div className="flex items-center gap-12 shrink-0">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders (30d)</p>
                      <p className="text-xl font-black text-foreground">{outlet.order_count}</p>
                   </div>
                   
                   <div className="text-right">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Revenue</p>
                      <p className="text-2xl font-black text-primary">
                         {formatCurrency(outlet.revenue, 'INR', 'en-IN')}
                      </p>
                   </div>

                   <div className="bg-emerald-500/5 px-4 py-2 rounded-xl text-center border border-emerald-500/10">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">LTM Score</p>
                      <p className="text-xl font-black text-emerald-500">92</p>
                   </div>

                   <Button variant="ghost" className="h-12 w-12 rounded-xl p-0 hover:bg-secondary">
                      <ExternalLink className="h-5 w-5 text-slate-300" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
