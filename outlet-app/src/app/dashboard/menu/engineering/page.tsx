'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Star, TrendingUp, HelpCircle, 
  Trash2, Sparkles, Filter,
  ArrowRight, DollarSign, BarChart4,
  AlertCircle, ChevronRight, Zap,
  TrendingDown, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useState } from 'react';

export default function MenuEngineeringPage() {
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7));

  const { data: matrix, isLoading } = useQuery({
    queryKey: ['menu-matrix', period],
    queryFn: async () => {
      const { data } = await api.get(`/menu/engineering/matrix?period=${period}`);
      return data.data;
    },
  });

  const getQuadrantItems = (classification: string) => {
    return matrix?.filter((m: any) => m.classification === classification) || [];
  };

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
       {[1,2,3,4].map(i => <div key={i} className="h-60 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <BarChart4 className="h-4 w-4" /> BCGB Menu Matrix
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Menu Engineering Matrix</h1>
        </div>
        <div className="flex gap-3">
           <input 
             type="month" 
             value={period} 
             onChange={(e) => setPeriod(e.target.value)}
             className="h-12 rounded-xl border border-border bg-card px-4 font-bold outline-none focus:ring-2 focus:ring-primary"
           />
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Sparkles className="h-4 w-4 mr-2" /> AI Optimization
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         
         {/* STARS: High Popularity, High Profit */}
         <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-50 dark:bg-indigo-900/20 p-8 space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <Star className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                     <h3 className="text-2xl font-black uppercase tracking-tight text-indigo-900 dark:text-indigo-100">Stars</h3>
                  </div>
                  <p className="text-xs font-medium text-indigo-600/60 dark:text-indigo-300/40 italic">High Profit • High Popularity</p>
               </div>
               <Badge className="bg-indigo-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Maintain & Feature</Badge>
            </div>
            <div className="space-y-3 relative z-10 h-60 overflow-y-auto pr-4 scrollbar-hide">
               {getQuadrantItems('STAR').map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm">
                    <span className="font-bold text-sm">{item.item_name}</span>
                    <span className="text-indigo-500 font-black text-sm">{item.sales_count} sold</span>
                 </div>
               ))}
               {getQuadrantItems('STAR').length === 0 && <p className="text-center text-slate-400 py-10">No items in this quadrant</p>}
            </div>
         </Card>

         {/* PLOWHORSES: High Popularity, Low Profit */}
         <Card className="border-none shadow-soft rounded-[3rem] bg-amber-50 dark:bg-amber-900/20 p-8 space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5 text-amber-500" />
                     <h3 className="text-2xl font-black uppercase tracking-tight text-amber-900 dark:text-amber-100">Plowhorses</h3>
                  </div>
                  <p className="text-xs font-medium text-amber-600/60 dark:text-amber-300/40 italic">Low Profit • High Popularity</p>
               </div>
               <Badge className="bg-amber-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Reprice or Refine</Badge>
            </div>
            <div className="space-y-3 relative z-10 h-60 overflow-y-auto pr-4 scrollbar-hide">
               {getQuadrantItems('PLOWHORSE').map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border-l-4 border-amber-500">
                    <span className="font-bold text-sm">{item.item_name}</span>
                    <div className="text-right">
                       <p className="text-xs font-black text-amber-600">Cost: {formatCurrency(item.cost_price_paise || 0)}</p>
                       <p className="text-[10px] font-medium text-slate-400">{item.sales_count} sold</p>
                    </div>
                 </div>
               ))}
            </div>
         </Card>

         {/* PUZZLES: Low Popularity, High Profit */}
         <Card className="border-none shadow-soft rounded-[3rem] bg-emerald-50 dark:bg-emerald-900/20 p-8 space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <HelpCircle className="h-5 w-5 text-emerald-500" />
                     <h3 className="text-2xl font-black uppercase tracking-tight text-emerald-900 dark:text-emerald-100">Puzzles</h3>
                  </div>
                  <p className="text-xs font-medium text-emerald-600/60 dark:text-emerald-300/40 italic">High Profit • Low Popularity</p>
               </div>
               <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Promote & Upsell</Badge>
            </div>
            <div className="space-y-3 relative z-10 h-60 overflow-y-auto pr-4 scrollbar-hide">
               {getQuadrantItems('PUZZLE').map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm">
                    <span className="font-bold text-sm">{item.item_name}</span>
                    <Badge className="bg-emerald-100 text-emerald-600 border-none text-[9px] font-black">Margin: {formatCurrency(item.base_price_paise - (item.cost_price_paise || 0))}</Badge>
                 </div>
               ))}
            </div>
         </Card>

         {/* DOGS: Low Popularity, Low Profit */}
         <Card className="border-none shadow-soft rounded-[3rem] bg-red-50 dark:bg-red-900/20 p-8 space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <TrendingDown className="h-5 w-5 text-red-500" />
                     <h3 className="text-2xl font-black uppercase tracking-tight text-red-900 dark:text-red-100">Dogs</h3>
                  </div>
                  <p className="text-xs font-medium text-red-600/60 dark:text-red-300/40 italic">Low Profit • Low Popularity</p>
               </div>
               <Badge className="bg-red-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Remove or Rework</Badge>
            </div>
            <div className="space-y-3 relative z-10 h-60 overflow-y-auto pr-4 scrollbar-hide">
               {getQuadrantItems('DOG').map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm opacity-60 grayscale">
                    <span className="font-bold text-sm">{item.item_name}</span>
                    <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                 </div>
               ))}
            </div>
         </Card>

      </div>

      {/* AI Intelligence Panel */}
      <Card className="border-none shadow-soft rounded-[3rem] bg-slate-900 text-white p-12 space-y-10">
         <div className="flex justify-between items-center">
            <div className="space-y-2">
               <h3 className="text-3xl font-black uppercase italic tracking-tight">AI Strategy Brief</h3>
               <p className="text-white/40 font-medium">Monthly Menu Optimization Insights</p>
            </div>
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-[10px] tracking-widest">
                  <DollarSign className="h-4 w-4" /> Margin Optimization
               </div>
               <p className="text-sm font-medium leading-relaxed text-white/70">
                  Your "Plowhorses" (like {getQuadrantItems('PLOWHORSE')[0]?.item_name || 'Burger'}) are extremely popular but thin on margin. We recommend a 5-8% price increase or a reduction in plate cost.
               </p>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest">
                  <Zap className="h-4 w-4" /> Marketing Opportunity
               </div>
               <p className="text-sm font-medium leading-relaxed text-white/70">
                  {getQuadrantItems('PUZZLE')[0]?.item_name || 'Grilled Fish'} has the highest profit margin on your menu but low visibility. Consider featuring it in your "Chef's Specials" for {period}.
               </p>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-red-400 font-black uppercase text-[10px] tracking-widest">
                  <AlertCircle className="h-4 w-4" /> Menu Cleanup
               </div>
               <p className="text-sm font-medium leading-relaxed text-white/70">
                  {getQuadrantItems('DOG').length} items are currently "Dogs." They clutter your menu and increase prep complexity without contributing meaningful profit.
               </p>
            </div>
         </div>
      </Card>
    </div>
  );
}
