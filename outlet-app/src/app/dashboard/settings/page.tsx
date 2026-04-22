'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Percent, 
  Receipt, 
  Save, 
  Plus, 
  Layout,
  Globe,
  Settings as SettingsIcon,
  Store,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOutletProfile, useUpdateProfile, useTables, useUpdateTable, useCreateTable } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { data: profile } = useOutletProfile();
  const { data: tables, isLoading: tablesLoading } = useTables();
  const updateProfile = useUpdateProfile();
  const updateTable = useUpdateTable();
  const { toast } = useToast();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: (document.querySelector('input[placeholder="Restaurant Name"]') as HTMLInputElement)?.value,
        gstin: (document.querySelector('input[placeholder="27AAAAA0000A1Z5"]') as HTMLInputElement)?.value,
        phone: (document.querySelector('input[placeholder="Primary Phone"]') as HTMLInputElement)?.value,
        address: (document.querySelector('input[placeholder="Official Address"]') as HTMLInputElement)?.value,
      });
      toast({ title: "Settings Saved", description: "Outlet configuration has been updated.", className: "bg-foreground text-background border-none" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save settings" });
    }
  };

  const handleDragEnd = async (tableId: string, event: any, info: any) => {
    const table = tables?.find((t: any) => t.id === tableId);
    if (!table) return;

    // Approximate snap to grid (e.g. 20px grid)
    const newX = Math.round((table.pos_x + info.offset.x) / 20) * 20;
    const newY = Math.round((table.pos_y + info.offset.y) / 20) * 20;

    // Constrain to bounds
    const boundedX = Math.max(0, Math.min(newX, 800));
    const boundedY = Math.max(0, Math.min(newY, 600));

    try {
      await updateTable.mutateAsync({
        id: tableId,
        pos_x: boundedX,
        pos_y: boundedY
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to update table position" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] overflow-hidden flex flex-col pb-10 bg-background font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase">
            Configuration
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">Fine-tune your restaurant's business rules and layout.</p>
        </div>
        <Button className="w-full md:w-auto h-12 md:h-14 px-6 md:px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none" onClick={handleSaveProfile}>
          <Save className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="floor" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-secondary p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] self-start shadow-inner border border-border mb-4 md:mb-8 overflow-x-auto no-scrollbar max-w-full flex-nowrap shrink-0">
          <TabsTrigger value="floor" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Visual Floor Plan</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Outlet Profile</TabsTrigger>
          <TabsTrigger value="business" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Business Rules</TabsTrigger>
          <TabsTrigger value="receipt" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Receipt Prefs</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          <TabsContent value="floor" className="mt-0 h-full">
             <div className="bg-card shadow-soft rounded-[2.5rem] p-8 h-full flex flex-col border border-border">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                         <Layout className="h-6 w-6" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Interactive Layout</h3>
                         <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-0.5">Drag to position tables</p>
                      </div>
                   </div>
                   <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-12 px-6 rounded-2xl border-border shadow-soft font-black uppercase tracking-widest text-slate-500 bg-secondary/50 hover:bg-secondary hover:text-primary">
                         <Plus className="h-4 w-4 mr-2" /> Add Table
                      </Button>
                    </DialogTrigger>
                    <AddTableDialog />
                  </Dialog>
               </div>
               <div className="flex-1 relative bg-background rounded-[2.5rem] border-2 border-dashed border-border overflow-hidden" 
                     style={{ backgroundImage: 'radial-gradient(var(--border) 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
                  
                  {tablesLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest">Loading blueprint...</div>
                  ) : tables?.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest">No tables placed on floor</div>
                  ) : (
                    tables?.map((table: any) => (
                        <motion.div
                        key={table.id}
                        drag
                        dragMomentum={false}
                        onDragEnd={(e, info) => handleDragEnd(table.id, e, info)}
                        initial={{ x: table.pos_x, y: table.pos_y }}
                        animate={{ x: table.pos_x, y: table.pos_y }}
                        className={cn(
                           "absolute cursor-grab active:cursor-grabbing w-28 h-28 rounded-[2rem] flex flex-col items-center justify-center shadow-lg border-2 transition-all hover:scale-105 z-10",
                           table.status === 'available' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10' : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/10'
                        )}
                      >
                         <h4 className="font-black text-2xl tracking-tighter">{table.name}</h4>
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">{table.capacity} PAX</span>
                      </motion.div>
                    ))
                  )}
               </div>
             </div>
          </TabsContent>

           <TabsContent value="profile" className="mt-0">
            <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
              <div className="flex items-center gap-5 mb-10">
                 <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <Building2 className="h-8 w-8" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Basic Information</h2>
                    <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest mt-1">Official details used for billing</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Restaurant Name</Label>
                    <div className="relative">
                       <Store className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input defaultValue={profile?.name} className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground" />
                    </div>
                 </div>
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">GSTIN Number</Label>
                    <div className="relative">
                       <FileText className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input defaultValue={profile?.gstin} placeholder="27AAAAA0000A1Z5" className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground uppercase" />
                    </div>
                 </div>
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Primary Phone</Label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input defaultValue={profile?.phone} className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground" />
                    </div>
                 </div>
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Official Address</Label>
                    <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input defaultValue={profile?.address} className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground" />
                    </div>
                 </div>
              </div>
            </div>
          </TabsContent>

           <TabsContent value="business" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                        <Percent className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Tax & Charges</h2>
                     </div>
                  </div>
                   <div className="space-y-8">
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">GST Percentage (%)</Label>
                        <Input type="number" defaultValue={profile?.settings_tax?.gst_percentage || 5} className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-2xl bg-background text-foreground" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">Applied as CGST/SGST automatically</p>
                     </div>
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Service Charge (%)</Label>
                        <Input type="number" defaultValue={profile?.settings_tax?.service_charge_percentage || 0} className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-2xl bg-background text-foreground" />
                     </div>
                  </div>
               </div>

                <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <Globe className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Localization</h2>
                     </div>
                  </div>
                   <div className="space-y-8">
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Currency Symbol</Label>
                        <Input defaultValue="₹ (INR)" disabled className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-xl bg-secondary text-slate-500 opacity-70 cursor-not-allowed" />
                     </div>
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Timezone</Label>
                        <Input defaultValue="Asia/Kolkata (GMT+5:30)" disabled className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-xl bg-secondary text-slate-500 opacity-70 cursor-not-allowed" />
                     </div>
                  </div>
               </div>
            </div>
          </TabsContent>

           <TabsContent value="receipt" className="mt-0">
             <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                <div className="flex items-center gap-5 mb-10">
                   <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                      <Receipt className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Receipt Preferences</h2>
                      <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest mt-1">Customize your thermal prints</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Receipt Header Text</Label>
                       <Textarea 
                         placeholder="Welcome to Adruva Resto!" 
                         defaultValue={profile?.settings_billing?.receipt_header}
                         className="h-40 p-6 rounded-[2rem] border-none shadow-soft font-mono text-sm bg-background text-foreground resize-none focus-visible:ring-primary"
                       />
                    </div>
                    <div className="space-y-3">
                       <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Receipt Footer Text</Label>
                       <Textarea 
                         placeholder="Thank you for visiting! Come again." 
                         defaultValue={profile?.settings_billing?.receipt_footer}
                         className="h-40 p-6 rounded-[2rem] border-none shadow-soft font-mono text-sm bg-background text-foreground resize-none focus-visible:ring-primary"
                       />
                    </div>
                </div>
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function AddTableDialog() {
  const createTable = useCreateTable();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);

  const handleCreate = async () => {
    if (!name) return;
    try {
      await createTable.mutateAsync({
        name,
        capacity,
        pos_x: 50,
        pos_y: 50,
        status: 'available'
      });
      toast({ title: "Table Created", description: `Table ${name} added to floor plan.` });
      setName('');
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to create table" });
    }
  };

  return (
     <DialogContent className="max-w-md rounded-[2.5rem] border-none p-10 bg-card shadow-soft font-sans">
      <DialogHeader>
        <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">New Table</DialogTitle>
      </DialogHeader>
      <div className="space-y-8 py-8">
         <div className="space-y-3">
          <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Table Name / Number</Label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. T1 or Table 5" 
            className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-xl bg-background text-foreground" 
          />
        </div>
         <div className="space-y-3">
          <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Seating Capacity (PAX)</Label>
          <Input 
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
            className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-2xl bg-background text-foreground" 
          />
        </div>
      </div>
      <DialogFooter>
         <Button 
          onClick={handleCreate}
          disabled={!name || createTable.isPending}
          className="w-full h-16 rounded-[2rem] bg-foreground hover:bg-foreground/90 text-background font-black shadow-lg shadow-black/10 tracking-widest uppercase transition-all active:scale-[0.98] border-none"
        >
          {createTable.isPending ? 'CREATING...' : 'ADD TO FLOOR PLAN'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

