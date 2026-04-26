'use client';

import { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  BellRing, 
  Users, 
  TrendingUp, 
  Target, 
  Zap, 
  Settings2, 
  Search, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  History as HistoryIcon,
  Map as MapIcon,
  MousePointer2,
  Share2,
  PieChart,
  ArrowUpRight,
  MoreVertical,
  Layers,
  FileText,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function GeoMarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const fetchData = async () => {
    const chainId = localStorage.getItem('last_chain_id');
    try {
      const [campRes, statsRes] = await Promise.all([
        api.get(`/marketing/geo/${chainId}/campaigns`),
        api.get(`/marketing/geo/${chainId}/analytics`)
      ]);
      setCampaigns(campRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data');
      // Placeholder data
      setCampaigns([
        { id: '1', name: 'Lunch Rush Proximity', trigger_message: 'Hungry? You are 200m away from Adruva! Come in for a free dessert.', is_active: true, triggers: 450, conversions: 120 },
        { id: '2', name: 'Weekend Shopper Catch', trigger_message: 'Take a break! Enjoy 15% off on our signature platters today.', is_active: true, triggers: 890, conversions: 210 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Scanning Geographical Perimeters...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Geo Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Target className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Proximity-Based Growth Engine</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Geo <br />
             <span className="text-primary">Fence</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Engage customers exactly when it matters. Use high-fidelity geo-fencing to trigger personalized offers as guests enter your outlet's vicinity, driving immediate footfall and higher conversion.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 flex items-center gap-3">
              <MapPin className="h-5 w-5" /> View Outlets
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
              <Plus className="h-5 w-5" /> New Campaign
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Analytics Grid */}
         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-none bg-card shadow-soft rounded-[3rem] p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <BellRing className="h-24 w-24" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Proximity Triggers</p>
                  <h3 className="text-5xl font-black text-foreground tracking-tighter">12.4K</h3>
                  <div className="flex items-center gap-2 mt-4 text-emerald-500">
                     <ArrowUpRight className="h-4 w-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">+18% vs Last Month</span>
                  </div>
               </Card>

               <Card className="border-none bg-card shadow-soft rounded-[3rem] p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <PieChart className="h-24 w-24" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Avg. Conversion Rate</p>
                  <h3 className="text-5xl font-black text-foreground tracking-tighter">24.2%</h3>
                  <div className="flex items-center gap-2 mt-4 text-primary">
                     <Target className="h-4 w-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Target: 30%</span>
                  </div>
               </Card>
            </div>

            {/* Campaign List */}
            <div className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Active Perimeters</h2>
                  <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-border">
                     {campaigns.length} Active Campaigns
                  </Badge>
               </div>

               <div className="space-y-4">
                  {campaigns.map((camp) => (
                    <Card key={camp.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                       <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-4">
                                   <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                         <Navigation className="h-5 w-5" />
                                      </div>
                                      <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">{camp.name}</h4>
                                   </div>
                                   <div className="bg-secondary/30 p-6 rounded-2xl border border-border border-dashed">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trigger Message</p>
                                      <p className="text-sm font-bold text-slate-600 italic">"{camp.trigger_message}"</p>
                                   </div>
                                </div>

                                <div className="flex gap-6 md:border-l border-border md:pl-8">
                                   <div className="text-center">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Triggers</p>
                                      <p className="text-2xl font-black">{camp.triggers || '0'}</p>
                                   </div>
                                   <div className="text-center">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Visits</p>
                                      <p className="text-2xl font-black text-primary">{camp.conversions || '0'}</p>
                                   </div>
                                   <div className="flex items-center">
                                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-secondary group-hover:text-primary"><Settings2 className="h-4 w-4" /></Button>
                                   </div>
                                </div>
                             </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </div>
         </div>

         {/* Visual Map/Radius Control */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[3.5rem] p-10 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-6 opacity-20">
                  <MapIcon className="h-16 w-16" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">Perimeter Live Map</h3>
               
               <div className="bg-white/5 rounded-[2.5rem] aspect-square relative border border-white/10 mb-8 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.2090,28.6139,12/400x400?access_token=pk.placeholder')] bg-cover" />
                  
                  {/* Mock Geo-Fence visualization */}
                  <div className="relative h-64 w-64">
                     <div className="absolute inset-0 bg-primary/20 rounded-full border-2 border-primary animate-pulse" />
                     <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 border border-primary/20" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <MapPin className="h-4 w-4 text-primary fill-primary" />
                     </div>
                     {/* Mock incoming triggers */}
                     <div className="absolute top-10 right-10 h-3 w-3 bg-white rounded-full animate-ping" />
                     <div className="absolute bottom-12 left-8 h-2 w-2 bg-white rounded-full animate-ping" />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Default Radius</p>
                     <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">2.0 KM</Badge>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full w-2/3 bg-primary" />
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-start gap-4">
                     <Zap className="h-5 w-5 text-primary mt-1 shrink-0" />
                     <p className="text-[10px] font-black text-white/60 leading-relaxed uppercase tracking-widest">
                        Smart Triggers active. Customers entering the perimeter receive a push notification within 30 seconds.
                     </p>
                  </div>
               </div>
            </Card>

            <Card className="border-none bg-card shadow-soft rounded-[3rem] p-8">
               <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 text-foreground">
                  <HistoryIcon className="h-5 w-5 text-primary" /> Recent Triggers
               </h3>
               <div className="space-y-6">
                  {[
                    { customer: 'Rohan Sharma', time: '2m ago', distance: '450m' },
                    { customer: 'Priya Verma', time: '8m ago', distance: '1.2km' },
                    { customer: 'Amit Gupta', time: '15m ago', distance: '200m' }
                  ].map((trigger, i) => (
                    <div key={i} className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                             <MousePointer2 className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="font-black text-xs uppercase text-foreground">{trigger.customer}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{trigger.distance} away</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{trigger.time}</span>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
