'use client';

import { useState } from 'react';
import { 
  ShieldCheck, FileText, AlertTriangle, CheckCircle2, 
  Download, Plus, TrendingUp, ClipboardList, Loader2, XCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useComplianceHistory, useComplianceStats, useSubmitAudit } from '@/hooks/useCompliance';
import { useToast } from '@/hooks/use-toast';

const AUDIT_TYPES = [
  'Daily Hygiene Check',
  'Kitchen Deep Clean',
  'FSSAI Self-Inspection',
  'Pest Control Visit',
  'Fire Safety Check',
  'Food Handler Health Check',
  'Equipment Maintenance Log',
  'Cold Chain Verification',
];

export default function CompliancePage() {
  const { data: logs, isLoading } = useComplianceHistory();
  const { data: stats } = useComplianceStats();
  const submitAudit = useSubmitAudit();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    audit_type: '',
    score: 100,
    notes: '',
    status: 'COMPLIANT',
  });

  const pendingCount = logs?.filter((l: any) => l.score < 70).length || 0;
  const avgScore = stats?.average_score ? Math.round(parseFloat(stats.average_score)) : null;
  const totalAudits = stats?.total_audits || 0;

  const handleSubmit = async () => {
    if (!form.audit_type) {
      toast({ variant: 'destructive', title: 'Select audit type' });
      return;
    }
    try {
      await submitAudit.mutateAsync({
        standard_id: null,
        results: { type: form.audit_type, notes: form.notes },
        score: form.score,
        corrective_actions: [],
      });
      toast({ title: 'Audit Logged', description: `${form.audit_type} recorded successfully.` });
      setModalOpen(false);
      setForm({ audit_type: '', score: 100, notes: '', status: 'COMPLIANT' });
    } catch {
      toast({ variant: 'destructive', title: 'Submission failed' });
    }
  };

  const handleExport = () => {
    if (!logs || logs.length === 0) return;
    const headers = ['Date', 'Audit Type', 'Score', 'Auditor'];
    const rows = logs.map((l: any) => [
      new Date(l.created_at).toLocaleDateString(),
      l.standard_title || 'General Audit',
      l.score,
      l.auditor_name || 'System',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map((r: any) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Adruva_Compliance_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    toast({ title: 'Export Complete', description: 'Compliance bundle downloaded as CSV.' });
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 bg-background font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Compliance & Safety</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">FSSAI regulations, hygiene audits, and safety logs.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="border-border text-slate-500 hover:bg-secondary font-black rounded-2xl h-14 px-8 tracking-widest uppercase shadow-soft"
            onClick={handleExport}
          >
            <Download className="h-5 w-5 mr-3" />
            Export Bundle
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-glow h-14 px-8 tracking-widest uppercase border-none"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-3" />
            New Audit Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">FSSAI License</p>
                <p className="text-2xl font-black text-foreground tracking-tighter uppercase">Active & Valid</p>
              </div>
            </div>
            <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase px-4 py-1.5 rounded-xl border-none">Verified</Badge>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={cn("p-4 rounded-3xl", pendingCount > 0 ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500")}>
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Critical Failures (30d)</p>
                <p className="text-2xl font-black text-foreground tracking-tighter">{stats?.critical_failures || 0}</p>
              </div>
            </div>
            <Badge className={cn("font-black text-[10px] uppercase px-4 py-1.5 rounded-xl border-none", pendingCount > 0 ? "bg-red-500/10 text-red-500" : "bg-secondary text-slate-500")}>
              {pendingCount > 0 ? 'Needs Action' : 'On Schedule'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 text-primary rounded-3xl">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Avg. Score (30d)</p>
                <p className="text-2xl font-black text-foreground tracking-tighter">
                  {avgScore !== null ? `${avgScore}/100` : 'No Data'}
                </p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary font-black text-[10px] uppercase px-4 py-1.5 rounded-xl border-none">
              {totalAudits} Audits
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table + Required Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 border-b border-border">
            <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">Operational Logs</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Hygiene checks, pest control, and equipment maintenance.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 border-border">
                  <TableHead className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Type</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Auditor</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Score</TableHead>
                  <TableHead className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && logs?.map((log: any) => (
                  <TableRow key={log.id} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        {log.score >= 70 
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 
                          : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        }
                        <span className="font-black text-foreground uppercase text-xs">{log.standard_title || 'General Audit'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-slate-500 text-xs">{log.auditor_name || 'System'}</TableCell>
                    <TableCell className="py-6">
                      <Badge className={cn(
                        "border-none font-black text-[9px] uppercase tracking-tighter",
                        log.score >= 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      )}>
                        {log.score}/100
                      </Badge>
                    </TableCell>
                    <TableCell className="px-10 py-6 text-right font-black text-slate-400 text-xs uppercase">
                      {new Date(log.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && (!logs || logs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No audit logs found.</p>
                      <p className="text-slate-400 text-xs mt-1">Click "New Audit Entry" to log your first audit.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Required Documents Panel */}
        <Card className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase">Required Docs</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { name: 'FSSAI License', status: 'valid', expiry: 'Dec 2026' },
              { name: 'GST Registration', status: 'valid', expiry: 'N/A' },
              { name: 'Health License', status: 'valid', expiry: 'Mar 2027' },
              { name: 'Fire Safety NOC', status: 'review', expiry: 'Jun 2026' },
            ].map((doc) => (
              <div key={doc.name} className="p-4 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between group hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className={cn("h-4 w-4", doc.status === 'valid' ? 'text-emerald-500' : 'text-orange-500')} />
                  <div>
                    <span className="text-sm font-bold text-foreground">{doc.name}</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expires: {doc.expiry}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "border-none font-black text-[8px] uppercase tracking-tight",
                  doc.status === 'valid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                )}>
                  {doc.status === 'valid' ? 'Valid' : 'Review'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* New Audit Entry Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg rounded-[2.5rem] border-none p-10 bg-card shadow-soft font-sans">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Log Audit Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Audit Type</label>
              <Select value={form.audit_type} onValueChange={(v) => setForm({ ...form, audit_type: v })}>
                <SelectTrigger className="h-14 rounded-2xl bg-secondary border-none px-5 font-bold text-foreground">
                  <SelectValue placeholder="Select audit type..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-card">
                  {AUDIT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="font-bold py-3 rounded-xl focus:bg-secondary">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Score (0–100)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                className="h-14 rounded-2xl bg-secondary border-none px-5 font-black text-foreground"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Observations</label>
              <Input
                placeholder="e.g. All surfaces clean, no pests observed..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="h-14 rounded-2xl bg-secondary border-none px-5 font-bold text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <div className="flex gap-4 w-full">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg tracking-widest uppercase border-none"
                onClick={handleSubmit}
                disabled={!form.audit_type || submitAudit.isPending}
              >
                {submitAudit.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Logging...</> : 'Submit Audit'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
