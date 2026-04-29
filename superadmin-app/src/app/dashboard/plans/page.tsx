'use client';

import { 
  usePlans, 
  useCreatePlan 
} from '@/hooks/useSuperAdmin';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
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
import { CreditCard, Plus, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import CreatePlanModal from '@/components/dashboard/CreatePlanModal';

export default function PlansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: plans } = usePlans();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <CreditCard className="h-10 w-10 text-primary" />
             </div>
             Monetization Engine
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Configure subscription tiers and platform access levels.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[11px] transition-all shadow-glow border-none"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-5 w-5 mr-3" /> Create New Tier
        </Button>
      </div>

      <CreatePlanModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans?.map((plan: any) => (
          <Card key={plan.id} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col hover:-translate-y-2 transition-all group">
             <CardHeader className="p-10 border-b border-border bg-secondary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <div className="flex justify-between items-start mb-6">
                   <Badge className="bg-primary/10 text-primary border-none group-hover:bg-primary-foreground group-hover:text-primary transition-all px-4 py-1.5 font-black uppercase tracking-widest text-[10px] rounded-xl">Tier: {plan.id.slice(0, 4)}</Badge>
                   {plan.is_active && <CheckCircle2 className="h-6 w-6 text-emerald-500 group-hover:text-primary-foreground" />}
                </div>
                <CardTitle className="text-4xl font-black tracking-tighter uppercase">{plan.name}</CardTitle>
                <div className="mt-4">
                   <span className="text-5xl font-black tracking-tighter">₹{plan.monthly_price_paise / 100}</span>
                   <span className="text-xs font-bold uppercase tracking-widest ml-2 opacity-60">/ Month</span>
                </div>
             </CardHeader>
             <CardContent className="p-10 space-y-8 flex-1">
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Max Outlets</span>
                      <span className="font-black text-foreground">{plan.max_outlets || 'Unlimited'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Max Staff</span>
                      <span className="font-black text-foreground">{plan.max_staff || 'Unlimited'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Commission</span>
                      <span className="font-black text-foreground">{plan.transaction_fee_bps / 100}%</span>
                   </div>
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-border font-black uppercase tracking-widest text-[11px] group-hover:bg-primary group-hover:text-primary-foreground transition-all">Edit Configurations</Button>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
