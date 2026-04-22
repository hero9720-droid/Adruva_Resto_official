'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAddVariants, useAddModifierGroup } from '@/hooks/useMenu';
import { useToast } from '@/hooks/use-toast';

export default function VariantsDialog({ open, onClose, item }: { open: boolean, onClose: () => void, item: any }) {
  const [activeTab, setActiveTab] = useState<'variants' | 'modifiers'>('variants');
  const [variants, setVariants] = useState([{ name: '', price_paise: '', is_default: true }]);
  const [modifierGroup, setModifierGroup] = useState({ name: '', is_required: false, min_select: 0, max_select: 1 });
  const [modifiers, setModifiers] = useState([{ name: '', extra_price_paise: '' }]);

  const addVariantsM = useAddVariants();
  const addModifiersM = useAddModifierGroup();
  const { toast } = useToast();

  const handleSaveVariants = async () => {
    const validVariants = variants.filter(v => v.name.trim());
    if (validVariants.length === 0) return onClose();
    try {
      await addVariantsM.mutateAsync({
        menu_item_id: item.id,
        variants: validVariants.map(v => ({
          name: v.name,
          price_paise: Math.round(Number(v.price_paise || 0) * 100),
          is_default: v.is_default
        }))
      });
      toast({ title: 'Variants saved' });
      onClose();
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save variants' });
    }
  };

  const handleSaveModifiers = async () => {
    if (!modifierGroup.name.trim()) return onClose();
    const validMods = modifiers.filter(m => m.name.trim());
    try {
      await addModifiersM.mutateAsync({
        menu_item_id: item.id,
        name: modifierGroup.name,
        is_required: modifierGroup.is_required,
        min_select: Number(modifierGroup.min_select || 0),
        max_select: Number(modifierGroup.max_select || 1),
        modifiers: validMods.map(m => ({
          name: m.name,
          extra_price_paise: Math.round(Number(m.extra_price_paise || 0) * 100)
        }))
      });
      toast({ title: 'Modifier Group added' });
      onClose();
    } catch {
      toast({ variant: 'destructive', title: 'Failed to add modifiers' });
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl bg-white p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-slate-900">Customize "{item.name}"</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 border-b border-slate-100 mb-6 pb-2">
          <button 
            onClick={() => setActiveTab('variants')} 
            className={`font-black text-sm uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${activeTab === 'variants' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Variants (Sizes)
          </button>
          <button 
            onClick={() => setActiveTab('modifiers')} 
            className={`font-black text-sm uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${activeTab === 'modifiers' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Add-ons
          </button>
        </div>

        {activeTab === 'variants' ? (
          <div className="space-y-4">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl text-sm font-medium border border-amber-100">
              Variants represent different sizes or types of the same item (e.g. Regular vs Large). 
            </div>
            {variants.map((v, i) => (
              <div key={i} className="flex items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                <div className="flex-1 space-y-1">
                  <Label>Variant Name</Label>
                  <Input value={v.name} onChange={e => {
                    const next = [...variants]; next[i].name = e.target.value; setVariants(next);
                  }} placeholder="e.g. Large" className="bg-white border-none shadow-sm" />
                </div>
                <div className="w-32 space-y-1">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={v.price_paise} onChange={e => {
                    const next = [...variants]; next[i].price_paise = e.target.value; setVariants(next);
                  }} placeholder="0.00" className="bg-white border-none shadow-sm" />
                </div>
                <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="h-10 w-10 shrink-0 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setVariants([...variants, { name: '', price_paise: '', is_default: false }])} className="w-full h-12 rounded-2xl border-dashed">
              <Plus className="h-4 w-4 mr-2" /> Add Another Variant
            </Button>
            <DialogFooter className="mt-8">
              <Button onClick={handleSaveVariants} disabled={addVariantsM.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 w-full font-black tracking-widest shadow-glow border-none">
                {addVariantsM.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'SAVE VARIANTS'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="space-y-1">
                <Label>Group Name</Label>
                <Input value={modifierGroup.name} onChange={e => setModifierGroup({...modifierGroup, name: e.target.value})} placeholder="e.g. Extra Toppings" className="bg-white border-none shadow-sm" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label>Is Required?</Label>
                <Switch checked={modifierGroup.is_required} onCheckedChange={c => setModifierGroup({...modifierGroup, is_required: c})} />
              </div>
            </div>

            <Label className="mt-6 block font-black uppercase tracking-widest text-xs text-slate-400">Modifier Options</Label>
            {modifiers.map((m, i) => (
              <div key={i} className="flex items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1 space-y-1">
                  <Label>Option Name</Label>
                  <Input value={m.name} onChange={e => {
                    const next = [...modifiers]; next[i].name = e.target.value; setModifiers(next);
                  }} placeholder="e.g. Extra Cheese" className="bg-white border-none shadow-sm" />
                </div>
                <div className="w-32 space-y-1">
                  <Label>Extra Price (₹)</Label>
                  <Input type="number" value={m.extra_price_paise} onChange={e => {
                    const next = [...modifiers]; next[i].extra_price_paise = e.target.value; setModifiers(next);
                  }} placeholder="0.00" className="bg-white border-none shadow-sm" />
                </div>
                <button onClick={() => setModifiers(modifiers.filter((_, idx) => idx !== i))} className="h-10 w-10 shrink-0 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setModifiers([...modifiers, { name: '', extra_price_paise: '' }])} className="w-full h-12 rounded-2xl border-dashed">
              <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
            <DialogFooter className="mt-8">
              <Button onClick={handleSaveModifiers} disabled={addModifiersM.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 w-full font-black tracking-widest shadow-glow border-none">
                {addModifiersM.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'SAVE ADD-ONS'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
