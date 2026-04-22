'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Table as TableIcon, 
  User, 
  Plus, 
  Minus, 
  Trash2,
  ChevronRight,
  Utensils,
  Check,
  Leaf,
  Flame,
  Info,
  Clock as ClockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMenuItems, useCategories } from '@/hooks/useMenu';
import { useTables } from '@/hooks/useSettings';
import { useActiveOrderForTable } from '@/hooks/useOrders';
import { useGenerateBill } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentModal from '@/components/pos/PaymentModal';
import { printer } from '@/lib/printer';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Printer as PrinterIcon, WifiOff } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CartItem {
  cart_id: string; 
  id: string; 
  name: string;
  price: number;
  quantity: number;
  modifiers: Record<string, string[]>;
  notes: string;
}

export default function POSPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);
  
  const [selectedItemForMod, setSelectedItemForMod] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [itemModifiers, setItemModifiers] = useState<Record<string, any[]>>({});
  const [itemNotes, setItemNotes] = useState('');

  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems(selectedCategory === 'all' ? undefined : selectedCategory);
  const { data: tables } = useTables();
  const { data: activeOrder, isLoading: isLoadingOrder, refetch: refetchOrder } = useActiveOrderForTable(selectedTableId);
  const generateBill = useGenerateBill();
  const { toast } = useToast();

  const handleItemClick = (item: any) => {
    const hasVariants = item.variants && item.variants.length > 0;
    const hasModifiers = item.modifier_groups && item.modifier_groups.length > 0;
    if (!hasVariants && !hasModifiers) {
      addToCartDirect(item, null, {}, '');
      return;
    }
    setSelectedItemForMod(item);
    setSelectedVariant(hasVariants ? (item.variants.find((v:any) => v.is_default) || item.variants[0]) : null);
    setItemModifiers({});
    setItemNotes('');
  };

  const addToCartDirect = (item: any, variant: any, mods: Record<string, any[]>, notes: string) => {
    const basePrice = variant ? variant.price_paise : item.base_price_paise;
    const modsPrice = Object.values(mods).flat().reduce((sum, mod) => sum + (mod.extra_price_paise || 0), 0);
    const finalPrice = basePrice + modsPrice;
    
    setCart(prev => {
      const existing = prev.find(i => 
        i.id === item.id && 
        JSON.stringify(i.modifiers) === JSON.stringify(mods) &&
        i.notes === notes
      );
      if (existing) {
        return prev.map(i => i.cart_id === existing.cart_id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        cart_id: Math.random().toString(36).substr(2, 9),
        id: item.id, 
        name: variant ? `${item.name} (${variant.name})` : item.name, 
        price: finalPrice, 
        quantity: 1,
        modifiers: mods,
        notes: notes
      }];
    });
  };

  const confirmAddToCart = () => {
    if (!selectedItemForMod) return;
    addToCartDirect(selectedItemForMod, selectedVariant, itemModifiers, itemNotes);
    setSelectedItemForMod(null);
  };

  const removeFromCart = (cart_id: string) => {
    setCart(prev => prev.filter(i => i.cart_id !== cart_id));
  };

  const updateQuantity = (cart_id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.cart_id === cart_id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const { isOnline, queueOrder } = useOfflineSync();

  const placeOrder = async () => {
    if (cart.length === 0 || !selectedTableId) return;

    const orderPayload = {
      order_type: 'dine_in',
      table_id: selectedTableId,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price_paise: item.price,
        modifiers_json: item.modifiers,
        notes: item.notes,
        name: item.name // For printing
      }))
    };

    try {
      if (!isOnline) {
        queueOrder(orderPayload);
        toast({ title: "Offline Order Saved", description: "Order queued and will sync when online." });
      } else {
        if (activeOrder) {
          await api.post(`/orders/${activeOrder.id}/items`, { items: orderPayload.items });
          toast({ title: "Order Updated", description: "Items added to ticket." });
        } else {
          await api.post('/orders', orderPayload);
          toast({ title: "Order Confirmed", description: "Sent to Kitchen." });
        }
      }

      // Hardware Printing (KOT)
      try {
        const table = tables?.find((t:any) => t.id === selectedTableId);
        await printer.printKOT({
          order_number: activeOrder?.order_number || 'NEW',
          table_name: table?.name || 'N/A',
          items: orderPayload.items
        });
        toast({ title: "KOT Printed", description: "Thermal printer successful." });
      } catch (printErr) {
        console.error('Print failed:', printErr);
        toast({ variant: "destructive", title: "Printer Error", description: "Connect printer via 'Print' button." });
      }

      setCart([]);
      refetchOrder();
    } catch (error) {
      toast({ variant: "destructive", title: "Order failed" });
    }
  };

  const handleCheckout = async () => {
    if (!activeOrder) return;
    try {
      const bill = await generateBill.mutateAsync({ order_id: activeOrder.id });
      setCurrentBill(bill);
      setIsPaymentOpen(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Checkout failed" });
    }
  };

  const filteredItems = menuItems?.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [tableViewMode, setTableViewMode] = useState<'list' | 'map'>('list');

  const renderCartPanel = () => (
    <div className="flex flex-col h-full bg-card relative">
      <div className="p-8 pb-6 bg-card border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-secondary rounded-xl text-primary">
               <ShoppingCart className="h-6 w-6" />
            </div>
            Current Order
          </h2>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-1 flex items-center gap-1">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-xl border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              onClick={() => printer.connect()}
              title="Connect Printer"
            >
               <PrinterIcon className="h-5 w-5" />
            </Button>
            <Badge className="bg-secondary text-foreground hover:bg-secondary/80 text-[11px] font-black px-3 py-1 rounded-lg border-none">
              {activeOrder ? activeOrder.items.length : cart.length} ITEMS
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar bg-background/30">
        {activeOrder ? (
          <div className="space-y-6">
            <div className="p-6 bg-secondary/50 rounded-3xl border border-border flex justify-between items-center shadow-sm">
              <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Active Ticket</p>
                 <p className="text-3xl font-black text-foreground">#{activeOrder.order_number}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground border-none text-xs px-3 py-1.5 shadow-glow">{activeOrder.status.toUpperCase()}</Badge>
            </div>
            <div className="flex flex-col gap-6">
              {activeOrder.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-foreground text-lg">{item.menu_item_name}</span>
                    <span className="text-sm text-slate-500 font-medium">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-black text-foreground text-xl">₹{(item.total_paise / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <div className="w-24 h-24 mb-6 relative">
               <div className="absolute inset-0 bg-slate-100 rounded-3xl rotate-6" />
               <div className="absolute inset-0 bg-white border border-slate-200 rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
                  <Utensils className="h-10 w-10 text-slate-300" />
               </div>
            </div>
            <p className="text-xl font-black tracking-tight text-foreground mb-1">Cart is empty</p>
            <p className="text-sm font-medium text-slate-500">Select a table to begin.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.cart_id} 
                  className="flex justify-between items-start group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-foreground text-base leading-tight mb-2">{item.name}</h4>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                          <button onClick={() => updateQuantity(item.cart_id, -1)} className="p-2 hover:bg-secondary transition-colors text-slate-500"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center font-bold text-[13px] text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cart_id, 1)} className="p-2 hover:bg-secondary transition-colors text-primary"><Plus className="h-3.5 w-3.5" /></button>
                       </div>
                       <span className="text-[13px] font-bold text-slate-400">@ ₹{item.price/100}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 pt-0.5">
                     <span className="font-black text-foreground text-lg">₹{(item.price * item.quantity) / 100}</span>
                     <button onClick={() => removeFromCart(item.cart_id)} className="h-8 w-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors border border-red-100 hover:border-red-500">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="p-8 bg-card border-t border-border shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="space-y-4 mb-8">
           <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Subtotal</span>
              <span className="text-lg font-black text-foreground">
                ₹{((activeOrder ? activeOrder.items.reduce((s:any,i:any)=>s+i.total_paise,0) : cartTotal) / 100).toLocaleString()}
              </span>
           </div>
           <div className="pt-5 mt-3 border-t border-dashed border-border flex justify-between items-end">
              <span className="text-lg font-black text-foreground">Grand Total</span>
              <span className="text-4xl font-black text-primary tracking-tighter">
                ₹{((activeOrder ? activeOrder.items.reduce((s:any,i:any)=>s+i.total_paise,0) : cartTotal) / 100).toLocaleString()}
              </span>
           </div>
        </div>

        {activeOrder ? (
          <Button 
            className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xl border-none shadow-[0_8px_32px_rgba(16,185,129,0.3)] transition-all"
            onClick={handleCheckout}
            disabled={generateBill.isPending}
          >
            {generateBill.isPending ? 'PROCESSING...' : 'PAY NOW'}
          </Button>
        ) : (
          <Button 
            className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale border-none shadow-[0_8px_32px_rgba(79,70,229,0.3)]"
            disabled={cart.length === 0 || !selectedTableId}
            onClick={placeOrder}
          >
            SEND TO KITCHEN
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 -m-4 font-sans bg-background">
      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden p-6">
        
        {/* Left: Table & Menu Browser */}
        <div className="flex-1 flex flex-col gap-8 overflow-hidden">
          
          {/* Top Bar: Tables */}
          <div className="flex flex-col gap-4 p-6 bg-card rounded-3xl shadow-soft shrink-0 relative border border-border">
             <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                     <TableIcon className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Select Table</h3>
                     <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">{tables?.length || 0} Available</p>
                  </div>
               </div>
               <div className="flex bg-secondary p-1.5 rounded-2xl border border-border shadow-inner">
                 <button 
                   onClick={() => setTableViewMode('list')}
                   className={cn("px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all", tableViewMode === 'list' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-slate-500 hover:text-foreground')}
                 >
                   List
                 </button>
                 <button 
                   onClick={() => setTableViewMode('map')}
                   className={cn("px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all", tableViewMode === 'map' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-slate-500 hover:text-foreground')}
                 >
                   Map
                 </button>
               </div>
             </div>
             
              <div className={cn(
                "flex gap-4 overflow-x-auto no-scrollbar py-2 px-2 transition-all",
                tableViewMode === 'map' ? 'h-[500px] relative bg-secondary/50 rounded-[2rem] border-2 border-dashed border-border' : ''
              )}>
                {tableViewMode === 'list' ? (
                  tables?.map((table: any) => (
                    <button 
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={cn(
                        "min-w-[100px] h-16 rounded-[1.25rem] flex flex-col items-center justify-center transition-all duration-300 relative border-2",
                        selectedTableId === table.id 
                          ? "bg-secondary border-primary text-primary shadow-soft scale-[1.02]" 
                          : table.status === 'occupied' 
                            ? "bg-card border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                            : "bg-card border-border text-slate-500 hover:border-slate-300 shadow-sm"
                      )}
                    >
                      <span className="text-sm font-black uppercase tracking-widest">{table.name}</span>
                      {table.status === 'occupied' && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e4e1ee 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}>
                    {tables?.map((table: any) => (
                      <motion.button
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        initial={{ x: table.pos_x, y: table.pos_y }}
                        animate={{ x: table.pos_x, y: table.pos_y }}
                        className={cn(
                          "absolute w-24 h-24 rounded-3xl flex flex-col items-center justify-center shadow-lg border-2 transition-all",
                          selectedTableId === table.id 
                            ? "bg-primary border-primary text-primary-foreground scale-110 z-10 shadow-glow" 
                            : table.status === 'occupied'
                              ? "bg-red-50 border-red-200 text-red-600"
                              : "bg-card border-border text-slate-600 hover:border-slate-300"
                        )}
                      >
                         <span className="font-black text-xl tracking-tighter">{table.name}</span>
                         <span className="text-[9px] font-black opacity-40 uppercase tracking-widest mt-1">{table.capacity} PAX</span>
                         {table.status === 'occupied' && !selectedTableId && (
                           <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                         )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
          </div>

          {/* Menu Browser */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-4 px-2">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="Search menu..." 
                    className="pl-12 h-14 rounded-2xl border-none shadow-soft text-lg font-medium bg-card text-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
                  <Badge 
                    onClick={() => setSelectedCategory('all')}
                    className={cn("px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all border-none", selectedCategory === 'all' ? "bg-primary text-primary-foreground shadow-glow" : "bg-card text-slate-500 hover:text-foreground shadow-soft")}
                  >
                    All
                  </Badge>
                  {categories?.map((cat: any) => (
                    <Badge 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn("px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer whitespace-nowrap transition-all border-none", selectedCategory === cat.id ? "bg-primary text-primary-foreground shadow-glow" : "bg-card text-slate-500 hover:text-foreground shadow-soft")}
                    >
                      {cat.name}
                    </Badge>
                  ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredItems?.map((item: any) => (
                <motion.div 
                  layout
                  whileHover={{ y: -4 }}
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-card rounded-[2rem] shadow-soft border border-border overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    
                    {/* Advanced Item Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                       <Badge className={cn(
                         "h-6 w-6 rounded-lg p-0 flex items-center justify-center border-none shadow-lg",
                         item.food_type === 'veg' ? "bg-emerald-500" : "bg-red-500"
                       )}>
                          {item.food_type === 'veg' ? <Leaf className="h-3.5 w-3.5 text-white" /> : <Flame className="h-3.5 w-3.5 text-white" />}
                       </Badge>
                       {item.is_featured && (
                         <Badge className="bg-amber-500 text-white border-none h-6 px-2 text-[8px] font-black uppercase tracking-tighter shadow-lg">HOT</Badge>
                       )}
                    </div>

                    {!item.is_available && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                         <Badge className="bg-white text-slate-900 font-black px-4 py-1.5 rounded-lg border-none shadow-xl">OUT</Badge>
                      </div>
                    )}

                    {/* Stock & ETA Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-900/80 to-transparent flex justify-between items-end">
                       <div className="flex items-center gap-1.5 text-white/80">
                          <ClockIcon className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{item.preparation_time_minutes || 15} MINS</span>
                       </div>
                       {item.current_stock !== undefined && (
                         <span className={cn(
                           "text-[9px] font-black px-2 py-0.5 rounded-md",
                           item.current_stock < 5 ? "bg-red-500 text-white animate-pulse" : "bg-white/20 text-white"
                         )}>
                            {item.current_stock} LEFT
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between bg-card relative">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
                    
                    <div>
                      <h3 className="font-black text-foreground text-[17px] leading-tight mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{item.description || 'Premium selection'}</p>
                    </div>
                    <div className="flex justify-between items-end mt-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Price</p>
                         <p className="text-xl font-black text-foreground tracking-tighter">₹{item.base_price_paise / 100}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                        <Plus className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Cart Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-glow border-none flex items-center justify-center relative">
                 <ShoppingCart className="h-6 w-6" />
                 {(activeOrder ? activeOrder.items.length : cart.length) > 0 && (
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white">
                     {activeOrder ? activeOrder.items.length : cart.length}
                   </span>
                 )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 border-none bg-card">
               {renderCartPanel()}
            </SheetContent>
          </Sheet>
        </div>

        {/* Right: The Order Panel (Desktop) */}
        <div className="hidden lg:flex w-[400px] flex-col h-full shrink-0 bg-card rounded-[2.5rem] shadow-soft border border-border overflow-hidden">
          {renderCartPanel()}
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        bill={currentBill}
        onSuccess={() => {
           setIsPaymentOpen(false);
           setSelectedTableId(null);
           refetchOrder();
        }}
      />

      <AnimatePresence>
        {selectedItemForMod && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <h2 className="text-3xl font-black text-foreground mb-2">{selectedItemForMod.name}</h2>
              <p className="text-slate-500 font-medium mb-8">Customize your selection</p>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                {selectedItemForMod.variants && selectedItemForMod.variants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Variant</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedItemForMod.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "h-14 rounded-2xl font-black text-sm transition-all border flex items-center justify-between px-4",
                            selectedVariant?.id === v.id ? "bg-secondary border-primary text-primary" : "bg-card border-border text-slate-500"
                          )}
                        >
                          <span>{v.name}</span>
                          <span className="text-xs opacity-60">₹{v.price_paise / 100}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItemForMod.modifier_groups && selectedItemForMod.modifier_groups.map((mg: any) => (
                  <div key={mg.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                       <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{mg.name}</h4>
                       <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-full">Max: {mg.max_select}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {mg.modifiers.map((mod: any) => {
                        const currentSelections = itemModifiers[mg.id] || [];
                        const isSelected = currentSelections.some((m:any) => m.id === mod.id);
                        
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setItemModifiers(prev => {
                                const current = prev[mg.id] || [];
                                if (isSelected) {
                                  return { ...prev, [mg.id]: current.filter((m:any) => m.id !== mod.id) };
                                }
                                if (current.length >= mg.max_select) {
                                  return prev;
                                }
                                return { ...prev, [mg.id]: [...current, mod] };
                              });
                            }}
                            className={cn(
                              "h-14 rounded-2xl font-black text-sm transition-all border flex items-center justify-between px-4",
                              isSelected ? "bg-secondary border-primary text-primary" : "bg-card border-border text-slate-500"
                            )}
                          >
                            <div className="flex flex-col items-start">
                              <span>{mod.name}</span>
                              {mod.extra_price_paise > 0 && <span className="text-[9px] opacity-60">+₹{mod.extra_price_paise / 100}</span>}
                            </div>
                            {isSelected && <Check className="h-4 w-4" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400" onClick={() => setSelectedItemForMod(null)}>Cancel</Button>
                <Button className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow border-none uppercase tracking-widest" onClick={confirmAddToCart}>Add to Order</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
