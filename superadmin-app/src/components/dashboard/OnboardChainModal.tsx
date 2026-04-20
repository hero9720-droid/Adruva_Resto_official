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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Onboard New Restaurant Chain</DialogTitle>
          <DialogDescription>
            This will create a new business entity, an initial outlet, and a manager account.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chain Name</Label>
              <Input 
                placeholder="e.g. Pizza Galaxy" 
                value={formData.chain_name}
                onChange={e => setFormData({...formData, chain_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>First Outlet Name</Label>
              <Input 
                placeholder="e.g. Pizza Galaxy HQ" 
                value={formData.outlet_name}
                onChange={e => setFormData({...formData, outlet_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subscription Plan</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.plan_id}
              onChange={e => setFormData({...formData, plan_id: e.target.value})}
              required
            >
              <option value="">Select a plan</option>
              {plans?.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₹{plan.monthly_price_paise / 100}/mo
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administrator Details</p>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                placeholder="e.g. Rahul Sharma" 
                value={formData.admin_name}
                onChange={e => setFormData({...formData, admin_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email"
                placeholder="rahul@example.com" 
                value={formData.admin_email}
                onChange={e => setFormData({...formData, admin_email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Password</Label>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={formData.admin_password}
                onChange={e => setFormData({...formData, admin_password: e.target.value})}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={onboard.isPending}>
              {onboard.isPending ? 'Onboarding...' : 'Create Chain'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
