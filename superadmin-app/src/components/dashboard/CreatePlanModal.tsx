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
import { useCreatePlan } from '@/hooks/useSuperAdmin';
import { useToast } from '@/hooks/use-toast';

export default function CreatePlanModal({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const createPlan = useCreatePlan();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    monthly_price_paise: '',
    annual_price_paise: '',
    max_tables: '',
    max_staff: '',
    max_menu_items: '',
    max_orders_per_month: '',
    features: {
      pos: true,
      inventory: true,
      kds: true,
      analytics: false,
      loyalty: false,
      multi_outlet: false
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlan.mutateAsync({
        ...formData,
        monthly_price_paise: Number(formData.monthly_price_paise) * 100,
        annual_price_paise: Number(formData.annual_price_paise) * 100,
        max_tables: Number(formData.max_tables),
        max_staff: Number(formData.max_staff),
        max_menu_items: Number(formData.max_menu_items),
        max_orders_per_month: Number(formData.max_orders_per_month),
      });
      toast({ title: "Plan Created", description: `Tier ${formData.name} is now live.` });
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border rounded-[2.5rem] p-10 shadow-soft overflow-y-auto max-h-[90vh] no-scrollbar">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Define Subscription Tier</DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-base mt-2"> Configure a new pricing plan for the Adruva SaaS network. </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Plan Name</Label>
              <Input 
                placeholder="e.g. Enterprise Elite" 
                className="h-14 rounded-2xl bg-secondary border-none font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Price (₹)</Label>
              <Input 
                type="number"
                placeholder="4999" 
                className="h-14 rounded-2xl bg-secondary border-none font-bold"
                value={formData.monthly_price_paise}
                onChange={e => setFormData({...formData, monthly_price_paise: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: 'Max Tables', key: 'max_tables' },
               { label: 'Max Staff', key: 'max_staff' },
               { label: 'Menu Items', key: 'max_menu_items' },
               { label: 'Monthly Orders', key: 'max_orders_per_month' },
             ].map(field => (
               <div key={field.key} className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{field.label}</Label>
                 <Input 
                   type="number"
                   placeholder="0 = Unlimited" 
                   className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-center"
                   value={(formData as any)[field.key]}
                   onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                   required
                 />
               </div>
             ))}
          </div>

          <div className="bg-secondary/30 rounded-3xl p-8 space-y-6">
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Feature Entitlements</p>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.keys(formData.features).map((feature) => (
                  <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-border bg-card text-primary focus:ring-primary/20"
                      checked={(formData.features as any)[feature]}
                      onChange={(e) => setFormData({
                        ...formData, 
                        features: { ...formData.features, [feature]: e.target.checked }
                      })}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary transition-colors">{feature.replace('_', ' ')}</span>
                  </label>
                ))}
             </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-glow border-none" disabled={createPlan.isPending}>
               {createPlan.isPending ? 'Publishing...' : 'Deploy Subscription Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
