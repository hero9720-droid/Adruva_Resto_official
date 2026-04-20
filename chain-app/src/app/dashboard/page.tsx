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
    <div className="min-h-screen bg-background p-8 space-y-8 font-sans text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-8 rounded-[2.5rem] shadow-none border border-border/10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl">
               <Building2 className="h-8 w-8 text-primary" />
             </div>
             Brand Command Center
          </h1>
          <p className="text-muted-foreground font-bold mt-2 ml-1 tracking-wide">Consolidated performance across your restaurant empire.</p>
        </div>
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="bg-card border-border/20 shadow-none hover:bg-secondary text-foreground font-black uppercase tracking-widest text-xs h-12 px-6 rounded-xl transition-all"
             onClick={() => setIsSyncModalOpen(true)}
           >
              <RefreshCw className="h-4 w-4 mr-2 text-primary" />
              Push Master Menu
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs h-12 px-6 rounded-xl transition-all shadow-[0_8px_32px_rgba(79,70,229,0.2)]">
              <Plus className="h-4 w-4 mr-2" />
              Onboard Outlet
           </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Total Revenue', value: `₹${(chainData?.metrics?.total_revenue / 100 || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Active Outlets', value: chainData?.metrics?.total_outlets || 0, icon: Store, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Total Orders', value: chainData?.metrics?.total_orders || 0, icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat) => (
          <Card key={stat.title} className="border border-border/10 bg-card shadow-none hover:-translate-y-1 transition-transform cursor-pointer group overflow-hidden rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                   <p className="text-4xl font-black text-foreground tracking-tighter mt-2">{stat.value}</p>
                </div>
                <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-none", stat.bg)}>
                   <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-border/10 bg-card shadow-none rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4 shrink-0 border-b border-border/5">
            <div className="flex justify-between items-center">
               <div>
                  <CardTitle className="text-2xl font-black text-foreground">Outlet Performance</CardTitle>
                  <CardDescription className="text-muted-foreground font-bold mt-1">Real-time revenue breakdown per branch.</CardDescription>
               </div>
               <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-black tracking-widest uppercase text-[10px]">Top Performers</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/10 hover:bg-transparent">
                  <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Branch Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Location</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Status</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chainData?.outletSales?.map((outlet: any) => (
                  <TableRow key={outlet.id} className="border-b border-border/5 hover:bg-secondary/50 transition-colors group cursor-pointer">
                    <TableCell className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-2xl flex items-center justify-center font-black text-primary text-lg">
                             {outlet.name[0]}
                          </div>
                          <div className="flex flex-col gap-0.5">
                             <span className="font-black tracking-tight text-foreground">{outlet.name}</span>
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">ID: {outlet.id.slice(0,8)}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                          <MapPin className="h-4 w-4 text-muted-foreground" /> Maharashtra, India
                       </span>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn(
                         "px-3 py-1 font-black tracking-widest uppercase text-[10px] border border-border/10 shadow-sm",
                         outlet.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                       )}>
                          {outlet.status.toUpperCase()}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8 font-black text-foreground text-xl tracking-tighter">
                       ₹{(outlet.revenue / 100).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-8 flex flex-col">
           <Card className="border border-primary/20 bg-primary/5 shadow-none rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 h-48 w-48 bg-primary rounded-full opacity-10 blur-[50px] -translate-y-20 translate-x-20" />
              <CardHeader className="p-8 pb-4 relative z-10">
                 <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-none">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                 </div>
                 <CardTitle className="text-xl font-black text-foreground">Master Menu Sync</CardTitle>
                 <CardDescription className="text-muted-foreground font-bold mt-1">Centralized control for all locations.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6 relative z-10">
                 <div className="p-6 bg-card rounded-2xl border border-border/10 shadow-none">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Version</span>
                       <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black tracking-widest uppercase px-2 py-0.5">LATEST</Badge>
                    </div>
                    <p className="text-xl font-black tracking-tighter text-foreground">v2.4.0 (Global)</p>
                 </div>
                 <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                    Pushing updates ensures all outlets follow the same pricing and brand guidelines.
                 </p>
                 <Button 
                   className="w-full bg-foreground text-background hover:bg-foreground/90 h-14 rounded-xl font-black uppercase tracking-widest text-xs transition-colors mt-2"
                   onClick={() => setIsSyncModalOpen(true)}
                 >
                    Sync to Outlets
                 </Button>
              </CardContent>
           </Card>

           <Card className="border border-border/10 bg-card shadow-none rounded-[2.5rem] overflow-hidden group flex-1">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-xl font-black text-foreground">Brand Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                 <div className="flex items-center gap-5 p-6 bg-green-500/10 rounded-[1.5rem] border border-green-500/20 group-hover:bg-green-500/20 transition-colors shadow-none">
                    <div className="p-3 bg-card rounded-xl border border-border/10"><ArrowUpRight className="h-6 w-6 text-green-500" /></div>
                    <div>
                       <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Revenue Growth</p>
                       <p className="text-3xl font-black text-green-500 tracking-tighter">+12.5%</p>
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground mt-6 px-2 font-bold leading-relaxed">
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
