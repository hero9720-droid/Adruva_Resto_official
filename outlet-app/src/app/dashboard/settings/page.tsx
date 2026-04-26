'use client';

import { useState, useEffect, useRef } from 'react';
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
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Lock,
  Languages,
  Database,
  CloudUpload,
  HardDrive,
  Activity,
  Server,
  QrCode,
  Upload,
  ImageIcon,
  Loader2
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
import { useUploadMenuPhoto } from '@/hooks/useMenu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import { Suspense } from 'react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'floor';
  
  const { data: profile } = useOutletProfile();
  const { data: tables, isLoading: tablesLoading } = useTables();
  const updateProfile = useUpdateProfile();
  const updateTable = useUpdateTable();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: '',
    gstin: '',
    phone: '',
    address: '',
    tax_rate_percent: 5,
    service_charge_percent: 0,
    logo_url: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMenuPhoto();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await upload.mutateAsync(file);
      setProfileForm(prev => ({ ...prev, logo_url: url }));
      toast({ title: "Logo Uploaded", description: "Save changes to finalize." });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        gstin: profile.gstin || '',
        phone: profile.phone || '',
        address: profile.address || '',
        tax_rate_percent: profile.tax_rate_percent || 5,
        service_charge_percent: profile.service_charge_percent || 0,
        logo_url: profile.logo_url || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(profileForm);
      toast({ title: "Settings Saved", description: "Outlet configuration has been updated.", className: "bg-foreground text-background border-none" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save settings" });
    }
  };

  const handleDragEnd = async (tableId: string, event: any, info: any) => {
    const table = tables?.find((t: any) => t.id === tableId);
    if (!table) return;

    const newX = Math.round((table.pos_x + info.offset.x) / 20) * 20;
    const newY = Math.round((table.pos_y + info.offset.y) / 20) * 20;

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
    <div className="space-y-6 md:space-y-8 min-h-0 flex flex-col pb-10 bg-background font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase">
            Configuration
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">Fine-tune your restaurant's business rules and layout.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <Button variant="outline" className="h-12 md:h-14 px-6 rounded-2xl border-none shadow-soft font-black tracking-widest uppercase bg-card text-primary shrink-0" onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')}>
              <Languages className="h-5 w-5 mr-3" />
              {language}
           </Button>
           <Button className="flex-1 md:flex-none h-12 md:h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none" onClick={handleSaveProfile}>
              <Save className="h-5 w-5 mr-3" />
              Save Changes
           </Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col">
        <TabsList className="bg-secondary p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] self-start shadow-inner border border-border mb-4 md:mb-8 overflow-x-auto no-scrollbar max-w-full flex-nowrap shrink-0">
          <TabsTrigger value="floor" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Visual Floor Plan</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Outlet Profile</TabsTrigger>
          <TabsTrigger value="business" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Business Rules</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Roles & Security</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">System & Backups</TabsTrigger>
          <TabsTrigger value="receipt" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Receipt Prefs</TabsTrigger>
          <TabsTrigger value="printers" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Printers</TabsTrigger>
          <TabsTrigger value="qr" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">QR Ordering</TabsTrigger>
        </TabsList>

        <div className="flex-1">
          
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
                   <AddTableDialog />
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
              {/* Profile/Logo Upload Section */}
              <div className="flex flex-col md:flex-row items-center gap-10 mb-12 pb-10 border-b border-border/50">
                 <div className="relative group">
                    <div className="h-40 w-40 rounded-[2.5rem] bg-secondary flex items-center justify-center overflow-hidden border-4 border-card shadow-xl group-hover:border-primary/20 transition-all">
                       {profileForm.logo_url ? (
                         <img src={profileForm.logo_url} className="w-full h-full object-cover" alt="Logo" />
                       ) : (
                         <ImageIcon className="h-16 w-16 text-slate-300" />
                       )}
                       <div 
                         className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm"
                         onClick={() => logoInputRef.current?.click()}
                       >
                          <Upload className="h-8 w-8 text-white mb-2" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Logo</span>
                       </div>
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-[2.5rem] z-20">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                    />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Outlet Brand Identity</h3>
                    <p className="text-slate-500 font-medium text-lg mb-6">Upload your restaurant logo. This will appear on digital menus, invoices, and the customer app.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                       <Button 
                        variant="outline" 
                        className="rounded-xl font-black text-xs uppercase tracking-widest border-border text-slate-400"
                        onClick={() => logoInputRef.current?.click()}
                       >
                         Choose File
                       </Button>
                       {profileForm.logo_url && (
                         <Button 
                          variant="ghost" 
                          className="rounded-xl font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50"
                          onClick={() => setProfileForm({...profileForm, logo_url: ''})}
                         >
                           Remove
                         </Button>
                       )}
                    </div>
                 </div>
              </div>

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
                       <Input 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground" 
                       />
                    </div>
                 </div>
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">GSTIN Number</Label>
                    <div className="relative">
                       <FileText className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input 
                        value={profileForm.gstin} 
                        onChange={e => setProfileForm({...profileForm, gstin: e.target.value})}
                        placeholder="27AAAAA0000A1Z5" 
                        className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground uppercase" 
                       />
                    </div>
                 </div>
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Primary Phone</Label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground" 
                       />
                    </div>
                 </div>
                  <div className="space-y-3">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Official Address</Label>
                    <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input 
                        value={profileForm.address} 
                        onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                        className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-background text-foreground" 
                       />
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
                          <Input 
                             type="number" 
                             value={profileForm.tax_rate_percent} 
                             onChange={e => setProfileForm({...profileForm, tax_rate_percent: Number(e.target.value)})}
                             className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-2xl bg-background text-foreground" 
                            />
                          <div className="flex gap-4 mt-2 ml-2">
                             <Badge className="bg-secondary text-slate-500 border-none font-bold">CGST: {profileForm.tax_rate_percent / 2}%</Badge>
                             <Badge className="bg-secondary text-slate-500 border-none font-bold">SGST: {profileForm.tax_rate_percent / 2}%</Badge>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="font-black text-xs uppercase tracking-widest text-slate-500 ml-2">Service Charge (%)</Label>
                          <Input 
                             type="number" 
                             value={profileForm.service_charge_percent} 
                             onChange={e => setProfileForm({...profileForm, service_charge_percent: Number(e.target.value)})}
                             className="px-6 h-16 rounded-[2rem] border-none shadow-soft font-black text-2xl bg-background text-foreground" 
                            />
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

          <TabsContent value="roles" className="mt-0">
             <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                <div className="flex items-center gap-5 mb-10">
                   <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                      <ShieldCheck className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Roles & Permissions</h2>
                      <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest mt-1">Audit and configure access levels</p>
                   </div>
                </div>
                
                <div className="space-y-6">
                   {[
                      { role: 'Admin', users: 2, permissions: ['FULL_ACCESS', 'REVENUE_VIEW', 'SET_PRICES'], color: 'bg-red-500' },
                      { role: 'Manager', users: 3, permissions: ['VOID_BILLS', 'MANAGE_STOCK', 'VIEW_REPORTS'], color: 'bg-indigo-500' },
                      { role: 'Captain', users: 8, permissions: ['PUNCH_ORDERS', 'BILL_GENERATE', 'TABLE_TRANSFER'], color: 'bg-emerald-500' },
                      { role: 'Waiter', users: 15, permissions: ['VIEW_MENU', 'CHECK_STATUS'], color: 'bg-amber-500' }
                   ].map((r) => (
                      <div key={r.role} className="p-6 rounded-[2rem] bg-background border border-border flex items-center justify-between group hover:border-indigo-500 transition-all">
                         <div className="flex items-center gap-5">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", r.color)}>
                               <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                               <h4 className="font-black text-foreground text-xl tracking-tight uppercase">{r.role}</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.users} ACTIVE ACCOUNTS</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            {r.permissions.slice(0, 2).map(p => (
                               <Badge key={p} variant="outline" className="border-indigo-100 text-indigo-400 font-black text-[9px] uppercase px-3 py-1">{p}</Badge>
                            ))}
                            {r.permissions.length > 2 && <Badge variant="outline" className="border-indigo-100 text-indigo-400 font-black text-[9px] px-2">+{r.permissions.length - 2}</Badge>}
                            <Button variant="ghost" size="icon" className="ml-4 h-12 w-12 rounded-xl text-slate-300 hover:text-indigo-500 hover:bg-indigo-50">
                               <Lock className="h-5 w-5" />
                            </Button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </TabsContent>

          <TabsContent value="system" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                   <div className="flex items-center gap-5 mb-10">
                      <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                         <Database className="h-8 w-8" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Automated Backups</h2>
                      </div>
                   </div>
                   
                   <div className="space-y-8">
                      <div className="p-6 bg-background rounded-3xl border border-border flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <CloudUpload className="h-6 w-6 text-emerald-500" />
                            <div>
                               <p className="font-black text-foreground uppercase tracking-tight text-sm">Cloud Storage</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ENABLED • DAILY @ 03:00 AM</p>
                            </div>
                         </div>
                         <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase">Configure</Button>
                      </div>

                      <div className="p-6 bg-background rounded-3xl border border-border flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <HardDrive className="h-6 w-6 text-blue-500" />
                            <div>
                               <p className="font-black text-foreground uppercase tracking-tight text-sm">Local Dump</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LAST SYNC: 14 MINS AGO</p>
                            </div>
                         </div>
                         <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase">Download</Button>
                      </div>

                      <Button className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
                         Run Manual Backup Now
                      </Button>
                   </div>
                </div>

                <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                   <div className="flex items-center gap-5 mb-10">
                      <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-inner">
                         <Server className="h-8 w-8" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">System Logs</h2>
                      </div>
                   </div>
                   
                   <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                      {[
                         { time: '14:22', msg: 'Backup cycle completed successfully.', type: 'info' },
                         { time: '14:15', msg: 'Table 4 status updated via Socket.', type: 'socket' },
                         { time: '13:58', msg: 'New Staff "Rahul" added to outlet.', type: 'auth' },
                         { time: '12:45', msg: 'Database migration v2.4 applied.', type: 'db' },
                         { time: '10:30', msg: 'Printer "KOT-1" went offline.', type: 'error' }
                      ].map((log, i) => (
                         <div key={i} className="p-4 bg-background rounded-2xl border border-border flex gap-4 text-xs">
                            <span className="font-bold text-slate-400 shrink-0">{log.time}</span>
                            <span className="font-medium text-slate-600">{log.msg}</span>
                         </div>
                      ))}
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

          <TabsContent value="printers" className="mt-0">
             <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-5">
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                         <Printer className="h-8 w-8" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Hardware Configuration</h2>
                         <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest mt-1">Manage network & USB printers</p>
                      </div>
                   </div>
                   <Button variant="outline" className="h-12 px-6 rounded-2xl border-border shadow-soft font-black uppercase tracking-widest text-slate-500 hover:text-primary">
                      Scan Network
                   </Button>
                </div>

                <div className="space-y-6">
                   {[
                      { name: 'Kitchen Thermal (KOT)', ip: '192.168.1.102', status: 'online', type: 'LAN' },
                      { name: 'Main Billing Printer', ip: 'USB-001', status: 'online', type: 'USB' },
                      { name: 'Bar Station (D-80)', ip: '192.168.1.105', status: 'offline', type: 'LAN' }
                   ].map((printer) => (
                      <div key={printer.name} className="p-6 rounded-[2rem] bg-background border border-border flex items-center justify-between group hover:border-primary transition-all">
                         <div className="flex items-center gap-5">
                            <div className={cn(
                               "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                               printer.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            )}>
                               <Printer className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-black text-foreground uppercase tracking-tight">{printer.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{printer.type} • {printer.ip}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <Badge className={cn(
                               "border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-lg",
                               printer.status === 'online' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            )}>
                               {printer.status}
                            </Badge>
                            <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-primary">Test Print</Button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </TabsContent>
           <TabsContent value="qr" className="mt-0">
              <div className="bg-card shadow-soft rounded-[2.5rem] p-10 border border-border">
                <div className="flex items-center gap-5 mb-10">
                   <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                      <QrCode className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">QR Ordering System</h2>
                      <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest mt-1">Manage digital menu access and self-ordering</p>
                   </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="p-8 bg-background rounded-[2rem] border border-border space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="font-black text-foreground uppercase tracking-tight">QR Ordering</h3>
                         <Badge className="bg-emerald-500 text-white border-none uppercase text-[9px] px-3">Active</Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Allow customers to scan QR codes on tables to view the menu and place orders directly.
                      </p>
                      <Button 
                        className="w-full h-12 rounded-xl bg-secondary text-primary font-black text-[10px] uppercase border-none hover:bg-primary/10"
                        onClick={() => window.open(`https://adruvaresto-customer.vercel.app/${profile?.slug}`, '_blank')}
                      >
                        View Public Menu URL
                      </Button>
                   </div>

                   <div className="p-8 bg-background rounded-[2rem] border border-border space-y-6">
                      <h3 className="font-black text-foreground uppercase tracking-tight">Bulk QR Export</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Generate and download high-resolution QR codes for all active tables.
                      </p>
                      <Button 
                        className="w-full h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase border-none shadow-glow"
                        onClick={() => toast({ title: "Bulk Export Started", description: "Preparing PDF bundle for all tables." })}
                      >
                        Generate Bulk QRs
                      </Button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                   {/* Digital Menu QR */}
                   <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-6">
                      <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center shadow-sm p-3 shrink-0 border border-primary/20" id="qr-menu">
                         <QRCodeSVG value={`https://adruvaresto-customer.vercel.app/${profile?.slug}`} size={80} level="H" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-black text-primary uppercase tracking-tight text-lg leading-tight">Digital Menu</h4>
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">General Ordering QR</p>
                         <Button 
                           variant="link" 
                           className="p-0 h-auto text-primary text-[10px] font-black uppercase tracking-widest mt-2"
                           onClick={() => window.open(`https://adruvaresto-customer.vercel.app/${profile?.slug}`, '_blank')}
                         >
                           Open Link <ChevronRight className="h-3 w-3 ml-1" />
                         </Button>
                      </div>
                   </div>

                   {/* Customer Feedback QR */}
                   <div className="p-8 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex items-center gap-6">
                      <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center shadow-sm p-3 shrink-0 border border-emerald-500/20" id="qr-feedback">
                         <QRCodeSVG value={`https://adruvaresto-customer.vercel.app/${profile?.slug}?mode=feedback`} size={80} level="H" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-black text-emerald-600 uppercase tracking-tight text-lg leading-tight">Customer Feedback</h4>
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Review & Ratings QR</p>
                         <Button 
                           variant="link" 
                           className="p-0 h-auto text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-2"
                           onClick={() => window.open(`https://adruvaresto-customer.vercel.app/${profile?.slug}?mode=feedback`, '_blank')}
                         >
                           Open Link <ChevronRight className="h-3 w-3 ml-1" />
                         </Button>
                      </div>
                   </div>
                </div>

                <div className="mt-12">
                   <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-6 flex items-center gap-3">
                      Table QR Catalog
                      <Badge className="bg-secondary text-primary border-none text-[9px] px-3">{tables?.length || 0} Tables</Badge>
                   </h3>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {tablesLoading ? (
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="h-64 bg-secondary animate-pulse rounded-[2rem]" />
                        ))
                      ) : tables?.map((table: any) => (
                        <div key={table.id} className="bg-background border border-border rounded-[2rem] p-6 flex flex-col items-center group hover:border-primary transition-all shadow-sm hover:shadow-glow-sm">
                           <div className="h-32 w-32 bg-white rounded-2xl flex items-center justify-center p-3 mb-6 shadow-inner border border-border group-hover:scale-105 transition-transform">
                              <QRCodeSVG 
                                value={`https://adruvaresto-customer.vercel.app/${profile?.slug}?table=${table.id}`} 
                                size={120} 
                                level="H" 
                                includeMargin={true}
                              />
                           </div>
                           <div className="text-center">
                              <h4 className="font-black text-foreground uppercase tracking-tight text-xl mb-1">TABLE {table.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{table.zone_name || 'Main Zone'}</p>
                              <div className="flex gap-2">
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   className="h-9 px-4 rounded-xl border-border text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary"
                                   onClick={() => toast({ title: "SVG Download", description: "Downloading Table " + table.name + " vector..." })}
                                 >
                                   Download
                                 </Button>
                                 <Button 
                                   variant="secondary" 
                                   size="sm" 
                                   className="h-9 px-4 rounded-xl bg-secondary text-primary text-[9px] font-black uppercase tracking-widest border-none"
                                   onClick={() => window.print()}
                                 >
                                   Print
                                 </Button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
           </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function AddTableDialog() {
  const createTable = useCreateTable();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to create table" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-border shadow-soft font-black uppercase tracking-widest text-slate-500 bg-secondary/50 hover:bg-secondary hover:text-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Table
        </Button>
      </DialogTrigger>
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
    </Dialog>
  );
}
