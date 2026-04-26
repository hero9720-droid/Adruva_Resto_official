'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  LineChart,
  Target,
  Layers,
  ChevronRight,
  ArrowUpRight,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PricingIntelligencePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  const [newRule, setNewRule] = useState({
    name: '',
    rule_type: 'time_based',
    adjustment_percent: 10,
    start_time: '19:00',
    end_time: '22:00'
  });

  const { toast } = useToast();

  const fetchRules = async () => {
    try {
      const { data } = await api.get('/pricing/rules');
      setRules(data.data);
    } catch (err) {
      console.error('Failed to fetch pricing rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/pricing/rules', newRule);
      toast({ title: "Pricing Rule Active", description: "Rule will be applied during the next recalculation cycle." });
      setShowCreate(false);
      fetchRules();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to create rule" });
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { data } = await api.post('/pricing/recalculate');
      toast({ title: "Prices Synchronized", description: data.message });
      fetchRules();
    } catch (err) {
      toast({ variant: "destructive", title: "Recalculation failed" });
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Scanning Market Fluctuations...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Dynamic Pricing Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Zap className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Profit Optimization</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Pricing <br />
             <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Maximize your margins with AI-driven adjustments. Set rules for peak hours, holiday surges, or ingredient cost fluctuations.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={handleRecalculate}
             disabled={recalculating}
             variant="outline"
             className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 flex items-center gap-3"
           >
              <Calculator className={cn("h-5 w-5", recalculating && "animate-spin")} />
              {recalculating ? 'Processing...' : 'Run Sync'}
           </Button>
           <Button 
             onClick={() => setShowCreate(true)}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <Plus className="h-5 w-5" /> New Pricing Rule
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Margin Card */}
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] lg:col-span-1">
            <CardContent className="p-8">
               <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Margin Lift</p>
               <p className="text-4xl font-black text-foreground">+14.2%</p>
               <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[70%]" />
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] lg:col-span-3 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 opacity-30" />
            <CardContent className="p-8 relative z-10 flex justify-between items-center">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Active Pricing Rules</h3>
                  <p className="text-sm font-bold text-slate-500">Global rules applying across {rules.length} categories.</p>
               </div>
               <div className="flex gap-4">
                  <div className="text-center bg-white p-4 rounded-2xl min-w-[100px] shadow-soft">
                     <p className="text-[9px] font-black uppercase text-slate-400">Time Based</p>
                     <p className="text-2xl font-black text-primary">{rules.filter(r => r.rule_type === 'time_based').length}</p>
                  </div>
                  <div className="text-center bg-white p-4 rounded-2xl min-w-[100px] shadow-soft">
                     <p className="text-[9px] font-black uppercase text-slate-400">Surge</p>
                     <p className="text-2xl font-black text-primary">{rules.filter(r => r.rule_type === 'surge').length}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Rules Queue */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Rule Management</h2>
            <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">AUTONOMOUS MODE ACTIVE</Badge>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                 <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8">
                       <div className={cn(
                         "h-20 w-20 rounded-[2rem] flex items-center justify-center relative",
                         rule.is_active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
                       )}>
                          {rule.rule_type === 'time_based' ? <Clock className="h-10 w-10" /> : <Zap className="h-10 w-10" />}
                          {rule.is_active && <div className="absolute inset-0 border-4 border-primary rounded-[2rem] animate-ping opacity-20" />}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className={cn(
                               "border-none font-black uppercase tracking-widest text-[8px] px-2.5 py-1 rounded-lg",
                               rule.is_active ? 'bg-primary/5 text-primary' : 'bg-slate-100 text-slate-400'
                             )}>
                                {rule.rule_type.replace('_', ' ')}
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Scope</span>
                          </div>
                          <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{rule.name}</h3>
                          <div className="flex items-center gap-4">
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-lg">
                                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> +{rule.adjustment_percent}% Adjustment
                             </span>
                             {rule.rule_type === 'time_based' && (
                               <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-lg">
                                  <Clock className="h-3.5 w-3.5" /> {rule.start_time} - {rule.end_time}
                               </span>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <Button variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-border hover:bg-secondary">
                          Edit Rule
                       </Button>
                       <Button className="bg-[#1b1b24] text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-none">
                          Deactivate
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
         <DialogContent className="max-w-3xl rounded-[3rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">New Pricing Rule</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Configure autonomous price adjustments for your menu.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Rule Name</label>
                     <Input 
                       placeholder="E.g. Weekend Prime Surge" 
                       value={newRule.name}
                       onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Adjustment (%)</label>
                     <Input 
                       type="number"
                       placeholder="10.0" 
                       value={newRule.adjustment_percent}
                       onChange={(e) => setNewRule({...newRule, adjustment_percent: Number(e.target.value)})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Time</label>
                     <Input 
                       type="time"
                       value={newRule.start_time}
                       onChange={(e) => setNewRule({...newRule, start_time: e.target.value})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Time</label>
                     <Input 
                       type="time"
                       value={newRule.end_time}
                       onChange={(e) => setNewRule({...newRule, end_time: e.target.value})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">Discard</Button>
               <Button onClick={handleCreate} className="flex-1 bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow">Activate Rule</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
