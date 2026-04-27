'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  PieChart, BarChart3, ArrowUpRight, 
  ArrowDownRight, Sparkles, Brain,
  Calendar, Info, AlertTriangle,
  Wallet, Layers, Target, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function PnLPage() {
  const { data: pnl, isLoading } = useQuery({
    queryKey: ['live-pnl'],
    queryFn: async () => {
      const { data } = await api.get('/finance/pnl/live');
      return data.data;
    },
  });

  const { data: projections } = useQuery({
    queryKey: ['financial-projections'],
    queryFn: async () => {
      const { data } = await api.get('/finance/projections/cashflow');
      return data.data;
    },
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
            <Activity className="h-4 w-4" /> Financial Health
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Profit & Loss Center</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Monthly Snapshots</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <BarChart3 className="h-4 w-4 mr-2" /> Download Full Report
           </Button>
        </div>
      </div>

      {/* P&L Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <ArrowUpRight className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {formatCurrency(pnl?.revenue || 0, 'INR', 'en-IN')}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                 <Layers className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct COGS</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {formatCurrency(pnl?.cogs || 0, 'INR', 'en-IN')}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                 <Wallet className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Overheads</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {formatCurrency(pnl?.overheads || 0, 'INR', 'en-IN')}
              </span>
           </CardContent>
        </Card>

        <Card className={cn(
          "border-none shadow-soft rounded-[2rem] overflow-hidden",
          pnl?.net_profit >= 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        )}>
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <Target className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Net Profit</span>
              <span className="text-4xl font-black tracking-tighter">
                 {formatCurrency(pnl?.net_profit || 0, 'INR', 'en-IN')}
              </span>
           </CardContent>
        </Card>
      </div>

      {/* Waterfall & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">P&L Waterfall Breakdown</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-10 space-y-8">
               <div className="space-y-6">
                  {/* Revenue Bar */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span>Gross Revenue</span>
                        <span>100%</span>
                     </div>
                     <div className="h-6 bg-emerald-500 rounded-xl shadow-glow-sm" />
                  </div>
                  {/* COGS Bar */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-black uppercase tracking-widest text-red-500">
                        <span>COGS (Food Cost)</span>
                        <span>{((pnl?.cogs / pnl?.revenue) * 100).toFixed(1)}%</span>
                     </div>
                     <div className="h-6 bg-red-500/20 rounded-xl overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(pnl?.cogs / pnl?.revenue) * 100}%` }} />
                     </div>
                  </div>
                  {/* Overheads Bar */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-black uppercase tracking-widest text-indigo-500">
                        <span>Operating Overheads</span>
                        <span>{((pnl?.overheads / pnl?.revenue) * 100).toFixed(1)}%</span>
                     </div>
                     <div className="h-6 bg-indigo-500/20 rounded-xl overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(pnl?.overheads / pnl?.revenue) * 100}%` }} />
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-secondary/50 rounded-2xl flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Margin</p>
                     <p className="text-3xl font-black text-foreground">{pnl?.margin_percent.toFixed(1)}%</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs">Healthy</Badge>
               </div>
            </Card>
         </div>

         <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
               <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">AI Cash Flow Projection</h2>
               <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">Beta</Badge>
            </div>
            <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 h-full flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Brain className="h-40 w-40" />
               </div>
               
               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight">14-Day Outlook</h3>
                  <p className="text-white/60 text-sm font-medium">AI analysis of recurring expenses vs. historical sales volume.</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black tracking-tighter text-emerald-400">+₹1,24,000</span>
                     <span className="text-white/40 font-bold uppercase text-xs tracking-widest">Expected Surplus</span>
                  </div>
                  
                  <div className="flex gap-4">
                     <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Peak Day</p>
                        <p className="text-sm font-bold uppercase">Sunday (May 03)</p>
                     </div>
                     <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Risk Level</p>
                        <p className="text-sm font-bold uppercase text-emerald-400">Low</p>
                     </div>
                  </div>
               </div>

               <Button className="w-full h-14 rounded-2xl bg-white text-indigo-900 font-black uppercase tracking-widest text-xs relative z-10 hover:bg-white/90">
                  Analyze Burn Rate
               </Button>
            </Card>
         </div>

      </div>
    </div>
  );
}
