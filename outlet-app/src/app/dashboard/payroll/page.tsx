'use client';

import { useState } from 'react';
import { Wallet, Users, Clock, ArrowRight, Download, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { format } from 'date-fns';

import { useStaffList } from '@/hooks/useStaff';

export default function PayrollPage() {
  const { data: staff, isLoading } = useStaffList('payroll');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 bg-background font-sans pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Staff & Payroll</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage staff compensation, tips, and performance.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="border-border text-slate-500 hover:bg-secondary font-black rounded-2xl h-14 px-8 tracking-widest uppercase shadow-soft"
          >
            <Download className="h-5 w-5 mr-3" />
            Download Payslips
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-glow h-14 px-8 tracking-widest uppercase border-none"
          >
            <Plus className="h-5 w-5 mr-3" />
            Process Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden relative">
           <CardContent className="p-8">
              <div className="flex items-center gap-5 mb-6">
                 <div className="p-3 bg-secondary text-primary rounded-2xl">
                    <Wallet className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Monthly Payout</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">
                      ₹{staff?.reduce((acc: number, s: any) => acc + (s.estimated_payout_paise || 0), 0) / 100 || 0}
                    </p>
                 </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-black text-[10px] uppercase px-3 py-1">Est. Total</Badge>
           </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden relative">
           <CardContent className="p-8">
              <div className="flex items-center gap-5 mb-6">
                 <div className="p-3 bg-secondary text-primary rounded-2xl">
                    <Clock className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Hours</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">
                      {staff?.reduce((acc: number, s: any) => acc + (s.total_hours || 0), 0).toFixed(1) || 0}h
                    </p>
                 </div>
              </div>
              <Badge variant="outline" className="border-border text-slate-400 font-black text-[10px] uppercase px-3 py-1">Across all staff</Badge>
           </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden relative">
           <CardContent className="p-8">
              <div className="flex items-center gap-5 mb-6">
                 <div className="p-3 bg-secondary text-primary rounded-2xl">
                    <Users className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Payroll Roster</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">{staff?.length || 0}</p>
                 </div>
              </div>
              <Badge variant="outline" className="border-border text-slate-400 font-black text-[10px] uppercase px-3 py-1">Registered</Badge>
           </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">Payroll Ledger</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Historical staff payments and records.</CardDescription>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search staff..." 
                  className="pl-12 h-12 border-none rounded-2xl bg-secondary font-black text-xs w-64" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!staff || staff.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No staff records found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="px-10 py-6 font-black uppercase text-[10px] tracking-widest">Employee</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest">Grade</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-center">Hours</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-right">Advances</TableHead>
                  <TableHead className="px-10 py-6 text-right font-black uppercase text-[10px] tracking-widest text-primary">Est. Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.filter((s:any) => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((s: any) => (
                  <TableRow key={s.id} className="border-border hover:bg-secondary/50 transition-colors">
                    <TableCell className="px-10 py-6">
                       <div className="flex flex-col">
                          <span className="font-black text-foreground text-lg tracking-tight uppercase">{s.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.role}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-indigo-500/10 text-indigo-500 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-lg">
                          {s.grade_name || 'Standard'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center font-black text-slate-600">{s.total_hours?.toFixed(1) || 0}h</TableCell>
                    <TableCell className="text-right font-bold text-red-400">₹{(s.total_advances / 100).toLocaleString()}</TableCell>
                    <TableCell className="px-10 py-6 text-right">
                       <span className="text-xl font-black text-foreground tracking-tighter">₹{(s.estimated_payout_paise / 100).toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

      </Card>
    </div>
  );
}
