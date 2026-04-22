'use client';

import { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Gift, 
  History, 
  Search, 
  Plus, 
  Star,
  Trophy,
  ArrowRight
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useCustomerLookup, useCustomerHistory } from '@/hooks/useCustomers';

export default function CustomersPage() {
  const [searchPhone, setSearchPhone] = useState('');
  const { data: customer, isLoading } = useCustomerLookup(searchPhone);
  const { data: history } = useCustomerHistory(customer?.id || '');

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-background -m-8 p-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Customer CRM</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Track guest loyalty and visit history.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
          <Plus className="h-4 w-4 mr-2" />
          Add New Guest
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card rounded-[2rem] overflow-hidden shadow-soft">
             <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black tracking-tighter uppercase text-foreground">Find Customer</CardTitle>
                <div className="relative mt-2">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input 
                     placeholder="Enter phone number (e.g. 9876543210)" 
                     className="pl-12 h-14 rounded-2xl border-none bg-background shadow-inner text-lg font-black text-foreground" 
                     value={searchPhone}
                     onChange={(e) => setSearchPhone(e.target.value)}
                   />
                </div>
             </CardHeader>
             {customer ? (
                <CardContent className="border-t border-border pt-6">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-inner">
                           {customer.name[0]}
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-foreground tracking-tighter">{customer.name}</h2>
                           <div className="flex gap-4 mt-1 text-sm text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary/60" /> {customer.phone}</span>
                              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary/60" /> {customer.email || 'No email'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <Badge className="bg-amber-500 text-white border-none px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg">
                           <Star className="h-3 w-3 mr-1 fill-current" /> GOLD MEMBER
                        </Badge>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Member since {new Date(customer.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>
               </CardContent>
             ) : searchPhone.length >= 10 ? (
               <CardContent className="border-t pt-8 pb-8 text-center">
                  <p className="text-slate-400 italic">No customer found with this number.</p>
                  <Button variant="link" className="text-indigo-600 font-bold mt-2">Create New Profile</Button>
               </CardContent>
             ) : (
               <CardContent className="border-t pt-8 pb-8 text-center text-slate-300">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Search by phone number to view history.</p>
               </CardContent>
             )}
          </Card>

           {customer && (
            <Card className="border-border bg-card rounded-[2rem] overflow-hidden shadow-soft">
               <CardHeader className="border-b border-border pb-4 bg-secondary/30">
                  <CardTitle className="text-lg font-black tracking-tighter uppercase text-foreground flex items-center gap-2">
                     <History className="h-5 w-5 text-primary" />
                     Visit History
                  </CardTitle>
               </CardHeader>
                <CardContent className="p-0">
                  <Table>
                     <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-border">
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Date</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Bill No.</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Order Type</TableHead>
                           <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Items</TableHead>
                           <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500">Amount</TableHead>
                        </TableRow>
                     </TableHeader>
                      <TableBody>
                        {history?.bills?.map((bill: any) => (
                           <TableRow key={bill.id} className="border-border hover:bg-secondary/20">
                              <TableCell className="text-xs font-bold text-slate-500">{new Date(bill.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="font-black text-foreground">{bill.bill_number}</TableCell>
                              <TableCell className="uppercase text-[10px] font-black text-primary">{bill.order_type || 'DINE-IN'}</TableCell>
                              <TableCell className="text-xs font-bold text-slate-400">
                                 {bill.items?.length || 0} items
                              </TableCell>
                              <TableCell className="text-right font-black text-foreground">₹{(bill.total_paise / 100).toLocaleString()}</TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
            <Card className="border-primary/20 bg-primary text-primary-foreground shadow-glow-sm overflow-hidden relative rounded-[2.5rem]">
               <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-10" />
               <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/70">Loyalty Balance</CardTitle>
               </CardHeader>
               <CardContent className="relative z-10">
                  <div className="flex items-end gap-2 mb-6">
                     <span className="text-6xl font-black tracking-tighter">{customer?.loyalty_points || 0}</span>
                     <span className="text-primary-foreground/70 font-black mb-2 uppercase tracking-widest text-xs">PTS</span>
                  </div>
                  <div className="p-4 bg-primary-foreground/10 rounded-2xl border border-primary-foreground/10 text-xs leading-relaxed">
                     <p className="flex items-center gap-3 font-bold">
                        <Gift className="h-4 w-4 text-amber-300" />
                        Redeemable for ₹{((customer?.loyalty_points || 0) * 10).toLocaleString()} discount.
                     </p>
                  </div>
                  <Button className="w-full mt-6 h-14 rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-black uppercase tracking-widest border-none shadow-lg">
                     Redeem Points <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
               </CardContent>
            </Card>

            <Card className="border-border bg-card rounded-[2.5rem] overflow-hidden shadow-soft">
               <CardHeader className="border-b border-border bg-secondary/30">
                  <CardTitle className="text-lg font-black tracking-tighter uppercase text-foreground flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-amber-500" />
                     Top Guests
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 p-6">
                  {[1,2,3].map((i) => (
                     <div key={i} className="flex items-center justify-between group cursor-pointer p-3 hover:bg-secondary rounded-2xl transition-all">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-black text-xs text-primary border border-primary/20">#{i}</div>
                           <div>
                              <p className="text-sm font-black text-foreground">Guest Name {i}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">12 Visits • 450 Pts</p>
                           </div>
                        </div>
                        <Badge variant="outline" className="text-primary text-[10px] font-black border-primary/20 rounded-lg">GOLD</Badge>
                     </div>
                  ))}
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">View All Customers</Button>
               </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
