'use client';

import { useState } from 'react';
import { 
  Calculator, Wallet, FileCheck, Download, 
  ArrowUpRight, ArrowDownLeft, Info, Search, Loader2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { useTaxSummary, useHSNReport, useUpdateHSN } from '@/hooks/useCompliance';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function TaxationSection() {
  const [dates, setDates] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const { data: summary, isLoading: loadingSummary } = useTaxSummary(dates.start, dates.end);
  const { data: hsnReport, isLoading: loadingHSN } = useHSNReport();
  const updateHSN = useUpdateHSN();
  const { toast } = useToast();

  const [hsnSearch, setHsnSearch] = useState('');
  const [editingHSN, setEditingHSN] = useState<{ [key: string]: string }>({});

  const handleUpdateHSN = async () => {
    const mappings = Object.entries(editingHSN).map(([id, code]) => ({ item_id: id, hsn_code: code }));
    if (mappings.length === 0) return;
    try {
      await updateHSN.mutateAsync(mappings);
      toast({ title: 'HSN Updated', description: `${mappings.length} items updated.` });
      setEditingHSN({});
    } catch {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const filteredHSN = hsnReport?.filter((h: any) => 
    h.item_name.toLowerCase().includes(hsnSearch.toLowerCase()) || 
    (h.hsn_code && h.hsn_code.includes(hsnSearch))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Date Filter & Summary */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-80 border-border shadow-soft bg-card rounded-[2rem]">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-black uppercase tracking-tighter">Report Period</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
              <Input type="date" value={dates.start} onChange={(e) => setDates({...dates, start: e.target.value})} className="h-12 rounded-xl bg-secondary border-none px-4 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
              <Input type="date" value={dates.end} onChange={(e) => setDates({...dates, end: e.target.value})} className="h-12 rounded-xl bg-secondary border-none px-4 font-bold" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 w-full">
          {/* GST Collected */}
          <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden border-l-4 border-l-emerald-500">
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 font-black text-[9px] uppercase border-none">Output Tax</Badge>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total GST Collected</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">
                  ₹{(summary?.tax_collected / 100).toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ITC Tracking */}
          <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <ArrowDownLeft className="h-6 w-6" />
                </div>
                <Badge className="bg-primary/10 text-primary font-black text-[9px] uppercase border-none">Input Tax (ITC)</Badge>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Available Credit</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">
                  ₹{(summary?.input_tax_credit / 100).toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Net Payable */}
          <Card className="border-border shadow-glow bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 text-white rounded-2xl">
                  <Calculator className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white font-black text-[9px] uppercase border-none">Net Liability</Badge>
              </div>
              <div>
                <p className="text-[11px] font-black text-white/60 uppercase tracking-widest">Tax Payable to Govt</p>
                <p className="text-3xl font-black tracking-tighter">
                  ₹{Math.max(0, (summary?.tax_collected - summary?.input_tax_credit) / 100).toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HSN/SAC Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 border-b border-border flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">HSN/SAC Mapping</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Verify and update HSN codes for menu items for accurate GSTR-1.</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search items..." 
                  value={hsnSearch}
                  onChange={(e) => setHsnSearch(e.target.value)}
                  className="h-12 pl-12 rounded-xl bg-secondary border-none font-bold" 
                />
              </div>
              {Object.keys(editingHSN).length > 0 && (
                <Button className="bg-emerald-500 hover:bg-emerald-600 font-black rounded-xl h-12 px-6 uppercase tracking-widest" onClick={handleUpdateHSN} disabled={updateHSN.isPending}>
                  {updateHSN.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 border-border">
                  <TableHead className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Item Name</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Current HSN</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Units Sold</TableHead>
                  <TableHead className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Taxable Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHSN && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                )}
                {!loadingHSN && filteredHSN?.map((item: any) => (
                  <TableRow key={item.item_id} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell className="px-10 py-6">
                      <span className="font-black text-foreground uppercase text-xs">{item.item_name}</span>
                    </TableCell>
                    <TableCell className="py-6">
                      <Input 
                        value={editingHSN[item.item_id] ?? item.hsn_code ?? ''}
                        onChange={(e) => setEditingHSN({...editingHSN, [item.item_id]: e.target.value})}
                        className="h-10 w-32 bg-transparent border-b border-dashed border-slate-300 focus:border-primary rounded-none px-1 text-xs font-black uppercase"
                        placeholder="N/A"
                      />
                    </TableCell>
                    <TableCell className="py-6 font-bold text-slate-500 text-xs">{item.total_qty}</TableCell>
                    <TableCell className="px-10 py-6 text-right font-black text-foreground text-xs uppercase">
                      ₹{(item.total_value / 100).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* GST Filing Summary */}
        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase">GSTR-1 Quick View</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">B2C Small (Total)</span>
                <span className="text-sm font-black text-foreground">₹{(summary?.tax_collected / 100).toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <div className="p-4 bg-secondary/50 rounded-2xl border border-border flex items-center gap-4">
                <Info className="h-5 w-5 text-primary" />
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                  Your tax slabs are currently set to <span className="text-foreground">GST 5%</span> (Restaurant Services).
                  Ensure Service Charge is excluded from tax calculation if applicable.
                </p>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl border-border text-slate-500 font-black uppercase tracking-widest hover:bg-secondary">
                <FileCheck className="h-5 w-5 mr-3" />
                Download GSTR-1 CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
