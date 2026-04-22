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
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background -m-8 relative overflow-hidden font-sans">
      {/* Dynamic Header */}
      <div className="bg-card border-b border-border p-6 shrink-0 shadow-soft z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'table' && (
              <button onClick={() => setStep(step === 'menu' ? 'table' : 'menu')} className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase">
              {step === 'table' ? 'Select Table' : step === 'menu' ? 'Take Order' : 'Cart'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-primary text-primary-foreground border-none font-black px-3 py-1 text-[10px] tracking-widest uppercase shadow-glow-sm">Waiter App</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
         {step === 'table' && (
          <div className="grid grid-cols-2 gap-6">
            {tables?.map((table: any) => (
              <button
                key={table.id}
                onClick={() => { setSelectedTableId(table.id); setStep('menu'); }}
                className={cn(
                  "h-40 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 shadow-soft",
                  table.status === 'occupied' ? "bg-primary/10 border-primary/20 text-primary" : "bg-card border-border text-slate-400 hover:border-primary/40 hover:bg-secondary/50"
                )}
              >
                <TableIcon className={cn("h-10 w-10", table.status === 'occupied' ? "text-primary" : "text-slate-300")} />
                <span className="font-black text-2xl tracking-tighter uppercase">{table.name}</span>
                {table.status === 'occupied' && (
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Occupied</span>
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
                 className={cn("px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none shadow-sm transition-all", selectedCategory === 'all' ? "bg-primary text-primary-foreground shadow-glow-sm" : "bg-card text-slate-500 hover:bg-secondary")}
               >
                 All
               </Badge>
               {categories?.map((cat: any) => (
                 <Badge 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={cn("px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer whitespace-nowrap border-none shadow-sm transition-all", selectedCategory === cat.id ? "bg-primary text-primary-foreground shadow-glow-sm" : "bg-card text-slate-500 hover:bg-secondary")}
                 >
                   {cat.name}
                 </Badge>
               ))}
            </div>

             <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search items..." 
                className="pl-12 h-14 rounded-2xl border-none shadow-soft bg-card font-black text-foreground uppercase tracking-tighter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

             <div className="grid grid-cols-1 gap-4 pb-24">
              {filteredItems?.map((item: any) => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="bg-card p-5 rounded-[2rem] shadow-soft border border-border flex items-center justify-between active:scale-[0.98] transition-all hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border">
                       <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-foreground text-lg leading-tight tracking-tighter uppercase">{item.name}</span>
                      <span className="text-sm font-black text-primary mt-1 uppercase tracking-widest">₹{item.base_price_paise / 100}</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Plus className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'cart' && (
          <div className="space-y-6 pb-24">
            {cart.length === 0 ? (
               <div className="py-20 text-center">
                  <div className="h-24 w-24 bg-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-border">
                     <Utensils className="h-10 w-10 text-primary/40" />
                  </div>
                  <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Cart is empty</p>
               </div>
            ) : (
               <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-card p-6 rounded-[2.5rem] shadow-soft border border-border flex justify-between items-center transition-all">
                    <div className="flex-1">
                       <h4 className="font-black text-foreground text-xl tracking-tighter uppercase leading-tight mb-4">{item.name}</h4>
                       <div className="flex items-center gap-6">
                          <div className="flex items-center bg-secondary rounded-2xl overflow-hidden border border-border shadow-inner">
                             <button onClick={() => updateQty(item.id, -1)} className="p-3.5 hover:bg-primary/10 text-primary transition-colors"><Minus className="h-4 w-4" /></button>
                             <span className="w-10 text-center font-black text-foreground text-lg">{item.quantity}</span>
                             <button onClick={() => updateQty(item.id, 1)} className="p-3.5 hover:bg-primary/10 text-primary transition-colors"><Plus className="h-4 w-4" /></button>
                          </div>
                          <span className="font-black text-primary uppercase tracking-widest text-sm">@ ₹{item.base_price_paise / 100}</span>
                       </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-glow-sm">
                       <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="p-6 bg-card border-t border-border shrink-0 shadow-soft z-20">
        {step === 'menu' && (
          <div className="flex gap-4">
             <Button 
               variant="outline"
               className="flex-1 h-14 rounded-2xl border-border font-black text-slate-500 uppercase tracking-widest text-[10px] hover:bg-secondary"
               onClick={() => setStep('cart')}
             >
               VIEW CART ({cart.length})
             </Button>
             <Button 
               className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 border-none uppercase tracking-widest text-xs"
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
