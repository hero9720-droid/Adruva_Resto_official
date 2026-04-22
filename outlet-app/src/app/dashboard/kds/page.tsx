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
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            KITCHEN
            <div className={cn(
              "h-4 w-4 rounded-full shadow-lg transition-all duration-500",
              isConnected ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
            )} />
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Culinary Command Center</p>
        </div>
        
        <div className="flex items-center gap-8 bg-white p-4 px-6 rounded-3xl border border-slate-100 shadow-soft">
           <div className="flex flex-col items-end">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Tickets</span>
              <span className="text-3xl font-black text-indigo-600 leading-none mt-1">{orders.length}</span>
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
                   <div className="absolute inset-0 bg-slate-100 rounded-full rotate-6" />
                   <div className="absolute inset-0 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <ChefHat className="h-14 w-14 text-slate-300" />
                   </div>
                </div>
                <p className="text-3xl font-black tracking-tighter text-slate-900">ALL CLEAR</p>
                <p className="text-slate-500 font-medium mt-2 text-lg">No active orders awaiting prep.</p>
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
                      "flex-1 flex flex-col rounded-3xl overflow-hidden transition-all duration-300 relative",
                      "bg-white border border-slate-100 shadow-soft",
                      isDelayed ? 'ring-2 ring-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : '',
                      allItemsReady ? 'opacity-60 grayscale' : ''
                    )}>
                      {/* Ticket Header */}
                      <div className={cn(
                        "p-6 border-b border-slate-100/50",
                        isDelayed ? "bg-red-50" :
                        isDineIn ? "bg-indigo-50/50" : 
                        "bg-amber-50/50"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
                               isDelayed ? "text-red-600" : "text-indigo-600"
                             )}>
                               Order Number
                             </span>
                             <span className="font-black text-4xl tracking-tighter text-slate-900 leading-none">
                               #{order.order_number}
                             </span>
                          </div>
                          <div className={cn(
                            "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest",
                            isDineIn ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                          )}>
                             {order.order_type.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border border-slate-200/50",
                            isDelayed ? "bg-red-500 text-white border-red-500 animate-pulse shadow-glow" : "bg-white text-slate-700 shadow-sm"
                          )}>
                            <Timer className="h-4 w-4" />
                            <span>{diffMins} mins</span>
                          </div>
                          {order.table_id && (
                            <div className="flex items-center gap-2 bg-white border border-slate-200/50 px-4 py-2 rounded-xl shadow-sm">
                               <span className="text-[10px] font-black text-slate-400">TABLE</span>
                               <span className="font-black text-slate-900 text-lg leading-none">{order.table_id}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Ticket Items */}
                      <div className="flex-1 p-3 overflow-y-auto no-scrollbar bg-slate-50/30">
                        <div className="flex flex-col gap-3">
                          {order.items.map((item: any) => {
                            const modifiers = item.modifiers_json ? (typeof item.modifiers_json === 'string' ? JSON.parse(item.modifiers_json) : item.modifiers_json) : {};
                            
                            return (
                            <div 
                              key={item.id} 
                              className={cn(
                                "p-4 rounded-2xl flex flex-col gap-4 transition-all duration-300",
                                item.status === 'ready' ? "bg-slate-50 opacity-50 border-transparent" : "bg-white border border-slate-200 shadow-sm"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                   <div className={cn(
                                     "h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0",
                                     item.status === 'ready' ? "bg-slate-200 text-slate-500" : "bg-indigo-100 text-indigo-700"
                                   )}>
                                      {item.quantity}
                                   </div>
                                   <div className="flex flex-col pt-0.5">
                                     <span className={cn(
                                       "font-black text-[17px] leading-tight",
                                       item.status === 'ready' ? "text-slate-400 line-through decoration-2" : "text-slate-900"
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
                              
                              <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-1">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                                  item.status === 'pending' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                  item.status === 'preparing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                                )}>
                                  {item.status}
                                </span>
                                <Button 
                                  size="sm" 
                                  className={cn(
                                    "h-10 px-5 rounded-xl text-xs font-black transition-all border-none",
                                    item.status === 'pending' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow' :
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
                        <div className="p-4 bg-red-50 text-red-600 border-t border-red-100 flex items-start gap-3">
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

