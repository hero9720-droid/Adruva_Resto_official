import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  QrCode,
  CheckCircle2,
  Receipt,
  Gift,
  Search,
  Loader2,
  Plus
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function PaymentModal({ 
  open, 
  onOpenChange, 
  bill,
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  bill: any;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && bill?.customer_id) {
      fetchCustomer(bill.customer_id);
    } else {
      setCustomer(null);
      setLoyaltyDiscount(0);
    }
  }, [open, bill]);

  const fetchCustomer = async (idOrPhone: string) => {
    setLoadingCustomer(true);
    try {
      const { data } = await api.get(`/customers/lookup?query=${idOrPhone}`);
      setCustomer(data.data);
    } catch (error) {
      console.error('Customer lookup failed');
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleRedeem = async () => {
    if (!customer || customer.loyalty_points < 100) return;
    try {
      const pointsToRedeem = Math.min(customer.loyalty_points, Math.floor((bill.total_paise - loyaltyDiscount) / 10));
      // Standard: 10 points = 1 Rupee
      const discountRupees = pointsToRedeem / 10;
      setLoyaltyDiscount(prev => prev + (discountRupees * 100));
      setCustomer({ ...customer, loyalty_points: customer.loyalty_points - pointsToRedeem });
      toast({ title: "Points Redeemed", description: `₹${discountRupees} discount applied.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Redemption failed" });
    }
  };

  const handlePayment = async () => {
    if (!method) return;
    setProcessing(true);
    try {
      await api.post('/billing/payments', {
        bill_id: bill.id,
        payment_method: method,
        amount_paise: bill.total_paise - loyaltyDiscount
      });
      toast({ title: "Payment Recorded", description: "Table is now available." });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Payment Failed" });
    } finally {
      setProcessing(false);
    }
  };

  const finalAmount = bill?.total_paise - loyaltyDiscount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl flex flex-col md:flex-row h-[600px] md:h-auto">
        {/* Left Panel: Bill & Loyalty */}
        <div className="flex-1 bg-indigo-600 p-8 text-white relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Receipt className="h-24 w-24" />
          </div>
          <div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-black text-white">Bill Overview</DialogTitle>
              <DialogDescription className="text-indigo-100 font-medium">
                Settling Bill #{bill?.bill_number}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-8 space-y-4">
               <div className="flex justify-between text-sm font-bold text-indigo-200 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{(bill?.subtotal_paise / 100).toLocaleString()}</span>
               </div>
               {loyaltyDiscount > 0 && (
                 <div className="flex justify-between text-sm font-bold text-green-300 uppercase tracking-widest animate-in slide-in-from-left">
                    <span>Loyalty Discount</span>
                    <span>-₹{(loyaltyDiscount / 100).toLocaleString()}</span>
                 </div>
               )}
               <div className="pt-4 border-t border-indigo-400/30 flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Balance Payable</span>
                  <span className="text-6xl font-black text-white tracking-tighter">₹{(finalAmount / 100).toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Gift className="h-5 w-5 text-yellow-400" />
                   <span className="font-black text-sm uppercase tracking-tighter">Loyalty Rewards</span>
                </div>
                {customer && <Badge className="bg-yellow-400 text-indigo-900 border-none font-black">{customer.loyalty_points} PTS</Badge>}
             </div>

             {!customer ? (
               <div className="space-y-3">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                     <Input 
                      placeholder="Customer Phone" 
                      className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-indigo-300 h-10 rounded-xl"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchCustomer(searchPhone)}
                     />
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full text-indigo-200 hover:text-white hover:bg-white/5 text-xs font-bold"
                    onClick={() => fetchCustomer(searchPhone)}
                    disabled={loadingCustomer}
                  >
                    {loadingCustomer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    LINK GUEST PROFILE
                  </Button>
               </div>
             ) : (
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">{customer.name[0]}</div>
                     <div>
                        <p className="font-black text-sm">{customer.name}</p>
                        <p className="text-[10px] font-bold text-indigo-200">{customer.phone}</p>
                     </div>
                  </div>
                  <Button 
                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl h-10 text-xs"
                    onClick={handleRedeem}
                    disabled={customer.loyalty_points < 100}
                  >
                    REDEEM POINTS (10 PTS = ₹1)
                  </Button>
               </div>
             )}
          </div>
        </div>

        {/* Right Panel: Payment Methods */}
        <div className="flex-1 p-8 space-y-6 bg-card">
           <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Select Payment Method</h3>
           <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'cash', name: 'Cash', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
              { id: 'upi', name: 'UPI / QR', icon: QrCode, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { id: 'card', name: 'Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'wallet', name: 'Wallet', icon: Smartphone, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${
                  method === m.id 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className={`p-3 rounded-2xl ${m.bg}`}>
                   <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <span className={`font-black text-xs uppercase tracking-widest ${method === m.id ? 'text-primary' : 'text-muted-foreground'}`}>
                   {m.name}
                </span>
              </button>
            ))}
          </div>

          <Button 
            className="w-full h-20 bg-foreground hover:bg-foreground/90 text-background rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            disabled={!method || processing}
            onClick={handlePayment}
          >
            {processing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                COMPLETE SETTLEMENT
              </>
            )}
          </Button>
          
          <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            This will mark the table as available and close the order session.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
