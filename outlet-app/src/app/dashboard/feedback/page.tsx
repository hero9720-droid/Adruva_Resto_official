'use client';

import { 
  MessageSquare, 
  ExternalLink, 
  Star, 
  Smile, 
  Meh, 
  Frown, 
  Calendar,
  User,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useFeedback, useFeedbackStats } from '@/hooks/useFeedback';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function FeedbackPage() {
  const { data: feedback, isLoading } = useFeedback();
  const { data: stats } = useFeedbackStats();

  if (isLoading) return <div className="p-8 h-screen flex items-center justify-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Customer Voices...</div>;

  const averageRating = stats?.average_rating || 0;

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-background -m-8 p-8 font-sans pb-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Customer Voices</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Track reviews, ratings, and customer satisfaction.</p>
        </div>
        <Link href="/dashboard/settings?tab=qr">
          <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
            <ExternalLink className="h-5 w-5 mr-2" />
            FEEDBACK QR CODES
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="bg-primary text-primary-foreground rounded-[2.5rem] border-none shadow-glow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Star className="h-32 w-32 fill-current" />
            </div>
            <CardContent className="p-10 relative z-10">
               <p className="text-sm font-black uppercase tracking-widest opacity-70 mb-4">Average Rating</p>
               <div className="flex items-end gap-3 mb-8">
                  <span className="text-7xl font-black tracking-tighter">{averageRating.toFixed(1)}</span>
                  <div className="mb-2">
                     <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={cn("h-4 w-4", s <= Math.round(averageRating) ? "fill-amber-300 text-amber-300" : "fill-primary-foreground/20 text-transparent")} />
                        ))}
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">From {stats?.total_reviews || 0} Reviews</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 bg-primary-foreground/10 rounded-2xl border border-primary-foreground/10">
                  <Smile className="h-5 w-5 text-amber-300" />
                  <p className="text-xs font-bold leading-tight">Your customers generally love the "Signature Biryani"!</p>
               </div>
            </CardContent>
         </Card>

         <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <RatingBreakdown count={stats?.breakdown?.five || 0} label="Excellent" icon={Smile} color="emerald" percentage={75} />
            <RatingBreakdown count={stats?.breakdown?.three || 0} label="Average" icon={Meh} color="amber" percentage={20} />
            <RatingBreakdown count={stats?.breakdown?.one || 0} label="Poor" icon={Frown} color="red" percentage={5} />
         </div>
      </div>

      {!feedback || feedback.length === 0 ? (
        <div className="py-24 text-center bg-card rounded-[2.5rem] shadow-soft border border-border">
          <div className="w-24 h-24 mb-8 relative mx-auto">
             <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-6" />
             <div className="absolute inset-0 bg-card border border-border rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
                <MessageSquare className="h-10 w-10 text-primary/40" />
             </div>
          </div>
          <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">Silence in the Hall</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
            Share your feedback QR codes with customers to start receiving ratings and comments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {feedback.map((review) => (
            <Card key={review.id} className="bg-card border border-border shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl shadow-inner">
                           {review.customer_name?.[0] || <User className="h-6 w-6" />}
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-tight">{review.customer_name || 'Guest User'}</h3>
                           <div className="flex items-center gap-3 mt-1">
                              <div className="flex gap-0.5">
                                 {[1, 2, 3, 4, 5].map(s => (
                                   <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-transparent")} />
                                 ))}
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(review.created_at), 'dd MMM, hh:mm a')}</span>
                           </div>
                        </div>
                     </div>
                     <Badge className={cn(
                        "border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                        review.rating >= 4 ? "bg-emerald-500 text-white" : review.rating >= 3 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                     )}>
                        {review.rating >= 4 ? 'Positive' : review.rating >= 3 ? 'Neutral' : 'Critical'}
                     </Badge>
                  </div>

                  <div className="relative">
                     <Quote className="absolute -left-2 -top-2 h-8 w-8 text-slate-100 -z-10" />
                     <p className="text-slate-600 font-medium italic leading-relaxed text-lg">
                        "{review.comment}"
                     </p>
                  </div>

                  {review.tags && review.tags.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2">
                       {review.tags.map(tag => (
                         <Badge key={tag} variant="secondary" className="bg-secondary text-slate-500 border-none font-bold text-[10px] px-3 py-1 uppercase tracking-tighter">
                            #{tag}
                         </Badge>
                       ))}
                    </div>
                  )}
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingBreakdown({ count, label, icon: Icon, color, percentage }: any) {
   const colors: any = {
      emerald: "text-emerald-500 bg-emerald-500/10",
      amber: "text-amber-500 bg-amber-500/10",
      red: "text-red-500 bg-red-500/10"
   };

   return (
      <Card className="bg-card border border-border shadow-soft rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-primary/20 transition-all">
         <div>
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner", colors[color])}>
               <Icon className="h-6 w-6" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{count} <span className="text-sm text-slate-400 font-bold">REVIEWS</span></p>
         </div>
         <div className="mt-8">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
               <div className={cn("h-full rounded-full transition-all duration-1000", color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${percentage}%` }} />
            </div>
         </div>
      </Card>
   );
}
