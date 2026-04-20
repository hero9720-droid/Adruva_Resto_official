'use client';

import { useState } from 'react';
import { 
  Receipt, 
  IndianRupee, 
  FileText, 
  Calendar, 
  TrendingDown, 
  Plus, 
  Search, 
  ArrowRight,
  Calculator,
  Download
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
import { useExpenses, useTaxReport } from '@/hooks/useExpenses';

export default function ExpensesPage() {
  const { data: expenses } = useExpenses();
  const { data: taxData } = useTaxReport({ start_date: '2024-04-01', end_date: '2024-04-30' });

  const totalExpenses = expenses?.reduce((acc: number, e: any) => acc + parseInt(e.amount_paise), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances & Taxes</h1>
          <p className="text-slate-500">Manage operational costs and tax liabilities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Tally
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown className="h-5 w-5" /></div>
                 <span className="text-sm font-medium text-slate-500">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold">₹{(totalExpenses / 100).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">This Month</p>
           </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
           <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calculator className="h-5 w-5" /></div>
                 <span className="text-sm font-medium text-slate-500">GST Collected</span>
              </div>
              <p className="text-2xl font-bold">₹{(taxData?.total_tax / 100 || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Output Tax</p>
           </CardContent>
        </Card>
        <Card className="md:col-span-2 border-slate-200 bg-slate-900 text-white shadow-lg overflow-hidden relative">
           <div className="absolute right-0 top-0 h-full w-48 bg-white/5 -skew-x-12 translate-x-16" />
           <CardContent className="p-6 relative z-10 flex justify-between items-center">
              <div>
                 <p className="text-slate-400 text-sm font-medium">GST Breakdown (Estimated)</p>
                 <div className="flex gap-8 mt-4">
                    <div>
                       <p className="text-xs text-slate-400 uppercase tracking-wider">SGST (2.5%)</p>
                       <p className="text-xl font-bold">₹{(taxData?.sgst / 100 || 0).toLocaleString()}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10 self-center" />
                    <div>
                       <p className="text-xs text-slate-400 uppercase tracking-wider">CGST (2.5%)</p>
                       <p className="text-xl font-bold">₹{(taxData?.cgst / 100 || 0).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
              <Button variant="ghost" className="text-white hover:bg-white/10">View Detailed Report <ArrowRight className="ml-2 h-4 w-4" /></Button>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-lg">Operational Expenses</CardTitle>
              <CardDescription>Recent business costs and overheads.</CardDescription>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search logs..." className="pl-9 h-9 text-sm" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                   <TableRow className="bg-slate-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {expenses?.map((e: any) => (
                     <TableRow key={e.id}>
                        <TableCell className="text-xs text-slate-500">
                           {new Date(e.expense_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="bg-slate-50 text-[10px] uppercase font-bold">
                              {e.category_name}
                           </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{e.description}</TableCell>
                        <TableCell className="text-xs uppercase text-slate-500">{e.payment_method}</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                           ₹{(e.amount_paise / 100).toLocaleString()}
                        </TableCell>
                     </TableRow>
                   ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-slate-200">
              <CardHeader>
                 <CardTitle className="text-lg">Tax Filing Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <div className="flex gap-3">
                       <FileText className="h-5 w-5 text-orange-600 shrink-0" />
                       <div>
                          <p className="text-sm font-bold text-orange-900">GSTR-1 Pending</p>
                          <p className="text-xs text-orange-700 mt-0.5">Deadline: 11th May 2024</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Taxable Turnover</span>
                       <span className="font-bold text-slate-900">₹{(taxData?.total_revenue / 100 || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Input Tax Credit</span>
                       <span className="font-bold text-green-600">₹0.00</span>
                    </div>
                    <div className="border-t border-dashed pt-3 flex justify-between">
                       <span className="font-bold">Net GST Payable</span>
                       <span className="font-bold text-indigo-600 text-lg">₹{(taxData?.total_tax / 100 || 0).toLocaleString()}</span>
                    </div>
                 </div>
                 <Button className="w-full bg-slate-900 hover:bg-black text-xs h-9 mt-2">Generate GST Summary</Button>
              </CardContent>
           </Card>

           <Card className="border-indigo-100 bg-indigo-50/30">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm text-indigo-900 uppercase tracking-wider font-black">Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-xs text-indigo-700 leading-relaxed">
                    Upload your expense receipts directly to AdruvaResto to claim Input Tax Credit (ITC) automatically during audit cycles.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
