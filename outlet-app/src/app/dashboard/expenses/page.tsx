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
  Download,
  Filter,
  LineChart
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-slate-900">Finances & Taxes</h1>
          <p className="text-slate-500 font-medium mt-1">Manage operational costs and tax liabilities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl h-11 px-5">
            <Download className="h-4 w-4 mr-2" />
            Export Tally
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-glow h-11 px-5">
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-100 shadow-soft overflow-hidden relative group">
           <div className="absolute -left-[2px] top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full" />
           <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                     <LineChart className="h-6 w-6" />
                   </div>
                   <div className="flex gap-1 flex-col items-end">
                     <div className="flex gap-1">
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                     </div>
                   </div>
                </div>
                <span className="text-sm font-bold text-slate-500">Total Expenses</span>
                <p className="text-3xl font-black text-slate-900 mt-1">₹{(totalExpenses / 100).toLocaleString()}</p>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-6">This Month</p>
           </CardContent>
           {/* Decorative Chart Line */}
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-indigo-50 to-transparent opacity-60" />
           <svg className="absolute bottom-0 w-full h-12 text-indigo-200" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M0 100 C 20 80, 40 100, 60 50 S 80 20, 100 10" /></svg>
        </Card>

        <Card className="border-slate-100 shadow-soft overflow-hidden relative">
           <div className="absolute -left-[2px] top-4 bottom-4 w-1 bg-emerald-400 rounded-r-full" />
           <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                     <Calculator className="h-6 w-6" />
                   </div>
                   <div className="flex gap-1 flex-col items-end">
                     <div className="flex gap-1">
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                     </div>
                   </div>
                </div>
                <span className="text-sm font-bold text-slate-500">GST Collected</span>
                <p className="text-3xl font-black text-slate-900 mt-1">₹{(taxData?.total_tax / 100 || 0).toLocaleString()}</p>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-6">Output Tax</p>
           </CardContent>
           {/* Decorative Chart Line */}
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-50 to-transparent opacity-60" />
           <svg className="absolute bottom-0 w-full h-12 text-emerald-200" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M0 100 C 20 90, 40 60, 60 80 S 80 40, 100 20" /></svg>
        </Card>

        <Card className="md:col-span-2 border-slate-100 shadow-soft bg-white relative overflow-hidden">
           <CardContent className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center h-full gap-6">
              <div className="flex-1">
                 <p className="text-slate-900 text-base font-black mb-6">GST Breakdown (Estimated)</p>
                 <div className="flex items-center gap-10">
                    <div>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">SGST (2.5%)</p>
                       <p className="text-2xl font-black text-slate-800">₹{(taxData?.sgst / 100 || 0).toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">CGST (2.5%)</p>
                       <p className="text-2xl font-black text-slate-800">₹{(taxData?.cgst / 100 || 0).toLocaleString()}</p>
                    </div>
                 </div>
                 <Button variant="link" className="text-indigo-600 p-0 h-auto mt-6 font-bold hover:no-underline hover:text-indigo-700">
                   View Detailed Report <ArrowRight className="ml-1 h-4 w-4" />
                 </Button>
              </div>
              {/* Fake Donut Chart representing breakdown */}
              <div className="relative w-32 h-32 shrink-0 md:mr-4 hidden sm:block">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-md">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4f46e5" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="60" className="opacity-90" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#818cf8" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="190" className="opacity-90" />
                </svg>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-100 shadow-soft">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 pt-6 px-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Operational Expenses</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">Recent business costs and overheads.</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search logs..." className="pl-10 h-11 border-slate-200 rounded-xl bg-slate-50/50 font-medium" />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 text-slate-500 shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             {expenses && expenses.length > 0 ? (
               <Table>
                  <TableHeader>
                     <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                        <TableHead className="font-bold text-slate-500 py-4 px-8">Date</TableHead>
                        <TableHead className="font-bold text-slate-500 py-4">Category</TableHead>
                        <TableHead className="font-bold text-slate-500 py-4">Description</TableHead>
                        <TableHead className="font-bold text-slate-500 py-4">Method</TableHead>
                        <TableHead className="text-right font-bold text-slate-500 py-4 px-8">Amount</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {expenses.map((e: any) => (
                       <TableRow key={e.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-sm font-medium text-slate-500 py-5 px-8">
                             {new Date(e.expense_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-5">
                             <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 text-[11px] uppercase font-bold py-1 px-2.5">
                                {e.category_name}
                             </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-slate-800 py-5">{e.description}</TableCell>
                          <TableCell className="text-xs font-bold uppercase text-slate-500 py-5">{e.payment_method}</TableCell>
                          <TableCell className="text-right font-black text-slate-900 py-5 px-8">
                             ₹{(e.amount_paise / 100).toLocaleString()}
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
             ) : (
               <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                 <div className="w-24 h-24 mb-6 relative">
                   {/* Empty state illustration representation */}
                   <div className="absolute inset-0 bg-indigo-50 rounded-3xl rotate-6" />
                   <div className="absolute inset-0 bg-white border-2 border-indigo-100 rounded-3xl -rotate-3 flex flex-col items-center justify-center gap-2">
                     <div className="w-10 h-1.5 bg-indigo-100 rounded-full" />
                     <div className="w-14 h-1.5 bg-indigo-100 rounded-full" />
                     <div className="w-8 h-1.5 bg-indigo-100 rounded-full" />
                   </div>
                   <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                     <Plus className="h-5 w-5 text-white" />
                   </div>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-2">No expenses recorded yet</h3>
                 <p className="text-slate-500 font-medium max-w-[250px] mx-auto mb-8 leading-relaxed">
                   Start tracking your business expenses by adding a new expense.
                 </p>
                 <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl h-11 px-6">
                   <Plus className="h-4 w-4 mr-2" />
                   Record Expense
                 </Button>
               </div>
             )}
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-slate-100 shadow-soft">
              <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                     <FileText className="h-5 w-5" />
                   </div>
                   <CardTitle className="text-lg font-black text-slate-900">Tax Filing Status</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-orange-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex gap-3 relative z-10">
                       <FileText className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold text-orange-900">GSTR-1 Pending</p>
                          <p className="text-[11px] font-bold text-orange-600/80 uppercase tracking-wider mt-1.5">Deadline: 11th May 2024</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-2 px-1">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-bold">Taxable Turnover</span>
                       <span className="font-black text-slate-900 text-base">₹{(taxData?.total_revenue / 100 || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-bold">Input Tax Credit</span>
                       <span className="font-black text-emerald-600 text-base">₹0.00</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center mt-2">
                       <span className="font-black text-slate-900">Net GST Payable</span>
                       <span className="font-black text-indigo-600 text-xl">₹{(taxData?.total_tax / 100 || 0).toLocaleString()}</span>
                    </div>
                 </div>
                 
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl mt-4 shadow-glow">
                   <FileText className="h-4 w-4 mr-2" />
                   Generate GST Summary
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
