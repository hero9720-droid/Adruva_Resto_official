'use client';

import { useState } from 'react';
import { 
  Star, 
  Heart, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Coffee,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const { outletSlug } = useParams();
  const router = useRouter();
  const [ratings, setRatings] = useState({ food: 5, service: 5, ambience: 5 });
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // We'd ideally fetch outlet_id from slug, but for now we assume API handles it or we use a global state
      await api.post('/feedback/submit', {
        outlet_id: 'd89c9371-8e37-4d90-b2c4-0e4b04c3ae2d', // Placeholder, in real app fetched from slug
        rating_food: ratings.food,
        rating_service: ratings.service,
        rating_ambience: ratings.ambience,
        comment
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 blur-[150px] animate-pulse" />
        <div className="relative z-10 text-center space-y-8 animate-in zoom-in duration-700">
           <div className="h-40 w-40 bg-emerald-500 rounded-[3rem] mx-auto flex items-center justify-center shadow-glow-emerald rotate-12 scale-110">
              <CheckCircle2 className="h-20 w-20 text-white" />
           </div>
           <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">
              Thank <span className="text-emerald-500">You!</span>
           </h1>
           <p className="text-slate-400 font-bold text-lg max-w-sm mx-auto leading-relaxed">
              Your feedback helps us create better dining experiences. We hope to see you again soon!
           </p>
           <Button 
             onClick={() => router.push(`/${outletSlug}`)}
             className="bg-white/10 hover:bg-white/20 text-white border-white/10 rounded-2xl h-16 px-12 font-black uppercase tracking-widest text-xs"
           >
              Return Home
           </Button>
        </div>
      </div>
    );
  }

  const RatingRow = ({ label, value, keyName, icon: Icon }: any) => (
    <div className="space-y-4">
       <div className="flex justify-between items-end">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
             <Icon className="h-4 w-4" />
             {label}
          </label>
          <span className="text-xl font-black text-primary">{value}/5</span>
       </div>
       <div className="flex gap-3">
          {[1,2,3,4,5].map(star => (
            <button 
              key={star}
              onClick={() => setRatings({...ratings, [keyName]: star})}
              className={cn(
                "h-14 flex-1 rounded-2xl border-2 transition-all flex items-center justify-center",
                star <= value 
                  ? "bg-primary/10 border-primary text-primary shadow-inner" 
                  : "bg-secondary/30 border-border text-slate-600 hover:border-slate-400"
              )}
            >
               <Star className={cn("h-6 w-6", star <= value && "fill-primary")} />
            </button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30">
      {/* Premium Header */}
      <div className="relative h-[35vh] overflow-hidden flex items-end p-8">
         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
         <div className="absolute inset-0 bg-primary/20 opacity-30 mix-blend-overlay" />
         <div className="relative z-20">
            <div className="flex items-center gap-3 mb-4">
               <Sparkles className="h-5 w-5 text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Guest Sentiment</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.8] mb-4">
               Rate Your <br />
               <span className="text-primary">Experience</span>
            </h1>
         </div>
      </div>

      <div className="p-8 space-y-12">
         {/* Ratings Grid */}
         <div className="space-y-10">
            <RatingRow label="Culinary Quality" value={ratings.food} keyName="food" icon={Coffee} />
            <RatingRow label="Service Efficiency" value={ratings.service} keyName="service" icon={Zap} />
            <RatingRow label="Atmosphere" value={ratings.ambience} keyName="ambience" icon={Heart} />
         </div>

         {/* Comment Area */}
         <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
               <MessageSquare className="h-4 w-4" />
               Detailed Thoughts (Optional)
            </label>
            <Textarea 
              placeholder="Tell us what you loved or how we can improve..."
              value={comment}
              onChange={(e: any) => setComment(e.target.value)}
              className="min-h-[160px] bg-secondary/20 border-2 border-border rounded-[2rem] p-8 text-lg font-bold placeholder:text-slate-600 focus:border-primary transition-all outline-none"
            />
         </div>

         {/* Submit Button */}
         <Button 
           onClick={handleSubmit}
           disabled={isSubmitting}
           className="w-full bg-primary hover:bg-primary/90 text-white rounded-[2rem] h-20 text-sm font-black uppercase tracking-[0.3em] shadow-glow flex items-center justify-center gap-4 group"
         >
            {isSubmitting ? 'Sending Review...' : 'Submit Feedback'}
            {!isSubmitting && <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />}
         </Button>

         <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest pb-12">
            Your review helps us maintain 5-star standards.
         </p>
      </div>
    </div>
  );
}
