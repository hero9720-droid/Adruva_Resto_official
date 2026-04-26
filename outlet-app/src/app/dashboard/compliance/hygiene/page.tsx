'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ClipboardCheck, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Thermometer, 
  Wind, 
  Droplets, 
  Users, 
  ChevronRight,
  Zap,
  MoreVertical,
  Layers,
  FileText,
  Clock,
  Briefcase,
  Camera,
  XCircle,
  BarChart3
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

export default function HygieneAuditPage() {
  const [standards, setStandards] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<any>(null);
  
  const [auditResults, setAuditResults] = useState<any[]>([]);

  const { toast } = useToast();

  const fetchData = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    const chainId = localStorage.getItem('last_chain_id');
    try {
      const [standardsRes, auditsRes, statsRes] = await Promise.all([
        api.get(`/compliance/standards/${chainId}`),
        api.get(`/compliance/${outletId}/history`),
        api.get(`/compliance/${outletId}/stats`)
      ]);
      setStandards(standardsRes.data.data);
      setAudits(auditsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch hygiene data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startAudit = (standard: any) => {
    setSelectedStandard(standard);
    setAuditResults(standard.checkpoints.map((cp: any) => ({
      question: cp.question,
      result: 'pass',
      comment: ''
    })));
    setShowAuditModal(true);
  };

  const submitAudit = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    const score = Math.round((auditResults.filter(r => r.result === 'pass').length / auditResults.length) * 100);
    
    try {
      await api.post(`/compliance/${outletId}/audits`, {
        standard_id: selectedStandard.id,
        results: auditResults,
        score: score
      });
      toast({ title: "Audit Submitted", description: `Safety score: ${score}% recorded.` });
      setShowAuditModal(false);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Audit submission failed" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Initializing Safety Sensors...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Compliance Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <ShieldCheck className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Safety, Hygiene & HACCP Compliance</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Hygiene <br />
             <span className="text-primary">Audits</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Digitize your food safety protocols. Conduct granular hygiene audits, track corrective actions, and maintain high-fidelity compliance scores to ensure total consumer safety.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6 min-w-[200px] text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Compliance Score</p>
              <p className="text-5xl font-black text-primary tracking-tighter">{Math.round(stats?.average_score || 0)}%</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                  <ClipboardCheck className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audits Conducted</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">{stats?.total_audits || 0}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">LAST 30 DAYS</p>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                  <AlertTriangle className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Failures</p>
               <p className="text-4xl font-black text-foreground tracking-tighter">{stats?.critical_failures || 0}</p>
               <p className="text-[10px] font-black text-amber-500 mt-2 tracking-widest uppercase">Requires Action</p>
            </CardContent>
         </Card>

         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4 lg:col-span-2">
            <CardHeader className="p-6 pb-2">
               <CardTitle className="text-xl font-black uppercase tracking-tighter">Available Standards</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex gap-4 overflow-x-auto no-scrollbar">
               {standards.map((s) => (
                 <Button 
                   key={s.id} 
                   onClick={() => startAudit(s)}
                   variant="outline" 
                   className="h-24 px-8 rounded-2xl border-border hover:border-primary group flex flex-col items-start justify-center gap-1 min-w-[220px]"
                 >
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.category}</span>
                    <span className="font-black uppercase tracking-tighter text-sm truncate w-full text-left">{s.title}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{s.checkpoints.length} Checkpoints</span>
                 </Button>
               ))}
            </CardContent>
         </Card>
      </div>

      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Audit History & Timeline</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <History className="h-4 w-4" /> COMPLIANCE LOG SECURED
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {audits.map((audit) => (
              <Card key={audit.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden hover:border-primary transition-all group">
                 <CardContent className="p-10 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                       <div className="text-center w-24">
                          <p className={cn(
                            "text-4xl font-black tracking-tighter",
                            audit.score >= 90 ? "text-emerald-500" : audit.score >= 70 ? "text-amber-500" : "text-red-500"
                          )}>
                             {audit.score}%
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Score</p>
                       </div>
                       <div className="h-16 w-[1px] bg-border" />
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                                {audit.standard_title || 'General Hygiene'}
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(audit.created_at), 'MMMM d, yyyy HH:mm')}</span>
                          </div>
                          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Audit by {audit.auditor_name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                             <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> {audit.results.filter((r: any) => r.result === 'pass').length} Passed
                             </span>
                             <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> {audit.results.filter((r: any) => r.result === 'fail').length} Failed
                             </span>
                          </div>
                       </div>
                    </div>
                    <Button variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] border-border hover:bg-secondary">
                       View Report
                    </Button>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>

      {/* Perform Audit Modal */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
         <DialogContent className="max-w-4xl rounded-[4rem] p-0 border-none bg-card shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
               {/* Form Side */}
               <div className="flex-1 p-12 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
                  <div>
                     <h2 className="text-4xl font-black uppercase tracking-tighter">{selectedStandard?.title}</h2>
                     <p className="font-bold text-slate-500">Verify every checkpoint and record observations.</p>
                  </div>

                  <div className="space-y-6">
                     {auditResults.map((item, idx) => (
                       <Card key={idx} className="border-border bg-secondary/20 rounded-[2rem] p-8 space-y-6">
                          <div className="flex justify-between items-start">
                             <p className="text-lg font-black text-foreground tracking-tight max-w-[80%] leading-tight uppercase">{item.question}</p>
                             <div className="flex gap-2 bg-card p-1 rounded-xl border border-border">
                                <button 
                                  onClick={() => {
                                    const updated = [...auditResults];
                                    updated[idx].result = 'pass';
                                    setAuditResults(updated);
                                  }}
                                  className={cn("px-4 py-2 rounded-lg font-black text-[9px] uppercase", item.result === 'pass' ? "bg-emerald-500 text-white" : "text-slate-400")}
                                >Pass</button>
                                <button 
                                  onClick={() => {
                                    const updated = [...auditResults];
                                    updated[idx].result = 'fail';
                                    setAuditResults(updated);
                                  }}
                                  className={cn("px-4 py-2 rounded-lg font-black text-[9px] uppercase", item.result === 'fail' ? "bg-red-500 text-white" : "text-slate-400")}
                                >Fail</button>
                             </div>
                          </div>
                          
                          <div className="flex gap-4">
                             <Input 
                               placeholder="Add observations or notes..."
                               className="flex-1 h-12 rounded-xl bg-card border-border font-bold text-xs"
                               value={item.comment}
                               onChange={(e) => {
                                 const updated = [...auditResults];
                                 updated[idx].comment = e.target.value;
                                 setAuditResults(updated);
                               }}
                             />
                             <Button variant="outline" className="h-12 w-12 rounded-xl border-border p-0 flex items-center justify-center text-slate-400"><Camera className="h-5 w-5" /></Button>
                          </div>
                       </Card>
                     ))}
                  </div>
               </div>

               {/* Action Side */}
               <div className="w-full md:w-[350px] bg-[#1b1b24] p-12 flex flex-col justify-between">
                  <div className="space-y-8">
                     <div className="h-20 w-20 bg-primary/10 rounded-[2.25rem] flex items-center justify-center text-primary shadow-glow">
                        <ShieldCheck className="h-10 w-10" />
                     </div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Compliance Review</h3>
                     <p className="text-white/40 font-bold leading-relaxed">Your score is calculated based on passed checkpoints. Critical failures require immediate corrective actions.</p>
                     
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-1">Projected Score</p>
                        <p className="text-4xl font-black text-primary">
                           {Math.round((auditResults.filter(r => r.result === 'pass').length / auditResults.length) * 100)}%
                        </p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <Button 
                      onClick={submitAudit}
                      className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
                     >
                        Submit Audit Report
                     </Button>
                     <Button variant="ghost" onClick={() => setShowAuditModal(false)} className="w-full text-white/40 h-14 font-black uppercase tracking-widest text-[10px]">Discard</Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
