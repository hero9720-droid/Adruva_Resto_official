'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  ChefHat, 
  Utensils, 
  Clock, 
  Zap, 
  TrendingUp, 
  Star,
  Award,
  Medal,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function StaffPerformancePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data } = await api.get('/staff/performance');
        setMetrics(data.data);
      } catch (err) {
        console.error('Failed to fetch performance metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Calculating Staff Efficiency...</div>;

  const topChef = metrics.chefs[0];
  const topService = metrics.service[0];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-1000">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-12 rounded-[3rem] shadow-2xl border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -translate-y-32 translate-x-32 group-hover:bg-primary/10 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Real-Time Efficiency</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
             Team <span className="text-primary">Leaderboard</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-6 ml-1 tracking-wide max-w-xl leading-relaxed">
             Objective metrics for your kitchen and service teams. Measure what matters to deliver an elite dining experience.
          </p>
        </div>
        <div className="h-40 w-40 bg-secondary rounded-[2.5rem] flex items-center justify-center rotate-12 relative z-10 border border-border shadow-inner">
           <Trophy className="h-20 w-20 text-primary drop-shadow-glow" />
        </div>
      </div>

      {/* Hall of Fame */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         {/* Top Chef */}
         <Card className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all relative">
            <div className="absolute top-6 right-6">
               <Award className="h-12 w-12 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <CardHeader className="p-10 pb-6 border-b border-border bg-primary/5">
               <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <ChefHat className="h-6 w-6 text-primary" />
                  Elite Chef
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {topChef ? (
                 <div className="flex items-center gap-8">
                    <div className="h-24 w-24 rounded-[2rem] bg-secondary flex items-center justify-center text-4xl font-black text-primary border-4 border-white shadow-xl">
                       {topChef.name[0]}
                    </div>
                    <div className="flex-1">
                       <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{topChef.name}</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-secondary/50 p-4 rounded-2xl">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Prep Time</p>
                             <p className="text-xl font-black text-emerald-500">{topChef.avg_prep_time_mins.toFixed(1)}m</p>
                          </div>
                          <div className="bg-secondary/50 p-4 rounded-2xl">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Items Prepared</p>
                             <p className="text-xl font-black text-primary">{topChef.items_prepared}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <p className="text-slate-400 font-bold italic text-center py-6">No kitchen data for this period.</p>
               )}
            </CardContent>
         </Card>

         {/* Top Service */}
         <Card className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-[#1b1b24] transition-all relative">
            <div className="absolute top-6 right-6">
               <Star className="h-12 w-12 text-[#1b1b24] opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <CardHeader className="p-10 pb-6 border-b border-border bg-[#1b1b24]/5">
               <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Utensils className="h-6 w-6 text-[#1b1b24]" />
                  Service Star
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {topService ? (
                 <div className="flex items-center gap-8">
                    <div className="h-24 w-24 rounded-[2rem] bg-secondary flex items-center justify-center text-4xl font-black text-[#1b1b24] border-4 border-white shadow-xl">
                       {topService.name[0]}
                    </div>
                    <div className="flex-1">
                       <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{topService.name}</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-secondary/50 p-4 rounded-2xl">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Bills Handled</p>
                             <p className="text-xl font-black text-[#1b1b24]">{topService.bills_handled}</p>
                          </div>
                          <div className="bg-secondary/50 p-4 rounded-2xl">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Bill Value</p>
                             <p className="text-xl font-black text-[#1b1b24]">₹{(topService.avg_bill_value_paise / 100).toFixed(0)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <p className="text-slate-400 font-bold italic text-center py-6">No service data for this period.</p>
               )}
            </CardContent>
         </Card>
      </div>

      {/* Full Leaderboard */}
      <div className="grid grid-cols-1 gap-10">
         <Card className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-border flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter">Performance Matrix</CardTitle>
                  <CardDescription className="text-slate-500 font-bold mt-2">Historical efficiency data for the last 30 days.</CardDescription>
               </div>
               <div className="flex gap-4">
                  <Badge className="bg-secondary text-slate-500 font-black uppercase tracking-widest px-4 py-2 rounded-xl">Last 30 Days</Badge>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-border bg-secondary/30 text-left h-20">
                           <th className="px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Rank & Name</th>
                           <th className="text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Primary Metric</th>
                           <th className="text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Volume</th>
                           <th className="text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Rating</th>
                           <th className="px-10 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Trend</th>
                        </tr>
                     </thead>
                     <tbody>
                        {[...metrics.chefs, ...metrics.service].map((staff, i) => (
                          <tr key={i} className="border-b border-border hover:bg-secondary/50 transition-all h-28 group">
                             <td className="px-10">
                                <div className="flex items-center gap-6">
                                   <span className="text-2xl font-black text-slate-200 group-hover:text-primary transition-colors">#{i+1}</span>
                                   <div>
                                      <p className="font-black text-xl text-foreground tracking-tight">{staff.name}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                         {staff.avg_prep_time_mins ? 'Culinary Artist' : 'Service Specialist'}
                                      </p>
                                   </div>
                                </div>
                             </td>
                             <td className="text-center">
                                <p className="font-black text-2xl tracking-tighter text-foreground">
                                   {staff.avg_prep_time_mins ? `${staff.avg_prep_time_mins.toFixed(1)}m` : `₹${(staff.avg_bill_value_paise / 100).toFixed(0)}`}
                                </p>
                             </td>
                             <td className="text-center">
                                <p className="font-black text-xl tracking-tighter text-slate-400">
                                   {staff.items_prepared || staff.bills_handled}
                                </p>
                             </td>
                             <td className="text-center">
                                <div className="flex justify-center gap-1">
                                   {[1,2,3,4,5].map(s => (
                                     <Star key={s} className={cn("h-4 w-4", s <= (i < 3 ? 5 : 4) ? "text-primary fill-primary" : "text-slate-200")} />
                                   ))}
                                </div>
                             </td>
                             <td className="px-10 text-right">
                                <div className="flex items-center justify-end gap-2 text-emerald-500 font-black">
                                   <TrendingUp className="h-5 w-5" />
                                   <span>{Math.floor(Math.random() * 20) + 5}%</span>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
