'use client';

import { useState } from 'react';
import { useGlobalAuditLogs } from '@/hooks/useSuperAdmin';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, User, HardDrive, Search, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MonitorPage() {
  const { data: logs } = useGlobalAuditLogs();
  const [filter, setFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = logs?.filter((l: any) => 
    l.event_type.toLowerCase().includes(filter.toLowerCase()) ||
    l.details.toLowerCase().includes(filter.toLowerCase()) ||
    l.actor_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
               <Activity className="h-10 w-10 text-primary" />
             </div>
             Global Activity Monitor
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide leading-relaxed">Live stream of all system operations and administrative actions.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="relative w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                 placeholder="Filter operations..." 
                 className="h-16 pl-14 rounded-2xl bg-secondary/50 border-none font-bold"
                 value={filter}
                 onChange={(e) => setFilter(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-4 px-8 py-5 bg-primary/5 border border-primary/10 rounded-3xl">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-black uppercase tracking-widest text-primary">Real-time Feed</span>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredLogs?.map((log: any) => (
          <Card key={log.id} className="border border-border bg-card shadow-soft rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all">
            <CardContent className="p-8 flex items-center justify-between">
               <div className="flex items-center gap-8">
                  <div className="h-16 w-16 bg-secondary/50 rounded-2xl flex items-center justify-center border border-border shadow-inner">
                     <HardDrive className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-black uppercase tracking-widest text-[9px] rounded-lg">{log.event_type}</Badge>
                        <span className="text-xs font-bold text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                     </div>
                     <p className="text-xl font-black tracking-tighter text-foreground leading-tight">{log.details}</p>
                     <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                           <User className="h-3.5 w-3.5 text-slate-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{log.actor_name}</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{log.outlet_name || 'System Level'}</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payload Source</p>
                     <code className="text-xs font-bold bg-secondary px-4 py-2 rounded-xl border border-border text-slate-600">{log.ip_address || 'INTERNAL'}</code>
                  </div>
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     className="rounded-xl h-12 w-12"
                     onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                     {expandedLog === log.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
               </div>
            </CardContent>
            
            {expandedLog === log.id && (
               <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-secondary/50 rounded-2xl p-6 border border-border overflow-x-auto">
                     <div className="flex items-center gap-2 mb-4">
                        <Code className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Manifest (JSON)</span>
                     </div>
                     <pre className="text-[11px] font-mono text-slate-600 leading-relaxed">
                        {JSON.stringify(log, null, 2)}
                     </pre>
                  </div>
               </div>
            )}
          </Card>
        ))}
        {(!logs || logs.length === 0) && (
          <div className="p-40 text-center">
             <Activity className="h-20 w-20 text-slate-200 mx-auto mb-8 animate-pulse" />
             <p className="text-slate-400 font-black uppercase tracking-widest">No activity detected in the last cycle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
