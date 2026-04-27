'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Globe, MessageSquare, Heart, 
  ThumbsUp, ThumbsDown, Star,
  RefreshCcw, ShieldCheck, Sparkles,
  ArrowRight, Search, Filter, 
  Instagram, Facebook, Linkedin,
  Send, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function SocialReputationPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [editedReply, setEditedReply] = useState('');

  const { data: feed, isLoading } = useQuery({
    queryKey: ['social-feed'],
    queryFn: async () => {
      const { data } = await api.get('/feedback/reputation/feed');
      return data.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string, reply: string }) => {
      await api.post(`/feedback/reputation/${id}/approve`, { reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      setSelectedReview(null);
      toast({ title: "Reply Sent", description: "The response has been posted to the platform." });
    }
  });

  const handleSelect = (review: any) => {
    setSelectedReview(review);
    setEditedReply(review.ai_draft_reply || '');
  };

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[1,2,3,4].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Globe className="h-4 w-4" /> Global Reputation
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Social Reputation Bridge</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Platform Sync</Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Sparkles className="h-4 w-4 mr-2" /> Reputation AI Settings
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Social Feed */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Brand Mentions ({feed?.length || 0})</h2>
            <div className="space-y-4">
               {feed?.map((review: any) => (
                 <Card 
                   key={review.id} 
                   onClick={() => handleSelect(review)}
                   className={cn(
                     "border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden cursor-pointer group transition-all",
                     selectedReview?.id === review.id ? "ring-2 ring-primary" : "hover:shadow-xl"
                   )}
                 >
                    <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center shrink-0 font-black text-slate-400 overflow-hidden">
                             {review.author_name[0]}
                          </div>
                          <div className="min-w-0">
                             <div className="flex items-center gap-3">
                                <h4 className="text-xl font-black text-foreground uppercase tracking-tight truncate">{review.author_name}</h4>
                                <Badge className={cn(
                                  "text-[9px] font-black uppercase tracking-widest border-none h-5",
                                  review.sentiment_score > 0.7 ? "bg-emerald-500/10 text-emerald-500" :
                                  review.sentiment_score < 0.4 ? "bg-red-500/10 text-red-500" :
                                  "bg-amber-500/10 text-amber-500"
                                )}>
                                   {review.sentiment_score > 0.7 ? 'Positive' : review.sentiment_score < 0.4 ? 'Critical' : 'Neutral'}
                                </Badge>
                             </div>
                             <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1 italic">"{review.content}"</p>
                             <div className="flex items-center gap-3 mt-2">
                                {review.platform === 'google_my_business' && <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-400">Google</Badge>}
                                {review.platform === 'meta' && <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-blue-500 border-blue-100">Meta</Badge>}
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                   {new Date(review.created_at).toLocaleDateString()}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                             <Star className={cn("h-5 w-5", Number(review.rating_score) >= 4 ? "text-amber-400 fill-amber-400" : "text-slate-300")} />
                          </div>
                          <span className="text-lg font-black">{Number(review.rating_score).toFixed(1)}</span>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>

         {/* Reply Assistant */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Reply Assistant</h2>
            {selectedReview ? (
              <Card className="border-none shadow-soft rounded-[3rem] bg-indigo-900 text-white p-10 space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Sparkles className="h-40 w-40" />
                 </div>

                 <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">AI Draft Response</h3>
                    <p className="text-white/60 text-sm font-medium">Context-aware reply generated for {selectedReview.author_name}.</p>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <textarea 
                      value={editedReply}
                      onChange={(e) => setEditedReply(e.target.value)}
                      className="w-full h-48 bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-white/30 font-medium focus:ring-2 focus:ring-white/50 transition-all outline-none"
                    />
                 </div>

                 <div className="flex gap-4 relative z-10">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedReview(null)}
                      className="flex-1 h-14 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/20"
                    >
                       Dismiss
                    </Button>
                    <Button 
                      onClick={() => replyMutation.mutate({ id: selectedReview.id, reply: editedReply })}
                      className="flex-[2] h-14 rounded-2xl bg-white text-indigo-900 font-black uppercase tracking-widest text-[10px] hover:bg-white/90 shadow-glow"
                    >
                       <Send className="h-4 w-4 mr-2" /> Approve & Post
                    </Button>
                 </div>
              </Card>
            ) : (
              <Card className="border-none shadow-soft rounded-[3rem] bg-secondary/20 p-10 flex flex-col items-center justify-center text-center gap-4 text-slate-300">
                 <MessageSquare className="h-12 w-12 opacity-20" />
                 <p className="text-[10px] font-black uppercase tracking-widest italic">Select a mention to draft a reply</p>
              </Card>
            )}

            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-10 space-y-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Reputation Gauge</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest">Brand Sentiment</span>
                     <span className="text-emerald-500 font-black">94% Positive</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[94%]" />
                  </div>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter leading-relaxed">
                     Your brand is trending upwards this week. 12 new positive mentions detected on Google.
                  </p>
               </div>
            </Card>
         </div>

      </div>
    </div>
  );
}
