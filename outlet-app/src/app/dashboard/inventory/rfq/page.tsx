'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Gavel, Users, Package, 
  Clock, ShieldCheck, Star,
  Trophy, ArrowRight, Plus,
  FileText, Search, Filter,
  MessageSquare, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

export default function RFQCenterPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ['procurement-rfqs'],
    queryFn: async () => {
      // Mocked endpoint for list, usually gets all active RFQs for outlet
      return [
        { id: '1', title: 'Monthly Staples (May 2026)', deadline: '2026-05-01', status: 'open', bid_count: 4 },
        { id: '2', title: 'Premium Seafood Batch', deadline: '2026-04-30', status: 'open', bid_count: 2 },
      ];
    },
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
      <div className="h-96 bg-secondary rounded-[3rem]" />
      <div className="h-96 bg-secondary rounded-[3rem]" />
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Gavel className="h-4 w-4" /> Strategic Sourcing
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">RFQ Command Center</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Vendor Performance</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> Launch New RFQ
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Active RFQs */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Live Bidding Events</h2>
            <div className="space-y-4">
               {rfqs?.map((rfq: any) => (
                 <Card key={rfq.id} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                             <FileText className="h-8 w-8 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{rfq.title}</h4>
                             <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                   <Clock className="h-3 w-3" /> Deadline: {rfq.deadline}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                   <Users className="h-3 w-3" /> {rfq.bid_count} Bids
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-secondary">
                          <ArrowRight className="h-5 w-5 text-slate-300" />
                       </Button>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         {/* Bid Comparison Matrix (Contextual) */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Smart Comparison Matrix</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 space-y-8 h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Star className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Best Value Detected</h3>
                  <p className="text-white/60 text-sm font-medium">AI analysis suggests Awarding to "Fresh Farms Ltd" for the Staple RFQ.</p>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                     <div className="flex items-center gap-4">
                        <Trophy className="h-6 w-6 text-amber-400" />
                        <div>
                           <p className="text-sm font-bold uppercase">Fresh Farms Ltd</p>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rating: 4.9/5.0</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xl font-black text-white">₹42,500</p>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">15% Savings</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                     <div className="flex items-center gap-4">
                        <Users className="h-6 w-6 text-white/40" />
                        <div>
                           <p className="text-sm font-bold uppercase">Metro Wholesale</p>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rating: 4.2/5.0</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xl font-black text-white">₹48,900</p>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Market Rate</p>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 relative z-10">
                  <Button className="flex-1 h-14 rounded-2xl bg-white text-indigo-900 font-black uppercase tracking-widest text-xs hover:bg-white/90">
                     Award Bid
                  </Button>
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/20 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10">
                     Negotiate
                  </Button>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
