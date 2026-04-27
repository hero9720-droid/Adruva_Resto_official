'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  ShieldCheck, Clock, CheckCircle2, 
  XCircle, ArrowRight, MessageSquare,
  AlertCircle, DollarSign, Package,
  User, Calendar, Filter, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useState } from 'react';

export default function ApprovalInboxPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [comment, setComment] = useState('');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data } = await api.get('/approvals/pending');
      return data.data;
    },
  });

  const decideMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string, decision: string }) => {
      await api.post(`/approvals/${id}/decide`, { decision, comments: comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setComment('');
      toast({ title: "Decision Recorded", description: "The transaction has been updated." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-1 gap-6">
       {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs">
            <ShieldCheck className="h-4 w-4" /> Governance & Control
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Approval Command Center</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Approval Policies</Button>
           <Button className="bg-foreground text-background font-black h-12 rounded-xl px-8 shadow-glow">
              Audit History
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Pending List */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Action Required ({pending?.length || 0})</h2>
            <div className="space-y-4">
               {pending?.map((req: any) => (
                 <Card key={req.id} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0",
                            req.type === 'expense' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                          )}>
                             {req.type === 'expense' ? <DollarSign className="h-8 w-8" /> : <Package className="h-8 w-8" />}
                          </div>
                          <div className="min-w-0">
                             <div className="flex items-center gap-3">
                                <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate">
                                   {req.type === 'expense' ? 'Operational Expense' : 'Bulk Purchase Order'}
                                </h4>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-lg border-border">
                                   High Value
                                </Badge>
                             </div>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                   <User className="h-3 w-3" /> Requested by: {req.requested_by_name}
                                </span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                   <Calendar className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            onClick={() => decideMutation.mutate({ id: req.id, decision: 'rejected' })}
                            className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100"
                          >
                             <XCircle className="h-6 w-6" />
                          </Button>
                          <Button 
                            onClick={() => decideMutation.mutate({ id: req.id, decision: 'approved' })}
                            className="h-14 px-8 rounded-2xl bg-emerald-500 text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-600 shadow-glow-emerald"
                          >
                             <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}

               {pending?.length === 0 && (
                 <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    <p className="text-xs font-black uppercase tracking-widest italic">All governance tasks cleared</p>
                 </div>
               )}
            </div>
         </div>

         {/* Decision Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Context & Notes</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <MessageSquare className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Decision Remarks</h3>
                  <p className="text-white/60 text-sm font-medium">Add a note to your decision for the audit log.</p>
               </div>

               <div className="space-y-4 relative z-10">
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g., Budget approved for this month..."
                    className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-white/30 font-medium focus:ring-2 focus:ring-white/50 transition-all outline-none"
                  />
               </div>

               <div className="p-6 bg-white/10 rounded-2xl border border-white/10 relative z-10">
                  <div className="flex items-center gap-3 text-amber-400">
                     <AlertCircle className="h-5 w-5" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Decision is Immutable</p>
                  </div>
                  <p className="text-[9px] text-white/40 font-medium mt-1 uppercase tracking-tighter">
                     All approvals and rejections are logged to the forensic chain audit trail.
                  </p>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
