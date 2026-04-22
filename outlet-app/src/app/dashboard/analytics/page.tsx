'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Flame,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7days');
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const { data } = await api.get('/analytics/sales-overview', { params: { period } });
      return data.data;
    },
    retry: 1,
  });

  const { data: topItems } = useQuery({
    queryKey: ['analytics', 'top-items'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-items');
      return data.data;
    },
    retry: 1,
  });

  if (isLoading) return (
    <div className="p-8 space-y-4 animate-pulse bg-background">
      <div className="h-8 w-48 bg-secondary rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-card border border-border rounded-3xl" />)}
      </div>
      <div className="h-64 bg-card border border-border rounded-3xl" />
    </div>
  );

  if (isError) return (
    <div className="p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[60vh] bg-background">
      <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
        <TrendingDown className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Analytics unavailable</h2>
      <p className="text-slate-500">Could not load analytics data. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 bg-background font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
            PERFORMANCE
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Data-driven insights for operational excellence.</p>
        </div>
        <div className="flex gap-2 bg-card p-2 rounded-[1.5rem] shadow-soft border border-border">
           {['7days', '30days', '90days'].map((p) => (
             <Button
              key={p}
              variant="ghost"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-xl px-6 h-10 font-black text-xs transition-all tracking-widest uppercase",
                period === p 
                  ? "bg-foreground text-background shadow-lg shadow-black/10 hover:bg-foreground/90" 
                  : "text-slate-500 hover:bg-secondary hover:text-foreground"
              )}
             >
               {p}
             </Button>
           ))}
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Today's Revenue" 
          value={`₹${((analytics?.today?.total_revenue || 0) / 100).toLocaleString()}`}
          subtext={`${analytics?.today?.total_bills || 0} Bills generated`}
          trend="+12%"
          icon={DollarSign}
          color="primary"
        />
        <MetricCard 
          title="Avg Order Value" 
          value={`₹${((analytics?.today?.avg_order_value || 0) / 100).toLocaleString()}`}
          subtext="Per unique session"
          trend="+5%"
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard 
          title="Weekly Growth" 
          value={`₹${((analytics?.weekComparison?.this_week || 0) / 100).toLocaleString()}`}
          subtext={`Vs ₹${((analytics?.weekComparison?.last_week || 0) / 100).toLocaleString()} last week`}
          trend="+28%"
          icon={TrendingUp}
          color="primary"
        />
        <MetricCard 
          title="Active Sessions" 
          value="14"
          subtext="Current live tables"
          trend="Live"
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
          <div className="p-8 pb-4">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-black text-foreground">Sales Velocity</h2>
                   <p className="font-medium text-slate-500">Daily revenue trend for the selected period.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1rem] bg-secondary text-primary hover:bg-secondary/90">
                  <Download className="h-5 w-5" />
                </Button>
             </div>
          </div>
          <div className="p-8 pt-0 flex-1 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700}}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700}}
                  tickFormatter={(val) => `₹${val/100}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)', padding: '16px', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                  itemStyle={{ fontWeight: 900, color: 'var(--primary)' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '8px' }}
                  formatter={(val: any) => [`₹${(val/100).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total_sales" stroke="var(--primary)" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
          <div className="p-8 pb-4">
             <h2 className="text-2xl font-black text-foreground">Payment Mix</h2>
             <p className="font-medium text-slate-500">Breakdown of transaction methods.</p>
          </div>
          <div className="p-8 pt-4 flex-1 flex flex-col justify-between">
             <div className="space-y-6">
                 {analytics?.paymentMethods?.map((pm: any, idx: number) => (
                  <div key={pm.payment_method} className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="font-black text-[11px] uppercase tracking-widest text-slate-500">{pm.payment_method}</span>
                        <span className="font-black text-foreground text-lg">₹{(pm.total / 100).toLocaleString()}</span>
                     </div>
                     <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            idx === 0 ? "bg-primary" : idx === 1 ? "bg-emerald-500" : "bg-amber-500"
                          )} 
                          style={{ width: `${(pm.total / (analytics.paymentMethods[0]?.total || 1)) * 100}%` }}
                        />
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 p-6 bg-secondary/50 rounded-3xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-secondary rounded-xl text-primary">
                      <Clock className="h-5 w-5" />
                   </div>
                   <span className="font-black text-sm uppercase tracking-widest text-foreground">Peak Hours</span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Most active between 8:00 PM - 10:00 PM.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Items Table */}
        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
          <div className="p-8 pb-4">
             <h2 className="text-2xl font-black text-foreground">Signature Dishes</h2>
             <p className="font-medium text-slate-500">Top performing menu items by volume.</p>
          </div>
          <div className="p-2 pb-6">
             <div className="flex flex-col gap-2">
                {topItems?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 mx-4 bg-secondary/30 rounded-3xl flex items-center justify-between hover:bg-secondary/50 transition-colors border border-border">
                     <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-card shadow-sm flex items-center justify-center font-black text-xl text-slate-300 shrink-0 border border-border">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-foreground text-lg tracking-tight leading-tight">{item.name}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.food_type}</span>
                        </div>
                     </div>
                      <div className="flex items-center gap-8 pr-2">
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty Sold</span>
                           <span className="font-black text-foreground text-lg">{item.total_quantity}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                           <span className="font-black text-primary text-lg">₹{(item.total_revenue / 100).toLocaleString()}</span>
                        </div>
                        <div className="h-10 w-10 rounded-[1rem] bg-card shadow-sm flex items-center justify-center border border-border">
                          <ChevronRight className="h-5 w-5 text-slate-300" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Heatmap Simulation (Hourly Activity) */}
        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
           <div className="p-8 pb-4">
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-foreground">Kitchen Heatmap</h2>
                    <p className="font-medium text-slate-500">Order density across operating hours.</p>
                 </div>
                 <Badge className="bg-red-500 text-white hover:bg-red-600 border-none font-black px-4 py-2 rounded-xl flex gap-2 shadow-glow-sm">
                    <Flame className="h-4 w-4" />
                    PEAK
                 </Badge>
              </div>
           </div>
           <div className="p-8 pt-4">
              <div className="grid grid-cols-7 gap-4">
                 {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                   <div key={day} className="text-center font-black text-sm text-slate-400 mb-2">{day}</div>
                 ))}
                 {Array.from({ length: 28 }).map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "aspect-square rounded-2xl transition-all hover:scale-110 cursor-pointer",
                      i % 7 === 0 || i % 5 === 0 ? "bg-primary shadow-lg shadow-primary/30" :
                      i % 3 === 0 ? "bg-primary/60" :
                      i % 2 === 0 ? "bg-secondary" : "bg-secondary/50"
                    )} 
                   />
                 ))}
              </div>
              <div className="mt-8 flex justify-between items-center text-xs font-black text-slate-500 uppercase tracking-widest bg-secondary/30 p-4 rounded-2xl">
                 <span>Low</span>
                 <div className="flex gap-2">
                    <div className="h-4 w-4 rounded-md bg-secondary/50" />
                    <div className="h-4 w-4 rounded-md bg-secondary" />
                    <div className="h-4 w-4 rounded-md bg-primary/60" />
                    <div className="h-4 w-4 rounded-md bg-primary" />
                 </div>
                 <span>High</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtext, trend, icon: Icon, color }: any) {
  const colors: any = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  const trendPositive = trend.startsWith('+') || trend === 'Live';

   return (
    <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-border">
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div className={cn("p-4 rounded-[1.25rem] shadow-inner", colors[color])}>
            <Icon className="h-7 w-7" />
          </div>
          <Badge className={cn(
            "border-none font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-widest", 
            trendPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary text-slate-500"
          )}>
            {trend}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          <p className="text-4xl font-black text-foreground tracking-tighter">{value}</p>
          <p className="text-xs font-bold text-slate-400 mt-2">{subtext}</p>
        </div>
      </div>
    </div>
  );
}
