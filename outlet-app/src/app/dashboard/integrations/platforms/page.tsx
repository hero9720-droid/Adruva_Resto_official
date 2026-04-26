'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Settings2, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  ShoppingBag, 
  AlertCircle,
  MoreVertical,
  Layers,
  FileText,
  Briefcase,
  ChevronRight,
  Globe,
  Power,
  RefreshCcw,
  Smartphone,
  ExternalLink,
  Ban,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PlatformSyncPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchData = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      const [platformsRes, ordersRes] = await Promise.all([
        api.get(`/integrations/platforms/${outletId}/status`),
        api.get(`/integrations/platforms/${outletId}/orders`)
      ]);
      setPlatforms(platformsRes.data.data);
      setOrders(ordersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePlatform = async (platformName: string, currentStatus: boolean) => {
    const outletId = localStorage.getItem('last_outlet_id');
    setSyncing(platformName);
    try {
      await api.patch(`/integrations/platforms/${outletId}/${platformName}/toggle`, {
        is_active: !currentStatus
      });
      toast({ 
        title: `${platformName.toUpperCase()} Status Updated`, 
        description: `Storefront is now ${!currentStatus ? 'ONLINE' : 'OFFLINE'}.` 
      });
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Toggle failed" });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Syncing Cross-Platform State...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Platform Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Globe className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Omni-Channel Storefront Management</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Platform <br />
             <span className="text-primary">Sync</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Your single source of truth for Zomato, Swiggy, and Magicpin. Manage storefront status, synchronize item availability, and monitor aggregated delivery orders in real-time.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 flex items-center gap-3">
              <RefreshCcw className="h-5 w-5" /> Force Sync All
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
              <Settings2 className="h-5 w-5" /> API Config
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {platforms.map((p) => (
           <Card key={p.id} className="border-none bg-card shadow-soft rounded-[3rem] p-8 overflow-hidden relative group transition-all hover:border-primary/30 border-2 border-transparent">
              <div className="flex justify-between items-start mb-10">
                 <div className="h-16 w-16 bg-secondary rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    {p.platform_name === 'zomato' ? <ShoppingBag className="h-8 w-8" /> : <Smartphone className="h-8 w-8" />}
                 </div>
                 <div className="flex flex-col items-end">
                    <Badge className={cn(
                      "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg mb-2",
                      p.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                       {p.is_active ? 'Online' : 'Offline'}
                    </Badge>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storefront Status</p>
                 </div>
              </div>
              
              <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">{p.platform_name}</h3>
              <p className="text-xs font-bold text-slate-500 mb-10">Merchant ID: {p.merchant_id || 'ADRUVA_102'}</p>

              <div className="flex items-center justify-between pt-8 border-t border-border">
                 <div className="flex items-center gap-3">
                    <Switch 
                      checked={p.is_active} 
                      onCheckedChange={() => handleTogglePlatform(p.platform_name, p.is_active)}
                      disabled={syncing === p.platform_name}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                       {syncing === p.platform_name ? 'Syncing...' : 'Toggle Store'}
                    </span>
                 </div>
                 <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-secondary hover:text-primary">
                    <ExternalLink className="h-4 w-4" />
                 </Button>
              </div>
           </Card>
         ))}

         <Card className="border-none bg-card shadow-soft rounded-[3rem] p-8 flex flex-col items-center justify-center text-center group border-2 border-dashed border-border hover:border-primary transition-all cursor-pointer">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center text-slate-300 group-hover:text-primary mb-6">
               <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-2">Add Integration</h3>
            <p className="text-xs font-bold text-slate-500 max-w-[160px]">Connect Magicpin, DotPe, or ONDC storefronts.</p>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* External Order Feed */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Delivery Order Feed</h2>
               <div className="flex items-center gap-4">
                  <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-border">
                     Live Feed Active
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-secondary"><RefreshCcw className="h-4 w-4" /></Button>
               </div>
            </div>

            <div className="space-y-4">
               {orders.length === 0 ? (
                 <div className="py-40 text-center bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border text-slate-400">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-sm">No delivery orders active</p>
                 </div>
               ) : (
                 orders.map((order) => (
                   <Card key={order.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                      <CardContent className="p-8 flex items-center justify-between">
                         <div className="flex items-center gap-8">
                            <div className={cn(
                              "h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black",
                              order.external_platform === 'zomato' ? "bg-red-500 shadow-lg shadow-red-500/20" : "bg-orange-500 shadow-lg shadow-orange-500/20"
                            )}>
                               {order.external_platform?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <Badge className="bg-secondary text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                                     #{order.external_order_id || '65421'}
                                  </Badge>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(order.created_at), 'HH:mm')} • {order.external_platform}</span>
                               </div>
                               <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">{order.customer_name || 'Guest User'}</h4>
                               <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                                  {order.items?.length || 0} ITEMS • ₹{(order.total_amount_paise / 100).toLocaleString()}
                               </p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4">
                            <div className="text-right mr-4">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Agent</p>
                               <p className="font-black text-sm uppercase">Assigned</p>
                            </div>
                            <Button size="lg" className="bg-primary text-white h-14 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] shadow-glow">
                               Print KOT
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                 ))
               )}
            </div>
         </div>

         {/* Item Sync Controls */}
         <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[3rem] lg:col-span-1 p-10 flex flex-col">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Item Availability</h3>
                  <p className="text-white/40 font-bold text-sm mt-1 italic">Sync stock with delivery apps.</p>
               </div>
               <Ban className="h-10 w-10 text-primary opacity-20" />
            </div>

            <div className="relative mb-8">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
               <Input 
                 placeholder="Search menu items..."
                 className="h-14 bg-white/5 border-white/10 rounded-2xl pl-14 text-white font-bold"
               />
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">
               {[
                 { name: 'Paneer Butter Masala', status: { zomato: true, swiggy: true } },
                 { name: 'Chicken Biryani', status: { zomato: false, swiggy: true } },
                 { name: 'Butter Naan', status: { zomato: true, swiggy: true } },
                 { name: 'Tandoori Chicken', status: { zomato: true, swiggy: false } }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between group">
                    <div>
                       <p className="font-black text-sm uppercase tracking-tighter">{item.name}</p>
                       <div className="flex gap-2 mt-1">
                          <span className={cn("text-[8px] font-black uppercase tracking-widest", item.status.zomato ? "text-emerald-500" : "text-red-500")}>Zomato</span>
                          <span className="text-white/10 text-[8px]">|</span>
                          <span className={cn("text-[8px] font-black uppercase tracking-widest", item.status.swiggy ? "text-emerald-500" : "text-red-500")}>Swiggy</span>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-white/5 hover:bg-primary hover:text-white">
                       <RefreshCcw className="h-4 w-4" />
                    </Button>
                 </div>
               ))}
            </div>

            <div className="mt-10 p-6 bg-primary/5 rounded-3xl border border-primary/20 flex items-start gap-4">
               <Zap className="h-5 w-5 text-primary mt-1 shrink-0" />
               <p className="text-[10px] font-black text-primary/80 leading-relaxed uppercase tracking-widest">
                  Auto-Sync is active. Mark an item "Out of Stock" in your main inventory to instantly turn it off on all delivery platforms.
               </p>
            </div>
         </Card>
      </div>
    </div>
  );
}
