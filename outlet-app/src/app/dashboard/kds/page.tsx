'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Timer, 
  AlertCircle,
  Info
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';
import { useTables } from '@/hooks/useSettings';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function KDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const { socket, isConnected } = useSocket('kitchen');
  const { toast } = useToast();
  const { data: tables } = useTables();

  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on('order:new', (newOrder: any) => {
        setOrders(prev => [newOrder, ...prev]);
        
        // Play notification sound
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.warn('Sound play blocked by browser', e));
        } catch (e) {}

        toast({ 
          title: "🔥 NEW ORDER", 
          description: `Order #${newOrder.order_number} for ${newOrder.table_id ? 'Table ' + newOrder.table_id : 'Takeaway'}`,
          className: "bg-indigo-600 text-white border-none font-bold"
        });
      });

      socket.on('order:update', (updatedOrder: any) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      });
    }

    return () => {
      if (socket) {
        socket.off('order:new');
        socket.off('order:update');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders', { params: { status: 'confirmed' } });
      setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const updateItemStatus = async (orderId: string, itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : 
                     currentStatus === 'preparing' ? 'ready' : 'served';
    
    // Optimistic Update
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.map((i: any) => i.id === itemId ? { ...i, status: nextStatus } : i)
        };
      }
      return o;
    }));

    try {
      await api.patch(`/orders/items/${itemId}/status`, { status: nextStatus });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update failed' });
      fetchOrders(); // Revert
    }
  };

  const markAllReady = async (order: any) => {
    const pendingItems = order.items.filter((i: any) => i.status === 'pending' || i.status === 'preparing');
    if (pendingItems.length === 0) return;

    // Optimistic Update
    setOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          items: o.items.map((i: any) => (i.status === 'pending' || i.status === 'preparing') ? { ...i, status: 'ready' } : i)
        };
      }
      return o;
    }));

    try {
      await Promise.all(pendingItems.map((i: any) => 
        api.patch(`/orders/items/${i.id}/status`, { status: 'ready' })
      ));
      toast({ title: 'Ticket Marked Ready', className: "bg-emerald-600 text-white border-none" });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Bulk update failed' });
      fetchOrders(); // Revert
    }
  };

  const getTimeDiff = (timestamp: string) => {
    const start = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diff;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] bg-background overflow-hidden font-sans pb-4">
      {/* Header - Minimal & Editorial */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
            KITCHEN
            <div className={cn(
              "h-3 w-3 md:h-4 md:w-4 rounded-full shadow-lg transition-all duration-500",
              isConnected ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
            )} />
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">Culinary Command Center</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
           <div className="flex bg-card p-1.5 rounded-2xl border border-border shadow-soft">
              {['all', 'kitchen', 'bar', 'grill', 'dessert'].map((station) => (
                <button
                  key={station}
                  onClick={() => setSelectedStation(station)}
                  className={cn(
                    "px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all",
                    selectedStation === station 
                      ? "bg-primary text-primary-foreground shadow-glow-sm" 
                      : "text-slate-500 hover:text-primary hover:bg-secondary"
                  )}
                >
                  {station}
                </button>
              ))}
           </div>
           <div className="flex flex-col items-end bg-card p-4 px-6 rounded-3xl border border-border shadow-soft">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Tickets</span>
              <span className="text-3xl font-black text-primary leading-none mt-1">{orders.length}</span>
           </div>
        </div>
      </div>

      {/* Kanban Board - Horizontal Scroll */}
      <div className="flex-1 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
        <div className="flex gap-8 h-full min-w-max items-start">
          <AnimatePresence>
            {orders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-slate-400"
              >
                <div className="w-32 h-32 mb-8 relative">
                   <div className="absolute inset-0 bg-secondary rounded-full rotate-6" />
                   <div className="absolute inset-0 bg-card border border-border rounded-full flex items-center justify-center shadow-sm">
                      <ChefHat className="h-14 w-14 text-slate-300" />
                   </div>
                </div>
                <p className="text-3xl font-black tracking-tighter text-foreground uppercase">All Clear</p>
                <p className="text-slate-500 font-medium mt-2 text-lg">No active orders awaiting prep.</p>
              </motion.div>
            ) : (
              orders
                .filter(order => {
                  if (selectedStation === 'all') return true;
                  return order.items.some((i: any) => i.station === selectedStation);
                })
                .map((order) => {
                  const diffMins = getTimeDiff(order.created_at);
                  const isDelayed = diffMins > 15;
                  const isUrgent = diffMins > 10;
                  const isDineIn = order.order_type === 'dine_in';
                  const allItemsReady = order.items.every((i: any) => i.status === 'ready' || i.status === 'served');

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    key={order.id} 
                    className="w-[26rem] h-full flex flex-col shrink-0"
                  >
                    <div className={cn(
                      "flex-1 flex flex-col rounded-3xl overflow-hidden transition-all duration-300 relative",
                      "bg-card border border-border shadow-soft",
                      isDelayed ? 'ring-2 ring-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : '',
                      allItemsReady ? 'opacity-60 grayscale' : ''
                    )}>
                      {/* Ticket Header */}
                      <div className={cn(
                        "p-6 border-b border-border",
                        isDelayed ? "bg-red-500/10" :
                        isDineIn ? "bg-primary/10" : 
                        "bg-amber-500/10"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                             <div className="flex items-center gap-3 mb-1">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.2em]",
                                  isDelayed ? "text-red-600" : "text-primary"
                                )}>
                                   Order Number
                                </span>
                                {isDelayed && (
                                  <Badge className="bg-red-500 text-white border-none font-black text-[9px] h-5 px-2 animate-bounce shadow-lg shadow-red-500/50 uppercase tracking-widest">
                                    Delayed
                                  </Badge>
                                )}
                             </div>
                             <span className="font-black text-4xl tracking-tighter text-foreground leading-none">
                                #{order.order_number}
                             </span>
                          </div>
                          <div className={cn(
                            "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest",
                            isDineIn ? "bg-primary text-primary-foreground" : "bg-amber-500 text-white"
                          )}>
                             {order.order_type.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border border-border",
                            isDelayed ? "bg-red-500 text-white border-red-500 animate-pulse shadow-glow" : "bg-card text-foreground shadow-sm"
                          )}>
                            <Timer className="h-4 w-4" />
                            <span>{diffMins} mins</span>
                          </div>
                          {order.table_id && (
                            <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
                               <span className="text-[10px] font-black text-slate-400">TABLE</span>
                               <span className="font-black text-foreground text-lg leading-none">
                                 {tables?.find((t: any) => t.id === order.table_id)?.name || order.table_id.substring(0, 4)}
                               </span>
                            </div>
                          )}
                        </div>
                        {!allItemsReady && (
                          <div className="mt-3">
                            <Button 
                              onClick={() => markAllReady(order)}
                              className="w-full h-8 text-[10px] font-black uppercase tracking-widest bg-secondary hover:bg-emerald-500 hover:text-white text-slate-500 transition-colors border-none"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> MARK ALL READY
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Ticket Items */}
                      <div className="flex-1 p-3 overflow-y-auto no-scrollbar bg-secondary/20">
                        <div className="flex flex-col gap-3">
                          {order.items
                            .filter((item: any) => selectedStation === 'all' || item.station === selectedStation)
                            .map((item: any) => {
                            const modifiers = item.modifiers_json ? (typeof item.modifiers_json === 'string' ? JSON.parse(item.modifiers_json) : item.modifiers_json) : {};
                            
                            return (
                            <div 
                              key={item.id} 
                              className={cn(
                                "p-4 rounded-2xl flex flex-col gap-4 transition-all duration-300",
                                item.status === 'ready' ? "bg-secondary opacity-50 border-transparent" : "bg-card border border-border shadow-sm"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                   <div className={cn(
                                     "h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0",
                                     item.status === 'ready' ? "bg-secondary text-slate-500" : "bg-primary/10 text-primary"
                                   )}>
                                      {item.quantity}
                                   </div>
                                   <div className="flex flex-col pt-0.5">
                                     <span className={cn(
                                       "font-black text-[17px] leading-tight",
                                       item.status === 'ready' ? "text-slate-400 line-through decoration-2" : "text-foreground"
                                     )}>
                                       {item.menu_item_name}
                                     </span>
                                     
                                     {/* Modifiers List */}
                                     {Object.keys(modifiers).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {Object.values(modifiers).flat().map((mod: any, idx) => (
                                            <span key={idx} className="text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-md">
                                              {mod.name || mod}
                                            </span>
                                          ))}
                                        </div>
                                     )}

                                     {item.notes && (
                                       <div className="flex items-center gap-1.5 mt-2 text-red-500">
                                          <AlertCircle className="h-4 w-4" />
                                          <span className="text-[11px] font-black uppercase tracking-tighter">{item.notes}</span>
                                       </div>
                                     )}
                                   </div>
                                </div>
                              </div>
                              <div className="pt-2 flex items-center justify-between border-t border-border mt-1">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                                  item.status === 'pending' ? 'bg-secondary text-slate-500 border-border' :
                                  item.status === 'preparing' ? 'bg-primary/10 text-primary border-primary/20' :
                                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                )}>
                                  {item.status}
                                </span>
                                <Button 
                                  size="sm" 
                                  className={cn(
                                    "h-10 px-5 rounded-xl text-xs font-black transition-all border-none",
                                    item.status === 'pending' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-sm' :
                                    item.status === 'preparing' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)]' :
                                    'hidden'
                                  )}
                                  onClick={() => updateItemStatus(order.id, item.id, item.status)}
                                  disabled={item.status === 'ready' || item.status === 'served'}
                                >
                                  {item.status === 'pending' && <><ChefHat className="h-4 w-4 mr-1.5" /> COOK</>}
                                  {item.status === 'preparing' && <><CheckCircle2 className="h-4 w-4 mr-1.5" /> DONE</>}
                                </Button>
                              </div>
                            </div>
                          )})}
                        </div>
                      </div>
                      
                      {/* Ticket Footer (Order Notes) */}
                      {order.notes && (
                        <div className="p-4 bg-red-500/10 text-red-500 border-t border-red-500/20 flex items-start gap-3">
                          <Info className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-bold leading-relaxed">{order.notes}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

