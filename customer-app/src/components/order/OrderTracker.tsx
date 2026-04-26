'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChefHat, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  HelpCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderTrackerProps {
  order: any;
  onClose: () => void;
}

export default function OrderTracker({ order, onClose }: OrderTrackerProps) {
  const steps = [
    { id: 'confirmed', label: 'Ordered', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'preparing', label: 'Cooking', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'served', label: 'Served', icon: Utensils, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status) || 0;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#fcf8ff] flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#1b1b24] text-white p-8 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary rounded-full opacity-10 blur-[80px] -translate-y-32 translate-x-32" />
        
        <div className="flex justify-between items-start relative z-10 mb-8">
           <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
              <X className="h-6 w-6" />
           </button>
           <Badge className="bg-primary text-white font-black uppercase tracking-widest px-4 py-1.5 shadow-glow">LIVE STATUS</Badge>
           <button className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
              <Bell className="h-6 w-6" />
           </button>
        </div>

        <div className="relative z-10 text-center space-y-2">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Ticket #{order.order_number}</p>
           <h2 className="text-4xl font-black tracking-tighter">Preparing Delights</h2>
           <p className="text-sm font-bold text-white/60">Estimated delivery in 12 mins</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-10 -mt-8 relative z-20">
         <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-[#e4e1ee]/50">
            <div className="flex justify-between items-center mb-8">
               {steps.map((step, idx) => (
                 <div key={step.id} className="flex flex-col items-center gap-3 relative">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                      idx <= currentStepIndex ? step.bg : "bg-[#fcf8ff] border border-[#e4e1ee]/50"
                    )}>
                       <step.icon className={cn(
                         "h-7 w-7",
                         idx <= currentStepIndex ? step.color : "text-[#c7c4d8]"
                       )} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      idx <= currentStepIndex ? "text-[#1b1b24]" : "text-[#c7c4d8]"
                    )}>{step.label}</span>
                    
                    {idx < steps.length - 1 && (
                      <div className="absolute top-7 -right-12 w-10 h-0.5 bg-[#e4e1ee]/50 hidden sm:block" />
                    )}
                 </div>
               ))}
            </div>
            
            <div className="h-2 w-full bg-[#fcf8ff] rounded-full overflow-hidden border border-[#e4e1ee]/50">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-primary shadow-glow transition-all duration-1000"
               />
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12 pb-32">
         {/* Item Status */}
         <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <h3 className="text-xl font-black text-[#1b1b24] tracking-tight uppercase">Dish Status</h3>
               <span className="text-[10px] font-black text-[#a09eb1] tracking-widest">{order.items?.length || 0} ITEMS</span>
            </div>
            <div className="space-y-4">
               {order.items?.map((item: any) => (
                 <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-[#e4e1ee]/30 flex items-center justify-between shadow-soft group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-5">
                       <div className={cn(
                         "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                         item.status === 'ready' ? "bg-emerald-500/10" : "bg-[#fcf8ff]"
                       )}>
                          {item.status === 'ready' ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <Clock className="h-6 w-6 text-[#c7c4d8]" />
                          )}
                       </div>
                       <div>
                          <p className="font-black text-[#1b1b24] text-lg leading-none mb-1.5">{item.quantity}x {item.menu_item_name}</p>
                          <p className="text-[10px] font-bold text-[#a09eb1] uppercase tracking-widest">
                             {item.status === 'ready' ? 'Ready to Serve' : 'In Preparation'}
                          </p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </section>

         {/* Bill Summary */}
         <section className="space-y-6">
            <h3 className="text-xl font-black text-[#1b1b24] tracking-tight uppercase px-2">Bill Transparency</h3>
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#e4e1ee]/30 shadow-soft space-y-5">
               <div className="flex justify-between text-sm font-bold text-[#777587]">
                  <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="text-foreground">₹{order.items?.reduce((s:number, i:any) => s + Number(i.total_paise), 0) / 100}</span>
               </div>
               <div className="flex justify-between text-sm font-bold text-[#777587]">
                  <span className="uppercase tracking-widest text-[10px]">Taxes & Fees</span>
                  <span className="text-foreground">₹{Math.round((order.items?.reduce((s:number, i:any) => s + Number(i.total_paise), 0) * 0.05) / 100)}</span>
               </div>
               <div className="h-px bg-[#e4e1ee]/50" />
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#1b1b24] uppercase tracking-[0.2em]">Total Payable</span>
                  <span className="text-3xl font-black tracking-tighter text-primary">₹{Math.round((order.items?.reduce((s:number, i:any) => s + Number(i.total_paise), 0) * 1.05) / 100)}</span>
               </div>
            </div>
         </section>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-2xl border-t border-[#e4e1ee]/50 flex gap-4">
         <Button variant="outline" className="flex-1 h-16 rounded-2xl border-[#e4e1ee] text-[#1b1b24] font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support
         </Button>
         <Button className="flex-[2] h-16 rounded-2xl bg-[#1b1b24] text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-between px-8 shadow-2xl group">
            <span>Pay At Counter</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
         </Button>
      </div>
    </motion.div>
  );
}
