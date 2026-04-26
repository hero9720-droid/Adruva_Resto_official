'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  PieChart as PieChartIcon, 
  Calculator, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Building2,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  Gavel
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TaxCompliancePage() {
  const [report, setReport] = useState<any[]>([]);
  const [slabs, setSlabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSlab, setShowCreateSlab] = useState(false);
  
  const [newSlab, setNewSlab] = useState({
    name: 'GST 5%',
    cgst_percent: 2.5,
    sgst_percent: 2.5,
    igst_percent: 0,
    vat_percent: 0
  });

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [reportRes, slabsRes] = await Promise.all([
        api.get('/finance/tax-report'),
        api.get('/finance/tax-slabs')
      ]);
      setReport(reportRes.data.data);
      setSlabs(slabsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch tax data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSlab = async () => {
    try {
      await api.post('/finance/tax-slabs', newSlab);
      toast({ title: "Tax Slab Created", description: "This can now be applied to menu categories." });
      setShowCreateSlab(false);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to create tax slab" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Calculating Tax Liabilities...</div>;

  const totalTax = report.reduce((s, c) => s + Number(c.total_tax), 0);
  const totalSales = report.reduce((s, c) => s + Number(c.net_sales), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Compliance Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Gavel className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Regulatory Compliance</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Taxation <br />
             <span className="text-primary">Command</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Automate your GST and VAT compliance. Generate chain-wide liability reports, audit multi-layered tax splits, and export ready-to-file data for your CA.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowCreateSlab(true)}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <Plus className="h-5 w-5" /> New Tax Slab
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Liability Summary */}
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <IndianRupee className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tax Liability</p>
               <p className="text-4xl font-black text-foreground">₹{(totalTax / 100).toLocaleString()}</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">Combined CGST + SGST</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-4">
            <CardContent className="p-6">
               <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Calculator className="h-6 w-6 text-blue-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax to Sales Ratio</p>
               <p className="text-4xl font-black text-foreground">{((totalTax / totalSales) * 100 || 0).toFixed(1)}%</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">Compliance Efficiency</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[2.5rem] lg:col-span-2 p-4">
            <CardContent className="p-6 flex justify-between items-center h-full">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Ready to File</h3>
                  <p className="text-sm font-bold text-white/40">Download your consolidated monthly tax summary for audit.</p>
                  <Button className="bg-primary text-white rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-glow flex items-center gap-2">
                     <Download className="h-4 w-4" /> Export GST Report
                  </Button>
               </div>
               <ShieldCheck className="h-20 w-20 text-primary/20" />
            </CardContent>
         </Card>
      </div>

      {/* Tax Report Table */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Liability Breakdown</h2>
            <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">FINANCIAL YEAR 2025-26</Badge>
         </div>

         <Card className="border-none bg-card shadow-soft rounded-[3rem] overflow-hidden">
            <Table>
               <TableHeader className="bg-secondary/50">
                  <TableRow className="border-none">
                     <TableHead className="font-black uppercase tracking-widest text-[10px] p-8">Outlet Name</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Net Sales</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">CGST (2.5%)</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">SGST (2.5%)</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Total Tax</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-right p-8 text-primary">Gross Collection</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {report.map((item, idx) => (
                    <TableRow key={idx} className="border-border hover:bg-secondary/20 transition-colors group">
                       <TableCell className="p-8 font-black text-foreground">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                             </div>
                             {item.outlet_name}
                          </div>
                       </TableCell>
                       <TableCell className="text-center font-bold text-slate-600">₹{(item.net_sales / 100).toLocaleString()}</TableCell>
                       <TableCell className="text-center font-bold text-slate-500">₹{(item.total_cgst / 100 || 0).toLocaleString()}</TableCell>
                       <TableCell className="text-center font-bold text-slate-500">₹{(item.total_sgst / 100 || 0).toLocaleString()}</TableCell>
                       <TableCell className="text-center font-black text-primary">₹{(item.total_tax / 100).toLocaleString()}</TableCell>
                       <TableCell className="p-8 text-right font-black text-foreground text-lg">₹{(item.gross_sales / 100).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </Card>
      </div>

      {/* Create Slab Dialog */}
      <Dialog open={showCreateSlab} onOpenChange={setShowCreateSlab}>
         <DialogContent className="max-w-2xl rounded-[3rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Define Tax Slab</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Standardize your tax configuration across the entire chain.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Slab Identity</label>
                  <Input 
                    placeholder="E.g. Standard GST 5%" 
                    value={newSlab.name}
                    onChange={(e) => setNewSlab({...newSlab, name: e.target.value})}
                    className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                  />
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CGST (%)</label>
                     <Input 
                       type="number"
                       placeholder="2.5" 
                       value={newSlab.cgst_percent}
                       onChange={(e) => setNewSlab({...newSlab, cgst_percent: Number(e.target.value)})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SGST (%)</label>
                     <Input 
                       type="number"
                       placeholder="2.5" 
                       value={newSlab.sgst_percent}
                       onChange={(e) => setNewSlab({...newSlab, sgst_percent: Number(e.target.value)})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowCreateSlab(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">Discard</Button>
               <Button onClick={handleCreateSlab} className="flex-1 bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow">Active Slab</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
