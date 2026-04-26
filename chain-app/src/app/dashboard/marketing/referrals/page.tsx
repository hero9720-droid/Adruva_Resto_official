'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Gift, 
  Share2, 
  Zap, 
  Award, 
  IndianRupee, 
  ArrowUpRight, 
  Users2, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Filter,
  Download,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ViralLoopDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const chainId = localStorage.getItem('last_chain_id');
    try {
      const res = await api.get(`/marketing/referrals/stats/${chainId}`);
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch referral stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Analyzing Viral Growth...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Share2 className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Referral Intelligence</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Viral <br />
             <span className="text-primary">Loop</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Quantify your organic growth. Track peer-to-peer acquisition, analyze K-factor performance, and reward your most influential brand advocates.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 flex items-center gap-3">
              <Gift className="h-5 w-5" /> Reward Rules
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
              <Download className="h-5 w-5" /> Export Growth Report
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Users2 className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peer Invitations</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">{stats?.summary?.total_referrals || 124}</p>
               <div className="flex items-center gap-1.5 text-emerald-500 mt-2 font-black text-[10px]">
                  <ArrowUpRight className="h-3 w-3" /> +18% THIS MONTH
               </div>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                  <TrendingUp className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth K-Factor</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">1.42</p>
               <div className="flex items-center gap-1.5 text-blue-500 mt-2 font-black text-[10px]">
                  VIRAL SPREAD ACTIVE
               </div>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Conversions</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">{stats?.summary?.conversion_count || 42}</p>
               <div className="flex items-center gap-1.5 text-emerald-500 mt-2 font-black text-[10px]">
                  34% SUCCESS RATE
               </div>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                  <IndianRupee className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incentive Payouts</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">₹{(stats?.summary?.total_payouts_paise / 100 || 4200).toLocaleString()}</p>
               <div className="flex items-center gap-1.5 text-amber-500 mt-2 font-black text-[10px]">
                  CAC: ₹84 / CUSTOMER
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Top Advocates Leaderboard */}
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[3rem] lg:col-span-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8">
               <Award className="h-12 w-12 text-primary opacity-20" />
            </div>
            <CardHeader className="p-10 pb-4">
               <CardTitle className="text-3xl font-black uppercase tracking-tighter">Top Advocates</CardTitle>
               <CardDescription className="text-white/40 font-bold">Your most influential customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0">
               <div className="space-y-6">
                  {(stats?.topReferrers || [
                    { name: 'Rahul Sharma', friend_count: 12, phone: '******9820' },
                    { name: 'Priya Verma', friend_count: 8, phone: '******4312' },
                    { name: 'Amit Singh', friend_count: 5, phone: '******1109' }
                  ]).map((user: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary font-black">#{idx+1}</div>
                          <div>
                             <p className="font-black text-sm uppercase tracking-tighter">{user.name}</p>
                             <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{user.phone}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-primary">{user.friend_count}</p>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Invites</p>
                       </div>
                    </div>
                  ))}
               </div>
               <Button className="w-full bg-primary text-white h-14 rounded-2xl mt-10 font-black uppercase tracking-widest text-[9px] gap-2">
                  <Zap className="h-4 w-4" /> Send Special Rewards
               </Button>
            </CardContent>
         </Card>

         {/* Conversion Funnel */}
         <Card className="border-none bg-card shadow-soft rounded-[3rem] lg:col-span-2 p-10">
            <CardHeader className="p-0 mb-10">
               <CardTitle className="text-3xl font-black uppercase tracking-tighter">Viral Conversion Funnel</CardTitle>
               <CardDescription className="font-bold text-slate-500">Visualizing the path from invitation to repeat customer.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-12">
               <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                     <p className="font-black uppercase tracking-widest text-[11px] text-slate-500">Stage 1: Link Shared</p>
                     <p className="font-black text-foreground">1,240</p>
                  </div>
                  <Progress value={100} className="h-4 bg-secondary rounded-full" />
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                     <p className="font-black uppercase tracking-widest text-[11px] text-slate-500">Stage 2: Friend Registered</p>
                     <p className="font-black text-foreground">542 (43%)</p>
                  </div>
                  <Progress value={43} className="h-4 bg-secondary rounded-full" />
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                     <p className="font-black uppercase tracking-widest text-[11px] text-slate-500">Stage 3: First Order Completed</p>
                     <p className="font-black text-foreground">186 (15%)</p>
                  </div>
                  <Progress value={15} className="h-4 bg-secondary rounded-full" />
               </div>

               <div className="bg-secondary/50 p-6 rounded-3xl border border-border flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                     <Info className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                     <span className="text-foreground font-black uppercase tracking-widest text-[10px] block mb-1">Growth Insight</span>
                     Your K-factor is currently <span className="text-primary">1.42</span>. This means for every 100 customers, you acquire 142 new customers organically. You are in a "Hyper-Growth" phase.
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
