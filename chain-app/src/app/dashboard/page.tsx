'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Plus, 
  RefreshCw, 
  ChevronRight,
  ArrowUpRight,
  Store,
  MapPin,
  Zap
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
import { useChainMetrics } from '@/hooks/useChain';
import SyncMenuModal from '@/components/dashboard/SyncMenuModal';
import { cn } from '@/lib/utils';

export default function ChainDashboard() {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const { data: chainData, isLoading } = useChainMetrics();

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 space-y-12 bg-background font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <Building2 className="h-10 w-10 text-primary" />
             </div>
             Brand Command Center
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-3 ml-2 tracking-wide leading-relaxed">Consolidated performance across your restaurant empire.</p>
        </div>
         <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="bg-card border-border shadow-soft hover:bg-secondary text-foreground font-black uppercase tracking-widest text-xs h-14 px-8 rounded-2xl transition-all"
             onClick={() => setIsSyncModalOpen(true)}
           >
              <RefreshCw className="h-5 w-5 mr-3 text-primary" />
              Push Master Menu
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs h-14 px-8 rounded-2xl transition-all shadow-glow border-none">
              <Plus className="h-5 w-5 mr-3" />
              Onboard Outlet
           </Button>
        </div>
      </div>

       {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Total Revenue', value: `₹${(chainData?.metrics?.total_revenue / 100 || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Active Outlets', value: chainData?.metrics?.total_outlets || 0, icon: Store, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Total Orders', value: chainData?.metrics?.total_orders || 0, icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat) => (
          <Card key={stat.title} className="border border-border bg-card shadow-soft hover:-translate-y-1 transition-transform cursor-pointer group overflow-hidden rounded-[2.5rem]">
            <CardContent className="p-10">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{stat.title}</p>
                   <p className="text-5xl font-black text-foreground tracking-tighter">{stat.value}</p>
                </div>
                <div className={cn("p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-inner", stat.bg)}>
                   <stat.icon className={cn("h-10 w-10", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="p-10 pb-6 shrink-0 border-b border-border">
            <div className="flex justify-between items-center">
               <div>
                  <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Outlet Performance</CardTitle>
                  <CardDescription className="text-slate-500 font-bold text-base mt-2">Real-time revenue breakdown per branch.</CardDescription>
               </div>
               <Badge className="bg-primary/10 text-primary border-none px-4 py-2 font-black tracking-widest uppercase text-[10px] rounded-xl">Top Performers</Badge>
            </div>
          </CardHeader>
           <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 border-b border-border hover:bg-secondary/30 h-16">
                  <TableHead className="px-10 font-black uppercase tracking-widest text-slate-500 text-[11px]">Branch Name</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-slate-500 text-[11px]">Location</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-slate-500 text-[11px]">Status</TableHead>
                  <TableHead className="text-right px-10 font-black uppercase tracking-widest text-slate-500 text-[11px]">Revenue</TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                {chainData?.outletSales?.map((outlet: any) => (
                  <TableRow key={outlet.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors group cursor-pointer h-24">
                    <TableCell className="px-10">
                       <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-2xl flex items-center justify-center font-black text-primary text-xl shadow-inner group-hover:scale-105">
                             {outlet.name[0]}
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="font-black tracking-tight text-foreground text-lg">{outlet.name}</span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {outlet.id.slice(0,8)}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <MapPin className="h-4 w-4 text-primary/60" /> Maharashtra, India
                       </span>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn(
                         "px-4 py-1.5 font-black tracking-widest uppercase text-[10px] border-none shadow-sm rounded-xl",
                         outlet.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                       )}>
                          {outlet.status.toUpperCase()}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10 font-black text-foreground text-2xl tracking-tighter">
                       ₹{(outlet.revenue / 100).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-8 flex flex-col">
           <Card className="border border-primary/20 bg-primary/5 shadow-soft rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary rounded-full opacity-10 blur-[80px] -translate-y-32 translate-x-32" />
              <CardHeader className="p-10 pb-6 relative z-10">
                 <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-glow">
                    <Zap className="h-8 w-8 text-primary-foreground" />
                 </div>
                 <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">Master Menu Sync</CardTitle>
                 <CardDescription className="text-slate-500 font-bold text-base mt-2">Centralized control for all locations.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-8 relative z-10">
                 <div className="p-8 bg-card rounded-[1.5rem] border border-border shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Version</span>
                       <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg">LATEST</Badge>
                    </div>
                    <p className="text-3xl font-black tracking-tighter text-foreground">v2.4.0 <span className="text-primary text-sm font-black uppercase tracking-widest ml-2">Standard</span></p>
                 </div>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Pushing updates ensures all outlets follow the same pricing, inventory rules, and brand guidelines across your empire.
                 </p>
                 <Button 
                   className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-glow border-none"
                   onClick={() => setIsSyncModalOpen(true)}
                 >
                    Sync to 24 Outlets
                 </Button>
              </CardContent>
           </Card>
 
           <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group flex-1">
              <CardHeader className="p-10 pb-6">
                 <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">Brand Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                 <div className="flex items-center gap-6 p-8 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                    <div className="p-4 bg-card rounded-2xl border border-border group-hover:scale-105 transition-transform"><ArrowUpRight className="h-8 w-8 text-emerald-500" /></div>
                    <div>
                       <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Weekly Momentum</p>
                       <p className="text-5xl font-black text-emerald-500 tracking-tighter">+12.5%</p>
                    </div>
                 </div>
                 <p className="text-sm text-slate-500 mt-8 px-2 font-medium leading-relaxed">
                    Your <span className="text-primary font-black">"Mumbai HQ"</span> outlet contributed to 45% of the total revenue this week.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>

      <SyncMenuModal 
        open={isSyncModalOpen} 
        onOpenChange={setIsSyncModalOpen} 
      />
    </div>
  );
}
