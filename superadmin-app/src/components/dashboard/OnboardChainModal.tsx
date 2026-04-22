'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboardChain, usePlans } from '@/hooks/useSuperAdmin';
import { useToast } from '@/hooks/use-toast';

export default function OnboardChainModal({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const { data: plans } = usePlans();
  const onboard = useOnboardChain();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    chain_name: '',
    outlet_name: '',
    plan_id: '',
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plan_id) {
        toast({ variant: "destructive", title: "Plan required", description: "Please select a subscription plan." });
        return;
    }

    try {
      await onboard.mutateAsync(formData);
      toast({ title: "Chain Onboarded", description: `${formData.chain_name} has been successfully registered.` });
      onOpenChange(false);
      setFormData({
        chain_name: '',
        outlet_name: '',
        plan_id: '',
        admin_name: '',
        admin_email: '',
        admin_password: ''
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Onboarding failed", description: "Please check the details and try again." });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border rounded-[2.5rem] p-10 shadow-soft overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-primary rounded-full opacity-5 blur-[60px] -translate-y-10 translate-x-10" />
        
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-foreground">Provision Entity</DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-base mt-2">
            Register a new multi-tenant restaurant chain on the Adruva network.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 py-4 relative z-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Name</Label>
              <Input 
                placeholder="e.g. Pizza Galaxy" 
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus:ring-2 focus:ring-primary/20"
                value={formData.chain_name}
                onChange={e => setFormData({...formData, chain_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Headquarters Name</Label>
              <Input 
                placeholder="e.g. Galaxy HQ" 
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus:ring-2 focus:ring-primary/20"
                value={formData.outlet_name}
                onChange={e => setFormData({...formData, outlet_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subscription Tier</Label>
            <select 
              className="flex h-14 w-full rounded-2xl bg-secondary/50 border-none px-5 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-inner"
              value={formData.plan_id}
              onChange={e => setFormData({...formData, plan_id: e.target.value})}
              required
            >
              <option value="" className="bg-card">Select access level...</option>
              {plans?.map((plan: any) => (
                <option key={plan.id} value={plan.id} className="bg-card">
                  {plan.name.toUpperCase()} — ₹{plan.monthly_price_paise / 100}/MO
                </option>
              ))}
            </select>
          </div>

          <div className="bg-secondary/30 rounded-3xl p-8 space-y-6 border border-border shadow-inner">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Administrative Authority</p>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Superuser Name</Label>
              <Input 
                placeholder="e.g. Rahul Sharma" 
                className="h-14 rounded-2xl bg-card border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 shadow-soft"
                value={formData.admin_name}
                onChange={e => setFormData({...formData, admin_name: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Official Email</Label>
                 <Input 
                   type="email"
                   placeholder="rahul@example.com" 
                   className="h-14 rounded-2xl bg-card border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 shadow-soft"
                   value={formData.admin_email}
                   onChange={e => setFormData({...formData, admin_email: e.target.value})}
                   required
                 />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Master Password</Label>
                 <Input 
                   type="password"
                   placeholder="••••••••" 
                   className="h-14 rounded-2xl bg-card border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 shadow-soft"
                   value={formData.admin_password}
                   onChange={e => setFormData({...formData, admin_password: e.target.value})}
                   required
                 />
               </div>
            </div>
          </div>

          <DialogFooter className="pt-6 flex gap-4">
            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[11px] uppercase tracking-widest shadow-glow border-none transition-all" disabled={onboard.isPending}>
              {onboard.isPending ? 'Provisioning...' : 'Initialize Hierarchy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
