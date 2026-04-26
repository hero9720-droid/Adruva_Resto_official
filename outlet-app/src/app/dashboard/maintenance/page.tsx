'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Zap, 
  Coffee, 
  HardDrive,
  Trash2,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function MaintenancePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showReportIncident, setShowReportIncident] = useState(false);
  const [showResolve, setShowResolve] = useState<any>(null);
  
  const [newAsset, setNewAsset] = useState({ name: '', category: 'kitchen', serial_number: '' });
  const [newIncident, setNewIncident] = useState({ asset_id: '', title: '', description: '', priority: 'medium' });
  const [resolveData, setResolveData] = useState({ cost_paise: 0 });
  
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [aRes, iRes] = await Promise.all([
        api.get('/maintenance/assets'),
        api.get('/maintenance/incidents')
      ]);
      setAssets(aRes.data.data);
      setIncidents(iRes.data.data);
    } catch (err) {
      console.error('Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAsset = async () => {
    try {
      await api.post('/maintenance/assets', newAsset);
      toast({ title: "Asset Registered", description: `${newAsset.name} added to inventory.` });
      setShowAddAsset(false);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to add asset" });
    }
  };

  const handleReportIncident = async () => {
    try {
      await api.post('/maintenance/incidents', newIncident);
      toast({ title: "Incident Logged", description: "Maintenance team notified." });
      setShowReportIncident(false);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to log incident" });
    }
  };

  const handleResolve = async () => {
    try {
      await api.post(`/maintenance/incidents/${showResolve.id}/resolve`, resolveData);
      toast({ title: "Incident Resolved", description: "Asset status restored." });
      setShowResolve(null);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to resolve" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Running Diagnostics...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Wrench className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Operations Integrity</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Maintenance <br />
             <span className="text-primary">Command</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Ensure 100% uptime for your equipment. Track critical assets, report failures instantly, and monitor maintenance costs.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowAddAsset(true)}
             variant="outline"
             className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[10px] hover:bg-white/10"
           >
              Register Asset
           </Button>
           <Button 
             onClick={() => setShowReportIncident(true)}
             className="bg-primary text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[10px] shadow-glow flex items-center gap-2"
           >
              <AlertTriangle className="h-5 w-5" /> Report Issue
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Incident Queue */}
         <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Active Issues</h2>
               <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">{incidents.filter(i => i.status !== 'resolved').length} OPEN</Badge>
            </div>
            
            <div className="space-y-6">
               {incidents.filter(i => i.status !== 'resolved').map((incident) => (
                 <Card key={incident.id} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all">
                    <CardContent className="p-0 flex items-stretch">
                       <div className={cn(
                         "w-3 transition-all group-hover:w-5",
                         incident.priority === 'critical' ? 'bg-red-500' : incident.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                       )} />
                       <div className="p-10 flex-1 flex justify-between items-center">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <Badge className={cn(
                                  "border-none font-black uppercase tracking-widest text-[8px] px-2.5 py-1 rounded-lg",
                                  incident.priority === 'critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                )}>
                                   {incident.priority} Priority
                                </Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(incident.created_at), 'MMM d, h:mm a')}</span>
                             </div>
                             <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">{incident.title}</h3>
                                <p className="text-slate-500 font-bold text-sm max-w-md">{incident.description}</p>
                             </div>
                             <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-secondary/30 w-fit px-4 py-2 rounded-xl">
                                <Settings className="h-3 w-3" /> {incident.asset_name || 'General Facility'}
                                <span className="h-1 w-1 rounded-full bg-slate-400 mx-1" />
                                <Clock className="h-3 w-3" /> Reported by {incident.reporter_name}
                             </div>
                          </div>
                          <Button 
                            onClick={() => setShowResolve(incident)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-glow-emerald"
                          >
                             Resolve Issue
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}
               {incidents.filter(i => i.status !== 'resolved').length === 0 && (
                 <div className="p-20 text-center bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border">
                    <CheckCircle2 className="h-20 w-20 text-emerald-500/20 mx-auto mb-6" />
                    <p className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Everything is running smooth</p>
                    <p className="text-slate-500 font-bold mt-2">All equipment is active and operational.</p>
                 </div>
               )}
            </div>
         </div>

         {/* Asset Registry */}
         <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground px-4">Equipment Hub</h2>
            <div className="grid grid-cols-1 gap-6">
               {assets.map((asset) => (
                 <Card key={asset.id} className="border border-border bg-card shadow-soft rounded-[2rem] hover:bg-secondary/20 transition-all cursor-pointer group">
                    <CardContent className="p-8 flex items-center gap-6">
                       <div className={cn(
                         "h-16 w-16 rounded-[1.25rem] flex items-center justify-center text-2xl relative",
                         asset.status === 'broken' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'
                       )}>
                          {asset.category === 'kitchen' ? <Coffee className="h-8 w-8" /> : asset.category === 'pos' ? <Zap className="h-8 w-8" /> : <HardDrive className="h-8 w-8" />}
                          {asset.status === 'broken' && <ShieldAlert className="h-5 w-5 absolute -top-1 -right-1 text-red-600 animate-pulse" />}
                       </div>
                       <div className="flex-1">
                          <p className="font-black text-foreground text-lg tracking-tight leading-none mb-1">{asset.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{asset.category} • {asset.status}</p>
                       </div>
                       <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>
      </div>

      {/* Report Incident Dialog */}
      <Dialog open={showReportIncident} onOpenChange={setShowReportIncident}>
         <DialogContent className="max-w-2xl rounded-[3rem] p-10 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Report Issue</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Log an operational failure for immediate attention.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-6">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Affected Equipment (Optional)</label>
                  <Select onValueChange={(val) => setNewIncident({...newIncident, asset_id: val})}>
                     <SelectTrigger className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold">
                        <SelectValue placeholder="Select asset..." />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl border-2">
                        {assets.map(a => <SelectItem key={a.id} value={a.id} className="font-bold">{a.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Short Title</label>
                     <Input 
                       placeholder="E.g. Coffee Grinder Stuck" 
                       value={newIncident.title}
                       onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority</label>
                     <Select onValueChange={(val) => setNewIncident({...newIncident, priority: val})}>
                        <SelectTrigger className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold">
                           <SelectValue placeholder="Medium" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                           <SelectItem value="low" className="font-bold">Low</SelectItem>
                           <SelectItem value="medium" className="font-bold">Medium</SelectItem>
                           <SelectItem value="high" className="font-bold text-orange-600">High</SelectItem>
                           <SelectItem value="critical" className="font-bold text-red-600 uppercase">Critical (Impacts Sales)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</label>
                  <Input 
                    placeholder="Provide details about the issue..." 
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                    className="h-24 rounded-2xl border-2 bg-secondary/30 font-bold"
                  />
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleReportIncident} className="w-full bg-primary text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-glow">Log Incident</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={!!showResolve} onOpenChange={() => setShowResolve(null)}>
         <DialogContent className="max-w-xl rounded-[3rem] p-10 border-none bg-card shadow-2xl text-center">
            <div className="h-20 w-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-emerald">
               <CheckCircle2 className="h-10 w-10" />
            </div>
            <DialogHeader>
               <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Mark as Resolved</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Confirm the issue is fixed and asset is back in service.</DialogDescription>
            </DialogHeader>
            <div className="py-10 space-y-6">
               <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                     <IndianRupee className="h-4 w-4" /> Maintenance Cost (Optional)
                  </label>
                  <Input 
                    type="number" 
                    placeholder="Enter amount in Rupees"
                    onChange={(e) => setResolveData({ cost_paise: Number(e.target.value) * 100 })}
                    className="h-16 rounded-2xl border-2 bg-secondary/30 font-black text-2xl text-center"
                  />
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowResolve(null)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]">Cancel</Button>
               <Button onClick={handleResolve} className="flex-1 bg-emerald-500 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-glow-emerald">Confirm Fixed</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
