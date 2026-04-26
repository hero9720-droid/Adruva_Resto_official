'use client';

import { useState, useEffect } from 'react';
import { 
  BookText, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  IndianRupee, 
  ArrowRightCircle, 
  ClipboardCheck, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Plus,
  Zap,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

export default function ShiftDiaryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [handover, setHandover] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogEntry, setShowLogEntry] = useState(false);

  const [newEntry, setNewEntry] = useState({
    shift_type: 'morning',
    opening_cash_paise: 500000, // ₹5,000
    closing_cash_paise: 0,
    summary: '',
    incidents: [] as any[],
    checklist_items: [
      { task: 'Cash Counter Tallied', completed: false },
      { task: 'Kitchen Deep Cleaned', completed: false },
      { task: 'Inventory Stock Counted', completed: false },
      { task: 'Staff Attendance Marked', completed: false },
    ]
  });

  const { toast } = useToast();

  const fetchData = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    if (!outletId) return;

    try {
      const [logsRes, handoverRes] = await Promise.all([
        api.get(`/operations/${outletId}/shift-logs`),
        api.get(`/operations/${outletId}/handover`)
      ]);
      setLogs(logsRes.data.data);
      setHandover(handoverRes.data.data);
    } catch (err) {
      console.error('Failed to fetch shift data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitLog = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      await api.post(`/operations/${outletId}/shift-logs`, newEntry);
      toast({ title: "Shift Handover Complete", description: "Your logs have been secured for the next manager." });
      setShowLogEntry(false);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Submission failed" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Retrieving Digital Diary...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Diary Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <BookText className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Shift Handover & Operations</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Manager’s <br />
             <span className="text-primary">Diary</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Eliminate manual logbooks. Record shift summaries, reconcile cash counters, log incidents, and ensure a seamless transition for the incoming management team.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowLogEntry(true)}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <Zap className="h-5 w-5" /> End Current Shift
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Handover Briefing */}
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[3rem] lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
               <ShieldCheck className="h-16 w-16 text-primary opacity-20" />
            </div>
            <CardHeader className="p-10 pb-4">
               <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase tracking-widest">Incoming Briefing</Badge>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Last Shift: {handover?.shift_type}</span>
               </div>
               <CardTitle className="text-4xl font-black uppercase tracking-tighter">Handover Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
               <p className="text-lg font-medium text-white/70 italic leading-relaxed mb-8">
                  "{handover?.summary || 'No summary provided for the previous shift. Carry on with standard protocols.'}"
               </p>
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {handover ? format(new Date(handover.created_at), 'HH:mm') : '--:--'}</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Logged by {handover?.manager_name || 'System'}</div>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <IndianRupee className="h-6 w-6 text-emerald-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cash Reconciliation</p>
               <p className="text-4xl font-black text-foreground">₹{(handover?.closing_cash_paise / 100 || 0).toLocaleString()}</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">Opening: ₹{(handover?.opening_cash_paise / 100 || 0).toLocaleString()}</p>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unresolved Incidents</p>
               <p className="text-4xl font-black text-foreground">{handover?.incidents?.length || 0}</p>
               <p className="text-[11px] font-bold text-primary mt-2">Requires immediate attention</p>
            </CardContent>
         </Card>
      </div>

      {/* Diary History Feed */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Operational Timeline</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <History className="h-4 w-4" /> AUDIT TRAIL SECURED
            </div>
         </div>

         <div className="space-y-6">
            {logs.map((log) => (
              <Card key={log.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden hover:border-primary transition-all">
                 <CardContent className="p-10 flex items-center justify-between gap-12">
                    <div className="flex items-center gap-10">
                       <div className="h-20 w-20 bg-secondary rounded-[2.25rem] flex items-center justify-center text-primary relative">
                          <BookText className="h-10 w-10" />
                          <div className="absolute -top-1 -right-1 h-6 w-6 bg-emerald-500 border-4 border-card rounded-full" />
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                                {log.shift_type} SHIFT
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(log.created_at), 'MMMM d, yyyy')}</span>
                          </div>
                          <h3 className="text-3xl font-black text-foreground tracking-tighter truncate max-w-xl">{log.summary || 'Standard shift completion.'}</h3>
                          <p className="text-sm font-bold text-slate-500 mt-2">Managed by {log.manager_name}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-border hover:bg-secondary">
                          View Details
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>

      {/* End Shift / Handover Modal */}
      <Dialog open={showLogEntry} onOpenChange={setShowLogEntry}>
         <DialogContent className="max-w-4xl rounded-[4rem] p-0 border-none bg-card shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
               {/* Form Side */}
               <div className="flex-1 p-12 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
                  <div>
                     <h2 className="text-4xl font-black uppercase tracking-tighter">End Shift Report</h2>
                     <p className="font-bold text-slate-500">Document your performance and reconcile finances.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Shift Period</label>
                        <select 
                          value={newEntry.shift_type}
                          onChange={(e) => setNewEntry({...newEntry, shift_type: e.target.value})}
                          className="w-full h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6 outline-none appearance-none"
                        >
                           <option value="morning">Morning Shift</option>
                           <option value="afternoon">Afternoon Shift</option>
                           <option value="night">Night Shift</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Closing Cash (₹)</label>
                        <Input 
                          type="number"
                          placeholder="e.g. 12500"
                          value={newEntry.closing_cash_paise / 100 || ''}
                          onChange={(e) => setNewEntry({...newEntry, closing_cash_paise: Number(e.target.value) * 100})}
                          className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Shift Summary & Notes</label>
                     <Textarea 
                       placeholder="Briefly describe key events, customer feedback, or operational notes..."
                       value={newEntry.summary}
                       onChange={(e) => setNewEntry({...newEntry, summary: e.target.value})}
                       className="min-h-[150px] rounded-3xl border-2 bg-secondary/30 font-bold p-6"
                     />
                  </div>

                  <div className="space-y-6">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pre-Handover Checklist</label>
                     <div className="space-y-3">
                        {newEntry.checklist_items.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              const updated = [...newEntry.checklist_items];
                              updated[idx].completed = !updated[idx].completed;
                              setNewEntry({...newEntry, checklist_items: updated});
                            }}
                            className={cn(
                              "flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all",
                              item.completed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" : "bg-secondary/30 border-transparent text-slate-500"
                            )}
                          >
                             <span className="font-black uppercase tracking-widest text-[11px]">{item.task}</span>
                             {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-5 w-5 rounded-full border-2 border-slate-300" />}
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Action Side */}
               <div className="w-full md:w-[350px] bg-[#1b1b24] p-12 flex flex-col justify-between">
                  <div className="space-y-8">
                     <div className="h-20 w-20 bg-primary/10 rounded-[2.25rem] flex items-center justify-center text-primary shadow-glow">
                        <Zap className="h-10 w-10" />
                     </div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Ready for Handover?</h3>
                     <p className="text-white/40 font-bold leading-relaxed">Ensure all data is accurate. Once submitted, these logs will be shared with the incoming manager.</p>
                  </div>

                  <div className="space-y-4">
                     <Button 
                      onClick={handleSubmitLog}
                      className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
                     >
                        Confirm & Close Shift
                     </Button>
                     <Button variant="ghost" onClick={() => setShowLogEntry(false)} className="w-full text-white/40 h-14 font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
