'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Building2, Receipt, TrendingUp, 
  AlertCircle, CheckCircle2, MapPin,
  PieChart, DollarSign, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function FranchiseDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['franchise-overview'],
    queryFn: async () => {
      const { data } = await api.get('/chain/franchise/overview');
      return data.data;
    },
  });

  const generateInvoices = useMutation({
    mutationFn: async () => {
      await api.post('/chain/franchise/invoices/generate');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-overview'] });
      toast({ title: "Invoices Generated", description: "Monthly royalty bills sent to all franchisees." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  const totalRoyaltyDue = overview?.royaltySummary.reduce((acc: number, r: any) => acc + (r.status !== 'paid' ? parseInt(r.total_paise) : 0), 0) || 0;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Building2 className="h-4 w-4" /> Network Operations
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Franchise Management</h1>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-glow"
          onClick={() => generateInvoices.mutate()}
          disabled={generateInvoices.isPending}
        >
          <Receipt className="h-4 w-4 mr-2" /> Generate Monthly Royalty Invoices
        </Button>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <MapPin className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Units</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {overview?.outlets.length || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <DollarSign className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Royalty Due</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {formatCurrency(totalRoyaltyDue, 'INR', 'en-IN')}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-indigo-600 text-white overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Compliance Score</span>
              <span className="text-4xl font-black tracking-tighter">94.2%</span>
           </CardContent>
        </Card>
      </div>

      {/* Outlet Performance List */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Network Performance Feed</h2>
        <div className="space-y-4">
          {overview?.outlets.map((outlet: any) => (
            <Card key={outlet.id} className="border-none shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all bg-card">
              <CardContent className="p-8 flex items-center justify-between gap-8">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                    <Building2 className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-black tracking-tight text-foreground uppercase truncate">{outlet.name}</h4>
                      <Badge variant="outline" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest border-primary text-primary">
                         {outlet.franchise_model}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Royalty Rate: {outlet.royalty_percentage}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-12 shrink-0">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Sales</p>
                      <p className="text-xl font-black text-foreground">{formatCurrency(outlet.current_month_sales_paise, 'INR', 'en-IN')}</p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                         <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="text-left">
                         <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Royalty Earned</p>
                         <p className="text-2xl font-black text-emerald-500">
                            {formatCurrency(Math.round(outlet.current_month_sales_paise * (outlet.royalty_percentage / 100)), 'INR', 'en-IN')}
                         </p>
                      </div>
                   </div>

                   <Button variant="ghost" className="h-12 w-12 rounded-xl p-0 hover:bg-secondary">
                      <AlertCircle className="h-5 w-5 text-slate-300" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
