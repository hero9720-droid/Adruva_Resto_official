'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShoppingBag, 
  Globe, 
  Truck, 
  IndianRupee, 
  ArrowDownRight, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ChannelAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/delivery/analytics');
        setData(data.data);
      } catch (err) {
        console.error('Failed to fetch channel analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Aggregating Sales Channels...</div>;

  const totalGross = data.reduce((s, c) => s + Number(c.gross_revenue), 0);
  const totalNet = data.reduce((s, c) => s + Number(c.net_revenue), 0);
  const totalCommission = data.reduce((s, c) => s + Number(c.total_commission), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Channel Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Layers className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Channel Intelligence</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Multi-Channel <br />
             <span className="text-primary">Revenue</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Audit your sales across all touchpoints. Compare direct POS revenue against third-party delivery platforms with precise commission tracking.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative z-10 text-center">
           <PieChart className="h-12 w-12 text-primary mx-auto mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Sales</p>
           <p className="text-4xl font-black text-white">
              {((data.find(c => c.source === 'pos')?.gross_revenue || 0) / totalGross * 100).toFixed(1)}%
           </p>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <IndianRupee className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Revenue</p>
               <p className="text-4xl font-black text-foreground">₹{(totalGross / 100).toLocaleString()}</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">Combined all channels</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <ArrowDownRight className="h-6 w-6 text-rose-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform Commissions</p>
               <p className="text-4xl font-black text-rose-500">-₹{(totalCommission / 100).toLocaleString()}</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">3rd Party Aggregator Fees</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-emerald-500 text-white shadow-glow-emerald rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-white" />
               </div>
               <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Net Revenue (Take Home)</p>
               <p className="text-4xl font-black text-white">₹{(totalNet / 100).toLocaleString()}</p>
               <p className="text-[11px] font-bold text-white/70 mt-2">After all commissions</p>
            </CardContent>
         </Card>
      </div>

      {/* Channel Leaderboard */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Performance by Channel</h2>
            <div className="flex gap-4">
               <Button variant="outline" className="rounded-xl h-10 border-border font-black text-[10px] uppercase tracking-widest">Download Report</Button>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {data.map((channel, idx) => (
              <Card key={idx} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                 <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8">
                       <div className="h-20 w-20 bg-secondary rounded-[2.25rem] flex items-center justify-center text-primary">
                          {channel.source === 'pos' ? <ShoppingBag className="h-10 w-10" /> : channel.source === 'web' ? <Globe className="h-10 w-10" /> : <Truck className="h-10 w-10" />}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className="bg-primary/5 text-primary border-none font-black uppercase tracking-widest text-[8px] px-2.5 py-1 rounded-lg">
                                {channel.source}
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{channel.total_orders} Orders</span>
                          </div>
                          <h3 className="text-3xl font-black text-foreground tracking-tighter">{channel.platform_name || 'Direct POS'}</h3>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-16 text-center">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross</p>
                          <p className="text-xl font-black text-foreground">₹{(channel.gross_revenue / 100).toLocaleString()}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-rose-500">Commission</p>
                          <p className="text-xl font-black text-rose-500">₹{(channel.total_commission / 100).toLocaleString()}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-emerald-500">Net Take</p>
                          <p className="text-2xl font-black text-emerald-500">₹{(channel.net_revenue / 100).toLocaleString()}</p>
                       </div>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                       <ChevronRight className="h-6 w-6" />
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>
    </div>
  );
}

function Layers(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.02a2 2 0 0 0 0 3.66l9.07 3.84a2 2 0 0 0 1.66 0l9.07-3.84a2 2 0 0 0 0-3.66z" />
      <path d="m2.1 11.1 9.07 3.84a2 2 0 0 0 1.66 0l9.07-3.84" />
      <path d="m2.1 16.1 9.07 3.84a2 2 0 0 0 1.66 0l9.07-3.84" />
    </svg>
  )
}
