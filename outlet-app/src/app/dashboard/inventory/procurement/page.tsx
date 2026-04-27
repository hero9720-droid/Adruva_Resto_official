'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  PackageSearch, Truck, AlertTriangle, 
  Plus, CheckCircle2, ShoppingCart,
  ArrowRight, Loader2, Sparkles, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { useOutletProfile } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export default function ProcurementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: outlet } = useOutletProfile();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['procurement-suggestions'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/procurement/suggestions');
      return data.data;
    },
  });

  const generatePOs = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/inventory/procurement/generate');
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['procurement-suggestions'] });
      toast({ 
        title: "Orders Generated", 
        description: `Successfully created ${data.createdCount} Purchase Orders.` 
      });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-3xl" />)}
    </div>
  </div>;

  const totalProjectedSpend = suggestions?.reduce((acc: number, item: any) => acc + (item.reorder_quantity * item.avg_cost_paise), 0) || 0;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Brain className="h-4 w-4" /> Supply Chain Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Auto-Procurement Center</h1>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-glow"
          onClick={() => generatePOs.mutate()}
          disabled={generatePOs.isPending || suggestions?.length === 0}
        >
          {generatePOs.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 fill-current" />}
          Generate All Suggested POs
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card">
           <CardContent className="p-8 flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Items</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black tracking-tighter text-foreground">{suggestions?.length || 0}</span>
                 <Badge className="bg-red-500 text-white border-none font-black text-[9px] uppercase tracking-tighter">Critical</Badge>
              </div>
           </CardContent>
        </Card>
        <Card className="border-none shadow-soft rounded-[2rem] bg-card">
           <CardContent className="p-8 flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected Spend</span>
              <span className="text-4xl font-black tracking-tighter text-primary">
                 {formatCurrency(totalProjectedSpend, outlet?.currency_code, outlet?.locale)}
              </span>
           </CardContent>
        </Card>
        <Card className="border-none shadow-soft rounded-[2rem] bg-primary/5 border border-primary/10">
           <CardContent className="p-8 flex flex-col gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Automation Status</span>
              <div className="flex items-center gap-2">
                 <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                 <span className="text-2xl font-black tracking-tighter text-foreground uppercase">Engine Active</span>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Suggestion Feed */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Smart Replenishment List</h2>
        <div className="space-y-4">
          {suggestions?.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center bg-secondary/20 rounded-[3rem] border border-dashed border-border">
               <PackageSearch className="h-16 w-16 text-slate-300 mb-4" />
               <p className="text-xl font-black text-slate-400 uppercase tracking-tight">Inventory levels optimal</p>
               <p className="text-slate-500 font-medium text-sm mt-1">No ingredients are below reorder level.</p>
            </div>
          ) : (
            suggestions?.map((item: any) => (
              <Card key={item.id} className="border-none shadow-soft rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all">
                <CardContent className="p-8 flex items-center justify-between gap-8">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                      <Truck className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                       <h4 className="text-xl font-black tracking-tight text-foreground uppercase truncate">{item.name}</h4>
                       <div className="flex items-center gap-4 mt-1">
                          <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">Stock: {item.current_stock}</p>
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Target: {item.reorder_level + item.reorder_quantity}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 shrink-0">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recommended Order</p>
                        <p className="text-lg font-black text-foreground">{item.reorder_quantity} Units</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Est. Cost</p>
                        <p className="text-xl font-black text-primary">
                           {formatCurrency(item.reorder_quantity * item.avg_cost_paise, outlet?.currency_code, outlet?.locale)}
                        </p>
                     </div>
                     <div className="bg-secondary/50 px-4 py-2 rounded-xl text-center min-w-[140px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Supplier</p>
                        <p className="text-[11px] font-black text-slate-600 uppercase truncate">
                           {item.supplier_name || 'Unassigned'}
                        </p>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
