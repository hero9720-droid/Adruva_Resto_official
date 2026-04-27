'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Sparkles, TrendingUp, TrendingDown, 
  ArrowUpRight, AlertCircle, CheckCircle2,
  Brain, Zap, Target, MousePointer2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { useOutletProfile } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function MenuAIPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: outlet } = useOutletProfile();
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['menu-pricing-insights'],
    queryFn: async () => {
      const { data } = await api.get('/menu/ai/pricing');
      return data.data;
    },
  });

  const applyPricing = useMutation({
    mutationFn: async (recommendations: any[]) => {
      await api.post('/menu/ai/pricing/apply', { recommendations });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-pricing-insights'] });
      toast({ title: "Pricing Updated", description: "Successfully applied AI recommendations." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary rounded-3xl" />)}
    </div>
  </div>;

  const stats = {
    stars: insights?.filter((i: any) => i.classification === 'star').length || 0,
    plowhorses: insights?.filter((i: any) => i.classification === 'plowhorse').length || 0,
    puzzles: insights?.filter((i: any) => i.classification === 'puzzle').length || 0,
    dogs: insights?.filter((i: any) => i.classification === 'dog').length || 0,
  };

  const filteredInsights = selectedClassification 
    ? insights?.filter((i: any) => i.classification === selectedClassification)
    : insights;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Brain className="h-4 w-4" /> Menu Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">AI Pricing Optimizer</h1>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-glow"
          onClick={() => {
            const recs = insights?.filter((i: any) => i.suggestedPricePaise !== i.price_paise)
              .map((i: any) => ({ menu_item_id: i.menu_item_id, suggestedPricePaise: i.suggestedPricePaise }));
            if (recs?.length > 0) applyPricing.mutate(recs);
          }}
          disabled={applyPricing.isPending}
        >
          <Zap className="h-4 w-4 mr-2 fill-current" /> Apply All Recommendations
        </Button>
      </div>

      {/* Quadrant Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Stars', count: stats.stars, class: 'star', color: 'bg-emerald-500', desc: 'High Profit & Popular' },
          { label: 'Plowhorses', count: stats.plowhorses, class: 'plowhorse', color: 'bg-amber-500', desc: 'Popular but Low Profit' },
          { label: 'Puzzles', count: stats.puzzles, class: 'puzzle', color: 'bg-indigo-500', desc: 'Profitable but Unpopular' },
          { label: 'Dogs', count: stats.dogs, class: 'dog', color: 'bg-red-500', desc: 'Low Profit & Unpopular' },
        ].map((q) => (
          <Card 
            key={q.class} 
            className={cn(
              "border-none shadow-soft rounded-[2rem] cursor-pointer transition-all hover:scale-[1.02]",
              selectedClassification === q.class ? "ring-4 ring-primary/20 bg-secondary" : "bg-card"
            )}
            onClick={() => setSelectedClassification(selectedClassification === q.class ? null : q.class)}
          >
            <CardContent className="p-6 flex flex-col gap-4">
               <div className="flex justify-between items-start">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white", q.color)}>
                     {q.class === 'star' && <StarIcon className="h-6 w-6" />}
                     {q.class === 'plowhorse' && <TrendingUp className="h-6 w-6" />}
                     {q.class === 'puzzle' && <AlertCircle className="h-6 w-6" />}
                     {q.class === 'dog' && <TrendingDown className="h-6 w-6" />}
                  </div>
                  <span className="text-4xl font-black tracking-tighter">{q.count}</span>
               </div>
               <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">{q.label}</h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{q.desc}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Intelligence Feed</h2>
        <div className="space-y-4">
          {filteredInsights?.map((item: any) => (
            <Card key={item.menu_item_id} className="border-none shadow-soft rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all">
              <CardContent className="p-8 flex items-center justify-between gap-8">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                    <MousePointer2 className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-black tracking-tight text-foreground uppercase truncate">{item.name}</h4>
                      <Badge className={cn(
                        "h-5 border-none px-2 text-[9px] font-black uppercase tracking-widest",
                        item.classification === 'star' ? "bg-emerald-500" :
                        item.classification === 'plowhorse' ? "bg-amber-500" :
                        item.classification === 'puzzle' ? "bg-indigo-500" : "bg-red-500"
                      )}>
                        {item.classification}
                      </Badge>
                    </div>
                    <p className="text-slate-500 font-bold text-xs flex items-center gap-2">
                       <Sparkles className="h-3 w-3 text-primary" /> {item.suggestion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12 shrink-0">
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Price</p>
                      <p className="text-lg font-black text-slate-400">{formatCurrency(item.price_paise, outlet?.currency_code, outlet?.locale)}</p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <ArrowUpRight className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                         <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">AI Suggested</p>
                         <p className="text-2xl font-black text-primary">
                            {formatCurrency(item.suggestedPricePaise, outlet?.currency_code, outlet?.locale)}
                         </p>
                      </div>
                   </div>

                   <Button 
                    variant="outline" 
                    className="h-12 px-6 rounded-xl font-bold border-border hover:border-primary group-hover:bg-primary group-hover:text-white transition-all"
                    onClick={() => applyPricing.mutate([{ menu_item_id: item.menu_item_id, suggestedPricePaise: item.suggestedPricePaise }])}
                   >
                     Update
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

function StarIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
