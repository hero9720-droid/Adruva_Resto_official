'use client';

import { useState, useMemo } from 'react';
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
  LineChart,
  CheckCircle2
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
import AddExpenseDialog from '@/components/dashboard/AddExpenseDialog';
import { format, startOfMonth, endOfMonth, addMonths, setDate } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ExpensesPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Dynamic Date Range
  const currentMonthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const currentMonthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  
  const { data: expenses } = useExpenses();
  const { data: taxData } = useTaxReport({ start_date: currentMonthStart, end_date: currentMonthEnd });

  const totalExpenses = expenses?.reduce((acc: number, e: any) => acc + parseInt(e.amount_paise), 0) || 0;

  // Dynamic Deadlines
  const nextMonth = addMonths(new Date(), 1);
  const gstr1Deadline = format(setDate(nextMonth, 11), 'do MMMM yyyy');
  const gstr3bDeadline = format(setDate(nextMonth, 20), 'do MMMM yyyy');

  const handleExport = () => {
    if (!expenses || expenses.length === 0) return;
    
    const headers = ['Date', 'Category', 'Description', 'Method', 'Amount (INR)'];
    const rows = expenses.map((e: any) => [
      new Date(e.expense_date).toLocaleDateString(),
      e.category_name,
      e.description,
      e.payment_method,
      (e.amount_paise / 100).toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map((r: any) => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Adruva_Expenses_${format(new Date(), 'MMM_yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    
    toast({ title: "Export Complete", description: "Expense log downloaded as CSV." });
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 bg-background font-sans pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Finances & Taxes</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage operational costs and tax liabilities.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="border-border text-slate-500 hover:bg-secondary font-black rounded-2xl h-14 px-8 tracking-widest uppercase shadow-soft"
            onClick={handleExport}
          >
            <Download className="h-5 w-5 mr-3" />
            Export Tally
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-glow h-14 px-8 tracking-widest uppercase border-none"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-5 w-5 mr-3" />
            Record Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="border-border shadow-soft overflow-hidden relative group bg-card rounded-[2.5rem]">
           <div className="absolute -left-[2px] top-4 bottom-4 w-1 bg-primary rounded-r-full" />
           <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-secondary text-primary rounded-2xl">
                     <LineChart className="h-6 w-6" />
                   </div>
                </div>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Expenses</span>
                <p className="text-3xl font-black text-foreground mt-1">₹{(totalExpenses / 100).toLocaleString()}</p>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-6">{format(new Date(), 'MMMM yyyy')}</p>
           </CardContent>
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/10 to-transparent opacity-60" />
           <svg className="absolute bottom-0 w-full h-12 text-primary/20" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M0 100 C 20 80, 40 100, 60 50 S 80 20, 100 10" /></svg>
        </Card>

        <Card className="border-border shadow-soft overflow-hidden relative bg-card rounded-[2.5rem]">
           <div className="absolute -left-[2px] top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full" />
           <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                     <Calculator className="h-6 w-6" />
                   </div>
                </div>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">GST Output</span>
                <p className="text-3xl font-black text-foreground mt-1">₹{(taxData?.total_tax / 100 || 0).toLocaleString()}</p>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-6">Collected</p>
           </CardContent>
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-60" />
           <svg className="absolute bottom-0 w-full h-12 text-emerald-500/20" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M0 100 C 20 90, 40 60, 60 80 S 80 40, 100 20" /></svg>
        </Card>

        <Card className="md:col-span-2 border-border shadow-soft bg-card relative overflow-hidden rounded-[2.5rem]">
           <CardContent className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center h-full gap-6">
              <div className="flex-1">
                 <p className="text-foreground text-base font-black mb-6 uppercase tracking-tighter">Tax Breakdown</p>
                 <div className="flex items-center gap-10">
                    <div>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">SGST (2.5%)</p>
                       <p className="text-2xl font-black text-foreground">₹{(taxData?.sgst / 100 || 0).toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">CGST (2.5%)</p>
                       <p className="text-2xl font-black text-foreground">₹{(taxData?.cgst / 100 || 0).toLocaleString()}</p>
                    </div>
                 </div>
                 <Button variant="link" className="text-primary p-0 h-auto mt-6 font-black uppercase text-[10px] tracking-widest hover:no-underline">
                   Full Audit Log <ArrowRight className="ml-1 h-3 w-3" />
                 </Button>
              </div>
              <div className="relative w-32 h-32 shrink-0 md:mr-4 hidden sm:block">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-md">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--secondary)" strokeWidth="20" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary)" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.5)} className="opacity-90" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-xs font-black text-primary">5%</span>
                </div>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
           <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-8 pt-8 px-10 gap-4">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-secondary text-primary rounded-2xl shadow-inner">
                <Receipt className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase leading-tight">Ledger</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Business Overheads</CardDescription>
              </div>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Filter entries..." className="pl-12 h-12 border-none rounded-2xl bg-secondary font-black text-xs text-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             {expenses && expenses.length > 0 ? (
               <Table>
                  <TableHeader>
                     <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-border">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-8">Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Category</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Description</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Vendor / Party</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-8">Amount</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {expenses.map((e: any) => (
                       <TableRow key={e.id} className="border-border hover:bg-secondary/50 transition-colors">
                          <TableCell className="text-xs font-bold text-slate-500 py-5 px-8">
                             {format(new Date(e.expense_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="py-5">
                             <Badge variant="outline" className="bg-card border-border text-slate-500 text-[10px] uppercase font-black py-1 px-2.5 tracking-tighter">
                                {e.category_name}
                             </Badge>
                          </TableCell>
                          <TableCell className="font-black text-foreground py-5 uppercase text-xs">{e.description}</TableCell>
                                                     <TableCell className="py-5">
                              <div className="flex flex-col">
                                 <span className="font-black text-foreground uppercase text-[11px] tracking-tight">{e.vendor_name || 'Cash Expense'}</span>
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="h-2 w-2"/> Verified</span>
                              </div>
                           </TableCell>
                          <TableCell className="text-right font-black text-foreground py-5 px-8">
                             ₹{(e.amount_paise / 100).toLocaleString()}
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
             ) : (
                <div className="py-24 text-center">
                   <p className="text-slate-400 font-bold italic">No records found for current period.</p>
                </div>
             )}
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pb-6 pt-8 px-8 border-b border-border">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary text-primary rounded-2xl shadow-inner">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase">Filing Calendar</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-[2rem] relative overflow-hidden">
                    <div className="flex gap-4 relative z-10">
                       <Calendar className="h-6 w-6 text-orange-500 shrink-0" />
                       <div>
                          <p className="text-sm font-black text-orange-950 uppercase tracking-tight">GSTR-1 Pending</p>
                          <p className="text-[10px] font-black text-orange-600/60 uppercase tracking-[0.1em] mt-1">Deadline: {gstr1Deadline}</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] relative overflow-hidden">
                    <div className="flex gap-4 relative z-10">
                       <Calendar className="h-6 w-6 text-emerald-500 shrink-0" />
                       <div>
                          <p className="text-sm font-black text-emerald-950 uppercase tracking-tight">GSTR-3B Next</p>
                          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.1em] mt-1">Deadline: {gstr3bDeadline}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-4 px-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Turnover</span>
                       <span className="font-black text-foreground">₹{(taxData?.total_revenue / 100 || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Net Payable</span>
                       <span className="font-black text-primary text-xl">₹{(taxData?.total_tax / 100 || 0).toLocaleString()}</span>
                    </div>
                 </div>
                 
                 <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-black h-16 rounded-[2rem] mt-6 shadow-lg tracking-widest uppercase border-none">
                    Generate Tax Bundle
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
      <AddExpenseDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
    </div>
  );
}
