'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  RefreshCw, 
  Calendar, 
  BarChart3, 
  ChefHat, 
  Package, 
  ArrowRight,
  BrainCircuit,
  Zap,
  Info,
  CheckCircle2
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function InventoryPredictorPage() {
  const [forecast, setForecast] = useState<any[]>([]);
  const [procurement, setProcurement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    // Simulated: Get current outlet ID from context or local storage
    const outletId = localStorage.getItem('last_outlet_id') || 'all'; 
    if (outletId === 'all') return setLoading(false);

    try {
      const [fRes, pRes] = await Promise.all([
        api.get(`/forecast/${outletId}/summary`),
        api.get(`/forecast/${outletId}/procurement`)
      ]);
      setForecast(fRes.data.data);
      setProcurement(pRes.data.data);
    } catch (err) {
      console.error('Failed to fetch forecast data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAI = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    if (!outletId) return;

    setAnalyzing(true);
    try {
      await api.post(`/forecast/${outletId}/analyze`);
      toast({ title: "AI Analysis Complete", description: "Demand predictions and procurement plans updated." });
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "AI processing failed" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Consulting Predictive Models...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Predictor Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <BrainCircuit className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">AI Demand Intelligence</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Demand <br />
             <span className="text-primary">Forecaster</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Predict your future inventory needs with surgical precision. Our AI analyzes historical sales, seasonal trends, and recipe data to tell you exactly what to buy.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={handleRunAI}
             disabled={analyzing}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <RefreshCw className={cn("h-5 w-5", analyzing && "animate-spin")} />
              {analyzing ? 'Analyzing Sales...' : 'Run AI Analysis'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Predictive Insights */}
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-8">
               <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Predicted Sales Lift</p>
               <p className="text-4xl font-black text-foreground">+12.5%</p>
               <p className="text-[11px] font-bold text-emerald-500 mt-2 flex items-center gap-1">Next 7 Days Forecast</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-8">
               <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Stock-Outs</p>
               <p className="text-4xl font-black text-foreground">{procurement.length}</p>
               <p className="text-[11px] font-bold text-amber-500 mt-2">Predicted items to deplete</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[2.5rem] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
               <Zap className="h-12 w-12 text-primary opacity-20" />
            </div>
            <CardContent className="p-8 relative z-10">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Wastage Reduction</p>
               <p className="text-5xl font-black text-primary">-24%</p>
               <p className="text-sm font-bold text-white/60 mt-4 leading-relaxed">AI procurement plan minimizes perishable stock wastage by aligning purchase with actual demand.</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Procurement Plan */}
         <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">AI Procurement Plan</h2>
               <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">7-DAY OUTLOOK</Badge>
            </div>
            <Card className="border-none bg-card shadow-soft rounded-[3rem] overflow-hidden">
               <Table>
                  <TableHeader className="bg-secondary/50">
                     <TableRow className="border-none">
                        <TableHead className="font-black uppercase tracking-widest text-[10px] p-8">Ingredient</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Required</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right p-8 text-primary">Action Needed</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {procurement.map((item, idx) => (
                       <TableRow key={idx} className="border-border hover:bg-secondary/20 transition-colors group">
                          <TableCell className="p-8 font-black text-foreground">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                                   <Package className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                {item.ingredient_name}
                             </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-slate-500">{Number(item.required_stock).toFixed(1)} {item.unit}</TableCell>
                          <TableCell className="p-8 text-right">
                             <Button className="bg-primary text-white rounded-xl px-6 h-10 font-black uppercase tracking-widest text-[9px] shadow-glow">
                                Buy {Math.ceil(item.purchase_needed)} {item.unit}
                             </Button>
                          </TableCell>
                       </TableRow>
                     ))}
                     {procurement.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={3} className="p-20 text-center font-bold text-slate-400">
                             <div className="space-y-4">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                                <p>Optimal Stock Levels. No immediate procurement needed.</p>
                             </div>
                          </TableCell>
                       </TableRow>
                     )}
                  </TableBody>
               </Table>
            </Card>
         </div>

         {/* Sales Forecast */}
         <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Sales Projections</h2>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Info className="h-4 w-4" /> Based on 30-day moving average
               </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
               {forecast.slice(0, 8).map((f, idx) => (
                 <Card key={idx} className="border border-border bg-card shadow-soft rounded-[2rem] hover:border-primary transition-all">
                    <CardContent className="p-6 flex justify-between items-center">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center font-black text-primary text-xs">
                             {format(new Date(f.predicted_date), 'EEE')}
                          </div>
                          <div>
                             <p className="text-sm font-black text-foreground">{f.item_name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(f.predicted_date), 'MMM d, yyyy')}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-black text-primary">{f.predicted_quantity}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400">Predicted Units</p>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
