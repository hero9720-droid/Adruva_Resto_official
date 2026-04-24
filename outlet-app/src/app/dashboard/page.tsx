'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Calendar,
  IndianRupee,
  Activity,
  QrCode,
  Zap,
  Target,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Layout,
  Cpu,
  RefreshCcw,
  MonitorCheck
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSalesOverview, useTopItems, useStaffPerformance, useHourlyHeatmap } from '@/hooks/useAnalytics';
import { useIngredients } from '@/hooks/useInventory';
import { useTables } from '@/hooks/useSettings';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { data: overview, isLoading } = useSalesOverview();
  const { data: topItems } = useTopItems();
  const { data: staffPerformance } = useStaffPerformance();
  const { data: heatmap } = useHourlyHeatmap();
  const { data: ingredients } = useIngredients();
  const { data: tables } = useTables();
  const { socket } = useSocket('admin');
  const [pulse, setPulse] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'hourly' | 'daily'>('hourly');
  const { toast } = useToast();

  const lowStockCount = ingredients?.filter((i: any) => i.current_stock <= i.low_threshold).length || 0;

  useEffect(() => {
    if (socket) {
      const handleEvent = (data: any) => {
        setPulse(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...data
        }, ...prev].slice(0, 10));
      };

      socket.on('order:new', (order: any) => handleEvent({ type: 'order', msg: `New Order #${order.order_number}`, icon: Package, color: 'text-indigo-500' }));
      socket.on('bill:paid', (bill: any) => handleEvent({ type: 'payment', msg: `Payment Received: ₹${bill.total_paise/100}`, icon: Zap, color: 'text-emerald-500' }));
      socket.on('room:checkin', (room: any) => handleEvent({ type: 'hospitality', msg: `Guest Check-in: ${room.name}`, icon: ShieldCheck, color: 'text-blue-500' }));

      return () => {
        socket.off('order:new');
        socket.off('bill:paid');
        socket.off('room:checkin');
      };
    }
  }, [socket]);

  const handleExport = () => {
    if (!overview?.salesTrend) return;
    
    const headers = ["Date", "Total Sales (Paise)", "Order Count"];
    const rows = overview.salesTrend.map((row: any) => [
      row.date,
      row.total_sales,
      row.order_count
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adruva_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Report Exported", description: "Your revenue report has been downloaded as CSV.", className: "bg-emerald-600 text-white border-none font-bold" });
  };

  const metrics = [
    { 
      title: 'Real-time Revenue', 
      value: `₹${(overview?.today?.total_revenue / 100 || 0).toLocaleString()}`, 
      change: '+12.5%', 
      icon: IndianRupee,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      desc: 'Net income today'
    },
    { 
      title: 'Operational Load', 
      value: `${overview?.active_orders || 12}`, 
      change: 'High', 
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      desc: 'Active kitchen tickets'
    },
    { 
      title: 'Efficiency Score', 
      value: '94%', 
      change: '+2.4%', 
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      desc: 'Prep time vs Target'
    },
    { 
      title: 'Live Capacity', 
      value: `${tables?.filter((t: any) => t.status === 'occupied').length || 0} / ${tables?.length || 0}`, 
      change: 'Active', 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: 'Occupied Tables'
    },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-10 bg-background min-h-[calc(100vh-120px)] font-sans pb-10">
      
      {/* Header with Glassmorphism */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Badge className="bg-indigo-600 text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-glow">Live Command</Badge>
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">SYSTEM PULSE</h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl mt-2 max-w-xl">Advanced operational oversight and financial intelligence.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/50 backdrop-blur-xl p-3 rounded-[2rem] border border-border shadow-soft w-full lg:w-auto">
           <Button 
            variant="ghost" 
            className="h-12 md:h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-primary w-full sm:w-auto"
            onClick={handleExport}
           >
            Export Report
           </Button>
           <Button className="h-12 md:h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow border-none uppercase tracking-widest w-full sm:w-auto">
             <Calendar className="h-5 w-5 mr-2" /> Select Period
           </Button>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
         <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/kds')}
          className="h-14 px-8 rounded-2xl bg-card border-none shadow-soft font-black flex items-center gap-3 shrink-0 group hover:bg-secondary transition-all"
         >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Activity className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">Active Tickets</span>
         </Button>
         <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/online-orders')}
          className="h-14 px-8 rounded-2xl bg-card border-none shadow-soft font-black flex items-center gap-3 shrink-0 group hover:bg-secondary transition-all"
         >
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
               <QrCode className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">QR Orders</span>
         </Button>
         <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/reservations')}
          className="h-14 px-8 rounded-2xl bg-card border-none shadow-soft font-black flex items-center gap-3 shrink-0 group hover:bg-secondary transition-all"
         >
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Users className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">Reservations</span>
         </Button>
         <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/inventory')}
          className="h-14 px-8 rounded-2xl bg-card border-none shadow-soft font-black flex items-center gap-3 shrink-0 group hover:bg-secondary transition-all"
         >
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Package className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">Inventory</span>
         </Button>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((m, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={m.title} 
            className="group relative bg-card rounded-[2.5rem] p-8 border border-border shadow-soft hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`h-14 w-14 rounded-2xl ${m.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                  <m.icon className={`h-7 w-7 ${m.color}`} />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest",
                  m.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                )}>
                   {m.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-foreground tracking-tighter">{m.value}</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 italic">{m.desc}</p>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
               <m.icon className="h-48 w-48 rotate-12" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Main Chart Section */}
        <div className="xl:col-span-2 space-y-10">
          <Card className="rounded-[3rem] border-none shadow-soft bg-card overflow-hidden p-2">
            <CardHeader className="p-10 pb-0">
               <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">Revenue Trajectory</h2>
                    <p className="text-slate-500 font-medium">Monitoring financial velocity across all channels.</p>
                  </div>
                  <div className="flex bg-secondary p-1.5 rounded-2xl border border-border">
                    <button 
                      onClick={() => setTimeframe('hourly')}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[11px] font-black transition-all uppercase",
                        timeframe === 'hourly' ? "bg-card shadow-sm text-primary" : "text-slate-400"
                      )}
                    >
                      Hourly
                    </button>
                    <button 
                      onClick={() => setTimeframe('daily')}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[11px] font-black transition-all uppercase",
                        timeframe === 'daily' ? "bg-card shadow-sm text-primary" : "text-slate-400"
                      )}
                    >
                      Daily
                    </button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="h-[450px] p-10 pt-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview?.salesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 'bold'}}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 'bold'}}
                    tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px', backgroundColor: 'var(--card)', color: 'var(--foreground)'}}
                    itemStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--muted-foreground)' }}
                    formatter={(val: any) => [`₹${(val/100).toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_sales" 
                    stroke="#6366f1" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table Occupancy (Phase 37) */}
          <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-card">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                       <Layout className="h-6 w-6" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Live Occupancy</h2>
                       <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-1">Real-time table status</p>
                    </div>
                 </div>
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-xl">
                    {tables?.filter((t:any) => t.status === 'occupied').length} / {tables?.length} OCCUPIED
                 </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                 {tables?.map((table: any) => (
                    <div key={table.id} className={cn(
                       "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                       table.status === 'occupied' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-glow' : 'bg-card border-border text-slate-300'
                    )}>
                       <span className="font-black text-lg">{table.name}</span>
                       <span className="text-[8px] font-black uppercase tracking-widest">{table.capacity}P</span>
                    </div>
                 ))}
                 {tables?.length === 0 && <div className="col-span-full py-10 text-center text-slate-400 font-black uppercase">No tables configured</div>}
              </div>
          </Card>

          {/* Analytics Layer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-card overflow-hidden">
                <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-tight">Revenue Breakdown</h3>
                <div className="h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={overview?.categoryBreakdown || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="total_revenue"
                            nameKey="category"
                         >
                            {overview?.categoryBreakdown?.map((entry: any, index: number) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Pie>
                         <Tooltip 
                            contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                            formatter={(val: any) => `₹${(val/100).toLocaleString()}`}
                         />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                   {overview?.categoryBreakdown?.slice(0, 4).map((cat: any, i: number) => (
                      <div key={cat.category} className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                         <span className="text-[9px] font-black text-slate-500 uppercase truncate">{cat.category}</span>
                      </div>
                   ))}
                </div>
             </Card>

             <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-card lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Peak Hours Heatmap</h3>
                   <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => <div key={v} className="h-2 w-2 rounded-sm" style={{ backgroundColor: `rgba(99, 102, 241, ${v * 0.2})` }} />)}
                   </div>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                   {Array.from({ length: 24 }).map((_, hour) => {
                      const hourData = heatmap?.find((h: any) => parseInt(h.hour_of_day) === hour);
                      const totalOrders = hourData?.order_count || 0;
                      const intensity = Math.min(totalOrders / 10, 1);
                      
                      return (
                        <div 
                           key={hour}
                           className="h-8 rounded-lg transition-all hover:scale-110 cursor-pointer border border-white/10" 
                           title={`${hour}:00 - ${totalOrders} orders`}
                           style={{ 
                              backgroundColor: totalOrders > 0 ? `rgba(99, 102, 241, ${0.1 + intensity * 0.9})` : 'var(--secondary)',
                           }} 
                        />
                      );
                   })}
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   <span>12 AM</span>
                   <span>6 AM</span>
                   <span>12 PM</span>
                   <span>6 PM</span>
                   <span>11 PM</span>
                </div>
             </Card>
          </div>
        </div>

        {/* Sidebar: Pulse & System Health */}
        <div className="space-y-10">
          
          {/* System Health (Phase 42) */}
          <Card className="rounded-[3rem] border-none shadow-soft bg-slate-900 text-white p-10 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Cpu className="h-40 w-40 text-indigo-400" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
                         <MonitorCheck className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">System Health</h3>
                   </div>
                   <Badge className="bg-emerald-500 text-white border-none font-black text-[9px]">OPTIMAL</Badge>
                </div>
                
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Latency</span>
                      <span className="font-bold text-emerald-400">42ms</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                      <span className="font-bold">99.98%</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Socket Conn.</span>
                      <span className="font-bold text-emerald-400">Active</span>
                   </div>
                   <div className="pt-4 border-t border-white/5 flex items-center justify-center">
                      <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:text-white hover:bg-white/5 h-10 w-full">
                         <RefreshCcw className="h-3 w-3 mr-2" /> RE-SYNC ENGINE
                      </Button>
                   </div>
                </div>
             </div>
          </Card>

          {/* Live Pulse Feed */}
          <Card className="rounded-[3rem] border-none shadow-soft bg-card overflow-hidden flex flex-col h-[500px]">
            <CardHeader className="p-10 pb-6 border-b border-secondary shrink-0">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Live Pulse</h3>
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
               </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto no-scrollbar p-0">
               <div className="divide-y divide-slate-50">
                  <AnimatePresence initial={false}>
                    {pulse.length === 0 ? (
                      <div className="p-20 text-center text-slate-300 font-black italic opacity-50 uppercase tracking-widest text-[10px]">Awaiting system signals...</div>
                    ) : (
                      pulse.map((event) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={event.id}
                          className="p-8 hover:bg-secondary/50 transition-colors group flex items-start gap-5"
                        >
                          <div className={cn("h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 transition-all group-hover:scale-110", event.color)}>
                             <event.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.type}</span>
                                <span className="text-[10px] font-bold text-slate-300">{event.time}</span>
                             </div>
                             <p className="font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{event.msg}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
               </div>
            </CardContent>
          </Card>

          {/* Power Insights */}
          <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-slate-900 text-white overflow-hidden relative">
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">AI Operational Insights</h3>
                <p className="text-slate-400 font-medium mb-10 text-[10px] uppercase tracking-widest">Automated recommendations</p>
                
                <div className="space-y-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4">
                      <div className="h-10 w-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                         <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">Stock Warning</p>
                         <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{lowStockCount} items below threshold</p>
                      </div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4">
                      <div className="h-10 w-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
                         <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">Volume Surge</p>
                         <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">30% spike in GPay payments</p>
                      </div>
                   </div>
                </div>
             </div>
          </Card>

        </div>

      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-center py-10 opacity-20 gap-4">
         <ShieldCheck className="h-6 w-6" />
         <span className="font-black tracking-[0.4em] text-sm uppercase">Adruva Operations Engine v2.5 • Premium Multi-Outlet Edition</span>
      </div>
    </div>
  );
}
