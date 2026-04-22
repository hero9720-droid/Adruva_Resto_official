'use client';

import { useState, useRef } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  CreditCard, 
  Banknote, 
  CheckCircle2,
  Clock,
  Eye,
  Scissors,
  Gift,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { useBills, useBillDetails, useRecordPayment } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import ThermalReceipt from '@/components/dashboard/ThermalReceipt';
import SplitBillDialog from '@/components/dashboard/SplitBillDialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillsPage() {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const { data: bills, isLoading: billsLoading, refetch } = useBills();
  const { data: bill, isLoading: billLoading } = useBillDetails(selectedBillId || '');
  const recordPayment = useRecordPayment();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    toast({ title: 'Sending to Printer...', description: 'Thermal KOT/Bill sequence started.' });
    // In a real environment, we'd use the serial printer lib
    window.print();
  };

  const settleBill = async (method: string) => {
    if (!bill) return;
    try {
      await recordPayment.mutateAsync({
        bill_id: bill.id,
        payment_method: method,
        amount_paise: bill.total_paise
      });
      toast({ title: "Payment Recorded", description: `Bill #${bill.bill_number} marked as paid via ${method}.` });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "Payment failed" });
    }
  };

  const filteredBills = bills?.filter((b: any) => 
    b.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.table_name && b.table_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background -m-8 p-8 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
            REVENUE
            <div className="h-4 w-4 bg-primary rounded-full shadow-lg shadow-primary/50" />
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Billing & Settlement Command</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
               <Input 
                 placeholder="Search bills or tables..." 
                 className="pl-12 h-14 rounded-2xl border-none shadow-soft text-lg font-medium bg-card text-foreground"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Left: Bill List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {billsLoading ? (
             <div className="py-20 text-center animate-pulse text-slate-400 font-black">SYNCING WITH REVENUE ENGINE...</div>
          ) : filteredBills?.length === 0 ? (
             <div className="py-20 text-center text-slate-400 font-medium">No bills found for your search.</div>
          ) : (
            filteredBills?.map((b: any) => (
               <motion.div
                layout
                key={b.id}
                onClick={() => setSelectedBillId(b.id)}
                className={cn(
                  "p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer group flex items-center justify-between",
                  selectedBillId === b.id 
                    ? "bg-primary border-primary text-primary-foreground shadow-glow" 
                    : "bg-card border-border hover:border-slate-300 text-slate-500 shadow-soft"
                )}
              >
                <div className="flex items-center gap-6">
                   <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                    selectedBillId === b.id ? "bg-primary-foreground/20" : "bg-secondary group-hover:bg-primary/10"
                  )}>
                    <Receipt className={cn("h-7 w-7", selectedBillId === b.id ? "text-primary-foreground" : "text-slate-400 group-hover:text-primary")} />
                  </div>
                  <div>
                    <h3 className={cn("text-2xl font-black tracking-tighter", selectedBillId === b.id ? "text-primary-foreground" : "text-foreground")}>
                      #{b.bill_number}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedBillId === b.id ? "text-primary-foreground/70" : "text-slate-400")}>
                         {b.table_name || 'Counter'}
                       </span>
                       <span className={cn("h-1 w-1 rounded-full", selectedBillId === b.id ? "bg-primary-foreground/40" : "bg-slate-200")} />
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedBillId === b.id ? "text-primary-foreground/70" : "text-slate-400")}>
                         {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                   <div>
                    <p className={cn("text-2xl font-black tracking-tighter", selectedBillId === b.id ? "text-primary-foreground" : "text-foreground")}>
                      ₹{(b.total_paise / 100).toLocaleString()}
                    </p>
                     <Badge className={cn(
                      "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border-none mt-1",
                      b.status === 'paid' 
                        ? (selectedBillId === b.id ? "bg-primary-foreground text-primary" : "bg-emerald-500/10 text-emerald-500") 
                        : (selectedBillId === b.id ? "bg-amber-400 text-white" : "bg-amber-500/10 text-amber-500")
                    )}>
                      {b.status}
                    </Badge>
                   </div>
                  <ChevronRight className={cn("h-6 w-6 transition-transform", selectedBillId === b.id ? "text-primary-foreground translate-x-1" : "text-slate-300 group-hover:text-primary")} />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right: Detailed Summary */}
        <div className="w-[450px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedBillId && bill ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                 className="h-full bg-card rounded-[2.5rem] border border-border shadow-soft overflow-hidden flex flex-col"
              >
                <div className="p-8 bg-secondary/50 border-b border-border flex justify-between items-center">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Settlement Details</h4>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter">#{bill.bill_number}</h2>
                  </div>
                  <Badge className={cn(
                    "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-none",
                    bill.status === 'paid' ? "bg-emerald-500 text-white shadow-glow" : "bg-amber-500 text-white shadow-glow"
                  )}>
                    {bill.status}
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                  {/* Itemized List */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                       <Package className="h-4 w-4 text-slate-400" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Items</span>
                    </div>
                     {bill.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex flex-col">
                           <span className="font-bold text-foreground">{item.menu_item_name}</span>
                           <span className="text-[11px] font-medium text-slate-500">Qty: {item.quantity} @ ₹{item.unit_price_paise / 100}</span>
                        </div>
                        <span className="font-black text-foreground">₹{(item.total_paise / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Loyalty & Discounts */}
                   <div className="pt-6 border-t border-dashed border-border space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
                       <div className="flex items-center gap-3">
                          <Gift className="h-5 w-5 text-primary" />
                          <div>
                             <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Loyalty Reward</p>
                             <p className="text-sm font-bold text-foreground">Points available: 450</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" className="text-primary font-black text-[10px] uppercase hover:bg-primary/20">Redeem</Button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="space-y-3 pt-6 border-t border-dashed border-border">
                    <div className="flex justify-between text-sm">
                       <span className="font-medium text-slate-500">Subtotal</span>
                       <span className="font-bold text-foreground">₹{(bill.subtotal_paise / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="font-medium text-slate-500">Service Charge ({bill.service_charge_percent || 0}%)</span>
                       <span className="font-bold text-foreground">₹{(bill.service_charge_paise / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="font-medium text-slate-500">GST (5%)</span>
                       <span className="font-bold text-foreground">₹{((bill.gst_5_paise + bill.gst_12_paise + bill.gst_18_paise) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end pt-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Amount</p>
                          <p className="text-4xl font-black text-primary tracking-tighter">₹{(bill.total_paise / 100).toLocaleString()}</p>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-secondary text-slate-500 border-none font-bold">Inclusive of all taxes</Badge>
                       </div>
                    </div>
                  </div>
                </div>

                 <div className="p-8 bg-card border-t border-border shrink-0 grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16 rounded-2xl border-border text-slate-500 font-black uppercase hover:bg-secondary" onClick={handlePrint}>
                    <Printer className="h-5 w-5 mr-2" /> Print
                  </Button>
                  
                  {bill.status !== 'paid' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow border-none uppercase tracking-widest">
                          <Banknote className="h-5 w-5 mr-2" /> Settle
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="max-w-md p-10 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-card">
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="h-48 w-48 -mr-12 -mt-12 text-foreground" />
                         </div>
                         <div className="relative z-10">
                            <h2 className="text-4xl font-black text-foreground tracking-tighter mb-2">Settle Bill</h2>
                            <p className="text-slate-500 font-medium mb-10">Choose payment method for <span className="text-primary font-black">₹{(bill.total_paise / 100).toLocaleString()}</span></p>
                                                        <div className="grid grid-cols-1 gap-4">
                               <Button 
                                 variant="outline" 
                                 className="h-20 rounded-2xl border-2 border-border hover:border-emerald-500 hover:bg-emerald-500/10 flex justify-between items-center px-6 transition-all group"
                                 onClick={() => settleBill('cash')}
                               >
                                  <div className="flex items-center gap-4">
                                     <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                        <Banknote className="h-6 w-6" />
                                     </div>
                                     <span className="font-black text-foreground group-hover:text-emerald-500">Cash Settlement</span>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-slate-300" />
                               </Button>
                               
                               <Button 
                                 variant="outline" 
                                 className="h-20 rounded-2xl border-2 border-border hover:border-blue-500 hover:bg-blue-500/10 flex justify-between items-center px-6 transition-all group"
                                 onClick={() => settleBill('card')}
                                >
                                  <div className="flex items-center gap-4">
                                     <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                                        <CreditCard className="h-6 w-6" />
                                     </div>
                                     <span className="font-black text-foreground group-hover:text-blue-500">Card / POS</span>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-slate-300" />
                               </Button>

                               <Button 
                                 variant="outline" 
                                 className="h-20 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/10 flex justify-between items-center px-6 transition-all group"
                                 onClick={() => settleBill('upi')}
                               >
                                  <div className="flex items-center gap-4">
                                     <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-black italic text-xs">UPI</div>
                                     <span className="font-black text-foreground group-hover:text-primary">GPay / PhonePe</span>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-slate-300" />
                               </Button>
                            </div>

                            <div className="mt-8 flex gap-4">
                               <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase text-slate-400" onClick={() => setSplitDialogOpen(true)}>Split Bill</Button>
                               <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase text-slate-400" onClick={() => {}}>Custom</Button>
                            </div>
                         </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button className="col-span-2 h-16 rounded-2xl bg-emerald-500 text-white font-black shadow-glow border-none uppercase tracking-widest cursor-default">
                      <CheckCircle2 className="h-5 w-5 mr-2" /> SETTLED
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-secondary/50 rounded-[2.5rem] border-2 border-dashed border-border p-12 text-center">
                 <div className="h-24 w-24 bg-card rounded-3xl flex items-center justify-center mb-8 shadow-soft border border-border">
                    <Receipt className="h-10 w-10 text-slate-300" />
                 </div>
                 <p className="text-xl font-black text-foreground mb-2">NO BILL SELECTED</p>
                 <p className="font-medium text-slate-500">Select a bill from the registry to view itemized details and process payment.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <ThermalReceipt ref={printRef} bill={bill} outlet={null} />
      </div>

      <SplitBillDialog 
        open={splitDialogOpen} 
        onClose={() => setSplitDialogOpen(false)} 
        bill={bill} 
      />
    </div>
  );
}
