'use client';

import { useState, useRef } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  CreditCard, 
  Banknote, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
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

export default function BillsPage() {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const { data: bills, isLoading: billsLoading, isError: billsError, refetch } = useBills();
  const { data: bill, isLoading: billLoading } = useBillDetails(selectedBillId || '');
  const recordPayment = useRecordPayment();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
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
    } catch (error) {
      toast({ variant: "destructive", title: "Payment failed" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Receipts</h1>
          <p className="text-slate-500">Track and settle customer bills.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search bill number..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-200">
          <CardHeader>
             <CardTitle className="text-lg">Recent Bills</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100">
               {billsLoading ? (
                 <div className="p-8 text-center text-slate-400 animate-pulse">Loading bills...</div>
               ) : billsError ? (
                 <div className="p-8 text-center space-y-3">
                   <p className="text-red-500 font-medium">Failed to load bills.</p>
                   <button onClick={() => refetch()} className="text-sm text-indigo-600 underline">Retry</button>
                 </div>
               ) : bills?.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No bills found.</div>
               ) : (
                 bills?.map((b: any) => (
                   <div key={b.id} 
                        className={cn("flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer", selectedBillId === b.id && "bg-indigo-50/50 border-l-4 border-indigo-600")} 
                        onClick={() => setSelectedBillId(b.id)}>
                      <div className="flex items-center gap-4">
                         <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", b.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600')}>
                            <Receipt className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">{b.bill_number}</p>
                            <p className="text-xs text-slate-500">
                              {b.table_name || 'Direct'} • {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right">
                            <p className="font-bold">₹{(b.total_paise / 100).toLocaleString()}</p>
                            <Badge variant="outline" className={b.status === 'paid' ? "text-green-600 bg-green-50 border-green-200" : "text-orange-600 bg-orange-50 border-orange-200"}>
                               {b.status.toUpperCase()}
                            </Badge>
                         </div>
                         <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </CardContent>
        </Card>

        {/* Bill Detail View (Right Sidebar) */}
        <div className="space-y-6">
          {selectedBillId ? (
            <Card className="border-slate-200 shadow-lg sticky top-6">
               <CardHeader className="bg-slate-50/50 border-b">
                  <div className="flex justify-between items-start">
                     <div>
                        <CardTitle className="text-lg">Bill Summary</CardTitle>
                        <CardDescription>BILL-00001</CardDescription>
                     </div>
                     <Badge className="bg-orange-500">Unpaid</Badge>
                  </div>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                     {/* Sample Items */}
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Paneer Tikka x 2</span>
                        <span className="font-medium">₹640.00</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Dal Makhani x 1</span>
                        <span className="font-medium">₹350.00</span>
                     </div>
                  </div>
                  
                  <div className="border-t border-dashed pt-4 space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span>₹990.00</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">GST (5%)</span>
                        <span>₹49.50</span>
                     </div>
                     <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Grand Total</span>
                        <span className="text-indigo-600">₹1,039.50</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                     <Button variant="outline" className="w-full" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                     </Button>
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100">
                              <Banknote className="h-4 w-4 mr-2" />
                              Settle
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                           <DialogHeader>
                              <DialogTitle>Settle Bill #BILL-00001</DialogTitle>
                           </DialogHeader>
                           <div className="grid grid-cols-2 gap-4 py-4">
                              <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 hover:border-indigo-600 hover:bg-indigo-50" onClick={() => settleBill('cash')}>
                                 <Banknote className="h-8 w-8 text-green-600" />
                                 <span>Cash</span>
                              </Button>
                              <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 hover:border-indigo-600 hover:bg-indigo-50" onClick={() => settleBill('card')}>
                                 <CreditCard className="h-8 w-8 text-blue-600" />
                                 <span>Card / POS</span>
                              </Button>
                              <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 hover:border-indigo-600 hover:bg-indigo-50" onClick={() => settleBill('upi')}>
                                 <div className="h-8 w-8 bg-indigo-100 rounded flex items-center justify-center font-bold text-indigo-600 text-xs italic">UPI</div>
                                 <span>GPay / PhonePe</span>
                              </Button>
                           </div>
                           <DialogFooter>
                              <Button variant="ghost" className="w-full">Cancel</Button>
                           </DialogFooter>
                        </DialogContent>
                     </Dialog>
                  </div>
               </CardContent>
            </Card>
          ) : (
            <div className="h-64 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 text-center p-8">
               <p>Select a bill from the list to view details and settle payment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <ThermalReceipt ref={printRef} bill={null} outlet={null} />
    </div>
  );
}
