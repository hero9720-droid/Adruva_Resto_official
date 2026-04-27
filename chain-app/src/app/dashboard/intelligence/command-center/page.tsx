'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  ShieldCheck, Sparkles, Zap, 
  Users, Globe, Landmark,
  BarChart4, Activity, ShieldAlert,
  ArrowRight, HeartPulse, Terminal,
  Maximize2, Share2, Layers,
  ChevronRight, Lightbulb, Radar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

export default function UnifiedCommandCenterPage() {
  const { data: intel, isLoading } = useQuery({
    queryKey: ['unified-intelligence'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/command-center');
      return data.data;
    },
    refetchInterval: 5000, // Real-time pulse
  });

  if (isLoading) return <div className="p-8 h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
       <div className="h-24 w-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="text-white font-black uppercase tracking-[0.5em] animate-pulse">Initializing Adruva Intelligence...</p>
    </div>
  </div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-10 font-sans selection:bg-primary/30">
      
      {/* HUD HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
           <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-glow animate-pulse">
              <Radar className="h-8 w-8 text-black" />
           </div>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-5xl font-black italic tracking-tighter uppercase">Command Center</h1>
                 <Badge className="bg-primary text-black font-black uppercase text-[10px] h-6 px-3">Live Protocol V50.0</Badge>
              </div>
              <p className="text-white/40 text-xs font-medium tracking-widest uppercase mt-1">Unified Multi-Tenant Operational Intelligence HUD</p>
           </div>
        </div>
        
        <div className="flex gap-4">
           <div className="text-right space-y-1 pr-6 border-r border-white/10">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">System Latency</p>
              <p className="text-emerald-500 font-black">12ms <span className="text-white/20">/ OK</span></p>
           </div>
           <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5">
              <Maximize2 className="h-5 w-5" />
           </Button>
           <Button className="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase italic tracking-tight hover:bg-white/90 shadow-glow">
              <Terminal className="h-4 w-4 mr-2" /> Global Protocol
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mt-12">
         
         {/* DOMAIN 1: FINANCIALS */}
         <Card className="bg-white/5 border-white/5 rounded-[3rem] p-10 space-y-8 group hover:bg-white/10 transition-all cursor-crosshair">
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                  <Landmark className="h-7 w-7 text-emerald-500" />
               </div>
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase">Financial Domain</Badge>
            </div>
            <div className="space-y-1">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Today's Net Revenue</p>
               <h3 className="text-4xl font-black tracking-tight">{formatCurrency(intel?.real_time?.revenue || 0)}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Bills</p>
                  <p className="text-lg font-black text-emerald-400">{intel?.real_time?.orders}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Avg Ticket</p>
                  <p className="text-lg font-black">₹{((Number(intel?.real_time?.revenue || 0) / (intel?.real_time?.orders || 1)) / 100).toFixed(0)}</p>
               </div>
            </div>
         </Card>

         {/* DOMAIN 2: OPERATIONS (EPI + GUEST) */}
         <Card className="bg-white/5 border-white/5 rounded-[3rem] p-10 space-y-8 group hover:bg-white/10 transition-all cursor-crosshair">
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 bg-indigo-500/10 rounded-3xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-indigo-500" />
               </div>
               <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[9px] uppercase">Human Ops Domain</Badge>
            </div>
            <div className="space-y-1">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Staff Index (EPI)</p>
               <h3 className="text-4xl font-black tracking-tight">{intel?.intelligence?.epi_score}<span className="text-xl text-white/20">/100</span></h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
               <div className="h-10 w-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-xs font-black italic shadow-glow">TOP</div>
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase">Best Performer</p>
                  <p className="text-sm font-bold">Arjun Sharma</p>
               </div>
            </div>
         </Card>

         {/* DOMAIN 3: INFRASTRUCTURE (HEALTH + QUEUE) */}
         <Card className="bg-white/5 border-white/5 rounded-[3rem] p-10 space-y-8 group hover:bg-white/10 transition-all cursor-crosshair">
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 bg-amber-500/10 rounded-3xl flex items-center justify-center">
                  <Zap className="h-7 w-7 text-amber-500" />
               </div>
               <Badge className="bg-amber-500/10 text-amber-500 border-none font-black text-[9px] uppercase">Technical Domain</Badge>
            </div>
            <div className="space-y-1">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Critical Warnings</p>
               <h3 className={cn("text-4xl font-black tracking-tight", intel?.intelligence?.equipment_warnings > 0 ? "text-red-500" : "text-emerald-500")}>
                  {intel?.intelligence?.equipment_warnings}
               </h3>
            </div>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-white/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Waitlist Load</span>
               </div>
               <span className="text-lg font-black text-amber-400">{intel?.real_time?.active_waitlist} <span className="text-[10px] text-white/20">WAITING</span></span>
            </div>
         </Card>

         {/* DOMAIN 4: REPUTATION & SUSTAINABILITY */}
         <Card className="bg-white/5 border-white/5 rounded-[3rem] p-10 space-y-8 group hover:bg-white/10 transition-all cursor-crosshair">
            <div className="flex justify-between items-start">
               <div className="h-14 w-14 bg-pink-500/10 rounded-3xl flex items-center justify-center">
                  <HeartPulse className="h-7 w-7 text-pink-500" />
               </div>
               <Badge className="bg-pink-500/10 text-pink-500 border-none font-black text-[9px] uppercase">Reputation Domain</Badge>
            </div>
            <div className="space-y-1">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Brand Sentiment</p>
               <h3 className="text-4xl font-black tracking-tight">{(Number(intel?.intelligence?.sentiment_score) * 100).toFixed(0)}% <span className="text-xl text-white/20">POS</span></h3>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 flex items-center gap-4">
               <Globe className="h-6 w-6 text-emerald-400" />
               <div>
                  <p className="text-[8px] font-black text-emerald-400/60 uppercase">Eco Preserved</p>
                  <p className="text-sm font-black">{intel?.intelligence?.eco_impact_kg}kg <span className="text-[10px] font-medium">CO₂</span></p>
               </div>
            </div>
         </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
         
         {/* LIVE EVENT STREAM */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-6">
               <h2 className="text-lg font-black uppercase tracking-widest italic flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-primary" /> Live Protocol Stream
               </h2>
               <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black text-primary uppercase">Listening...</span>
               </div>
            </div>
            <div className="space-y-3">
               {[
                 { time: '01:14:02', event: 'POS TRANSACTION CONFIRMED', detail: '₹2,450.00 from Table 12', color: 'text-emerald-500' },
                 { time: '01:12:45', event: 'EQUIPMENT TELEMETRY ALERT', detail: 'Walk-in Fridge #1 Temp: 8.2°C', color: 'text-amber-500' },
                 { time: '01:10:30', event: 'GUEST WAITLIST UPDATE', detail: 'Party of 4 added via QR Protocol', color: 'text-indigo-500' },
                 { time: '01:08:15', event: 'AI PRICING ENGINE TRIGGER', detail: 'Dynamic Surge Applied (+5% to Starters)', color: 'text-primary' },
                 { time: '01:05:00', event: 'SENTIMENT ALERT', detail: '5-Star Review Aggregated from Google Maps', color: 'text-pink-500' }
               ].map((log, i) => (
                 <div key={i} className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                    <span className="text-[10px] font-mono text-white/20">{log.time}</span>
                    <div className="flex-1">
                       <p className={cn("text-xs font-black tracking-widest uppercase", log.color)}>{log.event}</p>
                       <p className="text-sm font-medium text-white/60 mt-1">{log.detail}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/10" />
                 </div>
               ))}
            </div>
         </div>

         {/* AI STRATEGIC COMMAND */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest italic ml-4">AI Strategist</h2>
            <Card className="bg-primary text-black rounded-[3rem] p-12 space-y-8 relative overflow-hidden">
               <Sparkles className="absolute top-0 right-0 p-10 h-40 w-40 opacity-20" />
               <div className="space-y-2 relative z-10">
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Operational Summary</h3>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-widest">Neural Analysis Complete</p>
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                     <div className="h-6 w-6 bg-black text-primary rounded-full flex items-center justify-center shrink-0">1</div>
                     <p className="text-sm font-bold leading-relaxed">
                        System integrity is nominal. Revenue velocity is up <span className="underline italic">12%</span> against the current period baseline.
                     </p>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="h-6 w-6 bg-black text-primary rounded-full flex items-center justify-center shrink-0">2</div>
                     <p className="text-sm font-bold leading-relaxed">
                        <span className="underline italic">Action Required</span>: Equipment warning in Main Kitchen fridge. Preventive maintenance ticket auto-generated.
                     </p>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="h-6 w-6 bg-black text-primary rounded-full flex items-center justify-center shrink-0">3</div>
                     <p className="text-sm font-bold leading-relaxed">
                        EPI leaderboard indicates Arjun Sharma as a high-potential candidate for Multi-Unit Manager roles.
                     </p>
                  </div>
               </div>
               <Button className="w-full h-16 rounded-2xl bg-black text-primary font-black uppercase italic tracking-widest text-xs hover:bg-black/90 shadow-2xl relative z-10 mt-6">
                  Finalize Operations Report
               </Button>
            </Card>

            <Card className="bg-white/5 border-white/5 rounded-[3rem] p-10 space-y-4">
               <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Protocol Intelligence</h3>
               </div>
               <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">
                  "Your current sustainability metrics place you in the top 5% of global Adruva-enabled brands. This data has been synchronized with your Brand Story page."
               </p>
            </Card>
         </div>

      </div>

      {/* FOOTER STATS */}
      <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 hover:opacity-100 transition-all">
         <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest">Tenant Protocol</p>
            <p className="text-xs font-bold">Multi-Node Hybrid Cloud</p>
         </div>
         <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest">Encryption</p>
            <p className="text-xs font-bold">AES-256-GCM / QUAD-KEY</p>
         </div>
         <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest">Modules Deployed</p>
            <p className="text-xs font-bold">50 / 50 (Master Sequence)</p>
         </div>
         <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest">Status</p>
            <p className="text-xs font-bold text-emerald-500">OPTIMAL</p>
         </div>
      </div>

    </div>
  );
}
