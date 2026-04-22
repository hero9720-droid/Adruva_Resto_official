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
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-slate-100 rounded-3xl" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-3xl" />
    </div>
  );

  if (isError) return (
    <div className="p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[60vh]">
      <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
        <TrendingDown className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Analytics unavailable</h2>
      <p className="text-slate-500">Could not load analytics data. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 bg-[#fcf8ff] font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-[#1b1b24]">
            PERFORMANCE
          </h1>
          <p className="text-[#777587] font-medium text-lg mt-1">Data-driven insights for operational excellence.</p>
        </div>
        <div className="flex gap-2 bg-[#ffffff] p-2 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e4e1ee]/50">
           {['7days', '30days', '90days'].map((p) => (
             <Button
              key={p}
              variant="ghost"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-xl px-6 h-10 font-black text-xs transition-all tracking-widest uppercase",
                period === p 
                  ? "bg-[#1b1b24] text-[#ffffff] shadow-lg shadow-black/10" 
                  : "text-[#777587] hover:bg-[#f5f2ff] hover:text-[#1b1b24]"
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
          color="indigo"
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
          color="blue"
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
        <div className="lg:col-span-2 bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-8 pb-4">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-black text-[#1b1b24]">Sales Velocity</h2>
                   <p className="font-medium text-[#777587]">Daily revenue trend for the selected period.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1rem] bg-[#f5f2ff] text-[#4f46e5] hover:bg-[#e4e1ee]">
                  <Download className="h-5 w-5" />
                </Button>
             </div>
          </div>
          <div className="p-8 pt-0 flex-1 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ecf9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a09eb1', fontSize: 11, fontWeight: 700}}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a09eb1', fontSize: 11, fontWeight: 700}}
                  tickFormatter={(val) => `₹${val/100}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)', padding: '16px', backgroundColor: '#ffffff', color: '#1b1b24' }}
                  itemStyle={{ fontWeight: 900, color: '#4f46e5' }}
                  labelStyle={{ fontWeight: 700, color: '#777587', marginBottom: '8px' }}
                  formatter={(val: any) => [`₹${(val/100).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total_sales" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-8 pb-4">
             <h2 className="text-2xl font-black text-[#1b1b24]">Payment Mix</h2>
             <p className="font-medium text-[#777587]">Breakdown of transaction methods.</p>
          </div>
          <div className="p-8 pt-4 flex-1 flex flex-col justify-between">
             <div className="space-y-6">
                {analytics?.paymentMethods?.map((pm: any, idx: number) => (
                  <div key={pm.payment_method} className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="font-black text-[11px] uppercase tracking-widest text-[#777587]">{pm.payment_method}</span>
                        <span className="font-black text-[#1b1b24] text-lg">₹{(pm.total / 100).toLocaleString()}</span>
                     </div>
                     <div className="w-full h-3 bg-[#f5f2ff] rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            idx === 0 ? "bg-[#4f46e5]" : idx === 1 ? "bg-[#22c55e]" : "bg-[#f59e0b]"
                          )} 
                          style={{ width: `${(pm.total / (analytics.paymentMethods[0]?.total || 1)) * 100}%` }}
                        />
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 p-6 bg-gradient-to-br from-[#f5f2ff] to-[#ffffff] rounded-3xl border border-[#e4e1ee]">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-[#e2dfff] rounded-xl text-[#3525cd]">
                      <Clock className="h-5 w-5" />
                   </div>
                   <span className="font-black text-sm uppercase tracking-widest text-[#1b1b24]">Peak Hours</span>
                </div>
                <p className="text-sm text-[#777587] font-medium leading-relaxed">Most active between 8:00 PM - 10:00 PM.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Items Table */}
        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-8 pb-4">
             <h2 className="text-2xl font-black text-[#1b1b24]">Signature Dishes</h2>
             <p className="font-medium text-[#777587]">Top performing menu items by volume.</p>
          </div>
          <div className="p-2 pb-6">
             <div className="flex flex-col gap-2">
                {topItems?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 mx-4 bg-[#fcf8ff] rounded-3xl flex items-center justify-between hover:bg-[#f5f2ff] transition-colors border border-[#f0ecf9]">
                     <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-[#ffffff] shadow-sm flex items-center justify-center font-black text-xl text-[#c7c4d8] shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-[#1b1b24] text-lg tracking-tight leading-tight">{item.name}</span>
                           <span className="text-[10px] font-black text-[#a09eb1] uppercase tracking-widest mt-1">{item.food_type}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-8 pr-2">
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Qty Sold</span>
                           <span className="font-black text-[#1b1b24] text-lg">{item.total_quantity}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Revenue</span>
                           <span className="font-black text-[#4f46e5] text-lg">₹{(item.total_revenue / 100).toLocaleString()}</span>
                        </div>
                        <div className="h-10 w-10 rounded-[1rem] bg-[#ffffff] shadow-sm flex items-center justify-center">
                          <ChevronRight className="h-5 w-5 text-[#c7c4d8]" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Heatmap Simulation (Hourly Activity) */}
        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
           <div className="p-8 pb-4">
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-[#1b1b24]">Kitchen Heatmap</h2>
                    <p className="font-medium text-[#777587]">Order density across operating hours.</p>
                 </div>
                 <Badge className="bg-[#ffdad6] text-[#93000a] hover:bg-[#ffdad6] border-none font-black px-4 py-2 rounded-xl flex gap-2">
                    <Flame className="h-4 w-4" />
                    PEAK
                 </Badge>
              </div>
           </div>
           <div className="p-8 pt-4">
              <div className="grid grid-cols-7 gap-4">
                 {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                   <div key={day} className="text-center font-black text-sm text-[#a09eb1] mb-2">{day}</div>
                 ))}
                 {Array.from({ length: 28 }).map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "aspect-square rounded-2xl transition-all hover:scale-110 cursor-pointer",
                      i % 7 === 0 || i % 5 === 0 ? "bg-[#4f46e5] shadow-lg shadow-[#4f46e5]/30" :
                      i % 3 === 0 ? "bg-[#3525cd]/60" :
                      i % 2 === 0 ? "bg-[#e2dfff]" : "bg-[#f5f2ff]"
                    )} 
                   />
                 ))}
              </div>
              <div className="mt-8 flex justify-between items-center text-xs font-black text-[#777587] uppercase tracking-widest bg-[#fcf8ff] p-4 rounded-2xl">
                 <span>Low</span>
                 <div className="flex gap-2">
                    <div className="h-4 w-4 rounded-md bg-[#f5f2ff]" />
                    <div className="h-4 w-4 rounded-md bg-[#e2dfff]" />
                    <div className="h-4 w-4 rounded-md bg-[#3525cd]/60" />
                    <div className="h-4 w-4 rounded-md bg-[#4f46e5]" />
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
    indigo: "text-[#3525cd] bg-[#e2dfff]",
    emerald: "text-[#006e1c] bg-[#93f89e]",
    blue: "text-[#0061a4] bg-[#d1e4ff]",
    orange: "text-[#7e3000] bg-[#ffdbcc]",
  };

  const trendPositive = trend.startsWith('+') || trend === 'Live';

  return (
    <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div className={cn("p-4 rounded-[1.25rem] shadow-inner", colors[color])}>
            <Icon className="h-7 w-7" />
          </div>
          <Badge className={cn(
            "border-none font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-widest", 
            trendPositive ? "bg-[#93f89e]/30 text-[#006e1c]" : "bg-[#f0ecf9] text-[#777587]"
          )}>
            {trend}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black text-[#777587] uppercase tracking-[0.2em]">{title}</p>
          <p className="text-4xl font-black text-[#1b1b24] tracking-tighter">{value}</p>
          <p className="text-xs font-bold text-[#a09eb1] mt-2">{subtext}</p>
        </div>
      </div>
    </div>
  );
}
