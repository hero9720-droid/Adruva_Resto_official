'use client';

import { Database, HardDrive, BarChart, Server, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStorageMetrics } from '@/hooks/useSuperAdmin';

export default function StoragePage() {
  const { data: storage, isLoading } = useStorageMetrics();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
           <div className="p-4 bg-blue-500/10 rounded-3xl">
             <Database className="h-10 w-10 text-blue-500" />
           </div>
           Infrastructure Storage
        </h1>
        <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide">Monitoring primary relational database and object storage telemetry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft overflow-hidden group">
          <CardContent className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div className="p-5 rounded-[1.5rem] bg-blue-500/10 shadow-inner group-hover:scale-110 transition-transform">
                 <HardDrive className="h-8 w-8 text-blue-500" />
              </div>
              <Badge className="bg-secondary text-slate-500 border border-border px-4 py-1.5 font-black tracking-widest uppercase text-[10px] rounded-xl">Primary DB</Badge>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Database Size</p>
            <p className="text-6xl font-black tracking-tighter text-foreground">{storage?.database_size || '0 MB'}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border border-border bg-card rounded-[2.5rem] shadow-soft overflow-hidden p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">High-Volume Tables</h3>
              <p className="text-slate-500 font-bold text-sm tracking-wide">Table-level row count telemetry.</p>
            </div>
            <BarChart className="h-8 w-8 text-slate-300" />
          </div>
          
          <div className="space-y-6">
            {storage?.top_tables?.map((table: any) => (
              <div key={table.table_name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="h-3 w-3 text-primary" /> {table.table_name}
                  </span>
                  <span className="font-black text-foreground text-xl tracking-tighter">{Number(table.row_count).toLocaleString()} <span className="text-[10px] text-slate-400 ml-1">ROWS</span></span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner border border-border">
                  <div className="h-full bg-primary rounded-full shadow-glow" style={{ width: `${Math.min(100, (table.row_count / 10000) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft p-10 flex items-center gap-8">
            <div className="h-20 w-20 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
               <Server className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute Environment</p>
               <h4 className="text-3xl font-black tracking-tighter text-foreground uppercase">Railway Cloud</h4>
               <div className="text-emerald-500 text-xs font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Region: US-East-1
               </div>
            </div>
         </Card>
         
         <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft p-10 flex items-center gap-8">
            <div className="h-20 w-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border border-primary/20">
               <Database className="h-10 w-10 text-primary" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Caching Layer</p>
               <h4 className="text-3xl font-black tracking-tighter text-foreground uppercase">Redis Cluster</h4>
               <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">Status: Optimized Connection</p>
            </div>
         </Card>
      </div>
    </div>
  );
}
