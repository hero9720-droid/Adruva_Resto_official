'use client';

import { useState } from 'react';
import { 
  X, 
  Users, 
  Calculator, 
  ArrowRight, 
  Split,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SplitBillProps {
  open: boolean;
  onClose: () => void;
  bill: any;
}

export default function SplitBillDialog({ open, onClose, bill }: SplitBillProps) {
  const [splitCount, setSplitCount] = useState(2);
  const total = bill?.total_paise || 0;
  const splitAmount = Math.floor(total / splitCount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-10 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Split className="h-48 w-48 -mr-12 -mt-12" />
        </div>

        <div className="relative z-10 space-y-8">
          <DialogHeader>
             <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <Users className="h-6 w-6" />
                </div>
                <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter">Split Settlement</DialogTitle>
             </div>
             <p className="text-slate-500 font-medium">Divide the total amount among guests or items.</p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Split Strategy</label>
                <div className="grid grid-cols-1 gap-3">
                   <button className="flex items-center justify-between p-4 rounded-2xl bg-indigo-600 text-white shadow-glow text-left group">
                      <div>
                         <p className="font-bold text-sm">Equally</p>
                         <p className="text-[10px] text-indigo-200">Split by number of guests</p>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                   </button>
                   <button className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-left hover:bg-white hover:border-indigo-200 transition-all group">
                      <div>
                         <p className="font-bold text-sm">By Items</p>
                         <p className="text-[10px] text-slate-400">Assign items to guests</p>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Each Guest Pays</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tighter text-indigo-400">₹{(splitAmount / 100).toLocaleString()}</span>
                   </div>
                   <div className="h-px bg-white/10 my-4" />
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Remaining</span>
                      <span className="text-xs font-black">₹{((total % splitCount) / 100).toFixed(2)}</span>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Number of Guests</label>
                   <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        className="h-14 w-14 rounded-2xl border-2 border-slate-100 font-black text-xl"
                        onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                      >-</Button>
                      <span className="flex-1 text-center text-2xl font-black">{splitCount}</span>
                      <Button 
                        variant="outline" 
                        className="h-14 w-14 rounded-2xl border-2 border-slate-100 font-black text-xl"
                        onClick={() => setSplitCount(splitCount + 1)}
                      >+</Button>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
             <ShieldCheck className="h-6 w-6 text-emerald-600" />
             <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                Splitting will create multiple payment tokens for this bill. You can settle each part individually.
             </p>
          </div>

          <DialogFooter className="pt-4 gap-4">
             <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-slate-400 uppercase" onClick={onClose}>Cancel</Button>
             <Button className="h-16 flex-[2] rounded-2xl bg-indigo-600 text-white font-black shadow-glow border-none uppercase tracking-widest">
                Generate Splits <ArrowRight className="h-5 w-5 ml-2" />
             </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
