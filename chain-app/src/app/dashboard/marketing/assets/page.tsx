'use client';

import { useState, useEffect } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  Globe, 
  RefreshCcw, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  QrCode, 
  Copy, 
  Eye, 
  ShieldCheck, 
  Settings2,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
  LayoutDashboard,
  MoreVertical,
  FileText,
  Briefcase,
  Type,
  CloudUpload, 
  ExternalLink,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AssetRegistryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assets');

  const { toast } = useToast();

  const fetchData = async () => {
    const chainId = localStorage.getItem('last_chain_id');
    try {
      const res = await api.get(`/brand/${chainId}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch brand data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Syncing Brand Identity...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Asset Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <ShieldCheck className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Unified Brand Identity & Asset Hub</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Digital <br />
             <span className="text-primary">Assets</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Centralize your brand DNA. Manage logos, banners, and design tokens from a single source of truth and propagate visual updates across all outlets and guest touchpoints instantly.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 flex items-center gap-3">
              <RefreshCcw className="h-5 w-5" /> Propagate Brand
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
              <CloudUpload className="h-5 w-5" /> Bulk Upload
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Identity Sidebar */}
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem] lg:col-span-1 p-8 h-fit">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
               <Palette className="h-5 w-5 text-primary" /> Design Tokens
            </h3>
            
            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color Palette</label>
                  <div className="grid grid-cols-3 gap-3">
                     {Object.entries(data?.identity?.colors || {}).map(([key, val]: any) => (
                       <div key={key} className="group cursor-pointer">
                          <div className="h-12 w-full rounded-xl border border-border shadow-sm mb-1" style={{ backgroundColor: val }} />
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">{key}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Typography</label>
                  <div className="space-y-3">
                     <div className="bg-secondary/30 p-4 rounded-2xl border border-border">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Body Font</p>
                        <p className="font-bold text-sm">{data?.identity?.typography?.font_family || 'Inter'}</p>
                     </div>
                     <div className="bg-secondary/30 p-4 rounded-2xl border border-border">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Headings</p>
                        <p className="font-black text-sm uppercase tracking-tighter">{data?.identity?.typography?.heading_font || 'Outfit'}</p>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-border">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-2">
                     <Settings2 className="h-4 w-4" /> Edit Identity
                  </Button>
               </div>
            </div>
         </Card>

         {/* Asset Hub */}
         <div className="lg:col-span-3 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
               <div className="flex justify-between items-center mb-6">
                  <TabsList className="bg-secondary/50 p-1 rounded-2xl h-16 border border-border">
                     <TabsTrigger value="assets" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:shadow-soft">Visual Assets</TabsTrigger>
                     <TabsTrigger value="preview" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:shadow-soft">Live Preview</TabsTrigger>
                  </TabsList>
                  <div className="relative w-64">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <Input placeholder="Search assets..." className="h-12 bg-card border-border rounded-xl pl-11 font-bold text-xs" />
                  </div>
               </div>

               <TabsContent value="assets" className="mt-0 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {[
                       { type: 'Logo (Dark)', key: 'logo_dark', icon: <ImageIcon className="h-6 w-6" /> },
                       { type: 'Logo (Light)', key: 'logo_light', icon: <ImageIcon className="h-6 w-6" /> },
                       { type: 'Favicon', key: 'favicon', icon: <Layers className="h-6 w-6" /> },
                       { type: 'App Banner', key: 'banner_app', icon: <Monitor className="h-6 w-6" /> },
                       { type: 'QR Background', key: 'qr_bg', icon: <QrCode className="h-6 w-6" /> }
                     ].map((asset) => {
                       const activeAsset = data?.assets?.find((a: any) => a.asset_type === asset.key && a.is_active);
                       return (
                         <Card key={asset.key} className="border-2 border-transparent bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all">
                            <CardContent className="p-8 space-y-6">
                               <div className="flex justify-between items-start">
                                  <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                     {asset.icon}
                                  </div>
                                  <Badge className={cn(
                                    "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg",
                                    activeAsset ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-400"
                                  )}>
                                     {activeAsset ? 'Active' : 'Missing'}
                                  </Badge>
                               </div>
                               
                               <div>
                                  <h4 className="text-xl font-black text-foreground tracking-tighter uppercase">{asset.type}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recommended: 512x512 PNG</p>
                               </div>

                               <div className="h-32 bg-secondary/30 rounded-3xl flex items-center justify-center border-2 border-dashed border-border relative group-hover:border-primary/50 transition-all overflow-hidden">
                                  {activeAsset ? (
                                    <img src={activeAsset.url} className="h-20 object-contain" />
                                  ) : (
                                    <CloudUpload className="h-8 w-8 text-slate-300" />
                                  )}
                               </div>

                               <div className="flex gap-3 pt-2">
                                  <Button className="flex-1 bg-secondary text-foreground hover:bg-primary hover:text-white h-12 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2">
                                     <Upload className="h-3 w-3" /> Update
                                  </Button>
                                  <Button variant="ghost" className="h-12 w-12 rounded-xl bg-secondary p-0 text-slate-400 hover:text-red-500">
                                     <Trash2 className="h-4 w-4" />
                                  </Button>
                               </div>
                            </CardContent>
                         </Card>
                       );
                     })}
                  </div>
               </TabsContent>

               <TabsContent value="preview" className="mt-0 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-12 bg-secondary/10 rounded-[4rem] border-2 border-dashed border-border">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-2">
                           <Smartphone className="h-5 w-5 text-primary" />
                           <h3 className="font-black uppercase tracking-tighter text-xl text-foreground">Customer App</h3>
                        </div>
                        <div className="bg-card rounded-[3rem] shadow-2xl aspect-[9/16] overflow-hidden relative border-8 border-[#1b1b24]">
                           <div className="p-8 space-y-6">
                              <div className="flex justify-between items-center">
                                 <img src={data?.assets?.find((a: any) => a.asset_type === 'logo_dark')?.url || 'https://via.placeholder.com/100'} className="h-8" />
                                 <div className="h-8 w-8 rounded-full bg-secondary" />
                              </div>
                              <div className="h-40 w-full bg-primary/20 rounded-3xl flex items-center justify-center border-2 border-dashed border-primary/30">
                                 <span className="text-[10px] font-black text-primary uppercase">Hero Banner</span>
                              </div>
                              <div className="space-y-4">
                                 <div className="h-4 w-3/4 bg-secondary rounded-full" />
                                 <div className="h-4 w-1/2 bg-secondary rounded-full" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="h-32 bg-secondary rounded-2xl" />
                                 <div className="h-32 bg-secondary rounded-2xl" />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-2">
                           <Monitor className="h-5 w-5 text-primary" />
                           <h3 className="font-black uppercase tracking-tighter text-xl text-foreground">Outlet POS (Logo Propagation)</h3>
                        </div>
                        <div className="bg-[#1b1b24] rounded-[2.5rem] shadow-2xl aspect-video overflow-hidden border-8 border-slate-800">
                           <div className="h-full flex flex-col">
                              <div className="h-16 border-b border-white/5 flex items-center px-8 gap-6">
                                 <img src={data?.assets?.find((a: any) => a.asset_type === 'logo_light')?.url || 'https://via.placeholder.com/80'} className="h-6 brightness-200" />
                                 <div className="h-3 w-32 bg-white/10 rounded-full" />
                              </div>
                              <div className="flex-1 flex gap-4 p-8">
                                 <div className="flex-1 bg-white/5 rounded-2xl border border-white/10" />
                                 <div className="w-80 bg-white/5 rounded-2xl border border-white/10" />
                              </div>
                           </div>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 flex items-start gap-4 mt-8">
                           <Zap className="h-5 w-5 text-primary mt-1 shrink-0" />
                           <p className="text-[10px] font-black text-primary/80 leading-relaxed uppercase tracking-widest">
                              Live Sync Active. Every branding update you make here is automatically cached and served to all connected POS terminals and Customer applications.
                           </p>
                        </div>
                     </div>
                  </div>
               </TabsContent>
            </Tabs>
         </div>
      </div>
    </div>
  );
}
