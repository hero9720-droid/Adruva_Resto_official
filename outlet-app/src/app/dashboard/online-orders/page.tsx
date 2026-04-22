'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Package,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { socket } = useSocket('billing');
  const { toast } = useToast();

  useEffect(() => {
    fetchOnlineOrders();

    if (socket) {
      socket.on('order:new', (newOrder: any) => {
        if (newOrder.source !== 'pos') {
          setOrders(prev => [newOrder, ...prev]);
          toast({ 
            title: "🌐 NEW ONLINE ORDER", 
            description: `Order #${newOrder.order_number} from ${newOrder.source.toUpperCase()}`,
            className: "bg-emerald-600 text-white border-none font-bold"
          });
        }
      });
    }

    return () => {
      if (socket) socket.off('order:new');
    };
  }, [socket]);

  const fetchOnlineOrders = async () => {
    try {
      const { data } = await api.get('/orders', { params: { source: 'qr' } }); // Currently focusing on QR
      const { data: onlineData } = await api.get('/orders', { params: { source: 'online' } });
      setOrders([...data.data, ...onlineData.data]);
    } catch (error) {
      console.error('Failed to fetch online orders', error);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast({ title: `Order ${status}`, description: `Order #${orders.find(o=>o.id===orderId).order_number} has been ${status}.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background -m-8 p-8 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            ONLINE INBOX
            <div className="h-4 w-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">External & QR Order Queue</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
             <Button variant="ghost" className="rounded-xl px-6 font-black text-xs uppercase bg-white shadow-sm">All Orders</Button>
             <Button variant="ghost" className="rounded-xl px-6 font-black text-xs uppercase text-slate-500">QR Only</Button>
             <Button variant="ghost" className="rounded-xl px-6 font-black text-xs uppercase text-slate-500">Aggregators</Button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {orders.length === 0 ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-400">
                 <div className="h-24 w-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                    <Globe className="h-10 w-10 text-slate-300" />
                 </div>
                 <p className="text-xl font-black text-slate-900">NO PENDING ORDERS</p>
                 <p className="text-slate-500 font-medium mt-1">New online orders will appear here in real-time.</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden hover:shadow-xl transition-all duration-500 group"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                          order.source === 'qr' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {order.source === 'qr' ? <Smartphone className="h-7 w-7" /> : <Globe className="h-7 w-7" />}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">#{order.order_number}</h3>
                          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">{order.source} • {new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] border-none",
                        order.status === 'confirmed' ? "bg-blue-100 text-blue-700" : 
                        order.status === 'preparing' ? "bg-amber-100 text-amber-700" : 
                        "bg-slate-100 text-slate-700"
                      )}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="space-y-4 mb-8">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 bg-white rounded-lg flex items-center justify-center font-black text-indigo-600 border border-slate-100 shadow-sm">{item.quantity}</span>
                            <span className="font-bold text-slate-900">{item.menu_item_name}</span>
                          </div>
                          <span className="font-black text-slate-900">₹{(item.total_paise / 100).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      {order.status === 'confirmed' ? (
                        <div className="flex gap-4 w-full">
                           <Button 
                             className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800"
                             onClick={() => updateStatus(order.id, 'preparing')}
                           >
                             ACCEPT ORDER
                           </Button>
                           <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 text-red-500 hover:bg-red-50">
                             <XCircle className="h-6 w-6" />
                           </Button>
                        </div>
                      ) : (
                        <Button className="w-full h-14 rounded-2xl bg-slate-100 text-slate-400 font-black uppercase tracking-widest cursor-default border-none">
                           In Progress
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
