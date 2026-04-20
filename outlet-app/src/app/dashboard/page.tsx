'use client';

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
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Calendar,
  IndianRupee
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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { data: overview, isLoading } = useSalesOverview();
  const { data: topItems } = useTopItems();

  const metrics = [
    { 
      title: 'Today\'s Revenue', 
      value: `₹${(overview?.today?.total_revenue / 100 || 0).toLocaleString()}`, 
      change: '+12.5%', 
      icon: IndianRupee,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    { 
      title: 'Total Bills', 
      value: overview?.today?.total_bills || 0, 
      change: '+4.2%', 
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      title: 'Avg. Order Value', 
      value: `₹${(overview?.today?.avg_order_value / 100 || 0).toFixed(0)}`, 
      change: '-2.1%', 
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      title: 'Active Staff', 
      value: '5', 
      change: 'Steady', 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Executive Overview</h1>
        <p className="text-slate-500">Real-time performance metrics for your outlet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <Card key={m.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${m.bg}`}>
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <Badge className={m.change.startsWith('+') ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'} variant="outline">
                   {m.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{m.title}</p>
                <p className="text-2xl font-bold text-slate-900">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
                <CardDescription>Daily sales performance for the last 30 days.</CardDescription>
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm">7D</Button>
                 <Button variant="outline" size="sm" className="bg-slate-100">30D</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#94a3b8', fontSize: 12}}
                   tickFormatter={(val) => `₹${val/100000}L`}
                />
                <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                   formatter={(val: any) => [`₹${(val/100).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total_sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <CardDescription>Revenue share by channel.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={overview?.paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total"
                   >
                      {overview?.paymentMethods?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                   <Tooltip formatter={(val: any) => `₹${(val/100).toLocaleString()}`} />
                </PieChart>
             </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-6 space-y-2">
             {overview?.paymentMethods?.map((pm: any, idx: number) => (
               <div key={pm.payment_method} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                     <span className="capitalize">{pm.payment_method}</span>
                  </div>
                  <span className="font-bold">₹{(pm.total / 100).toLocaleString()}</span>
               </div>
             ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        <Card className="border-slate-200">
           <CardHeader>
              <CardTitle className="text-lg">Top Selling Items</CardTitle>
              <CardDescription>Items with the highest volume this month.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              {topItems?.map((item: any, idx: number) => (
                <div key={item.name} className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <span className="text-slate-300 font-black text-xl italic group-hover:text-indigo-200 transition-colors">0{idx + 1}</span>
                      <div>
                         <p className="font-bold text-slate-900">{item.name}</p>
                         <p className="text-xs text-slate-500">{item.total_quantity} units sold</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-indigo-600">₹{(item.total_revenue / 100).toLocaleString()}</p>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full" style={{width: `${(item.total_quantity / topItems[0].total_quantity) * 100}%`}} />
                      </div>
                   </div>
                </div>
              ))}
           </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900 text-white overflow-hidden relative">
           <div className="absolute inset-0 bg-[url('/grid-dark.svg')] opacity-20" />
           <CardHeader className="relative z-10">
              <CardTitle className="text-lg text-white">Staff Leaderboard</CardTitle>
              <CardDescription className="text-slate-400">Top performance by orders served.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6 relative z-10">
              {[1,2,3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                         {i === 1 ? '🥇' : i === 2 ? '🥈' : '🥉'}
                      </div>
                      <div>
                         <p className="font-bold">Staff Member {i}</p>
                         <p className="text-xs text-slate-400">{20 - i * 3} orders served</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-400">Total Value</p>
                      <p className="font-bold text-indigo-400">₹{(15000 / i).toLocaleString()}</p>
                   </div>
                </div>
              ))}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
