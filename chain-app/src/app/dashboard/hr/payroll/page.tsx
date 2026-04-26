'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Receipt, 
  Clock, 
  Settings2, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  IndianRupee, 
  TrendingDown,
  Users,
  Building2,
  ChevronRight,
  ArrowUpRight,
  PlayCircle,
  FileText
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PayrollCommandPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  
  const [newCycle, setNewCycle] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const { toast } = useToast();

  const fetchCycles = async () => {
    try {
      const { data } = await api.get('/payroll/cycles');
      setCycles(data.data);
    } catch (err) {
      console.error('Failed to fetch payroll cycles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslips = async (cycleId: string) => {
    try {
      const { data } = await api.get(`/payroll/cycles/${cycleId}/payslips`);
      setPayslips(data.data);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to fetch payslips" });
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/payroll/cycles/generate', newCycle);
      toast({ title: "Payroll Processed", description: `Cycle for ${newCycle.month}/${newCycle.year} is complete.` });
      setShowGenerate(false);
      fetchCycles();
    } catch (err) {
      toast({ variant: "destructive", title: "Generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Synchronizing Payroll Ledger...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Payroll Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Wallet className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Workforce Compensation</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Payroll <br />
             <span className="text-primary">Command</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Automate staff compensation based on attendance, overtime, and performance bonuses. Generate digital payslips and track labor costs across your chain.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowGenerate(true)}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <PlayCircle className="h-5 w-5" /> Process New Cycle
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Stats */}
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Workforce</p>
               <p className="text-4xl font-black text-foreground">124</p>
               <p className="text-[11px] font-bold text-emerald-500 mt-2 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +5 This Month</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <IndianRupee className="h-6 w-6 text-blue-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Monthly Payout</p>
               <p className="text-4xl font-black text-foreground">₹24.5L</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">Chain-wide average</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[2.5rem] lg:col-span-2 p-4">
            <CardContent className="p-6 flex justify-between items-center h-full">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Autonomous Payroll</h3>
                  <p className="text-sm font-bold text-white/40">Our engine syncs with attendance logs to calculate precise net pay every cycle.</p>
                  <Button variant="outline" className="bg-white/5 border-white/10 text-white rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] hover:bg-white/10">
                     View Payroll Configs
                  </Button>
               </div>
               <TrendingDown className="h-20 w-20 text-emerald-500/20" />
            </CardContent>
         </Card>
      </div>

      {/* Cycles Queue */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Payroll History</h2>
            <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">{cycles.length} TOTAL CYCLES</Badge>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {cycles.map((cycle) => (
              <Card key={cycle.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                 <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8">
                       <div className="h-20 w-20 bg-secondary rounded-[2.25rem] flex items-center justify-center text-primary">
                          <Calendar className="h-10 w-10" />
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className={cn(
                               "border-none font-black uppercase tracking-widest text-[8px] px-2.5 py-1 rounded-lg",
                               cycle.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'
                             )}>
                                {cycle.status}
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cycle.year}</span>
                          </div>
                          <h3 className="text-3xl font-black text-foreground tracking-tighter">Month {cycle.month} Full Cycle</h3>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <Button 
                        onClick={() => {
                          setSelectedCycle(cycle);
                          fetchPayslips(cycle.id);
                        }}
                        className="bg-[#1b1b24] text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-none shadow-glow flex items-center gap-2"
                       >
                          <Receipt className="h-4 w-4" /> View Payslips
                       </Button>
                       <Button variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-border group-hover:bg-primary group-hover:text-white transition-all">
                          Audit Log
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>

      {/* Payslip Modal */}
      <Dialog open={!!selectedCycle} onOpenChange={() => setSelectedCycle(null)}>
         <DialogContent className="max-w-5xl rounded-[3rem] p-10 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Cycle Payslips</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Month {selectedCycle?.month} / {selectedCycle?.year}</DialogDescription>
            </DialogHeader>
            <div className="py-8 max-h-[60vh] overflow-y-auto no-scrollbar">
               <Table>
                  <TableHeader>
                     <TableRow className="border-none">
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Staff Member</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Base Paid</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Overtime</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Net Payout</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {payslips.map((p) => (
                       <TableRow key={p.id} className="border-border group">
                          <TableCell className="py-6">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center font-black text-xs text-primary">
                                   {p.staff_name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                   <p className="font-black text-foreground">{p.staff_name}</p>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.staff_role} @ {p.outlet_name}</p>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="font-bold">₹{(p.base_paid_paise / 100).toLocaleString()}</TableCell>
                          <TableCell className="font-bold text-emerald-500">+₹{(p.overtime_paid_paise / 100).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-black text-lg">₹{(p.net_paid_paise / 100).toLocaleString()}</TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
            <DialogFooter>
               <Button onClick={() => setSelectedCycle(null)} className="w-full h-16 rounded-2xl bg-secondary text-primary font-black uppercase tracking-widest text-[11px]">Close Review</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Generate Cycle Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
         <DialogContent className="max-w-xl rounded-[3rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Process Payroll</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Initiate automated salary calculation for the current month.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Month (1-12)</label>
                     <Input 
                       type="number"
                       value={newCycle.month}
                       onChange={(e) => setNewCycle({...newCycle, month: Number(e.target.value)})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Year</label>
                     <Input 
                       type="number"
                       value={newCycle.year}
                       onChange={(e) => setNewCycle({...newCycle, year: Number(e.target.value)})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button 
                onClick={handleGenerate} 
                disabled={generating}
                className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
               >
                  {generating ? 'Processing Ledger...' : <><PlayCircle className="h-5 w-5" /> Start Calculation</>}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
