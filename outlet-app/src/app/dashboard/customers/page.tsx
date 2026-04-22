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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer CRM</h1>
          <p className="text-slate-500">Track guest loyalty and visit history.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Guest
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
             <CardHeader className="pb-4">
                <CardTitle className="text-lg">Find Customer</CardTitle>
                <div className="relative mt-2">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input 
                     placeholder="Enter phone number (e.g. 9876543210)" 
                     className="pl-10 h-12 text-lg font-medium" 
                     value={searchPhone}
                     onChange={(e) => setSearchPhone(e.target.value)}
                   />
                </div>
             </CardHeader>
             {customer ? (
               <CardContent className="border-t pt-6">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                           {customer.name[0]}
                        </div>
                        <div>
                           <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
                           <div className="flex gap-4 mt-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email || 'No email'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <Badge className="bg-yellow-500 text-white border-none px-3 py-1 text-xs">
                           <Star className="h-3 w-3 mr-1 fill-current" /> GOLD MEMBER
                        </Badge>
                        <p className="text-xs text-slate-400 mt-2">Member since {new Date(customer.created_at).toLocaleDateString()}</p>
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
            <Card className="border-slate-200">
               <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                     <History className="h-5 w-5 text-indigo-600" />
                     Visit History
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                     <TableHeader>
                        <TableRow className="bg-slate-50">
                           <TableHead>Date</TableHead>
                           <TableHead>Bill No.</TableHead>
                           <TableHead>Order Type</TableHead>
                           <TableHead>Items</TableHead>
                           <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {history?.bills?.map((bill: any) => (
                           <TableRow key={bill.id}>
                              <TableCell className="text-xs">{new Date(bill.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="font-bold">{bill.bill_number}</TableCell>
                              <TableCell className="uppercase text-[10px] font-black">{bill.order_type || 'DINE-IN'}</TableCell>
                              <TableCell className="text-xs text-slate-500">
                                 {bill.items?.length || 0} items
                              </TableCell>
                              <TableCell className="text-right font-bold">₹{(bill.total_paise / 100).toLocaleString()}</TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card className="border-slate-200 bg-indigo-600 text-white shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-10" />
              <CardHeader className="relative z-10 pb-2">
                 <CardTitle className="text-sm uppercase tracking-widest text-indigo-200">Loyalty Balance</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                 <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black">{customer?.loyalty_points || 0}</span>
                    <span className="text-indigo-200 font-bold mb-1">PTS</span>
                 </div>
                 <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs leading-relaxed">
                    <p className="flex items-center gap-2">
                       <Gift className="h-4 w-4 text-yellow-400" />
                       Redeemable for ₹{((customer?.loyalty_points || 0) * 10).toLocaleString()} discount.
                    </p>
                 </div>
                 <Button className="w-full mt-4 bg-white text-indigo-600 hover:bg-indigo-50 font-bold">
                    Redeem Points <ArrowRight className="h-4 w-4 ml-2" />
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-slate-200">
              <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Guests
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">#{i}</div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">Guest Name {i}</p>
                             <p className="text-[10px] text-slate-400">12 Visits • 450 Pts</p>
                          </div>
                       </div>
                       <Badge variant="outline" className="text-indigo-600 text-[10px]">GOLD</Badge>
                    </div>
                 ))}
                 <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-indigo-600">View All Customers</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
