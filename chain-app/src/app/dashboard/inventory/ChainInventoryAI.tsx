'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BarChart3, Globe, AlertTriangle, 
  ArrowUpRight, TrendingUp, Layers 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function ChainInventoryAnalytics() {
  const { data: globalStock, isLoading } = useQuery({
    queryKey: ['global-stock'],
    queryFn: async () => {
      // In a real scenario, this would be a specific aggregated endpoint
      // For now, we simulate by fetching and aggregating (or using a new endpoint if we had one)
      const { data } = await api.get('/chain/inventory/global'); // Need to implement this
      return data.data;
    },
  });

  if (isLoading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Aggregating Global Inventory...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Risk Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 border-b border-border">
            <div className="flex items-center gap-4">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Chain-Wide Stock Risk</CardTitle>
                <CardDescription className="text-slate-500 font-bold text-base mt-1">Cross-outlet ingredient availability heatmap.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {globalStock?.map((item: any) => (
                <div key={item.name} className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-all">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="font-black text-xl text-foreground uppercase tracking-tight">{item.name}</span>
                      <Badge className={cn(
                        "font-black text-[9px] uppercase px-3 py-1",
                        item.total_stock < item.global_threshold ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                      )}>
                        {item.total_stock < item.global_threshold ? "CRITICAL" : "OPTIMAL"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Stock</p>
                          <p className="text-2xl font-black text-foreground">{item.total_stock} {item.unit}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outlets Low</p>
                          <p className="text-2xl font-black text-red-500">{item.outlets_at_risk}</p>
                       </div>
                    </div>
                    <Progress value={(item.total_stock / (item.global_threshold * 2)) * 100} className="h-2 bg-secondary" />
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</p>
                    <p className="text-xl font-black text-foreground">₹{(item.total_value_paise / 100).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Insights */}
        <div className="space-y-8">
          <Card className="border-border shadow-glow bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden">
             <CardContent className="p-10 space-y-6">
                <Layers className="h-12 w-12 text-white/30" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-white/60">Capital Locked in Stock</p>
                   <p className="text-4xl font-black tracking-tighter mt-2">₹14.2L</p>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Wastage Rate</span>
                   <span className="text-lg font-black">-12% MoM</span>
                </div>
             </CardContent>
          </Card>

          <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
             <CardHeader className="p-8 border-b border-border">
                <CardTitle className="text-lg font-black text-foreground tracking-widest uppercase">Smart Rebalancing</CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="p-6 bg-secondary/50 rounded-3xl border border-border space-y-3">
                   <div className="flex items-center gap-3">
                      <ArrowUpRight className="h-5 w-5 text-indigo-500" />
                      <p className="font-black text-foreground text-xs uppercase tracking-tight">Transfer Opportunity</p>
                   </div>
                   <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                      Outlet "Indiranagar" has 40kg excess <strong>Butter</strong> while "HSR Layout" is critical. 
                      Save ₹1,400 in procurement by rebalancing.
                   </p>
                   <Button className="w-full h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest">Auto-Rebalance</Button>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
