'use client';

import { useState, useRef } from 'react';
import { 
  X, 
  IndianRupee, 
  FileText, 
  Calendar, 
  Upload,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Store
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddExpenseProps {
  open: boolean;
  onClose: () => void;
}

export default function AddExpenseDialog({ open, onClose }: AddExpenseProps) {
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setReceiptUrl(URL.createObjectURL(file));
      setUploading(false);
      toast({ title: "Receipt Captured", description: "Image attached to expense log." });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-10 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <IndianRupee className="h-48 w-48 -mr-12 -mt-12" />
        </div>

        <div className="relative z-10">
          <DialogHeader className="mb-8">
             <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <FileText className="h-6 w-6" />
                </div>
                <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter">Record Expense</DialogTitle>
             </div>
             <p className="text-slate-500 font-medium">Log your operational costs with digital receipt proof.</p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Amount *</Label>
                   <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input placeholder="0.00" className="h-14 pl-12 rounded-2xl border-none bg-slate-50 text-xl font-black text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600/20" />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</Label>
                   <Select>
                      <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-50 font-bold text-slate-900">
                         <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                         <SelectItem value="raw_materials">🥩 Raw Materials</SelectItem>
                         <SelectItem value="electricity">⚡ Utilities (Electricity)</SelectItem>
                         <SelectItem value="rent">🏢 Rent / Lease</SelectItem>
                         <SelectItem value="repairs">🛠️ Maintenance & Repairs</SelectItem>
                         <SelectItem value="marketing">📣 Marketing / Ads</SelectItem>
                         <SelectItem value="salary">💰 Staff Salary Advance</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor / Supplier</Label>
                   <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input placeholder="Enter supplier name" className="h-14 pl-12 rounded-2xl border-none bg-slate-50 font-bold text-slate-900" />
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Receipt (Proof)</Label>
                <div 
                  className="h-full min-h-[220px] rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden group relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                   {receiptUrl ? (
                      <>
                        <img src={receiptUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Receipt Preview" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="bg-white/90 p-3 rounded-full shadow-lg">
                              <Upload className="h-6 w-6 text-indigo-600" />
                           </div>
                        </div>
                      </>
                   ) : uploading ? (
                      <div className="flex flex-col items-center gap-4">
                         <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                         <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Processing Image...</p>
                      </div>
                   ) : (
                      <div className="flex flex-col items-center gap-4 p-8 text-center">
                         <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-soft text-slate-300 group-hover:text-indigo-400 transition-colors">
                            <Upload className="h-8 w-8" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900">Upload Receipt</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">PNG, JPG or PDF up to 5MB</p>
                         </div>
                      </div>
                   )}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={handleFileUpload} 
                   />
                </div>
             </div>
          </div>

          <div className="mt-8 p-4 bg-slate-900 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Ready</span>
             </div>
             <p className="text-[10px] text-slate-500 font-medium">This entry will be synced with your CA/Tally export.</p>
          </div>

          <DialogFooter className="mt-10 gap-4">
             <Button variant="ghost" className="h-16 flex-1 rounded-2xl font-black text-slate-400 uppercase" onClick={onClose}>Cancel</Button>
             <Button className="h-16 flex-[2] rounded-2xl bg-indigo-600 text-white font-black shadow-glow border-none uppercase tracking-widest">
                Save & Record <CheckCircle2 className="h-5 w-5 ml-2" />
             </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
