'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Coins, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Search,
  ArrowRight
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
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ShiftReconciliationPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const fetchShifts = async () => {
    try {
      const { data } = await api.get('/staff/shifts/unverified');
      setShifts(data.data);
    } catch (err) {
      console.error('Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleVerify = async () => {
    if (!selectedShift) return;
    setIsVerifying(true);
    try {
      await api.post('/staff/shifts/verify', {
        shift_id: selectedShift.id,
        manager_notes: managerNotes
      });
      toast({ title: "Shift Verified", description: `Reconciliation for ${selectedShift.staff_name} complete.` });
      setSelectedShift(null);
      setManagerNotes('');
      fetchShifts();
    } catch (err) {
      toast({ variant: "destructive", title: "Verification failed" });
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Scanning Cash Logs...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#1b1b24] p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <ShieldCheck className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Financial Auditing</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none">
             Shift <span className="text-primary">Audit</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-6 ml-1 tracking-wide max-w-xl">
             Verify daily cash handovers and resolve discrepancies. Maintain a clean digital audit trail for every shift.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative z-10">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pending Reconciliation</p>
           <p className="text-4xl font-black text-white">{shifts.length} <span className="text-xl text-primary">SHIFTS</span></p>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 gap-6">
         {shifts.length === 0 ? (
           <Card className="border-dashed border-2 border-border bg-transparent p-20 text-center rounded-[3rem]">
              <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6 opacity-20" />
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">All shifts reconciled</h3>
              <p className="text-slate-500 font-bold mt-2">Check back later for new shift handovers.</p>
           </Card>
         ) : (
           shifts.map((shift) => {
             const isShort = Number(shift.discrepancy_paise) < 0;
             const isExcess = Number(shift.discrepancy_paise) > 0;

             return (
               <Card 
                 key={shift.id} 
                 className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all cursor-pointer"
                 onClick={() => setSelectedShift(shift)}
               >
                  <CardContent className="p-0 flex items-stretch">
                     <div className={cn(
                       "w-2 transition-all group-hover:w-4",
                       isShort ? "bg-red-500" : isExcess ? "bg-emerald-500" : "bg-primary"
                     )} />
                     <div className="p-10 flex-1 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-2xl font-black text-primary">
                              {shift.staff_name[0]}
                           </div>
                           <div>
                              <p className="font-black text-xl text-foreground tracking-tight">{shift.staff_name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                 <Clock className="h-3 w-3" />
                                 {format(new Date(shift.clock_in), 'h:mm a')} - {format(new Date(shift.clock_out), 'h:mm a')}
                              </p>
                           </div>
                        </div>

                        <div className="bg-secondary/30 p-6 rounded-2xl">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Expected Cash</p>
                           <p className="text-xl font-black text-foreground">₹{(Number(shift.expected_cash_paise) / 100).toLocaleString()}</p>
                        </div>

                        <div className="bg-secondary/30 p-6 rounded-2xl">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Actual Cash</p>
                           <p className="text-xl font-black text-foreground">₹{(Number(shift.closing_cash_paise) / 100).toLocaleString()}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                           <div className={cn(
                             "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest",
                             isShort ? "bg-red-500/10 text-red-500" : isExcess ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                           )}>
                              {Number(shift.discrepancy_paise) === 0 ? 'Balanced' : `₹${Math.abs(Number(shift.discrepancy_paise) / 100).toLocaleString()} ${isShort ? 'Short' : 'Excess'}`}
                           </div>
                           <Button variant="ghost" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] h-8 hover:bg-primary/5">
                              Verify Now <ArrowRight className="h-3 w-3 ml-2" />
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>
             );
           })
         )}
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
         <DialogContent className="max-w-2xl rounded-[3rem] p-10 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Shift Verification</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Confirm cash handover for {selectedShift?.staff_name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-secondary/50 p-8 rounded-[2rem] border border-border">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recorded by Staff</p>
                     <p className="text-3xl font-black text-foreground">₹{(Number(selectedShift?.closing_cash_paise) / 100).toLocaleString()}</p>
                  </div>
                  <div className={cn(
                    "p-8 rounded-[2rem] border-2",
                    Number(selectedShift?.discrepancy_paise) < 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                  )}>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Discrepancy</p>
                     <p className={cn(
                       "text-3xl font-black",
                       Number(selectedShift?.discrepancy_paise) < 0 ? "text-red-500" : "text-emerald-500"
                     )}>
                        {Number(selectedShift?.discrepancy_paise) === 0 ? 'None' : `₹${(Number(selectedShift?.discrepancy_paise) / 100).toLocaleString()}`}
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                     <FileText className="h-4 w-4" /> Manager Audit Notes
                  </label>
                  <Input 
                    placeholder="E.g., Shortage due to change error, verified with CCTV..."
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    className="h-20 bg-secondary/30 border-2 border-border rounded-2xl p-6 text-lg font-bold focus:border-primary outline-none transition-all"
                  />
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button 
                 variant="ghost" 
                 onClick={() => setSelectedShift(null)}
                 className="flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-[11px]"
               >
                  Cancel
               </Button>
               <Button 
                 onClick={handleVerify}
                 disabled={isVerifying}
                 className="flex-1 bg-primary text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-glow"
               >
                  {isVerifying ? 'Verifying...' : 'Approve & Close Shift'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
