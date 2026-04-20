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
import { useOutletProfile, useUpdateProfile, useTables, useUpdateTable } from '@/hooks/useSettings';
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
    toast({ title: "Settings Saved", description: "Outlet configuration has been updated.", className: "bg-[#1b1b24] text-white border-none" });
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
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-hidden flex flex-col -m-8 p-8 bg-[#fcf8ff] font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-[#1b1b24] uppercase">
            Configuration
          </h1>
          <p className="text-[#777587] font-medium text-lg mt-1">Fine-tune your restaurant's business rules and layout.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-[#4f46e5] hover:bg-[#3525cd] text-white font-black shadow-lg shadow-[#4f46e5]/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none" onClick={handleSaveProfile}>
          <Save className="h-5 w-5 mr-3" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="floor" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-[#ffffff] p-2 rounded-[1.5rem] self-start shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e4e1ee]/50 mb-8">
          <TabsTrigger value="floor" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">VISUAL FLOOR PLAN</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">OUTLET PROFILE</TabsTrigger>
          <TabsTrigger value="business" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">BUSINESS RULES</TabsTrigger>
          <TabsTrigger value="receipt" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">RECEIPT PREFS</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          <TabsContent value="floor" className="mt-0 h-full">
             <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 h-full flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 bg-[#e2dfff] rounded-xl flex items-center justify-center text-[#3525cd] shadow-inner">
                        <Layout className="h-6 w-6" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-[#1b1b24] tracking-tighter uppercase">Interactive Layout</h3>
                        <p className="text-[#a09eb1] font-black text-[10px] uppercase tracking-widest mt-0.5">Drag to position tables</p>
                     </div>
                  </div>
                  <Button variant="outline" className="h-12 px-6 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black uppercase tracking-widest text-[#777587] bg-[#fcf8ff] hover:bg-[#f5f2ff] hover:text-[#1b1b24]">
                     <Plus className="h-4 w-4 mr-2" /> Add Table
                  </Button>
               </div>
               
               <div className="flex-1 relative bg-[#fcf8ff] rounded-[2rem] border-2 border-dashed border-[#e4e1ee] overflow-hidden" 
                    style={{ backgroundImage: 'radial-gradient(#e4e1ee 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
                  
                  {tablesLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[#a09eb1] font-black uppercase tracking-widest">Loading blueprint...</div>
                  ) : tables?.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[#a09eb1] font-black uppercase tracking-widest">No tables placed on floor</div>
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
                           "absolute cursor-grab active:cursor-grabbing w-28 h-28 rounded-[1.5rem] flex flex-col items-center justify-center shadow-lg border-2 transition-colors",
                           table.status === 'available' ? 'bg-[#93f89e]/20 border-[#006e1c]/30 text-[#006e1c]' : 'bg-[#ffdad6]/50 border-[#ba1a1a]/30 text-[#ba1a1a]'
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
            <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10">
              <div className="flex items-center gap-5 mb-10">
                 <div className="h-16 w-16 bg-[#e2dfff] rounded-2xl flex items-center justify-center text-[#3525cd] shadow-inner">
                    <Building2 className="h-8 w-8" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-[#1b1b24] tracking-tighter uppercase">Basic Information</h2>
                    <p className="text-[#a09eb1] font-black text-[11px] uppercase tracking-widest mt-1">Official details used for billing</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Restaurant Name</Label>
                    <div className="relative">
                       <Store className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#c7c4d8]" />
                       <Input defaultValue={profile?.name} className="pl-16 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-lg bg-[#fcf8ff] text-[#1b1b24]" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">GSTIN Number</Label>
                    <div className="relative">
                       <FileText className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#c7c4d8]" />
                       <Input defaultValue={profile?.gstin} placeholder="27AAAAA0000A1Z5" className="pl-16 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-lg bg-[#fcf8ff] text-[#1b1b24] uppercase" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Primary Phone</Label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#c7c4d8]" />
                       <Input defaultValue={profile?.phone} className="pl-16 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-lg bg-[#fcf8ff] text-[#1b1b24]" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Official Address</Label>
                    <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#c7c4d8]" />
                       <Input defaultValue={profile?.address} className="pl-16 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-lg bg-[#fcf8ff] text-[#1b1b24]" />
                    </div>
                 </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="business" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="h-16 w-16 bg-[#93f89e]/30 rounded-2xl flex items-center justify-center text-[#006e1c] shadow-inner">
                        <Percent className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-[#1b1b24] tracking-tighter uppercase">Tax & Charges</h2>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">GST Percentage (%)</Label>
                        <Input type="number" defaultValue={profile?.settings_tax?.gst_percentage || 5} className="px-6 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-2xl bg-[#fcf8ff] text-[#1b1b24]" />
                        <p className="text-[10px] text-[#a09eb1] font-bold uppercase tracking-widest ml-2">Applied as CGST/SGST automatically</p>
                     </div>
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Service Charge (%)</Label>
                        <Input type="number" defaultValue={profile?.settings_tax?.service_charge_percentage || 0} className="px-6 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-2xl bg-[#fcf8ff] text-[#1b1b24]" />
                     </div>
                  </div>
               </div>

               <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-5 mb-10">
                     <div className="h-16 w-16 bg-[#e2dfff] rounded-2xl flex items-center justify-center text-[#3525cd] shadow-inner">
                        <Globe className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-[#1b1b24] tracking-tighter uppercase">Localization</h2>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Currency Symbol</Label>
                        <Input defaultValue="₹ (INR)" disabled className="px-6 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-xl bg-[#f5f2ff] text-[#777587] opacity-70" />
                     </div>
                     <div className="space-y-3">
                        <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Timezone</Label>
                        <Input defaultValue="Asia/Kolkata (GMT+5:30)" disabled className="px-6 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-xl bg-[#f5f2ff] text-[#777587] opacity-70" />
                     </div>
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="mt-0">
             <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10">
                <div className="flex items-center gap-5 mb-10">
                   <div className="h-16 w-16 bg-[#ffdad6] rounded-2xl flex items-center justify-center text-[#ba1a1a] shadow-inner">
                      <Receipt className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-[#1b1b24] tracking-tighter uppercase">Receipt Preferences</h2>
                      <p className="text-[#a09eb1] font-black text-[11px] uppercase tracking-widest mt-1">Customize your thermal prints</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Receipt Header Text</Label>
                      <Textarea 
                        placeholder="Welcome to Adruva Resto!" 
                        defaultValue={profile?.settings_billing?.receipt_header}
                        className="h-40 p-6 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-mono text-sm bg-[#fcf8ff] text-[#1b1b24] resize-none focus-visible:ring-[#4f46e5]"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="font-black text-xs uppercase tracking-widest text-[#777587] ml-2">Receipt Footer Text</Label>
                      <Textarea 
                        placeholder="Thank you for visiting! Come again." 
                        defaultValue={profile?.settings_billing?.receipt_footer}
                        className="h-40 p-6 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-mono text-sm bg-[#fcf8ff] text-[#1b1b24] resize-none focus-visible:ring-[#4f46e5]"
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
