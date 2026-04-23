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
  ChevronRight,
  Download,
  QrCode,
  MessageSquare,
  Sparkles,
  Zap,
  Package
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
  const [customPaymentOpen, setCustomPaymentOpen] = useState(false);
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const { data: bills, isLoading: billsLoading, refetch } = useBills();
  const { data: bill, isLoading: billLoading } = useBillDetails(selectedBillId || '');
  const recordPayment = useRecordPayment();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    toast({ title: 'Sending to Printer...', description: 'Thermal KOT/Bill sequence started.' });
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

  const handleRedeemLoyalty = () => {
    setIsRedeeming(true);
    setTimeout(() => {
      setIsRedeeming(false);
      toast({ 
        title: "Loyalty Applied!", 
        description: `₹250.00 discount applied to Bill #${bill?.bill_number}. (Simulation Mode)`,
        className: "bg-emerald-500 text-white border-none"
      });
    }, 1500);
  };

  const filteredBills = bills?.filter((b: any) => {
    const matchesSearch = b.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.table_name && b.table_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = dateFilter ? b.created_at.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  }) || [];

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const exportCSV = () => {
    if (!filteredBills.length) return;
    const headers = ['Bill No', 'Date', 'Type', 'Status', 'Total (INR)', 'Payment Method'];
    const rows = filteredBills.map((b: any) => [
      b.bill_number,
      `"${new Date(b.created_at).toLocaleString()}"`,
      b.order_type,
      b.status,
      (b.total_paise / 100).toFixed(2),
      b.payment_method || 'Unpaid'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bills_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Started", description: "Your CSV file is being downloaded." });
  };

  return (
    <>
      <ThermalReceipt bill={bill} outlet={{ name: 'ADRUVA RESTO' }} type="bill" />
      <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] bg-background overflow-hidden font-sans pb-10 print:hidden">
        {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
            REVENUE
            <div className="h-3 w-3 md:h-4 md:w-4 bg-primary rounded-full shadow-lg shadow-primary/50" />
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">Billing & Settlement Command</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative">
               <Input 
                 type="date"
                 className="h-14 rounded-2xl border-none shadow-soft text-sm font-bold bg-card text-slate-500 px-4 w-[160px]"
                 value={dateFilter}
                 onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
               />
            </div>
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
               <Input 
                 placeholder="Search bills or tables..." 
                 className="pl-12 h-14 rounded-2xl border-none shadow-soft text-lg font-medium bg-card text-foreground w-full"
                 value={searchQuery}
                 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
               />
            </div>
            <Button 
              variant="outline" 
              onClick={exportCSV}
              className="h-14 px-6 rounded-2xl border-2 border-border font-black uppercase tracking-widest text-[11px] hover:bg-secondary hover:text-primary transition-all gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-8 overflow-hidden">
        {/* Left: Bill List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4 lg:pb-0">
          {billsLoading ? (
             <div className="py-20 text-center animate-pulse text-slate-400 font-black">SYNCING WITH REVENUE ENGINE...</div>
          ) : filteredBills?.length === 0 ? (
             <div className="py-20 text-center text-slate-400 font-medium">No bills found for your search.</div>
          ) : (
            <>
              {paginatedBills.map((b: any) => (
               <motion.div
                layout
                key={b.id}
                onClick={() => setSelectedBillId(b.id)}
                className={cn(
                  "p-4 md:p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer group flex items-center justify-between shrink-0",
                  selectedBillId === b.id 
                    ? "bg-primary border-primary text-primary-foreground shadow-glow" 
                    : "bg-card border-border hover:border-slate-300 text-slate-500 shadow-soft"
                )}
              >
                <div className="flex items-center gap-4 md:gap-6">
                   <div className={cn(
                    "h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                    selectedBillId === b.id ? "bg-primary-foreground/20" : "bg-secondary group-hover:bg-primary/10"
                  )}>
                    <Receipt className={cn("h-6 w-6 md:h-7 md:w-7", selectedBillId === b.id ? "text-primary-foreground" : "text-slate-400 group-hover:text-primary")} />
                  </div>
                  <div>
                    <h3 className={cn("text-xl md:text-2xl font-black tracking-tighter", selectedBillId === b.id ? "text-primary-foreground" : "text-foreground")}>
                      #{b.bill_number}
                    </h3>
                    <div className="flex items-center gap-2 md:gap-3 mt-1">
                        <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", selectedBillId === b.id ? "text-primary-foreground/70" : "text-slate-400")}>
                         {b.table_name || 'Counter'}
                       </span>
                       <span className={cn("h-1 w-1 rounded-full", selectedBillId === b.id ? "bg-primary-foreground/40" : "bg-slate-200")} />
                       <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", selectedBillId === b.id ? "text-primary-foreground/70" : "text-slate-400")}>
                         {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8 text-right">
                   <div>
                    <p className={cn("text-xl md:text-2xl font-black tracking-tighter", selectedBillId === b.id ? "text-primary-foreground" : "text-foreground")}>
                      ₹{(b.total_paise / 100).toLocaleString()}
                    </p>
                     <Badge className={cn(
                      "px-2 py-1 md:px-3 md:py-1 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest border-none mt-1",
                      b.status === 'paid' 
                        ? (selectedBillId === b.id ? "bg-primary-foreground text-primary" : "bg-emerald-500/10 text-emerald-500") 
                        : (selectedBillId === b.id ? "bg-amber-400 text-white" : "bg-amber-500/10 text-amber-500")
                    )}>
                      {b.status}
                    </Badge>
                   </div>
                  <ChevronRight className={cn("h-5 w-5 md:h-6 md:w-6 transition-transform", selectedBillId === b.id ? "text-primary-foreground translate-x-1" : "text-slate-300 group-hover:text-primary")} />
                </div>
              </motion.div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4 shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl font-bold text-slate-500 hover:text-foreground"
                  >
                    Previous
                  </Button>
                  <span className="font-bold text-slate-500 text-sm">Page {page} of {totalPages}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl font-bold text-slate-500 hover:text-foreground"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Detailed Summary */}
        <div className={cn(
          "w-full lg:w-[450px] shrink-0 overflow-hidden flex-col",
          selectedBillId ? "flex h-[55vh] lg:h-auto" : "hidden lg:flex lg:h-auto"
        )}>
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

                  {/* Loyalty & Discounts (Phase 38) */}
                  {bill.customer_id && (
                    <div className="pt-6 border-t border-dashed border-border space-y-4">
                     <div className="flex items-center justify-between p-6 bg-primary/10 rounded-[2rem] border border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                           <Sparkles className="h-20 w-20 text-primary" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                              <Gift className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Loyalty Wallet</p>
                              <p className="text-lg font-black text-foreground tracking-tight">{bill.customer_loyalty_points || 0} POINTS</p>
                           </div>
                        </div>
                        <Button 
                          className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase shadow-glow border-none relative z-10" 
                          onClick={handleRedeemLoyalty}
                          disabled={isRedeeming}
                        >
                          {isRedeeming ? 'REDEEMING...' : 'REDEEM NOW'}
                        </Button>
                     </div>
                   </div>
                  )}

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
                                <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase text-slate-400" onClick={() => setCustomPaymentOpen(true)}>Custom</Button>
                             </div>
                          </div>
                       </DialogContent>
                    </Dialog>
                  ) : (
                    <Dialog>
                       <DialogTrigger asChild>
                          <Button className="h-16 rounded-2xl bg-secondary text-primary font-black shadow-glow border-none uppercase tracking-widest hover:bg-primary/10 transition-all">
                             <QrCode className="h-5 w-5 mr-2" /> FEEDBACK QR
                          </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-md p-12 rounded-[3.5rem] border-none shadow-2xl bg-card flex flex-col items-center text-center">
                          <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 shadow-inner">
                             <MessageSquare className="h-10 w-10" />
                          </div>
                          <h2 className="text-4xl font-black text-foreground tracking-tighter mb-2">Guest Feedback</h2>
                          <p className="text-slate-500 font-medium mb-10">Scan this QR to allow Guest to rate their experience for <span className="text-primary font-black">#{bill.bill_number}</span></p>
                          
                          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-4 border-primary/20 mb-10">
                             <QrCode className="h-40 w-40 text-foreground" strokeWidth={1.5} />
                          </div>
                          
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Simulation Link</p>
                          <code className="bg-secondary px-4 py-2 rounded-xl text-xs font-bold text-primary mb-8">adruva.com/review/{bill.id}</code>
                          
                          <Button variant="outline" className="w-full h-16 rounded-2xl border-border font-black uppercase text-slate-500" onClick={() => toast({ title: "Copied", description: "Review link copied to clipboard." })}>
                             COPY REVIEW LINK
                          </Button>
                       </DialogContent>
                    </Dialog>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full bg-card rounded-[2.5rem] border border-border shadow-soft flex flex-col items-center justify-center p-8 text-center">
                 <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                    <Receipt className="h-10 w-10 text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-black text-foreground tracking-tighter mb-2">No Bill Selected</h3>
                 <p className="text-slate-500 font-medium">Select a bill from the queue to view details and settle payments.</p>
              </div>
            )}
          </AnimatePresence>
      </div>
    </div>
      <SplitBillDialog 
        open={splitDialogOpen} 
        onClose={() => setSplitDialogOpen(false)} 
        bill={bill} 
      />

      {/* Custom Payment Dialog */}
      <Dialog open={customPaymentOpen} onOpenChange={setCustomPaymentOpen}>
        <DialogContent className="bg-card rounded-[2.5rem] border-border shadow-2xl p-8 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground tracking-tighter">Custom Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-slate-500">Payment Method</label>
               <Input 
                 placeholder="e.g. Swiggy, Zomato, Amex" 
                 value={customPaymentMethod}
                 onChange={(e) => setCustomPaymentMethod(e.target.value)}
                 className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
               />
             </div>
             <Button 
               onClick={() => { settleBill(customPaymentMethod); setCustomPaymentOpen(false); setCustomPaymentMethod(''); }}
               disabled={!customPaymentMethod.trim()}
               className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest border-none mt-2 shadow-glow"
             >
               Record Payment
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
