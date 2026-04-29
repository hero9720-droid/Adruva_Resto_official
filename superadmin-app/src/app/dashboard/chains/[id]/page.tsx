'use client';

import { useParams, useRouter } from 'next/navigation';
import { useChainDetails, useSuspendChain } from '@/hooks/useSuperAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Globe, 
  Store, 
  CreditCard, 
  Calendar, 
  UserX, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ChainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  
  const { data: details, isLoading } = useChainDetails(id);
  const suspendChain = useSuspendChain();

  const handleSuspend = async () => {
    if (confirm(`Are you sure you want to suspend this chain? All its outlets will be deactivated.`)) {
      try {
        await suspendChain.mutateAsync(id);
        toast({ title: "Chain Suspended", description: "All associated nodes have been deactivated." });
      } catch (error) {
        toast({ variant: "destructive", title: "Action failed" });
      }
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-slate-500 uppercase tracking-widest">Intercepting Node Data...</div>;
  if (!details) return <div className="p-20 text-center text-red-500 font-black">CHAIN_NOT_FOUND</div>;

  const { chain, outlets, subscription } = details;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-8 bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <Button 
          variant="ghost" 
          className="w-fit -ml-4 text-slate-500 hover:text-primary gap-2 font-bold uppercase tracking-widest text-[10px]"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Network
        </Button>
        
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center font-black text-primary text-4xl shadow-inner border border-primary/10">
              {chain.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                 <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">{chain.name}</h1>
                 <Badge className={cn(
                    "px-4 py-1.5 font-black tracking-widest uppercase text-[10px] rounded-xl",
                    chain.status === 'active' || chain.status === 'trial' ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'
                 )}>{chain.status}</Badge>
              </div>
              <p className="text-slate-500 font-bold text-lg tracking-wide">{chain.owner_email} • Platform Node ID: {chain.id}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <Button 
                variant="outline" 
                className="h-14 rounded-2xl border-border px-8 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all"
                onClick={handleSuspend}
             >
                <UserX className="h-5 w-5 mr-3" /> Suspend Chain
             </Button>
             <Button className="h-14 rounded-2xl bg-primary px-8 font-black uppercase tracking-widest text-[11px] shadow-glow border-none">
                <Globe className="h-5 w-5 mr-3" /> Live Control
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Subscription & Plan */}
        <div className="space-y-8">
           <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft overflow-hidden">
              <CardHeader className="p-8 border-b border-border bg-secondary/20">
                 <CardTitle className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" /> Active Plan
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Tier</p>
                    <p className="text-3xl font-black text-foreground uppercase tracking-tighter">{subscription?.plan_name || 'Legacy Plan'}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-xs font-black uppercase text-emerald-500 tracking-widest">{subscription?.status || 'Active'}</span>
                       </div>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Renewal</p>
                       <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-xs font-black uppercase tracking-widest">
                             {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                          </span>
                       </div>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">Upgrade Tier</Button>
              </CardContent>
           </Card>

           <Card className="border border-amber-500/10 bg-amber-500/[0.03] rounded-[2rem] p-8">
              <div className="flex items-start gap-4">
                 <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                 <div>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Safety Notice</p>
                    <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                       Suspension will immediately lock all POS terminals and customer ordering interfaces for this chain.
                    </p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Col: Outlets List */}
        <div className="lg:col-span-2">
           <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft overflow-hidden h-full">
              <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-xl font-black tracking-tighter uppercase">Deployed Outlets</CardTitle>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Total Active Nodes: {outlets.length}</p>
                 </div>
                 <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[9px]">Add New Node</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-border">
                    {outlets.map((outlet: any) => (
                       <div key={outlet.id} className="p-8 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                          <div className="flex items-center gap-6">
                             <div className="h-12 w-12 bg-secondary rounded-xl flex items-center justify-center border border-border">
                                <Store className="h-6 w-6 text-slate-400" />
                             </div>
                             <div>
                                <p className="font-black text-foreground text-lg tracking-tight uppercase">{outlet.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{outlet.id}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <Badge className={cn(
                                   "bg-secondary text-foreground border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest",
                                   outlet.is_active ? 'text-emerald-500' : 'text-destructive'
                                )}>{outlet.is_active ? 'Active' : 'Offline'}</Badge>
                             </div>
                             <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                                <ExternalLink className="h-5 w-5" />
                             </Button>
                          </div>
                       </div>
                    ))}
                    {outlets.length === 0 && (
                       <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm italic">
                          No outlets deployed for this chain.
                       </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
