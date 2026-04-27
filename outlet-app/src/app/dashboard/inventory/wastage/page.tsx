'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Trash2, AlertTriangle, TrendingDown, 
  Sparkles, Brain, History, Info,
  ArrowRight, ShieldCheck, Scale, PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { useOutletProfile } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export default function WastagePreventionPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: outlet } = useOutletProfile();

  const { data: risks, isLoading } = useQuery({
    queryKey: ['wastage-risks'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/ai/wastage-risks');
      return data.data;
    },
  });

  const runPrediction = useMutation({
    mutationFn: async () => {
      await api.post('/inventory/ai/predict-usage');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastage-risks'] });
      toast({ title: "AI Sync Complete", description: "Demand forecasts updated based on latest sales." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
      {[1,2].map(i => <div key={i} className="h-48 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Sparkles className="h-4 w-4" /> AI Core V3
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Smart Wastage Prevention</h1>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-glow"
          onClick={() => runPrediction.mutate()}
          disabled={runPrediction.isPending}
        >
          <Brain className="h-4 w-4 mr-2" /> Sync Demand Forecast
        </Button>
      </div>

      {/* Critical Expiry Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-none shadow-soft rounded-[3rem] bg-amber-500 text-white overflow-hidden p-1">
            <div className="bg-white/10 p-8 h-full rounded-[2.8rem]">
               <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                     <AlertTriangle className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white text-amber-600 font-black border-none uppercase tracking-widest text-[10px]">High Priority</Badge>
               </div>
               <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase">Expiry Risk Alert</h3>
               <p className="text-white/80 font-medium text-sm mb-6 max-w-sm">
                  AI identified ingredients that will expire before your predicted demand can consume them.
               </p>
               <div className="space-y-3">
                  {risks?.slice(0, 3).map((r: any) => (
                    <div key={r.id} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                       <span className="font-black uppercase tracking-tight">{r.name}</span>
                       <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-lg">Waste Risk: {r.excess_stock} {r.unit}</span>
                    </div>
                  ))}
               </div>
            </div>
         </Card>

         <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-600 text-white overflow-hidden p-1">
            <div className="bg-white/10 p-8 h-full rounded-[2.8rem] flex flex-col justify-between">
               <div>
                  <div className="flex justify-between items-start mb-6">
                     <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <TrendingDown className="h-8 w-8" />
                     </div>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase">Smart Optimization</h3>
                  <p className="text-white/80 font-medium text-sm mb-8">
                     Potential savings identified through wastage reduction.
                  </p>
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter">₹4,250</span>
                  <span className="text-white/60 font-bold uppercase text-xs tracking-widest mb-2">/ Week Est.</span>
               </div>
            </div>
         </Card>
      </div>

      {/* Demand vs Stock Comparison */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Predictive Inventory Feed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks?.map((item: any) => (
            <Card key={item.id} className="border-none shadow-soft rounded-[2rem] bg-card hover:shadow-xl transition-all border border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h4 className="text-xl font-black tracking-tight text-foreground uppercase">{item.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perishable Category</p>
                   </div>
                   <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest text-[9px] h-6">
                      7d Prediction
                   </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock on Hand</p>
                      <p className="text-lg font-black text-foreground">{item.current_stock} {item.unit}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Predicted Usage</p>
                      <p className="text-lg font-black text-indigo-500">{item.predicted_usage} {item.unit}</p>
                   </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-slate-300" />
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        item.excess_stock > 0 ? "text-red-500" : "text-emerald-500"
                      )}>
                         {item.excess_stock > 0 ? `${item.excess_stock} ${item.unit} Excess` : 'Supply Optimal'}
                      </p>
                   </div>
                   <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest hover:bg-secondary">
                      Create Discount
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
