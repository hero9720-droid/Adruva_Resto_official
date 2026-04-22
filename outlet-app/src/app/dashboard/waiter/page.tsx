'use client';

import { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Utensils, 
  Table as TableIcon,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMenuItems, useCategories } from '@/hooks/useMenu';
import { useTables } from '@/hooks/useSettings';
import { useActiveOrderForTable } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaiterAppPage() {
  const [step, setStep] = useState<'table' | 'menu' | 'cart'>('table');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: tables } = useTables();
  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems(selectedCategory === 'all' ? undefined : selectedCategory);
  const { data: activeOrder, refetch: refetchOrder } = useActiveOrderForTable(selectedTableId);
  const { toast } = useToast();

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({ title: 'Added', description: item.name, duration: 1000 });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const placeOrder = async () => {
    if (!selectedTableId || cart.length === 0) return;
    try {
      const payload = {
        order_type: 'dine_in',
        table_id: selectedTableId,
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          unit_price_paise: i.base_price_paise,
          modifiers_json: []
        }))
      };

      if (activeOrder) {
        await api.post(`/orders/${activeOrder.id}/items`, { items: payload.items });
      } else {
        await api.post('/orders', payload);
      }

      toast({ title: 'KOT Sent', description: 'Order sent to kitchen.' });
      setCart([]);
      setStep('table');
      setSelectedTableId(null);
      refetchOrder();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Order failed' });
    }
  };

  const filteredItems = menuItems?.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 -m-8 relative overflow-hidden font-sans">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-100 p-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'table' && (
              <button onClick={() => setStep(step === 'menu' ? 'table' : 'menu')} className="p-2 -ml-2 text-slate-400 hover:text-indigo-600">
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              {step === 'table' ? 'Select Table' : step === 'menu' ? 'Take Order' : 'Cart'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-indigo-600 text-white border-none font-black px-3 py-1 text-[10px] tracking-widest">WAITER APP</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {step === 'table' && (
          <div className="grid grid-cols-2 gap-4">
            {tables?.map((table: any) => (
              <button
                key={table.id}
                onClick={() => { setSelectedTableId(table.id); setStep('menu'); }}
                className={cn(
                  "h-32 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                  table.status === 'occupied' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-400"
                )}
              >
                <TableIcon className={cn("h-8 w-8", table.status === 'occupied' ? "text-indigo-600" : "text-slate-300")} />
                <span className="font-black text-xl tracking-tighter uppercase">{table.name}</span>
                {table.status === 'occupied' && (
                   <span className="text-[10px] font-black uppercase opacity-60">Occupied</span>
                )}
              </button>
            ))}
          </div>
        )}

        {step === 'menu' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
               <Badge 
                 onClick={() => setSelectedCategory('all')}
                 className={cn("px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none", selectedCategory === 'all' ? "bg-indigo-600 text-white shadow-glow" : "bg-white text-slate-500 shadow-sm")}
               >
                 All
               </Badge>
               {categories?.map((cat: any) => (
                 <Badge 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={cn("px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer whitespace-nowrap border-none", selectedCategory === cat.id ? "bg-indigo-600 text-white shadow-glow" : "bg-white text-slate-500 shadow-sm")}
                 >
                   {cat.name}
                 </Badge>
               ))}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search items..." 
                className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredItems?.map((item: any) => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                       <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 leading-tight">{item.name}</span>
                      <span className="text-sm font-bold text-slate-400">₹{item.base_price_paise / 100}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'cart' && (
          <div className="space-y-6">
            {cart.length === 0 ? (
               <div className="py-20 text-center">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Utensils className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Cart is empty</p>
               </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
                    <div className="flex-1">
                       <h4 className="font-black text-slate-900 text-lg leading-tight mb-3">{item.name}</h4>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                             <button onClick={() => updateQty(item.id, -1)} className="p-2.5 hover:bg-slate-100"><Minus className="h-4 w-4" /></button>
                             <span className="w-8 text-center font-black text-slate-900">{item.quantity}</span>
                             <button onClick={() => updateQty(item.id, 1)} className="p-2.5 hover:bg-slate-100"><Plus className="h-4 w-4" /></button>
                          </div>
                          <span className="font-bold text-slate-400">@ ₹{item.base_price_paise / 100}</span>
                       </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                       <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="p-6 bg-white border-t border-slate-100 shrink-0">
        {step === 'menu' && (
          <div className="flex gap-4">
             <Button 
               variant="outline"
               className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-slate-600"
               onClick={() => setStep('cart')}
             >
               VIEW CART ({cart.length})
             </Button>
             <Button 
               className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white font-black shadow-glow border-none uppercase tracking-widest"
               disabled={cart.length === 0}
               onClick={() => setStep('cart')}
             >
               NEXT <ChevronRight className="h-5 w-5 ml-1" />
             </Button>
          </div>
        )}

        {step === 'cart' && (
           <Button 
             className="w-full h-16 rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl shadow-[0_8px_32px_rgba(16,185,129,0.3)] border-none uppercase tracking-tighter"
             onClick={placeOrder}
             disabled={cart.length === 0}
           >
             <ChefHat className="h-6 w-6 mr-2" /> SEND TO KITCHEN
           </Button>
        )}
      </div>
    </div>
  );
}
