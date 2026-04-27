'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, ChefHat, 
  Timer, AlertCircle, Info,
  MousePointer2, Flame, Utensils, 
  BookOpen, ChevronRight, Zap, RefreshCcw
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';
import { useTables } from '@/hooks/useSettings';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function KDSV2Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [recipeItem, setRecipeItem] = useState<any>(null);
  const { socket, isConnected } = useSocket('kitchen');
  const { toast } = useToast();
  const { data: tables } = useTables();

  useEffect(() => {
    fetchOrders();
    fetchStations();

    if (socket) {
      socket.on('order:new', (newOrder: any) => {
        setOrders(prev => [newOrder, ...prev]);
        notifySound();
      });

      socket.on('order:item_update', ({ order_id, item_id, status }: any) => {
        setOrders(prev => prev.map(o => {
          if (o.id === order_id) {
            return { ...o, items: o.items.map((i: any) => i.id === item_id ? { ...i, status } : i) };
          }
          return o;
        }));
      });
    }

    const interval = setInterval(() => {
       // Force re-render for timers
       setOrders(prev => [...prev]);
    }, 10000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('order:new');
        socket.off('order:item_update');
      }
    };
  }, [socket]);

  const fetchStations = async () => {
    try {
      const { data } = await api.get('/settings/kitchen-stations');
      setStations(data.data);
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders', { params: { status: 'confirmed' } });
      setOrders(data.data);
    } catch (err) {}
  };

  const notifySound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const updateItemStatus = async (orderId: string, itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : 
                     currentStatus === 'preparing' ? 'ready' : 'served';
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, items: o.items.map((i: any) => i.id === itemId ? { ...i, status: nextStatus } : i) };
      }
      return o;
    }));

    try {
      await api.patch(`/orders/items/${itemId}/status`, { status: nextStatus });
    } catch (err) {
      fetchOrders();
    }
  };

  const getTimeElapsed = (timestamp: string) => {
    const start = new Date(timestamp).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / 60000);
  };

  const getPrepProgress = (item: any) => {
    const elapsed = getTimeElapsed(item.created_at || item.order_time);
    const target = item.preparation_time_minutes || 15;
    return Math.min(100, (elapsed / target) * 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-background overflow-hidden p-6 gap-6">
      {/* Station Toolbar */}
      <div className="flex items-center justify-between shrink-0 bg-card p-4 rounded-[2rem] border border-border shadow-soft">
         <div className="flex items-center gap-6">
            <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
               Prep Console 
               <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
            </h1>
            <div className="flex gap-2 bg-secondary/50 p-1 rounded-2xl">
               <Button 
                variant={selectedStationId === 'all' ? 'default' : 'ghost'} 
                className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                onClick={() => setSelectedStationId('all')}
               >
                 ALL STATIONS
               </Button>
               {stations.map(s => (
                 <Button 
                  key={s.id}
                  variant={selectedStationId === s.id ? 'default' : 'ghost'} 
                  className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => setSelectedStationId(s.id)}
                 >
                   {s.name}
                 </Button>
               ))}
            </div>
         </div>
         <Button variant="ghost" className="rounded-xl h-12 w-12 p-0" onClick={fetchOrders}>
            <RefreshCcw className="h-5 w-5 text-slate-400" />
         </Button>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-x-auto no-scrollbar">
         <div className="flex gap-6 h-full items-start min-w-max">
            <AnimatePresence>
               {orders.filter(o => {
                 if (selectedStationId === 'all') return true;
                 return o.items.some((i: any) => i.station_id === selectedStationId);
               }).map((order) => (
                 <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={order.id}
                  className="w-[28rem] h-full flex flex-col bg-card border border-border rounded-[2.5rem] shadow-soft overflow-hidden"
                 >
                    {/* Header */}
                    <div className={cn(
                      "p-6 flex flex-col gap-4 border-b border-border",
                      getTimeElapsed(order.created_at) > 15 ? "bg-red-500/5" : "bg-primary/5"
                    )}>
                       <div className="flex justify-between items-start">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ticket</span>
                             <h2 className="text-4xl font-black tracking-tighter text-foreground leading-none mt-1">#{order.order_number}</h2>
                          </div>
                          <Badge className="bg-foreground text-background font-black uppercase tracking-widest text-[10px] px-3 py-1">
                             {order.order_type.replace('_', ' ')}
                          </Badge>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-widest border",
                            getTimeElapsed(order.created_at) > 15 ? "bg-red-500 text-white border-red-500" : "bg-secondary text-slate-600 border-border"
                          )}>
                             <Timer className="h-3.5 w-3.5" />
                             {getTimeElapsed(order.created_at)} MINS AGO
                          </div>
                          {order.table_name && (
                            <div className="bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-widest">
                               TABLE {order.table_name}
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-secondary/10">
                       {order.items
                        .filter((item: any) => selectedStationId === 'all' || item.station_id === selectedStationId)
                        .map((item: any) => (
                         <div 
                          key={item.id}
                          className={cn(
                            "bg-card p-5 rounded-[1.5rem] border border-border shadow-sm relative group",
                            item.status === 'ready' && "opacity-40 grayscale"
                          )}
                         >
                            <div className="flex justify-between items-start mb-4">
                               <div className="flex gap-4">
                                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-xl">
                                     {item.quantity}
                                  </div>
                                  <div>
                                     <h3 className="font-black text-lg text-foreground uppercase tracking-tight leading-tight">{item.menu_item_name}</h3>
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {item.notes && <Badge variant="destructive" className="h-5 text-[9px] font-black uppercase tracking-widest"><AlertCircle className="h-3 w-3 mr-1" /> {item.notes}</Badge>}
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-5 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary p-0"
                                          onClick={() => setRecipeItem(item)}
                                        >
                                          <BookOpen className="h-3 w-3 mr-1" /> View Recipe
                                        </Button>
                                     </div>
                                  </div>
                               </div>
                               <Button 
                                onClick={() => updateItemStatus(order.id, item.id, item.status)}
                                className={cn(
                                  "h-12 w-12 rounded-xl p-0 shadow-lg transition-all",
                                  item.status === 'pending' ? "bg-primary hover:bg-primary/90 text-white" :
                                  item.status === 'preparing' ? "bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse" :
                                  "bg-secondary text-slate-300 pointer-events-none shadow-none"
                                )}
                               >
                                  {item.status === 'pending' && <Flame className="h-6 w-6" />}
                                  {item.status === 'preparing' && <CheckCircle2 className="h-6 w-6" />}
                                  {item.status === 'ready' && <Zap className="h-6 w-6" />}
                               </Button>
                            </div>
                            
                            {/* Prep Progress Bar */}
                            {item.status !== 'ready' && (
                              <div className="space-y-1.5 mt-2">
                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                                  <span>Time Pressure</span>
                                  <span>{getPrepProgress(item).toFixed(0)}%</span>
                                </div>
                                <Progress value={getPrepProgress(item)} className="h-1 bg-secondary" />
                              </div>
                            )}
                         </div>
                       ))}
                    </div>

                    {/* Quick Footer */}
                    <div className="p-4 bg-card border-t border-border flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {order.items.length} items</span>
                       <Button 
                        variant="outline" 
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4 border-border hover:bg-emerald-500 hover:text-white transition-all"
                        onClick={async () => {
                          const pending = order.items.filter((i: any) => i.status !== 'ready');
                          for(const i of pending) await updateItemStatus(order.id, i.id, i.status);
                        }}
                       >
                         Bump Ticket
                       </Button>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Recipe Drawer (Simulated as Dialog for now) */}
      <Dialog open={!!recipeItem} onOpenChange={() => setRecipeItem(null)}>
         <DialogContent className="max-w-2xl rounded-[3rem] p-10 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-6 flex items-center gap-4 text-foreground">
                  <Utensils className="h-8 w-8 text-primary" /> {recipeItem?.menu_item_name}
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-8">
               <div className="p-6 bg-secondary/50 rounded-[2rem] border border-border">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Prep Instructions</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">
                     Cook at high flame for 5 minutes. Add secret sauce at 3 minute mark. Ensure garnish is fresh before serving.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                     <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-2">Ingredients</h4>
                     <ul className="space-y-1 text-sm font-bold text-slate-600">
                        <li>• Main Protein (150g)</li>
                        <li>• Base Veggies (50g)</li>
                        <li>• Chef Sauce (30ml)</li>
                     </ul>
                  </div>
                  <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                     <h4 className="font-black text-[10px] uppercase tracking-widest text-amber-600 mb-2">Allergens</h4>
                     <div className="flex gap-2">
                        <Badge variant="outline" className="text-amber-600 border-amber-600/30">Nuts</Badge>
                        <Badge variant="outline" className="text-amber-600 border-amber-600/30">Dairy</Badge>
                     </div>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
