'use client';

import { usePlatformPayments, useRevenueTrends } from '@/hooks/useSuperAdmin';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RevenuePage() {
  const { data: payments, isLoading } = usePlatformPayments();
  const { data: trends } = useRevenueTrends();

  const totalPaise = payments?.reduce((acc: number, p: any) => acc + (p.status === 'paid' ? Number(p.amount_paise) : 0), 0) || 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
               <div className="p-4 bg-emerald-500/10 rounded-3xl shadow-inner">
                 <DollarSign className="h-10 w-10 text-emerald-500" />
               </div>
               Platform Revenue HQ
            </h1>
            <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Global economic telemetry and subscription cashflow.</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Monthly Recurring</p>
             <p className="text-6xl font-black tracking-tighter text-foreground">₹{(totalPaise / 100).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Avg. Ticket Size', value: '₹4,999', trend: '+12%', up: true },
             { label: 'Churn Probability', value: '2.4%', trend: '-0.5%', up: false },
             { label: 'Active Subscriptions', value: '42', trend: '+4', up: true },
           ].map(stat => (
             <div key={stat.label} className="p-6 bg-secondary/30 rounded-3xl border border-border flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                  stat.up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                   {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                   {stat.trend}
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payments Feed */}
        <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-border bg-secondary/10 flex flex-row items-center justify-between">
             <div>
                <CardTitle className="text-xl font-black tracking-tighter uppercase">Transaction Stream</CardTitle>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Last 50 payments across the network</p>
             </div>
             <CreditCard className="h-6 w-6 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-secondary/20 h-16">
                  <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Chain / Plan</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment: any) => (
                  <TableRow key={payment.id} className="border-b border-border hover:bg-secondary/50 transition-all h-20">
                    <TableCell className="px-8">
                       <div className="flex flex-col">
                          <span className="font-black tracking-tighter text-foreground uppercase">{payment.chain_name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{payment.plan_name}</span>
                       </div>
                    </TableCell>
                    <TableCell className="font-black text-foreground">₹{(payment.amount_paise / 100).toLocaleString()}</TableCell>
                    <TableCell>
                       <Badge className={cn(
                         "px-3 py-1 font-black tracking-widest uppercase text-[9px] border-none shadow-inner rounded-lg",
                         payment.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                       )}>
                         {payment.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8 text-xs font-bold text-slate-500">
                       {new Date(payment.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
                {(!payments || payments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">
                       No payments detected in the current ledger.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Side Metrics */}
        <div className="space-y-8">
           <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft p-10 overflow-hidden relative group">
              <TrendingUp className="absolute -right-8 -top-8 h-40 w-40 text-primary/5 group-hover:scale-125 transition-transform duration-1000" />
              <h3 className="text-xl font-black tracking-tighter text-foreground uppercase mb-6 flex items-center gap-3 relative z-10">
                 <TrendingUp className="h-5 w-5 text-primary" /> Growth Pulse
              </h3>
              <div className="space-y-8 relative z-10">
                 <div>
                    <div className="flex justify-between items-end mb-3">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Share Target</span>
                       <span className="font-black text-foreground">64%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-primary rounded-full shadow-glow" style={{ width: '64%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-3">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Velocity</span>
                       <span className="font-black text-foreground">82%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-500 rounded-full shadow-glow" style={{ width: '82%' }} />
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="border border-primary/20 bg-primary/[0.03] rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-6">
              <div className="p-5 bg-primary/10 rounded-2xl">
                 <Clock className="h-10 w-10 text-primary" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-foreground tracking-tighter uppercase mb-2">Next Payout Cycle</h4>
                 <p className="text-sm font-bold text-slate-600 mb-4 tracking-tight">The platform fee settlement is scheduled for May 1st.</p>
                 <Badge className="bg-primary text-white border-none px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px]">Processing Stage 1</Badge>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
