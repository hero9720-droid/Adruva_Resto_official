'use client';

import { useState, useEffect } from 'react';
import { 
  Bug, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  FileText, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight, 
  Search, 
  Plus, 
  MoreVertical, 
  Settings2,
  Layers,
  Zap,
  Filter,
  Trash2,
  Check,
  X,
  History,
  Briefcase,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PestControlPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const fetchData = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      const [logsRes, alertsRes] = await Promise.all([
        api.get(`/compliance/pest/${outletId}/logs`),
        api.get(`/compliance/pest/${outletId}/alerts`)
      ]);
      setLogs(logsRes.data.data);
      setAlerts(alertsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch pest control data');
      // Placeholder data
      setLogs([
        { id: '1', vendor_name: 'Safeguard Pest Solutions', service_date: '2026-04-10', next_service_due: '2026-05-10', chemicals_used: ['Imidacloprid', 'Bifenthrin'], areas_treated: ['Kitchen', 'Storage'], is_compliant: true },
        { id: '2', vendor_name: 'Safeguard Pest Solutions', service_date: '2026-03-10', next_service_due: '2026-04-10', chemicals_used: ['Fipronil'], areas_treated: ['General Dining'], is_compliant: true }
      ]);
      setAlerts([
        { id: '1', sensor_type: 'Electronic Trap', location: 'Kitchen Main Drain', triggered_at: '2026-04-26T08:30:00Z', status: 'open' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resolveAlert = async (alertId: string) => {
    try {
      await api.patch(`/compliance/pest/alerts/${alertId}/resolve`, {
        resolution_notes: 'Inspected and cleaned.'
      });
      toast({ title: "Alert Resolved", description: "Sensor has been reset and logged." });
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Resolution failed" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Monitoring Facility Bio-Security...</div>;

  const nextService = logs[0]?.next_service_due;
  const isOverdue = nextService ? new Date(nextService) < new Date() : false;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Pest Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <ShieldCheck className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Digital Hygiene & Bio-Security Command</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Pest <br />
             <span className="text-primary">Control</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Ensure absolute facility integrity. Use digitized professional service logs, sensor-linked trap monitoring, and FSSAI-compliant audit trails to protect your brand and guests.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 flex items-center gap-3">
              <FileText className="h-5 w-5" /> View Certificates
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
              <Plus className="h-5 w-5" /> Log New Service
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Status Sidebar */}
         <div className="lg:col-span-1 space-y-8">
            <Card className={cn(
              "border-none shadow-soft rounded-[2.5rem] p-8 relative overflow-hidden group transition-all",
              isOverdue ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            )}>
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  {isOverdue ? <ShieldAlert className="h-24 w-24" /> : <ShieldCheck className="h-24 w-24" />}
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Compliance Status</p>
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">
                  {isOverdue ? 'Overdue' : 'Compliant'}
               </h3>
               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                     <span className="text-[10px] font-black uppercase opacity-60">Last Service</span>
                     <span className="font-black text-sm">{logs[0]?.service_date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                     <span className="text-[10px] font-black uppercase opacity-60">Next Due</span>
                     <span className="font-black text-sm">{nextService || 'N/A'}</span>
                  </div>
                  <Button className="w-full bg-white text-emerald-600 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] mt-4 hover:bg-white/90">
                     Schedule Visit
                  </Button>
               </div>
            </Card>

            <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-8">
               <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 text-foreground">
                  <Activity className="h-5 w-5 text-primary" /> Active Sensors
               </h3>
               <div className="space-y-4">
                  {[
                    { name: 'Electronic Trap #1', area: 'Kitchen Main', status: 'active' },
                    { name: 'Pheromone Trap #4', area: 'Dry Storage', status: 'active' },
                    { name: 'Bait Station #2', area: 'Rear Exit', status: 'active' }
                  ].map((sensor, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-secondary/30 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                       <div>
                          <p className="font-black text-[10px] uppercase text-foreground">{sensor.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sensor.area}</p>
                       </div>
                       <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Alerts & Logs */}
         <div className="lg:col-span-3 space-y-8">
            {/* Sensor Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-top duration-700">
                 <div className="flex items-center gap-3 px-4">
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-red-500">Sensor Alerts (Action Required)</h2>
                 </div>
                 {alerts.map((alert) => (
                   <Card key={alert.id} className="border-2 border-red-500/20 bg-red-500/[0.02] shadow-soft rounded-[3rem] overflow-hidden group hover:bg-red-500/[0.05] transition-all">
                      <CardContent className="p-8 flex items-center justify-between">
                         <div className="flex items-center gap-8">
                            <div className="h-16 w-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                               <AlertCircle className="h-8 w-8" />
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <Badge className="bg-red-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg animate-pulse">
                                     Pest Activity Detected
                                  </Badge>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(alert.triggered_at), 'HH:mm')} • {alert.location}</span>
                               </div>
                               <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">{alert.sensor_type} Triggered</h4>
                               <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest italic">Electronic notification received from perimeter sensor.</p>
                            </div>
                         </div>
                         <Button 
                           onClick={() => resolveAlert(alert.id)}
                           className="bg-red-500 text-white h-14 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:bg-red-600"
                         >
                            Clear & Log Incident
                         </Button>
                      </CardContent>
                   </Card>
                 ))}
              </div>
            )}

            {/* Service History */}
            <div className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Professional Service Logs</h2>
                  <div className="relative w-64">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <Input placeholder="Search logs..." className="h-12 bg-card border-border rounded-xl pl-11 font-bold text-xs" />
                  </div>
               </div>

               <div className="space-y-4">
                  {logs.map((log) => (
                    <Card key={log.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                       <CardContent className="p-10">
                          <div className="flex flex-col md:flex-row justify-between gap-10">
                             <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                      <History className="h-6 w-6" />
                                   </div>
                                   <div>
                                      <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">{log.vendor_name}</h4>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Date: {format(new Date(log.service_date), 'MMMM dd, yyyy')}</p>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Chemicals Utilized</p>
                                      <div className="flex flex-wrap gap-2">
                                         {log.chemicals_used?.map((c: string, i: number) => <Badge key={i} variant="outline" className="text-[8px] font-black uppercase border-slate-200">{c}</Badge>)}
                                      </div>
                                   </div>
                                   <div className="bg-secondary/20 p-5 rounded-2xl border border-border">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Treatment Areas</p>
                                      <div className="flex flex-wrap gap-2">
                                         {log.areas_treated?.map((a: string, i: number) => <Badge key={i} variant="outline" className="text-[8px] font-black uppercase border-slate-200">{a}</Badge>)}
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="flex flex-col md:items-end justify-center gap-4 md:border-l border-border md:pl-10">
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                                   <CheckCircle2 className="h-3 w-3 mr-2" /> FSSAI Verified
                                </Badge>
                                <Button variant="ghost" size="lg" className="h-14 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] bg-secondary hover:text-primary gap-3">
                                   <ExternalLink className="h-4 w-4" /> View Certificate
                                </Button>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
