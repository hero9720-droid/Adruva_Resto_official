'use client';

import { 
  useChains, 
  useSuspendChain 
} from '@/hooks/useSuperAdmin';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserX, ChevronRight, Globe, Plus } from 'lucide-react';
import { useState } from 'react';
import OnboardChainModal from '@/components/dashboard/OnboardChainModal';

export default function ChainsPage() {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const { data: chains } = useChains();
  const suspendChain = useSuspendChain();
  const { toast } = useToast();

  const handleSuspend = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to suspend ${name}? All outlets will be deactivated.`)) {
      try {
        await suspendChain.mutateAsync(id);
        toast({ title: "Chain Suspended", description: `${name} has been successfully deactivated.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Action failed" });
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <Globe className="h-10 w-10 text-primary" />
             </div>
             Multi-Tenancy Control
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Manage your restaurant chains and enterprise nodes.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[11px] transition-all shadow-glow border-none"
          onClick={() => setIsOnboardModalOpen(true)}
        >
          <Plus className="h-5 w-5 mr-3" /> Provision New Chain
        </Button>
      </div>

      <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px]">
        <CardContent className="p-0 flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-secondary/30 hover:bg-secondary/30 h-20">
                <TableHead className="px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Chain Identity</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Footprint</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Onboarded</TableHead>
                <TableHead className="text-right px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chains?.map((chain: any) => (
                <TableRow 
                  key={chain.id} 
                  className="border-b border-border hover:bg-secondary/50 transition-all cursor-pointer group h-28"
                  onClick={() => router.push(`/dashboard/chains/${chain.id}`)}
                >
                  <TableCell className="px-10">
                     <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-[1.25rem] flex items-center justify-center font-black text-primary text-xl shadow-inner border border-primary/10 group-hover:rotate-6">
                           {chain.name[0]}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-black tracking-tighter text-foreground text-lg group-hover:text-primary transition-colors">{chain.name}</span>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{chain.owner_email}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-500 text-sm uppercase tracking-wider">{chain.outlet_count} active nodes</TableCell>
                  <TableCell>
                     <Badge className={cn(
                       "px-4 py-2 font-black tracking-widest uppercase text-[10px] border border-border shadow-inner rounded-xl",
                       chain.status === 'active' || chain.status === 'trial' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                     )}>
                       {chain.status?.toUpperCase() || 'EXPIRED'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-black text-slate-500 tracking-tighter">
                     {new Date(chain.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right px-10">
                     <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-2xl h-12 w-12 border border-transparent hover:border-destructive/20"
                          onClick={(e) => { e.stopPropagation(); handleSuspend(chain.id, chain.name); }}
                        >
                          <UserX className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-secondary rounded-2xl h-12 w-12 border border-transparent hover:border-border">
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OnboardChainModal 
        open={isOnboardModalOpen} 
        onOpenChange={setIsOnboardModalOpen} 
      />
    </div>
  );
}
