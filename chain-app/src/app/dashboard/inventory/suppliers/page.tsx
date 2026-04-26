'use client';

import { useState, useEffect } from 'react';
import { 
  Truck, 
  Wallet, 
  IndianRupee, 
  History, 
  ChevronRight, 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  User, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Layers,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function SupplierLedgerPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [dues, setDues] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amount_paise: 0,
    description: '',
    outlet_id: ''
  });

  const { toast } = useToast();

  const fetchData = async () => {
    const chainId = localStorage.getItem('last_chain_id');
    try {
      const [suppliersRes, duesRes] = await Promise.all([
        api.get(`/inventory/suppliers/${chainId}`),
        api.get(`/inventory/suppliers/${chainId}/dues`)
      ]);
      setSuppliers(suppliersRes.data.data);
      setDues(duesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch supplier data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (supplierId: string) => {
    try {
      const res = await api.get(`/inventory/suppliers/${supplierId}/ledger`);
      setLedger(res.data.data);
    } catch (err) {
      console.error('Failed to fetch ledger');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier);
    fetchLedger(supplier.id);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedSupplier) return;
    try {
      await api.post(`/inventory/suppliers/${selectedSupplier.id}/payments`, paymentData);
      toast({ title: "Payment Recorded", description: "The supplier ledger has been updated." });
      setShowPaymentModal(false);
      fetchLedger(selectedSupplier.id);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Payment recording failed" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Reconciling Vendor Ledgers...</div>;

  const totalOutstanding = dues.reduce((acc, curr) => acc + (Number(curr.outstanding_balance_paise) || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Ledger Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Truck className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Vendor Finance & Accounts Payable</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Supplier <br />
             <span className="text-primary">Ledger</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Automate your procurement finance. Track vendor credit lines, reconcile purchase orders, and manage bulk payouts from a single high-fidelity dashboard.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6 min-w-[240px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Chain Outstanding</p>
              <p className="text-4xl font-black text-primary tracking-tighter">₹{(totalOutstanding / 100).toLocaleString()}</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Supplier Directory */}
         <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between px-4">
               <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Vendor Directory</h2>
               <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-secondary"><Plus className="h-5 w-5" /></Button>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
               {suppliers.map((s) => {
                 const due = dues.find(d => d.id === s.id);
                 const isSelected = selectedSupplier?.id === s.id;
                 return (
                   <Card 
                     key={s.id} 
                     onClick={() => handleSupplierSelect(s)}
                     className={cn(
                       "border-2 bg-card rounded-[2.5rem] cursor-pointer transition-all hover:border-primary/50 overflow-hidden",
                       isSelected ? "border-primary shadow-glow" : "border-transparent shadow-soft"
                     )}
                   >
                      <CardContent className="p-8">
                         <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center text-slate-400">
                               <Building2 className="h-6 w-6" />
                            </div>
                            <Badge className={cn(
                              "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg",
                              (Number(due?.outstanding_balance_paise) || 0) > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                               {(Number(due?.outstanding_balance_paise) || 0) > 0 ? 'Credit Active' : 'No Dues'}
                            </Badge>
                         </div>
                         <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-1">{s.name}</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">NET-{s.payment_terms_days} TERMS</p>
                         
                         <div className="flex justify-between items-end pt-4 border-t border-border">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                               <p className="text-xl font-black text-foreground">₹{(Number(due?.outstanding_balance_paise) / 100 || 0).toLocaleString()}</p>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 transition-transform", isSelected ? "text-primary translate-x-1" : "text-slate-300")} />
                         </div>
                      </CardContent>
                   </Card>
                 );
               })}
            </div>
         </div>

         {/* Transaction Ledger */}
         <div className="lg:col-span-2 space-y-6">
            {selectedSupplier ? (
              <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                 <div className="flex justify-between items-center px-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Financial Ledger: {selectedSupplier.name}</h2>
                    <Button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-primary text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-glow gap-2"
                    >
                       <Wallet className="h-4 w-4" /> Record Payment
                    </Button>
                 </div>

                 <div className="space-y-4">
                    {ledger.length === 0 ? (
                      <div className="py-40 text-center bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border text-slate-400">
                         <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                         <p className="font-black uppercase tracking-widest text-sm">No transaction history found</p>
                      </div>
                    ) : (
                      ledger.map((entry) => (
                        <Card key={entry.id} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
                           <CardContent className="p-8 flex items-center justify-between">
                              <div className="flex items-center gap-8">
                                 <div className={cn(
                                   "h-14 w-14 rounded-2xl flex items-center justify-center",
                                   entry.type === 'CREDIT' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                 )}>
                                    {entry.type === 'CREDIT' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-3 mb-1">
                                       <Badge variant="outline" className="font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                                          {entry.type}
                                       </Badge>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-foreground tracking-tighter uppercase">{entry.description || 'Procurement Transaction'}</h4>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">Outlet: {entry.outlet_name || 'Chain Direct'}</p>
                                 </div>
                              </div>
                              
                              <div className="text-right">
                                 <p className={cn(
                                   "text-2xl font-black tracking-tighter",
                                   entry.type === 'CREDIT' ? "text-amber-500" : "text-emerald-500"
                                 )}>
                                    {entry.type === 'CREDIT' ? '+' : '-'} ₹{(entry.amount_paise / 100).toLocaleString()}
                                 </p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Bal: ₹{(entry.balance_after_paise / 100).toLocaleString()}</p>
                              </div>
                           </CardContent>
                        </Card>
                      )
                    ))}
                 </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-6 bg-secondary/10 rounded-[4rem] border-2 border-dashed border-border p-20">
                 <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center text-slate-300">
                    <FileText className="h-12 w-12" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter">Vendor Audit Panel</h3>
                    <p className="text-sm font-bold text-slate-500 max-w-md mx-auto">Select a supplier from the directory to view their detailed transaction history, credit lines, and payment records.</p>
                 </div>
              </div>
            )}
         </div>
      </div>

      {/* Payment Recording Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
         <DialogContent className="max-w-xl rounded-[3.5rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Record Payment</DialogTitle>
               <DialogDescription className="font-bold text-slate-500 italic">Settling dues for {selectedSupplier?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Amount (₹)</label>
                  <div className="relative">
                     <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                     <Input 
                       type="number"
                       placeholder="0.00"
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-black px-14 text-xl"
                       value={paymentData.amount_paise / 100 || ''}
                       onChange={(e) => setPaymentData({...paymentData, amount_paise: Number(e.target.value) * 100})}
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reference / Note</label>
                  <Input 
                    placeholder="e.g. Bank Transfer Ref #12345"
                    className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                  />
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowPaymentModal(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">Cancel</Button>
               <Button 
                onClick={handlePaymentSubmit}
                className="flex-1 bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow"
               >
                  Authorize Payment
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
