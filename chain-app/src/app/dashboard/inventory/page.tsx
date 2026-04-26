'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  PackageCheck, 
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function InventoryTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransfers = async () => {
    try {
      const { data } = await api.get('/inventory/transfers');
      setTransfers(data.data);
    } catch (err) {
      console.error('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/inventory/transfers/${id}/status`, { status });
      toast({ title: "Transfer Updated", description: `Stock movement marked as ${status}.` });
      fetchTransfers();
    } catch (err) {
      toast({ variant: "destructive", title: "Update failed", description: "Could not finalize transfer." });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <ArrowRightLeft className="h-10 w-10 text-primary" />
             </div>
             Supply Chain
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Inter-outlet stock transfers and inventory movement.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[11px] transition-all shadow-glow border-none flex items-center gap-3">
           <Plus className="h-5 w-5" />
           Initiate Transfer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
           <CardHeader className="p-10 pb-6 border-b border-border flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Active Movements</CardTitle>
                 <CardDescription className="text-slate-500 font-bold text-base mt-2">Real-time status of stock currently in transit or pending.</CardDescription>
              </div>
              <div className="flex gap-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      placeholder="Search transfers..." 
                      className="h-12 w-64 bg-secondary/50 border border-border rounded-2xl pl-12 pr-6 font-bold text-sm focus:bg-secondary transition-all outline-none"
                    />
                 </div>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <Table>
                 <TableHeader>
                    <TableRow className="border-b border-border bg-secondary/30 hover:bg-secondary/30 h-20">
                       <TableHead className="px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Ingredient & Qty</TableHead>
                       <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Route</TableHead>
                       <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                       <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Initiated</TableHead>
                       <TableHead className="text-right px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {transfers.map((t) => (
                      <TableRow key={t.id} className="border-b border-border hover:bg-secondary/50 transition-all h-28 group">
                         <TableCell className="px-10">
                            <div className="flex items-center gap-6">
                               <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                  <PackageCheck className="h-7 w-7 text-primary" />
                               </div>
                               <div>
                                  <p className="font-black text-lg text-foreground tracking-tight">{t.ingredient_name}</p>
                                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t.quantity} Units</p>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-4">
                               <span className="font-black text-sm text-foreground">{t.from_outlet_name}</span>
                               <ArrowRight className="h-4 w-4 text-slate-300" />
                               <span className="font-black text-sm text-foreground">{t.to_outlet_name}</span>
                            </div>
                         </TableCell>
                         <TableCell>
                            <Badge className={cn(
                               "px-4 py-2 font-black tracking-widest uppercase text-[9px] border border-border shadow-inner rounded-xl",
                               t.status === 'received' ? 'bg-emerald-500/10 text-emerald-500' : 
                               t.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                               t.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-destructive/10 text-destructive'
                            )}>
                               {t.status}
                            </Badge>
                         </TableCell>
                         <TableCell className="text-sm font-black text-slate-500 tracking-tighter">
                            {new Date(t.created_at).toLocaleDateString()}
                         </TableCell>
                         <TableCell className="text-right px-10">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                               {t.status === 'pending' && (
                                 <Button 
                                  variant="ghost" 
                                  className="text-blue-500 hover:bg-blue-500/10 rounded-xl px-4 h-11 font-black text-[10px] uppercase tracking-widest"
                                  onClick={() => handleUpdateStatus(t.id, 'shipped')}
                                 >
                                    Ship
                                 </Button>
                               )}
                               {t.status === 'shipped' && (
                                 <Button 
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 h-11 font-black text-[10px] uppercase tracking-widest border-none shadow-glow-emerald"
                                  onClick={() => handleUpdateStatus(t.id, 'received')}
                                 >
                                    Mark Received
                                 </Button>
                               )}
                               {(t.status === 'pending' || t.status === 'shipped') && (
                                 <Button 
                                  variant="ghost" 
                                  className="text-destructive hover:bg-destructive/10 rounded-xl h-11 w-11 flex items-center justify-center p-0"
                                  onClick={() => handleUpdateStatus(t.id, 'cancelled')}
                                 >
                                    <XCircle className="h-5 w-5" />
                                 </Button>
                               )}
                            </div>
                         </TableCell>
                      </TableRow>
                    ))}
                    {transfers.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={5} className="h-64 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                               <Truck className="h-16 w-16" />
                               <p className="font-black uppercase tracking-widest text-xs">No active transfers detected.</p>
                            </div>
                         </TableCell>
                      </TableRow>
                    )}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
