'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCcw, 
  ChevronRight, 
  Store, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Globe,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MenuSyncPage() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [sourceOutlet, setSourceOutlet] = useState<string>('');
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const { data } = await api.get('/chain/outlets');
        setOutlets(data.data);
        if (data.data.length > 0) setSourceOutlet(data.data[0].id);
      } catch (err) {
        console.error('Failed to fetch outlets');
      }
    };
    fetchOutlets();
  }, []);

  const handleSync = async () => {
    if (selectedOutlets.length === 0) {
      toast({ variant: "destructive", title: "No targets selected", description: "Select at least one outlet to sync to." });
      return;
    }

    setIsSyncing(true);
    try {
      await api.post('/menu/sync', {
        source_outlet_id: sourceOutlet,
        target_outlet_ids: selectedOutlets
      });
      toast({ 
        title: "Sync Successful", 
        description: `Menu catalog pushed to ${selectedOutlets.length} outlets.` 
      });
      setSelectedOutlets([]);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync failed", description: "One or more outlets failed to update." });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleOutlet = (id: string) => {
    if (selectedOutlets.includes(id)) {
      setSelectedOutlets(selectedOutlets.filter(i => i !== id));
    } else {
      setSelectedOutlets([...selectedOutlets, id]);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-12 rounded-[3rem] shadow-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -translate-y-32 translate-x-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Master Orchestration</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
             Menu <span className="text-primary">Sync</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-6 ml-1 tracking-wide max-w-xl leading-relaxed">
            Push your master catalog to all sub-outlets instantly. Manage pricing, categories, and availability from a single source.
          </p>
        </div>
        <div className="h-48 w-48 bg-primary/10 rounded-[3rem] flex items-center justify-center rotate-6 shadow-inner relative z-10">
           <RefreshCcw className={cn("h-24 w-24 text-primary", isSyncing && "animate-spin")} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Source Selection */}
         <Card className="lg:col-span-1 border border-border bg-card shadow-soft rounded-[2.5rem]">
            <CardHeader className="p-10 border-b border-border bg-secondary/20">
               <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-primary text-white rounded-2xl shadow-glow">
                     <Globe className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Source Hub</CardTitle>
               </div>
               <CardDescription className="text-slate-500 font-bold">Select the "Master" outlet to copy the menu from.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
               {outlets.map((outlet) => (
                 <div 
                   key={outlet.id}
                   onClick={() => setSourceOutlet(outlet.id)}
                   className={cn(
                     "p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group",
                     sourceOutlet === outlet.id 
                       ? "border-primary bg-primary/5 shadow-inner" 
                       : "border-border bg-transparent hover:bg-secondary/50"
                   )}
                 >
                    <div className="flex items-center gap-5">
                       <div className={cn(
                         "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                         sourceOutlet === outlet.id ? "bg-primary text-white" : "bg-secondary text-slate-400 group-hover:text-primary"
                       )}>
                          <Store className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="font-black text-foreground">{outlet.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{outlet.city}</p>
                       </div>
                    </div>
                    {sourceOutlet === outlet.id && <CheckCircle2 className="h-6 w-6 text-primary" />}
                 </div>
               ))}
            </CardContent>
         </Card>

         {/* Target Selection */}
         <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col">
            <CardHeader className="p-10 border-b border-border bg-secondary/20 flex flex-row items-center justify-between">
               <div>
                  <div className="flex items-center gap-4 mb-2">
                     <div className="p-3 bg-[#1b1b24] text-white rounded-2xl shadow-glow">
                        <Zap className="h-6 w-6" />
                     </div>
                     <CardTitle className="text-2xl font-black uppercase tracking-tight">Target Outlets</CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 font-bold">Choose outlets that should receive the update.</CardDescription>
               </div>
               <Button 
                 variant="ghost" 
                 className="font-black uppercase tracking-widest text-[10px] text-primary"
                 onClick={() => setSelectedOutlets(outlets.filter(o => o.id !== sourceOutlet).map(o => o.id))}
               >
                  Select All
               </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto no-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                  {outlets.filter(o => o.id !== sourceOutlet).map((outlet) => (
                    <div 
                      key={outlet.id} 
                      className={cn(
                        "p-10 bg-card hover:bg-secondary/30 transition-all cursor-pointer flex items-center gap-8 group",
                        selectedOutlets.includes(outlet.id) && "bg-secondary/50"
                      )}
                      onClick={() => toggleOutlet(outlet.id)}
                    >
                       <Checkbox 
                         checked={selectedOutlets.includes(outlet.id)}
                         className="h-7 w-7 rounded-lg border-2"
                       />
                       <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Store className="h-7 w-7 text-slate-400 group-hover:text-primary" />
                          </div>
                          <div>
                             <p className="font-black text-xl text-foreground tracking-tight">{outlet.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="px-2 py-0 text-[8px] font-black uppercase tracking-tighter rounded-md">{outlet.city}</Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Outlet</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
            <div className="p-10 bg-secondary/10 border-t border-border flex justify-between items-center">
               <div className="flex items-center gap-4 text-slate-500 font-bold">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">This will overwrite existing item prices/descriptions at targets.</span>
               </div>
               <Button 
                 onClick={handleSync}
                 disabled={isSyncing || selectedOutlets.length === 0}
                 className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-12 h-16 font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-glow flex items-center gap-4"
               >
                  {isSyncing ? 'Syncing Catalog...' : 'Initialize Push'}
                  {!isSyncing && <ChevronRight className="h-5 w-5" />}
               </Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
