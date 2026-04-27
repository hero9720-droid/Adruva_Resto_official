'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  History, ArrowLeft, ArrowUpRight, 
  ArrowDownLeft, AlertCircle, Search,
  Filter, Calendar, User, FileText,
  Boxes, Package, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ForensicLedgerPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: history, isLoading } = useQuery({
    queryKey: ['inventory-ledger', id],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/ledger/${id}`);
      return data.data;
    },
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="h-96 bg-secondary rounded-[3rem]" />
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-0 hover:bg-transparent text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2"
          >
             <ArrowLeft className="h-3 w-3 mr-1" /> Back to Inventory
          </Button>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <History className="h-4 w-4" /> Forensic Audit Trail
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Stock Ledger History</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">
              <Calendar className="h-4 w-4 mr-2" /> Select Range
           </Button>
           <Button className="bg-foreground text-background font-black h-12 rounded-xl px-8 shadow-glow">
              Export Audit Log
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
         
         <Card className="border-none shadow-soft rounded-[3rem] bg-card overflow-hidden">
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-border bg-secondary/30">
                           <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                           <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Event Type</th>
                           <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Performed By</th>
                           <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Delta</th>
                           <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">New Balance</th>
                           <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border/50">
                        {history?.map((log: any) => (
                          <tr key={log.id} className="hover:bg-secondary/20 transition-colors group">
                             <td className="px-8 py-6">
                                <p className="text-xs font-black text-foreground">{format(new Date(log.created_at), 'MMM dd, HH:mm')}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-1">{format(new Date(log.created_at), 'yyyy')}</p>
                             </td>
                             <td className="px-8 py-6">
                                <Badge className={cn(
                                  "h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest",
                                  log.type === 'purchase' ? "bg-emerald-500/10 text-emerald-500" :
                                  log.type === 'waste' ? "bg-red-500/10 text-red-500" :
                                  log.type === 'sale' ? "bg-blue-500/10 text-blue-500" :
                                  "bg-slate-500/10 text-slate-500"
                                )}>
                                   {log.type.replace('_', ' ')}
                                </Badge>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                   <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center font-black text-[10px] text-slate-400">
                                      {log.staff_name?.[0] || 'S'}
                                   </div>
                                   <p className="text-xs font-bold text-foreground">{log.staff_name || 'System Auto'}</p>
                                </div>
                             </td>
                             <td className={cn(
                               "px-8 py-6 text-right font-black text-sm",
                               log.quantity_delta > 0 ? "text-emerald-500" : "text-red-500"
                             )}>
                                {log.quantity_delta > 0 ? '+' : ''}{log.quantity_delta}
                             </td>
                             <td className="px-8 py-6 text-right">
                                <p className="text-sm font-black text-foreground">{log.balance_after}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer">
                                   <FileText className="h-4 w-4 text-slate-300" />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary">
                                      {log.reference_id?.split('-')[0] || 'Direct'}
                                   </span>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               {history?.length === 0 && (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-300 gap-4">
                     <Boxes className="h-12 w-12" />
                     <p className="text-xs font-black uppercase tracking-widest">No movement history found for this item</p>
                  </div>
               )}
            </CardContent>
         </Card>

      </div>
    </div>
  );
}
