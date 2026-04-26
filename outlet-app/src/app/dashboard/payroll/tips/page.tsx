'use client';

import { useState, useEffect } from 'react';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  IndianRupee, 
  Zap, 
  History, 
  Settings2, 
  Filter, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Layers,
  FileText,
  Briefcase,
  Star,
  Users2,
  CalendarDays,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export default function TipIntelligencePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });

  const { toast } = useToast();

  const fetchData = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      const res = await api.get(`/payroll/tips/${outletId}/stats`);
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch tip stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDistribution = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      await api.post(`/payroll/tips/${outletId}/distribute`, {
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      toast({ title: "Tips Distributed", description: "The pool has been successfully split across staff." });
      setShowDistributeModal(false);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Distribution failed", description: "Ensure tips exist for the selected range." });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Calculating Performance Shares...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Tip Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Coins className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Automated Performance Pooling</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Tip <br />
             <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Eliminate distribution bias. Automate guest tip pooling based on staff roles, performance scores, and duty cycles with surgical transparency.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6 min-w-[240px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Unallocated Tip Pool</p>
              <p className="text-5xl font-black text-primary tracking-tighter">₹{(Number(stats?.unallocated_paise) / 100).toLocaleString()}</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                  <TrendingUp className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Weekly Pool</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">₹18,420</p>
               <div className="flex items-center gap-1.5 text-emerald-500 mt-2 font-black text-[10px]">
                  <ArrowUpRight className="h-3 w-3" /> +12% VS LAST WEEK
               </div>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                  <Star className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Performer Multiplier</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">1.25x</p>
               <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">DRIVING EXCELLENCE</p>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4 lg:col-span-2">
            <CardHeader className="p-6 pb-2">
               <CardTitle className="text-xl font-black uppercase tracking-tighter">Active Distribution Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex gap-4 overflow-x-auto no-scrollbar">
               {stats?.rules.map((rule: any) => (
                 <div key={rule.id} className="bg-secondary/30 border border-border p-5 rounded-2xl min-w-[160px] flex flex-col justify-between group hover:border-primary transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rule.role_key}</p>
                    <p className="text-2xl font-black text-foreground mt-2">{rule.weight}x <span className="text-[10px] text-slate-400">WT</span></p>
                 </div>
               ))}
               <Button variant="outline" className="min-w-[100px] h-20 rounded-2xl border-dashed border-2 text-slate-400 hover:text-primary hover:border-primary"><Plus className="h-6 w-6" /></Button>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Pool Actions */}
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[3rem] lg:col-span-1 p-10 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-[60px] -translate-y-10 translate-x-10" />
            <div className="relative z-10">
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Execute <br />Distribution</h3>
               <p className="text-white/40 font-bold mb-8 leading-relaxed">Ready to split the current unallocated pool? The system will calculate shares based on role weights and performance multipliers for the current week.</p>
               
               <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-white/30 font-black uppercase tracking-widest text-[10px]">Active Pool</span>
                     <span className="text-primary font-black">₹{(Number(stats?.unallocated_paise) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-white/30 font-black uppercase tracking-widest text-[10px]">Staff Count</span>
                     <span className="font-black">12 ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-white/30 font-black uppercase tracking-widest text-[10px]">Avg share</span>
                     <span className="font-black">₹{(Number(stats?.unallocated_paise) / 1200).toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <Button 
              onClick={() => setShowDistributeModal(true)}
              className="relative z-10 w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow gap-3"
            >
               <Zap className="h-4 w-4" /> Finalize Payouts
            </Button>
         </Card>

         {/* Distribution History */}
         <Card className="border-none bg-card shadow-soft rounded-[3.5rem] lg:col-span-2 p-10">
            <CardHeader className="p-0 mb-10">
               <div className="flex justify-between items-center">
                  <div>
                     <CardTitle className="text-3xl font-black uppercase tracking-tighter">Payout History</CardTitle>
                     <CardDescription className="font-bold text-slate-500">History of weekly tip distributions.</CardDescription>
                  </div>
                  <Button variant="ghost" className="h-12 w-12 rounded-xl bg-secondary"><Filter className="h-5 w-5" /></Button>
               </div>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
               {[
                 { date: 'Apr 18 - Apr 24', total: 12400, staff: 12, status: 'Completed' },
                 { date: 'Apr 11 - Apr 17', total: 10850, staff: 11, status: 'Completed' },
                 { date: 'Apr 04 - Apr 10', total: 14200, staff: 12, status: 'Completed' }
               ].map((h, i) => (
                 <div key={i} className="flex items-center justify-between p-8 bg-secondary/20 rounded-[2.5rem] border border-transparent hover:border-primary transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 bg-card rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary">
                          <CalendarDays className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="font-black text-lg text-foreground tracking-tighter uppercase">{h.date}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.staff} STAFF RECIPIENTS</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-foreground tracking-tighter">₹{h.total.toLocaleString()}</p>
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md mt-1">
                          {h.status}
                       </Badge>
                    </div>
                 </div>
               ))}
            </CardContent>
         </Card>
      </div>

      {/* Distribution Modal */}
      <Dialog open={showDistributeModal} onOpenChange={setShowDistributeModal}>
         <DialogContent className="max-w-xl rounded-[3.5rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto">
                  <Award className="h-8 w-8" />
               </div>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-center">Confirm Distribution</DialogTitle>
               <DialogDescription className="font-bold text-slate-500 text-center italic">
                  Authorize the weekly tip split for the current pool.
               </DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <div className="bg-secondary/30 p-6 rounded-3xl border border-border">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Period</span>
                     <span className="font-black text-sm uppercase">{format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total to Distribute</span>
                     <span className="text-2xl font-black text-primary">₹{(Number(stats?.unallocated_paise) / 100).toLocaleString()}</span>
                  </div>
               </div>
               <div className="flex items-start gap-4 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                  <p className="text-xs font-bold text-blue-500/80 leading-relaxed italic">
                     This action will move all tips from the selected date range into a "Processed" state and credit individual staff tip ledgers. This cannot be undone.
                  </p>
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowDistributeModal(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">Cancel</Button>
               <Button 
                onClick={handleDistribution}
                className="flex-1 bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow"
               >
                  Authorize Split
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
