'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Star, MessageSquare, Brain, 
  Smile, Frown, Meh, Sparkles,
  Reply, History, TrendingUp, PieChart,
  ShieldCheck, AlertTriangle, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ReputationPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const { data: feedback, isLoading: isFeedbackLoading } = useQuery({
    queryKey: ['outlet-feedback'],
    queryFn: async () => {
      const { data } = await api.get('/feedback/list');
      return data.data;
    },
  });

  const { data: insights, isLoading: isInsightsLoading } = useQuery({
    queryKey: ['reputation-insights'],
    queryFn: async () => {
      const { data } = await api.get('/feedback/reputation/insights');
      return data.data;
    },
  });

  const analyzeFeedback = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/feedback/${id}/analyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlet-feedback'] });
      toast({ title: "Analysis Complete", description: "AI has processed the sentiment and drafted a reply." });
    }
  });

  if (isFeedbackLoading || isInsightsLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Sparkles className="h-4 w-4" /> Guest Relations Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Reputation Center</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Feedback Settings</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <ShieldCheck className="h-4 w-4 mr-2" /> Reputation Audit
           </Button>
        </div>
      </div>

      {/* Reputation KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <Smile className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Positive Sentiment</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {insights?.overview.positive_count || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                 <Frown className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negative Sentiment</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {insights?.overview.negative_count || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-indigo-600 text-white overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">NPS Score</span>
              <span className="text-4xl font-black tracking-tighter">8.4</span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <History className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Response Rate</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 92%
              </span>
           </CardContent>
        </Card>
      </div>

      {/* Review Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Review Feed</h2>
            <div className="space-y-4">
               {feedback?.map((review: any) => (
                 <Card key={review.id} className={cn(
                    "border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden transition-all border-2",
                    selectedReview?.id === review.id ? "border-primary" : "border-transparent"
                 )}>
                    <CardContent className="p-8 space-y-6">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 bg-secondary rounded-xl flex items-center justify-center font-black text-slate-400">
                                {review.customer_name?.[0] || 'G'}
                             </div>
                             <div>
                                <h4 className="font-black text-foreground uppercase tracking-tight">{review.customer_name || 'Guest'}</h4>
                                <div className="flex items-center gap-1 text-amber-400">
                                   {[1,2,3,4,5].map(s => (
                                     <Star key={s} className={cn("h-3 w-3 fill-current", s > review.rating_food && "text-slate-200 fill-none")} />
                                   ))}
                                </div>
                             </div>
                          </div>
                          <Badge className={cn(
                            "h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest",
                            review.sentiment === 'positive' ? "bg-emerald-500/10 text-emerald-500" : 
                            review.sentiment === 'negative' ? "bg-red-500/10 text-red-500" : "bg-slate-100 text-slate-400"
                          )}>
                             {review.sentiment}
                          </Badge>
                       </div>

                       <p className="text-slate-600 font-medium italic">"{review.comment}"</p>

                       <div className="flex justify-between items-center pt-4 border-t border-border/50">
                          <div className="flex gap-4">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Food: {review.rating_food}/5</div>
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service: {review.rating_service}/5</div>
                          </div>
                          <div className="flex gap-2">
                             {!review.sentiment_label && (
                                <Button 
                                  variant="ghost" 
                                  className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                                  onClick={() => analyzeFeedback.mutate(review.id)}
                                >
                                   <Brain className="h-3 w-3 mr-1" /> Analyze
                                </Button>
                             )}
                             <Button 
                               className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest bg-foreground text-background"
                               onClick={() => setSelectedReview(review)}
                             >
                                <Reply className="h-3 w-3 mr-1" /> {review.is_replied ? 'View Reply' : 'Reply'}
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Smart Assistant</h2>
            {selectedReview ? (
               <Card className="border-none shadow-soft rounded-[3rem] bg-card border border-primary/20 sticky top-8">
                  <CardHeader className="p-8 pb-0">
                     <CardTitle className="text-xl font-black uppercase tracking-tight">Drafting Response</CardTitle>
                     <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Replying to {selectedReview.customer_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="p-4 bg-secondary/50 rounded-2xl border border-border text-sm font-medium text-slate-600">
                        {selectedReview.ai_reply_draft || "Analyzing review to draft a context-aware response..."}
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final Message</label>
                        <textarea 
                           className="w-full h-32 bg-secondary rounded-2xl p-4 text-sm font-medium focus:ring-2 ring-primary outline-none resize-none"
                           defaultValue={selectedReview.ai_reply_draft}
                        />
                     </div>
                     <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow">
                        <Send className="h-4 w-4 mr-2" /> Post Official Reply
                     </Button>
                  </CardContent>
               </Card>
            ) : (
               <Card className="border-none shadow-soft rounded-[3rem] bg-card border border-dashed border-border p-12 text-center h-[400px] flex flex-col items-center justify-center">
                  <div className="h-20 w-20 bg-secondary rounded-3xl flex items-center justify-center mb-6">
                     <MessageSquare className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-black text-sm uppercase tracking-tight">Select a review to start responding</p>
               </Card>
            )}

            {/* Topic Cloud */}
            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-8">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Trending Topics</h3>
               <div className="flex flex-wrap gap-2">
                  {['Great Pasta', 'Slow Service', 'Friendly Staff', 'Valet Issues', 'Crispy Wings', 'Clean Ambience'].map(t => (
                    <Badge key={t} variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-secondary text-slate-600 border-none cursor-default">
                       {t}
                    </Badge>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
