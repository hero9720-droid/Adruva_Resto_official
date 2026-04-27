'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BrainCircuit, AlertCircle, ShoppingCart, 
  RefreshCcw, TrendingDown, Clock, PackageCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function InventoryAI() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['inventory-predictions'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/forecast/predictions');
      return data.data;
    },
  });

  const runForecast = useMutation({
    mutationFn: async () => {
      await api.post('/inventory/forecast/run');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-predictions'] });
      toast({ title: 'AI Forecast Updated', description: 'Stock predictions have been recalculated based on latest sales.' });
    },
  });

  if (isLoading) return <div className="p-8 text-center">Analyzing sales data...</div>;

  const lowStockPredictions = predictions?.filter((p: any) => p.days_remaining <= 3) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-soft bg-card rounded-[2rem] overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model Status</p>
              <p className="text-lg font-black text-foreground tracking-tighter uppercase">Optimized</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card rounded-[2rem] overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Items</p>
              <p className="text-lg font-black text-foreground tracking-tighter uppercase">{lowStockPredictions.length} High Risk</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-end items-center">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-glow h-12 px-8 tracking-widest uppercase border-none"
            onClick={() => runForecast.mutate()}
            disabled={runForecast.isPending}
          >
            <RefreshCcw className={cn("h-4 w-4 mr-3", runForecast.isPending && "animate-spin")} />
            Recalculate Forecast
          </Button>
        </div>
      </div>

      {/* Critical Stock Outs */}
      {lowStockPredictions.length > 0 && (
        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-red-500/5">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-red-500" />
              <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase">Predicted Stock Outs (Next 72h)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {lowStockPredictions.map((p: any) => (
                <div key={p.name} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-secondary/20 transition-colors">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg text-foreground uppercase tracking-tight">{p.name}</span>
                      <Badge className="bg-red-500 text-white font-black text-[10px] uppercase border-none">
                        Runout in {Math.floor(p.days_remaining * 24)}h
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Stock</p>
                        <p className="text-sm font-black text-foreground">{p.current_stock} {p.unit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Daily Demand (AI)</p>
                        <p className="text-sm font-black text-foreground">{(p.predicted_demand || 0).toFixed(2)} {p.unit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Time</p>
                        <p className="text-sm font-black text-foreground">{p.lead_time_days} Days</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-red-500">Stock Integrity Risk</span>
                        <span className="text-slate-500">{Math.round(p.days_remaining * 100 / 3)}% Buffer</span>
                      </div>
                      <Progress value={p.days_remaining * 100 / 3} className="h-1.5 bg-secondary" indicatorClassName="bg-red-500" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" className="border-border text-slate-500 font-black uppercase tracking-widest rounded-xl h-12 px-6 hover:bg-secondary">
                      <Clock className="h-4 w-4 mr-2" />
                      View Trends
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-xl h-12 px-6 border-none shadow-soft">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Reorder {p.reorder_quantity || (p.predicted_demand * 7).toFixed(0)} {p.unit}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Healthy Stock Items */}
      <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-6 w-6 text-emerald-500" />
            <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase">Stable Inventory</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions?.filter((p: any) => p.days_remaining > 3).map((p: any) => (
              <div key={p.name} className="p-4 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-black text-foreground text-xs uppercase">{p.name}</p>
                  <p className="text-[10px] font-bold text-slate-500">Sufficient for {Math.floor(p.days_remaining)} days</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 font-black text-[9px] uppercase border-none">
                  Stable
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
