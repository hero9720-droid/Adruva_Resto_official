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
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function KDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { socket, isConnected } = useSocket('kitchen');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on('order:new', (newOrder: any) => {
        setOrders(prev => [newOrder, ...prev]);
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
    
    try {
      await api.patch(`/orders/items/${itemId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            items: o.items.map((i: any) => i.id === itemId ? { ...i, status: nextStatus } : i)
          };
        }
        return o;
      }));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const getTimeDiff = (timestamp: string) => {
    const start = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diff;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background -m-8 p-8 overflow-hidden font-sans">
      {/* Header - Minimal & Editorial */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
            KITCHEN
            <div className={cn(
              "h-4 w-4 rounded-full shadow-lg transition-all duration-500",
              isConnected ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"
            )} />
          </h1>
          <p className="text-muted-foreground font-medium text-lg mt-1">Culinary Command Center</p>
        </div>
        
        <div className="flex items-center gap-8 bg-card p-4 rounded-3xl border border-border/10 shadow-none">
           <div className="flex flex-col items-end">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Tickets</span>
              <span className="text-3xl font-black text-primary">{orders.length}</span>
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
                className="w-full h-full flex flex-col items-center justify-center text-muted-foreground"
              >
                <div className="p-12 bg-card rounded-full mb-6 border border-border/10 shadow-none">
                   <ChefHat className="h-24 w-24 opacity-30 text-muted-foreground" />
                </div>
                <p className="text-3xl font-black text-muted-foreground">ALL CLEAR</p>
                <p className="text-muted-foreground/60 font-medium mt-2 text-lg">No active orders awaiting prep.</p>
              </motion.div>
            ) : (
              orders.map((order) => {
                const diffMins = getTimeDiff(order.created_at);
                const isDelayed = diffMins > 15;
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
                      "flex-1 flex flex-col rounded-[2rem] overflow-hidden transition-all duration-300 backdrop-blur-3xl",
                      "bg-card/90 border border-border/10 shadow-none",
                      isDelayed ? 'ring-2 ring-destructive/40 shadow-lg shadow-destructive/10' : '',
                      allItemsReady ? 'opacity-50 grayscale' : ''
                    )}>
                      {/* Ticket Header */}
                      <div className={cn(
                        "p-6 border-b border-border/10",
                        isDelayed ? "bg-gradient-to-br from-destructive/20 to-card" :
                        isDineIn ? "bg-gradient-to-br from-secondary/50 to-card" : 
                        "bg-gradient-to-br from-tertiary/20 to-card"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                             <span className={cn(
                               "text-[11px] font-black uppercase tracking-[0.2em]",
                               isDelayed ? "text-destructive" : "text-primary"
                             )}>
                               Order Number
                             </span>
                             <span className="font-black text-4xl tracking-tighter text-foreground">
                               #{order.order_number}
                             </span>
                          </div>
                          <div className={cn(
                            "px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest",
                            isDineIn ? "bg-primary/20 text-primary-foreground" : "bg-tertiary/20 text-tertiary-foreground"
                          )}>
                             {order.order_type.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-2xl border border-border/10",
                            isDelayed ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-background text-foreground"
                          )}>
                            <Timer className="h-5 w-5" />
                            <span>{diffMins} mins</span>
                          </div>
                          {order.table_id && (
                            <div className="flex items-center gap-2 bg-background border border-border/10 px-4 py-2 rounded-2xl">
                               <span className="text-[11px] font-black text-muted-foreground">TABLE</span>
                               <span className="font-black text-foreground text-lg leading-none">{order.table_id}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Ticket Items */}
                      <div className="flex-1 p-2 overflow-y-auto no-scrollbar">
                        <div className="flex flex-col gap-2">
                          {order.items.map((item: any) => {
                            const modifiers = item.modifiers_json ? (typeof item.modifiers_json === 'string' ? JSON.parse(item.modifiers_json) : item.modifiers_json) : {};
                            
                            return (
                            <div 
                              key={item.id} 
                              className={cn(
                                "p-4 rounded-[1.5rem] flex flex-col gap-4 transition-all duration-300 border",
                                item.status === 'ready' ? "bg-background opacity-60 border-transparent" : "bg-card hover:bg-secondary border-border/10 shadow-none"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                   <div className={cn(
                                     "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border border-border/10",
                                     item.status === 'ready' ? "bg-background text-muted-foreground" : "bg-primary/20 text-primary-foreground"
                                   )}>
                                      {item.quantity}
                                   </div>
                                   <div className="flex flex-col pt-1">
                                     <span className={cn(
                                       "font-black text-xl leading-tight",
                                       item.status === 'ready' ? "text-muted-foreground line-through decoration-2" : "text-foreground"
                                     )}>
                                       {item.menu_item_name}
                                     </span>
                                     
                                     {/* Modifiers List */}
                                     {Object.keys(modifiers).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {Object.values(modifiers).flat().map((mod: any, idx) => (
                                            <span key={idx} className="text-xs font-bold bg-tertiary/20 text-tertiary-foreground border border-tertiary/10 px-2 py-1 rounded-lg">
                                              {mod.name}
                                            </span>
                                          ))}
                                        </div>
                                     )}

                                     {item.notes && (
                                       <div className="flex items-center gap-1.5 mt-2 text-destructive">
                                          <AlertCircle className="h-4 w-4" />
                                          <span className="text-xs font-black uppercase italic tracking-tighter">{item.notes}</span>
                                       </div>
                                     )}
                                   </div>
                                </div>
                              </div>
                              
                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-background border border-border/10 px-3 py-1.5 rounded-lg">
                                  {item.status}
                                </span>
                                <Button 
                                  size="sm" 
                                  className={cn(
                                    "h-12 px-6 rounded-2xl text-sm font-black transition-all border-none",
                                    item.status === 'pending' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_32px_rgba(79,70,229,0.2)]' :
                                    item.status === 'preparing' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-[0_8px_32px_rgba(var(--destructive),0.2)]' :
                                    'hidden'
                                  )}
                                  onClick={() => updateItemStatus(order.id, item.id, item.status)}
                                  disabled={item.status === 'ready' || item.status === 'served'}
                                >
                                  {item.status === 'pending' && <><ChefHat className="h-5 w-5 mr-2" /> COOK</>}
                                  {item.status === 'preparing' && <><CheckCircle2 className="h-5 w-5 mr-2" /> DONE</>}
                                </Button>
                              </div>
                            </div>
                          )})}
                        </div>
                      </div>
                      
                      {/* Ticket Footer (Order Notes) */}
                      {order.notes && (
                        <div className="p-5 bg-destructive/20 text-destructive-foreground border-t border-destructive/20 flex items-start gap-3 rounded-b-[2rem]">
                          <Info className="h-5 w-5 shrink-0 mt-0.5" />
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

