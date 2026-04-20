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
  useSuspendChain 
} from '@/hooks/useSuperAdmin';
import OnboardChainModal from '@/components/dashboard/OnboardChainModal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const { data: metrics, isLoading: metricsLoading } = useGlobalMetrics();
  const { data: health } = useSystemHealth();
  const { data: chains } = useChains();
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

  return (
    <div className="min-h-screen bg-background p-8 space-y-8 font-sans text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-8 rounded-[2.5rem] shadow-none border border-border/10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl">
               <ShieldCheck className="h-8 w-8 text-primary" />
             </div>
             Adruva SaaS HQ
          </h1>
          <p className="text-muted-foreground font-bold mt-2 ml-1 tracking-wide">Global System Control & Multi-Tenant Oversight.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-6 py-4 bg-background border border-border/10 rounded-[1.5rem] shadow-none">
              <Activity className="h-5 w-5 text-green-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">API Status</span>
                <span className="text-sm font-black tracking-tight text-foreground">{health?.api.toUpperCase() || 'OFFLINE'}</span>
              </div>
           </div>
           <div className="flex items-center gap-3 px-6 py-4 bg-background border border-border/10 rounded-[1.5rem] shadow-none">
              <Database className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">DB Status</span>
                <span className="text-sm font-black tracking-tight text-foreground">{health?.database.toUpperCase() || 'OFFLINE'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Global Revenue', value: `₹${(metrics?.totalRevenue / 100 || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Total Chains', value: metrics?.chains || 0, icon: Globe, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Total Outlets', value: metrics?.outlets || 0, icon: Server, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Registered Users', value: metrics?.customers || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat) => (
          <Card key={stat.title} className="border border-border/10 bg-card rounded-[2rem] shadow-none hover:-translate-y-1 transition-transform cursor-pointer overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl shadow-none", stat.bg)}>
                  <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
                <Badge className="bg-background text-muted-foreground border border-border/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors px-3 py-1 font-black tracking-widest uppercase text-[10px]">Global</Badge>
              </div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
              <p className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-border/10 bg-card shadow-none rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4 shrink-0 border-b border-border/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black text-foreground">Restaurant Chains</CardTitle>
                <CardDescription className="text-muted-foreground font-bold mt-1">Comprehensive list of all registered business entities.</CardDescription>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-black uppercase tracking-widest text-xs transition-all shadow-[0_8px_32px_rgba(79,70,229,0.2)]"
                onClick={() => setIsOnboardModalOpen(true)}
              >
                Add New Chain
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/10 hover:bg-transparent">
                  <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Chain Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Outlets</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Subscription</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Created At</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chains?.map((chain: any) => (
                  <TableRow key={chain.id} className="border-b border-border/5 hover:bg-secondary/50 transition-colors cursor-pointer group">
                    <TableCell className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-2xl flex items-center justify-center font-black text-primary text-lg">
                             {chain.name[0]}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black tracking-tight text-foreground">{chain.name}</span>
                            <span className="text-[11px] font-bold text-muted-foreground">{chain.owner_email}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="font-bold text-muted-foreground">{chain.outlet_count} active</TableCell>
                    <TableCell>
                       <Badge className={cn(
                         "px-3 py-1 font-black tracking-widest uppercase text-[10px] border border-border/10 shadow-sm",
                         chain.status === 'active' || chain.status === 'trial' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                       )}>
                         {chain.status?.toUpperCase() || 'EXPIRED'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-muted-foreground">
                       {new Date(chain.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10"
                            onClick={(e) => { e.stopPropagation(); handleSuspend(chain.id, chain.name); }}
                          >
                            <UserX className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl h-10 w-10">
                            <ChevronRight className="h-5 w-5" />
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
           <Card className="border border-primary/20 bg-primary/5 shadow-none rounded-[2.5rem] text-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 h-48 w-48 bg-primary rounded-full opacity-10 blur-[50px] -translate-y-10 translate-x-10" />
              <CardHeader className="p-8 relative z-10">
                 <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="p-2.5 bg-card border border-border/10 rounded-xl shadow-none">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    Subscription Mix
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 relative z-10">
                 <div className="space-y-6">
                    {metrics?.subscriptions?.map((sub: any) => (
                      <div key={sub.plan_name} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="font-bold text-muted-foreground capitalize">{sub.plan_name}</span>
                         </div>
                         <span className="font-black text-2xl tracking-tighter text-foreground">{sub.count}</span>
                      </div>
                    ))}
                    {(!metrics?.subscriptions || metrics.subscriptions.length === 0) && (
                      <p className="text-muted-foreground text-sm font-bold text-center py-4">No active subscriptions found.</p>
                    )}
                 </div>
                 <Button className="w-full mt-8 bg-foreground text-background hover:bg-foreground/90 h-14 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                    Manage Plans
                 </Button>
              </CardContent>
           </Card>

           <Card className="border border-border/10 bg-card shadow-none rounded-[2.5rem] overflow-hidden flex-1">
              <CardHeader className="p-8 pb-6">
                 <CardTitle className="text-xl font-black text-foreground flex items-center gap-3">
                   <div className="p-2.5 bg-blue-500/10 rounded-xl shadow-none border border-blue-500/20">
                      <Server className="h-5 w-5 text-blue-500" />
                   </div>
                   System Health
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Memory Usage</span>
                       <span className="font-black text-foreground">{Math.round(health?.memory?.rss / 1024 / 1024) || 0} <span className="text-xs text-muted-foreground">MB</span></span>
                    </div>
                    <div className="h-3 w-full bg-background border border-border/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: '35%'}} />
                    </div>
                 </div>
                 <div className="pt-2 flex items-center gap-3">
                    <div className="h-10 flex-1 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                       <span className="text-xs font-black uppercase tracking-widest text-green-500">Uptime: {Math.round(health?.uptime / 3600) || 0}H</span>
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
