'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Globe, 
  CreditCard, 
  TrendingUp, 
  Users,
  Server,
  ChevronRight,
  UserX
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  useGlobalMetrics, 
  useSystemHealth, 
  useChains, 
  useSuspendChain,
  useGlobalAuditLogs,
  useRevenueTrends
} from '@/hooks/useSuperAdmin';
import OnboardChainModal from '@/components/dashboard/OnboardChainModal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function SuperAdminDashboard() {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const { data: metrics } = useGlobalMetrics();
  const { data: health } = useSystemHealth();
  const { data: chains } = useChains();
  const { data: logs } = useGlobalAuditLogs();
  const { data: trends } = useRevenueTrends();
  const suspendChain = useSuspendChain();
  const { toast } = useToast();

  const handleSuspend = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to suspend ${name}? All outlets will be deactivated.`)) {
      try {
        await suspendChain.mutateAsync(id);
        toast({ title: "Chain Suspended", description: `${name} has been successfully deactivated.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Action failed" });
      }
    }
  };

  const chartData = trends?.map((t: any) => ({
    date: new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    revenue: Number(t.total_paise) / 100
  })).reverse() || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <ShieldCheck className="h-10 w-10 text-primary" />
             </div>
             Adruva HQ
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Global System Control & Multi-Tenant Oversight.</p>
        </div>
        <div className="flex gap-6">
           <div className="flex items-center gap-4 px-8 py-5 bg-secondary/50 border border-border rounded-3xl shadow-inner group hover:bg-secondary transition-all">
              <Activity className="h-6 w-6 text-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">API Status</span>
                <span className="text-sm font-black tracking-tight text-emerald-500">{health?.api.toUpperCase() || 'OFFLINE'}</span>
              </div>
           </div>
           <div className="flex items-center gap-4 px-8 py-5 bg-secondary/50 border border-border rounded-3xl shadow-inner group hover:bg-secondary transition-all">
              <Database className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">DB Status</span>
                <span className="text-sm font-black tracking-tight text-primary">{health?.database.toUpperCase() || 'OFFLINE'}</span>
              </div>
           </div>
        </div>
      </div>

       {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Global Revenue', value: `₹${(metrics?.totalRevenue / 100 || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Total Chains', value: metrics?.chains || 0, icon: Globe, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Total Outlets', value: metrics?.outlets || 0, icon: Server, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Users', value: metrics?.customers || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat) => (
          <Card key={stat.title} className="border border-border bg-card rounded-[2.5rem] shadow-soft hover:-translate-y-2 transition-all cursor-pointer overflow-hidden group">
            <CardContent className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div className={cn("p-5 rounded-[1.5rem] shadow-inner", stat.bg)}>
                   <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
                <Badge className="bg-secondary text-slate-500 border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all px-4 py-1.5 font-black tracking-widest uppercase text-[10px] rounded-xl">Global</Badge>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.title}</p>
              <p className="text-5xl font-black tracking-tighter text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics & Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trends */}
        <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col p-10">
           <div className="flex justify-between items-end mb-10">
              <div>
                 <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Platform Performance</h3>
                 <p className="text-slate-500 font-bold text-sm tracking-wide">Daily aggregate revenue trends across all multi-tenant nodes.</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Index</p>
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black px-4 py-1.5">+12.5%</Badge>
              </div>
           </div>
           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                       itemStyle={{ fontWeight: 'black', color: '#2563eb' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Global Audit Feed */}
        <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col">
           <CardHeader className="p-10 pb-6 border-b border-border bg-secondary/10">
              <CardTitle className="text-2xl font-black text-foreground flex items-center gap-4 tracking-tighter uppercase">
                 <div className="p-3 bg-card border border-border rounded-2xl shadow-glow">
                    <Activity className="h-6 w-6 text-primary" />
                 </div>
                 Operations Stream
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
              <div className="divide-y divide-border">
                 {logs?.map((log: any) => (
                   <div key={log.id} className="p-6 hover:bg-secondary/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{log.event_type}</span>
                         <span className="text-[9px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">{log.details}</p>
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-border text-slate-500 py-0.5">{log.outlet_name || 'Global'}</Badge>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">by {log.actor_name}</span>
                      </div>
                   </div>
                 ))}
                 {(!logs || logs.length === 0) && (
                   <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for events...</div>
                 )}
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px]">
          <CardHeader className="p-10 pb-6 shrink-0 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Enterprise Entities</CardTitle>
                <CardDescription className="text-slate-500 font-bold text-base mt-2">Comprehensive list of all registered business entities.</CardDescription>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[11px] transition-all shadow-glow border-none"
                onClick={() => setIsOnboardModalOpen(true)}
              >
                Provision New Chain
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-secondary/30 hover:bg-secondary/30 h-20">
                  <TableHead className="px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Chain Identity</TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Footprint</TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Tier</TableHead>
                  <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Onboarded</TableHead>
                  <TableHead className="text-right px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Governance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chains?.map((chain: any) => (
                  <TableRow key={chain.id} className="border-b border-border hover:bg-secondary/50 transition-all cursor-pointer group h-28">
                    <TableCell className="px-10">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-[1.25rem] flex items-center justify-center font-black text-primary text-xl shadow-inner border border-primary/10 group-hover:rotate-6">
                             {chain.name[0]}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="font-black tracking-tighter text-foreground text-lg group-hover:text-primary transition-colors">{chain.name}</span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{chain.owner_email}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="font-black text-slate-500 text-sm uppercase tracking-wider">{chain.outlet_count} active nodes</TableCell>
                    <TableCell>
                       <Badge className={cn(
                         "px-4 py-2 font-black tracking-widest uppercase text-[10px] border border-border shadow-inner rounded-xl",
                         chain.status === 'active' || chain.status === 'trial' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                       )}>
                         {chain.status?.toUpperCase() || 'EXPIRED'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-black text-slate-500 tracking-tighter">
                       {new Date(chain.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-2xl h-12 w-12 border border-transparent hover:border-destructive/20"
                            onClick={(e) => { e.stopPropagation(); handleSuspend(chain.id, chain.name); }}
                          >
                            <UserX className="h-6 w-6" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-secondary rounded-2xl h-12 w-12 border border-transparent hover:border-border">
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-8 flex flex-col">
            <Card className="border border-primary/20 bg-primary/5 shadow-soft rounded-[2.5rem] text-foreground overflow-hidden relative">
               <div className="absolute top-0 right-0 h-64 w-64 bg-primary rounded-full opacity-10 blur-[80px] -translate-y-32 translate-x-32" />
               <CardHeader className="p-10 pb-6 relative z-10">
                  <CardTitle className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase">
                     <div className="p-3 bg-card border border-border rounded-2xl shadow-glow">
                       <CreditCard className="h-6 w-6 text-primary" />
                     </div>
                     Subscription Mix
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-10 pt-0 relative z-10">
                  <div className="space-y-8">
                     {metrics?.subscriptions?.map((sub: any) => (
                       <div key={sub.plan_name} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                             <div className="h-3 w-3 rounded-full bg-primary shadow-glow group-hover:scale-125 transition-transform" />
                             <span className="font-black text-slate-500 uppercase tracking-widest text-[11px]">{sub.plan_name} Tier</span>
                          </div>
                          <span className="font-black text-3xl tracking-tighter text-foreground">{sub.count}</span>
                       </div>
                     ))}
                     {(!metrics?.subscriptions || metrics.subscriptions.length === 0) && (
                       <p className="text-slate-500 text-sm font-black uppercase tracking-widest text-center py-6">No entities detected.</p>
                     )}
                  </div>
                  <Button className="w-full mt-10 bg-foreground text-background hover:bg-foreground/90 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-soft border-none">
                     Manage Pricing Tiers
                  </Button>
               </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex-1">
               <CardHeader className="p-10 pb-6">
                  <CardTitle className="text-2xl font-black text-foreground flex items-center gap-4 tracking-tighter uppercase">
                    <div className="p-3 bg-blue-500/10 rounded-2xl shadow-inner border border-blue-500/20">
                       <Server className="h-6 w-6 text-blue-500" />
                    </div>
                    Engine Health
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-10 pt-0 space-y-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Allocation</span>
                        <span className="font-black text-foreground text-2xl tracking-tighter">{Math.round(health?.memory?.rss / 1024 / 1024) || 0} <span className="text-xs text-slate-500 ml-1">MB</span></span>
                     </div>
                     <div className="h-4 w-full bg-secondary rounded-full overflow-hidden shadow-inner border border-border">
                        <div className="h-full bg-primary rounded-full shadow-glow transition-all duration-1000" style={{width: '35%'}} />
                     </div>
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                     <div className="h-14 flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.25rem] flex items-center justify-center gap-3 shadow-inner">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Uptime: {Math.round(health?.uptime / 3600) || 0}H Continuous</span>
                     </div>
                  </div>
               </CardContent>
            </Card>
        </div>
      </div>

      <OnboardChainModal 
        open={isOnboardModalOpen} 
        onOpenChange={setIsOnboardModalOpen} 
      />
    </div>
  );
}
