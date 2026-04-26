'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function PnLAnalysisPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPnL = async () => {
      try {
        const { data } = await api.get('/chain/pnl-analysis');
        setData(data.data);
      } catch (err) {
        console.error('Failed to fetch P&L data');
      } finally {
        setLoading(false);
      }
    };
    fetchPnL();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Analyzing Financials...</div>;

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#1b1b24] p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none mb-4">
             Financial <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-white/40 font-bold text-lg tracking-wide max-w-xl">
             Real-time Profit & Loss breakdown across all chain outlets. Comparative performance and tax liability tracking.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button variant="outline" className="bg-white/5 border-white/10 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              Last 30 Days
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-glow border-none">
              <Download className="h-5 w-5" />
              Export Report
           </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Gross Revenue', value: data.outletPerformance.reduce((a:any, b:any) => a + Number(b.gross_revenue), 0), icon: DollarSign, color: 'text-blue-500' },
           { label: 'Total Discounts', value: data.outletPerformance.reduce((a:any, b:any) => a + Number(b.total_discounts), 0), icon: ArrowDownRight, color: 'text-orange-500' },
           { label: 'Tax Liability', value: data.outletPerformance.reduce((a:any, b:any) => a + Number(b.total_tax), 0), icon: PieChart, color: 'text-red-500' },
           { label: 'Net Profit', value: data.outletPerformance.reduce((a:any, b:any) => a + Number(b.net_revenue), 0), icon: TrendingUp, color: 'text-emerald-500' },
         ].map((stat, i) => (
           <Card key={i} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all">
              <CardContent className="p-10">
                 <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl bg-secondary group-hover:bg-primary group-hover:text-white transition-all", stat.color)}>
                       <stat.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">+12.5%</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                 <h3 className="text-4xl font-black text-foreground tracking-tighter">₹{(stat.value / 100).toLocaleString()}</h3>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Comparative Bar Chart */}
         <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[3rem] p-10">
            <CardHeader className="p-0 mb-10 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-3xl font-black uppercase tracking-tight">Revenue Comparison</CardTitle>
                  <CardDescription className="text-slate-500 font-bold">Performance breakdown by individual outlet.</CardDescription>
               </div>
               <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-border px-4 py-2 rounded-xl">
                     <div className="h-2 w-2 rounded-full bg-primary" /> Net Revenue
                  </div>
               </div>
            </CardHeader>
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.outletPerformance}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="outlet_name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#1b1b24', borderRadius: '20px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: '900' }}
                       cursor={{ fill: '#f8fafc' }}
                     />
                     <Bar dataKey="net_revenue" radius={[10, 10, 10, 10]} barSize={40}>
                        {data.outletPerformance.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Category Leaderboard */}
         <Card className="lg:col-span-1 border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden flex flex-col">
            <CardHeader className="p-10 border-b border-border bg-secondary/20">
               <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-primary text-white rounded-2xl shadow-glow">
                     <Layers className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Top Categories</CardTitle>
               </div>
               <CardDescription className="text-slate-500 font-bold">Best performing food categories across chain.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6 flex-1">
               {data.categoryLeaderboard.map((cat: any, i: number) => (
                 <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                       <span className="text-2xl font-black text-slate-200 group-hover:text-primary transition-colors">#{i+1}</span>
                       <div>
                          <p className="font-black text-foreground tracking-tight">{cat.category_name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat.total_quantity} Dishes Sold</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-lg text-foreground tracking-tighter">₹{(cat.total_sales / 100).toLocaleString()}</p>
                       <div className="h-1.5 w-24 bg-secondary rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(cat.total_sales / data.categoryLeaderboard[0].total_sales) * 100}%` }} />
                       </div>
                    </div>
                 </div>
               ))}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
