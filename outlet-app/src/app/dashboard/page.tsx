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
  Zap,
  Target,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertTriangle
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
import { useSalesOverview, useTopItems } from '@/hooks/useAnalytics';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { data: overview, isLoading } = useSalesOverview();
  const { data: topItems } = useTopItems();
  const { socket } = useSocket('admin');
  const [pulse, setPulse] = useState<any[]>([]);

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
      value: '78%', 
      change: 'Peaking', 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: 'Table occupancy'
    },
  ];

  return (
    <div className="flex flex-col gap-10 bg-background -m-8 p-10 min-h-screen font-sans">
      
      {/* Header with Glassmorphism */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Badge className="bg-indigo-600 text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-glow">Live Command</Badge>
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground">SYSTEM PULSE</h1>
          <p className="text-slate-500 font-medium text-xl mt-2 max-w-xl">Advanced operational oversight and financial intelligence for <span className="text-primary font-bold">Adruva Gourmet</span>.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card/50 backdrop-blur-xl p-3 rounded-[2rem] border border-border shadow-soft">
           <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-primary">Export Report</Button>
           <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow border-none uppercase tracking-widest">
             <Calendar className="h-5 w-5 mr-2" /> Select Period
           </Button>
        </div>
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
                    <button className="px-6 py-2 rounded-xl text-[11px] font-black bg-card shadow-sm text-primary uppercase">Hourly</button>
                    <button className="px-6 py-2 rounded-xl text-[11px] font-black text-slate-400 uppercase">Daily</button>
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
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                    tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px'}}
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

          {/* Efficiency Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-card">
                <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary" />
                   Station Performance
                </h3>
                <div className="space-y-6">
                   {['Kitchen', 'Bar', 'Bakery', 'Grill'].map((station, i) => (
                      <div key={station} className="space-y-2">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                            <span>{station}</span>
                            <span>{95 - (i * 8)}% Optimized</span>
                         </div>
                         <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${95 - (i * 8)}%` }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              className={cn(
                                "h-full rounded-full shadow-glow",
                                i === 0 ? "bg-primary" : i === 1 ? "bg-emerald-500" : "bg-orange-500"
                              )}
                            />
                         </div>
                      </div>
                   ))}
                </div>
             </Card>

             <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Zap className="h-48 w-48 text-indigo-400 -mr-12 -mt-12" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-black mb-2">Power Insights</h3>
                   <p className="text-slate-400 font-medium mb-10 text-sm">Automated operational recommendations.</p>
                   
                   <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4">
                         <div className="h-10 w-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Inventory Warning</p>
                            <p className="text-xs text-slate-400 mt-0.5">'Truffle Oil' stock is below threshold (500ml left).</p>
                         </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4">
                         <div className="h-10 w-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
                            <TrendingUp className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Peak Prediction</p>
                            <p className="text-xs text-slate-400 mt-0.5">High traffic expected in 45 mins. Prep staff alert.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </Card>
          </div>
        </div>

        {/* Sidebar: Pulse & Analytics */}
        <div className="space-y-10">
          
          {/* Live Pulse Feed */}
          <Card className="rounded-[3rem] border-none shadow-soft bg-card overflow-hidden flex flex-col h-[600px]">
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
                      <div className="p-20 text-center text-slate-300 font-black italic opacity-50">AWAITING EVENTS...</div>
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
            <div className="p-8 bg-secondary border-t border-border">
               <Button variant="ghost" className="w-full font-black text-[11px] uppercase tracking-widest text-primary hover:bg-primary/10">
                  View Full Audit Log <ChevronRight className="h-4 w-4 ml-2" />
               </Button>
            </div>
          </Card>

          {/* Top Products Small Grid */}
          <Card className="rounded-[3rem] border-none shadow-soft bg-card p-10">
             <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-tight">Top Performance</h3>
             <div className="space-y-8">
                {topItems?.slice(0, 3).map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-lg italic text-slate-400">
                           {idx + 1}
                        </div>
                        <div>
                           <p className="font-bold text-foreground text-sm leading-none mb-1">{item.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.total_quantity} sold</p>
                        </div>
                     </div>
                     <span className="font-black text-primary">₹{(item.total_revenue / 100).toLocaleString()}</span>
                  </div>
                ))}
             </div>
          </Card>

        </div>

      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-center py-10 opacity-20 gap-4">
         <ShieldCheck className="h-6 w-6" />
         <span className="font-black tracking-[0.4em] text-sm uppercase">Adruva Operations Engine v2.0</span>
      </div>
    </div>
  );
}
