'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Leaf, Droplets, Wind, 
  Trash2, TrendingDown, Sparkles,
  BarChart3, ShieldCheck, ArrowRight,
  Globe, Trees, Recycle, 
  Scale, AlertTriangle, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

export default function SustainabilityDashboard() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['sustainability-report'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/sustainability/report');
      return data.data;
    },
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
       {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  const totalCO2 = report?.reduce((acc: any, curr: any) => acc + Number(curr.total_co2), 0) || 0;
  const totalWater = report?.reduce((acc: any, curr: any) => acc + Number(curr.total_water), 0) || 0;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-xs">
            <Globe className="h-4 w-4" /> Eco-Impact Center
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Sustainability Intelligence</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">
              Impact Audit
           </Button>
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-xl px-8 shadow-glow-emerald">
              <Sparkles className="h-4 w-4 mr-2" /> Green Strategy AI
           </Button>
        </div>
      </div>

      {/* Hero Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-soft rounded-[3rem] bg-emerald-50 text-emerald-900 p-1 relative overflow-hidden">
            <CardContent className="p-10 space-y-4 relative z-10">
               <div className="h-14 w-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Wind className="h-8 w-8 text-emerald-600" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Carbon Footprint</p>
                  <h3 className="text-4xl font-black tracking-tighter">{totalCO2.toFixed(1)} <span className="text-lg opacity-40">KG CO₂</span></h3>
               </div>
               <p className="text-xs font-medium text-emerald-700/60">Equivalent to planting {(totalCO2 / 20).toFixed(0)} trees this month.</p>
            </CardContent>
            <Wind className="absolute -bottom-10 -right-10 h-40 w-40 text-emerald-100/50" />
         </Card>

         <Card className="border-none shadow-soft rounded-[3rem] bg-blue-50 text-blue-900 p-1 relative overflow-hidden">
            <CardContent className="p-10 space-y-4 relative z-10">
               <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Droplets className="h-8 w-8 text-blue-600" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Water Usage Waste</p>
                  <h3 className="text-4xl font-black tracking-tighter">{totalWater.toLocaleString()} <span className="text-lg opacity-40">LTRS</span></h3>
               </div>
               <p className="text-xs font-medium text-blue-700/60">Lost during supply chain and prep spoilage.</p>
            </CardContent>
            <Droplets className="absolute -bottom-10 -right-10 h-40 w-40 text-blue-100/50" />
         </Card>

         <Card className="border-none shadow-soft rounded-[3rem] bg-slate-900 text-white p-1 relative overflow-hidden">
            <CardContent className="p-10 space-y-4 relative z-10">
               <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Scale className="h-8 w-8 text-white" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Waste Cost</p>
                  <h3 className="text-4xl font-black tracking-tighter text-emerald-400">{formatCurrency(report?.reduce((acc: any, curr: any) => acc + Number(curr.total_cost), 0) || 0)}</h3>
               </div>
               <p className="text-xs font-medium text-white/40">Direct revenue lost to discarded inventory.</p>
            </CardContent>
            <Scale className="absolute -bottom-10 -right-10 h-40 w-40 text-white/5" />
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Category Breakdown */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Eco-Impact by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {report?.map((cat: any) => (
                 <Card key={cat.item_category} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 space-y-6">
                       <div className="flex justify-between items-start">
                          <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{cat.item_category}</h4>
                          <Badge className="bg-secondary text-slate-400 border-none font-black text-[9px] uppercase tracking-widest">
                             {((Number(cat.total_co2) / totalCO2) * 100).toFixed(0)}% Share
                          </Badge>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-secondary/30 rounded-2xl">
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">CO₂ Impact</p>
                             <p className="text-lg font-black">{Number(cat.total_co2).toFixed(1)}kg</p>
                          </div>
                          <div className="p-4 bg-secondary/30 rounded-2xl">
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Water Cost</p>
                             <p className="text-lg font-black">{Number(cat.total_water).toLocaleString()}L</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Revenue Leak: {formatCurrency(cat.total_cost)}</span>
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         {/* Green Insights Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Eco-Strategy</h2>
            
            <Card className="border-none shadow-soft rounded-[3rem] bg-emerald-900 text-white p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Trees className="h-40 w-40" />
               </div>

               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">AI Green Tip</h3>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">
                     Your meat waste accounts for 84% of your CO₂ footprint. Reducing meat spoilage by just 10% would save as much CO₂ as a car driving 1,200 miles.
                  </p>
               </div>

               <Button className="w-full h-14 rounded-2xl bg-white text-emerald-900 font-black uppercase tracking-widest text-xs hover:bg-white/90 relative z-10 shadow-glow">
                  Launch Waste-Reduction Goal
               </Button>
            </Card>

            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-10 space-y-6">
               <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Recoverable Waste</h3>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                     "Approximately 14% of your dry goods waste this month was donatable before expiry. Consider a partnership with local food banks."
                  </p>
                  <Button variant="link" className="p-0 h-auto text-emerald-600 font-black uppercase text-[10px] tracking-widest">
                     View Donation Logic <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
