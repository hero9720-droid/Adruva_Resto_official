'use client';

import { Cloud, Leaf, Droplets, Zap, BarChart3, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', savings: 40 },
  { name: 'Tue', savings: 30 },
  { name: 'Wed', savings: 65 },
  { name: 'Thu', savings: 45 },
  { name: 'Fri', savings: 80 },
  { name: 'Sat', savings: 95 },
  { name: 'Sun', savings: 70 },
];

export default function SustainabilityPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-emerald-500/10 rounded-3xl">
               <Leaf className="h-10 w-10 text-emerald-500" />
             </div>
             Eco Impact Dashboard
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide">Tracking environmental footprint and resource optimization.</p>
        </div>
        <div className="flex items-center gap-4 px-8 py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-inner">
           <Globe className="h-5 w-5 text-emerald-500" />
           <span className="text-sm font-black uppercase tracking-widest text-emerald-500">Green Certified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Carbon Offset', value: '1.2 Tons', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Water Saved', value: '12,400 L', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { title: 'Energy Efficiency', value: '15.4%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <Card key={stat.title} className="border border-border bg-card rounded-[2.5rem] shadow-soft p-10 group hover:-translate-y-2 transition-all">
             <div className="flex justify-between items-start mb-8">
                <div className={cn("p-5 rounded-2xl shadow-inner", stat.bg)}>
                   <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
                <Badge className="bg-secondary text-slate-500 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[9px] rounded-xl">MTD</Badge>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.title}</p>
             <p className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden p-10">
            <div className="flex justify-between items-end mb-10">
               <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Waste Reduction Trends</h3>
                  <p className="text-slate-500 font-bold text-sm tracking-wide">Daily food waste reduction through AI-driven prep planning.</p>
               </div>
               <BarChart3 className="h-8 w-8 text-emerald-200" />
            </div>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] p-10 flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">Eco-Friendly Initiatives</h3>
               <div className="space-y-6">
                  {[
                    { name: 'Paperless Billing', progress: 85 },
                    { name: 'Local Sourcing', progress: 60 },
                    { name: 'Plastic Free', progress: 95 },
                  ].map((item) => (
                    <div key={item.name} className="space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">{item.name}</span>
                          <span className="text-emerald-500">{item.progress}%</span>
                       </div>
                       <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${item.progress}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="mt-10 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-center">
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Platform Contribution</p>
               <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  Adruva Resto has reduced your operational carbon footprint by 12% this quarter.
               </p>
            </div>
         </Card>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
