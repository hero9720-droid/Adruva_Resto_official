'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BarChart4, Wallet, FileText, 
  ArrowUpRight, ArrowDownRight, Scale,
  RefreshCcw, ShieldCheck, Sparkles,
  ArrowRight, Search, Filter,
  Building2, Receipt, Landmark,
  Send, AlertCircle, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useState } from 'react';

export default function FranchiseSettlementsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7));

  const { data: settlements, isLoading } = useQuery({
    queryKey: ['franchise-settlements', period],
    queryFn: async () => {
      const { data } = await api.get(`/chain/management/franchise/settlements?period=${period}`);
      return data.data;
    },
  });

  const calcMutation = useMutation({
    mutationFn: async (outlet_id: string) => {
      await api.post('/chain/management/franchise/settlements/calculate', { outlet_id, period });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-settlements'] });
      toast({ title: "Settlement Recalculated", description: "Royalties and net payouts updated for the period." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[1,2,3,4].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs">
            <Landmark className="h-4 w-4" /> Financial Reconciliation
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Franchisee Settlements</h1>
        </div>
        <div className="flex gap-3">
           <input 
             type="month" 
             value={period} 
             onChange={(e) => setPeriod(e.target.value)}
             className="h-12 rounded-xl border border-border bg-card px-4 font-bold outline-none focus:ring-2 focus:ring-primary"
           />
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Download className="h-4 w-4 mr-2" /> Bulk Export
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         
         {/* Settlement Ledger */}
         <div className="xl:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Settlement Ledger ({settlements?.length || 0})</h2>
            <div className="space-y-4">
               {settlements?.map((sett: any) => (
                 <Card key={sett.id} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                             <Building2 className="h-8 w-8 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{sett.outlet_name}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Invoice: {sett.invoice_number}</p>
                             <div className="flex items-center gap-2 mt-2">
                                <Badge className={cn(
                                  "text-[8px] font-black uppercase tracking-widest border-none h-5",
                                  sett.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                )}>
                                   {sett.status}
                                </Badge>
                                <span className="text-[10px] font-medium text-slate-300">Net Payout Scheduled</span>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-3 gap-8 shrink-0">
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Sales</p>
                             <p className="text-lg font-black">{formatCurrency(sett.total_sales_paise)}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Royalty + Fees</p>
                             <p className="text-lg font-black text-red-500">-{formatCurrency(Number(sett.royalty_amount_paise) + Number(sett.fixed_fee_paise))}</p>
                          </div>
                          <div className="col-span-2 md:col-span-1 border-l border-border pl-8 hidden md:block">
                             <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Net Payout</p>
                             <p className="text-xl font-black text-emerald-500">{formatCurrency(sett.net_payout_paise)}</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <Button variant="outline" className="h-12 w-12 rounded-xl border-border" onClick={() => calcMutation.mutate(sett.outlet_id)}>
                             <RefreshCcw className={cn("h-5 w-5", calcMutation.isPending && "animate-spin")} />
                          </Button>
                          <Button className="h-12 px-6 rounded-xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest shadow-glow">
                             Details
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         {/* Financial Overview Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Chain Reconciliation</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Landmark className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Period Summary</h3>
                  <p className="text-white/60 text-sm font-medium">Reconciliation for {period}</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Chain Revenue</span>
                     <span className="text-xl font-black">{formatCurrency(settlements?.reduce((acc: any, s: any) => acc + Number(s.total_sales_paise), 0) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Royalties Due</span>
                     <span className="text-xl font-black text-amber-400">{formatCurrency(settlements?.reduce((acc: any, s: any) => acc + Number(s.royalty_amount_paise), 0) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Franchisee Net Payout</span>
                     <span className="text-xl font-black text-emerald-400">{formatCurrency(settlements?.reduce((acc: any, s: any) => acc + Number(s.net_payout_paise), 0) || 0)}</span>
                  </div>
               </div>

               <Button className="w-full h-14 rounded-2xl bg-white text-indigo-900 font-black uppercase tracking-widest text-xs hover:bg-white/90 relative z-10 shadow-glow">
                  <Send className="h-4 w-4 mr-2" /> Finalize & Release Payouts
               </Button>
            </Card>

            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-10 space-y-6">
               <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Compliance Alerts</h3>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                     3 outlets have pending marketing cost adjustments for this period. Please reconcile before final release.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary font-black uppercase text-[10px] tracking-widest">
                     View Adjustments <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
