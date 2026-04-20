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
  Check
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

interface CartItem {
  cart_id: string; // Unique ID per cart entry to handle same item with diff modifiers
  id: string; // menu_item_id
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
  
  // Modifier Modal State
  const [selectedItemForMod, setSelectedItemForMod] = useState<any>(null);
  const [itemModifiers, setItemModifiers] = useState<Record<string, string[]>>({});
  const [itemNotes, setItemNotes] = useState('');

  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems(selectedCategory === 'all' ? undefined : selectedCategory);
  const { data: tables } = useTables();
  const { data: activeOrder, isLoading: isLoadingOrder, refetch: refetchOrder } = useActiveOrderForTable(selectedTableId);
  const generateBill = useGenerateBill();
  const { toast } = useToast();

  const handleItemClick = (item: any) => {
    if (activeOrder) {
      toast({ title: "Order in Progress", description: "Use the Modify Order flow to add items to an existing bill." });
      return;
    }
    // Simplistic check for modifiers (you would fetch real modifier groups from DB here)
    // For now, if no modifiers, add directly. Otherwise open modal.
    setSelectedItemForMod(item);
    setItemModifiers({});
    setItemNotes('');
  };

  const confirmAddToCart = () => {
    if (!selectedItemForMod) return;
    
    // Calculate extra price from modifiers (mock logic for now, backend will validate)
    const extraPrice = Object.values(itemModifiers).flat().length * 5000; // 50rs extra per mod just for UI showcase
    
    setCart(prev => {
      // Check if exact same item + modifiers exists
      const existing = prev.find(i => 
        i.id === selectedItemForMod.id && 
        JSON.stringify(i.modifiers) === JSON.stringify(itemModifiers) &&
        i.notes === itemNotes
      );
      
      if (existing) {
        return prev.map(i => i.cart_id === existing.cart_id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      
      return [...prev, { 
        cart_id: Math.random().toString(36).substr(2, 9),
        id: selectedItemForMod.id, 
        name: selectedItemForMod.name, 
        price: selectedItemForMod.base_price_paise + extraPrice, 
        quantity: 1,
        modifiers: itemModifiers,
        notes: itemNotes
      }];
    });
    
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

  const placeOrder = async () => {
    if (cart.length === 0 || !selectedTableId) return;
    try {
      await api.post('/orders', {
        order_type: 'dine_in',
        table_id: selectedTableId,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price_paise: item.price,
          modifiers_json: item.modifiers,
          notes: item.notes
        }))
      });
      setCart([]);
      refetchOrder();
      toast({ title: "Order Confirmed", description: "Sent to Kitchen." });
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

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6 -m-4 font-sans bg-background">
      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden p-6">
        
        {/* Left: Table & Menu Browser */}
        <div className="flex-1 flex flex-col gap-8 overflow-hidden">
          
          {/* Top Bar: Tables */}
          <div className="flex flex-col gap-4 p-6 bg-card rounded-[2.5rem] shadow-none shrink-0 transition-all duration-500 relative border border-border/10">
             <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                     <TableIcon className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Select Table</h3>
                     <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-0.5">{tables?.length || 0} Available</p>
                  </div>
               </div>
               <div className="flex bg-background p-1 rounded-2xl border border-border/20">
                 <button 
                   onClick={() => setTableViewMode('list')}
                   className={cn("px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all", tableViewMode === 'list' ? 'bg-popover text-popover-foreground shadow-md' : 'text-muted-foreground hover:text-foreground')}
                 >
                   List
                 </button>
                 <button 
                   onClick={() => setTableViewMode('map')}
                   className={cn("px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all", tableViewMode === 'map' ? 'bg-popover text-popover-foreground shadow-md' : 'text-muted-foreground hover:text-foreground')}
                 >
                   Map View
                 </button>
               </div>
             </div>
             
             {tableViewMode === 'list' ? (
               <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-2">
                  {tables?.map((table: any) => (
                    <button 
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={cn(
                        "min-w-[100px] h-16 rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-300 relative border-2",
                        selectedTableId === table.id 
                          ? "bg-secondary border-primary text-secondary-foreground shadow-lg shadow-primary/10 scale-[1.02]" 
                          : table.status === 'occupied' 
                            ? "bg-card border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "bg-card border-transparent text-muted-foreground hover:border-border/30"
                      )}
                    >
                      <span className="text-sm font-black uppercase tracking-widest">{table.name}</span>
                      {table.status === 'occupied' && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(var(--destructive),0.5)]" />
                      )}
                    </button>
                  ))}
               </div>
             ) : (
               <div className="relative h-64 bg-background rounded-[2rem] border border-border/20 overflow-hidden mt-2 transition-all duration-500"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
                  {tables?.map((table: any) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      style={{ left: table.pos_x, top: table.pos_y }}
                      className={cn(
                         "absolute w-20 h-20 rounded-[1.25rem] flex flex-col items-center justify-center shadow-lg border transition-all hover:scale-105 active:scale-95",
                         selectedTableId === table.id 
                           ? 'bg-primary border-primary text-primary-foreground z-10 scale-110 shadow-xl shadow-primary/40' 
                           : table.status === 'occupied' 
                             ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                             : 'bg-card border-border/20 text-foreground'
                      )}
                    >
                       <span className="font-black text-xl tracking-tighter">{table.name}</span>
                       <span className={cn("text-[8px] font-black uppercase tracking-widest mt-1", selectedTableId === table.id ? "opacity-80" : "text-muted-foreground")}>{table.capacity} PAX</span>
                       {table.status === 'occupied' && selectedTableId !== table.id && (
                          <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                       )}
                    </button>
                  ))}
               </div>
             )}
          </div>

          {/* Menu Browser */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Search & Categories */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search menu..." 
                  className="pl-16 h-16 rounded-[2rem] border border-border/10 bg-card focus:ring-2 focus:ring-primary/20 text-lg font-medium text-foreground placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar p-1">
                <Button 
                  variant="ghost"
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "h-14 px-8 rounded-[1.5rem] font-black transition-all text-sm tracking-wide", 
                    selectedCategory === 'all' 
                      ? "bg-popover text-popover-foreground shadow-lg" 
                      : "bg-card text-muted-foreground hover:bg-secondary border border-border/10"
                  )}
                >
                  ALL
                </Button>
                {categories?.map((cat: any) => (
                  <Button 
                    key={cat.id} 
                    variant="ghost"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "h-14 px-8 rounded-[1.5rem] font-black transition-all text-sm tracking-wide whitespace-nowrap", 
                      selectedCategory === cat.id 
                        ? "bg-popover text-popover-foreground shadow-lg" 
                        : "bg-card text-muted-foreground hover:bg-secondary border border-border/10"
                    )}
                  >
                    {cat.name.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pb-8 pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 no-scrollbar">
              {filteredItems?.map((item: any) => (
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={item.id} 
                  className="bg-card rounded-[2rem] overflow-hidden shadow-none cursor-pointer group flex flex-col transition-all duration-300 border border-border/10"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="h-40 bg-secondary relative overflow-hidden">
                    <img 
                      src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" 
                      alt="" 
                    />
                    <div className="absolute top-4 left-4 bg-background/60 backdrop-blur-md rounded-xl p-2 shadow-sm border border-border/20">
                       <div className={cn("h-3 w-3 rounded-full", item.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500')} />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-black text-foreground text-lg leading-tight mb-1">{item.name}</h3>
                      <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-2xl font-black text-primary">₹{item.base_price_paise / 100}</span>
                      <div className="h-10 w-10 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <Plus className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: The Order Strip */}
        <div className="w-full lg:w-[420px] flex flex-col h-full shrink-0">
          <div className="flex-1 flex flex-col bg-card rounded-[2.5rem] shadow-none border border-border/10 overflow-hidden relative">
            
            <div className="p-8 pb-6 bg-card">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                     <ShoppingCart className="h-7 w-7" />
                  </div>
                  Current Order
                </h2>
                <Badge className="bg-popover text-popover-foreground hover:bg-popover/90 text-xs font-black px-3 py-1 rounded-xl">
                  {activeOrder ? activeOrder.items.length : cart.length} ITEMS
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
              {activeOrder ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-secondary/50 to-background rounded-3xl border border-border/10 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Active Ticket</p>
                       <p className="text-2xl font-black text-foreground">#{activeOrder.order_number}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none text-xs px-3 py-1">{activeOrder.status.toUpperCase()}</Badge>
                  </div>
                  <div className="flex flex-col gap-6">
                    {activeOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground text-lg">{item.menu_item_name}</span>
                          <span className="text-sm text-muted-foreground font-medium">Qty: {item.quantity}</span>
                          {item.modifiers_json && Object.keys(item.modifiers_json).length > 0 && (
                             <span className="text-xs text-tertiary-foreground font-bold bg-tertiary/20 px-2 py-0.5 rounded-lg w-max mt-1">
                               Modified
                             </span>
                          )}
                        </div>
                        <span className="font-black text-foreground text-xl">₹{(item.total_paise / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <div className="p-10 bg-background rounded-full mb-6 border border-border/10">
                     <Utensils className="h-16 w-16 opacity-30" />
                  </div>
                  <p className="text-2xl font-black uppercase tracking-tighter text-muted-foreground">Cart is empty</p>
                  <p className="text-base font-medium mt-2">Select a table to begin.</p>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
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
                          <h4 className="font-bold text-foreground text-lg leading-tight mb-2">{item.name}</h4>
                          {Object.keys(item.modifiers).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {Object.values(item.modifiers).flat().map((m: any, i) => (
                                <span key={i} className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                  {m.name || m}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                             <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
                                <button onClick={() => updateQuantity(item.cart_id, -1)} className="p-2 hover:bg-muted transition-colors text-muted-foreground"><Minus className="h-4 w-4" /></button>
                                <span className="w-8 text-center font-black text-sm text-foreground">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.cart_id, 1)} className="p-2 hover:bg-muted transition-colors text-primary"><Plus className="h-4 w-4" /></button>
                             </div>
                             <span className="text-sm font-bold text-muted-foreground">@ ₹{item.price/100}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 pt-1">
                           <span className="font-black text-foreground text-xl">₹{(item.price * item.quantity) / 100}</span>
                           <button onClick={() => removeFromCart(item.cart_id)} className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="p-8 bg-card rounded-t-[2.5rem] mt-4 border-t border-border/10 relative z-10">
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Subtotal</span>
                    <span className="text-xl font-black text-foreground">
                      ₹{((activeOrder ? activeOrder.items.reduce((s:any,i:any)=>s+i.total_paise,0) : cartTotal) / 100).toLocaleString()}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Taxes (Est.)</span>
                    <span className="text-sm font-black text-primary">Calculated at Checkout</span>
                 </div>
                 <div className="pt-4 mt-2 border-t border-border/10 flex justify-between items-end">
                    <span className="text-lg font-black text-foreground">Grand Total</span>
                    <span className="text-5xl font-black text-primary tracking-tighter">
                      ₹{((activeOrder ? activeOrder.items.reduce((s:any,i:any)=>s+i.total_paise,0) : cartTotal) / 100).toLocaleString()}
                    </span>
                 </div>
              </div>

              {activeOrder ? (
                <Button 
                  className="w-full h-[72px] bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-[2rem] font-black text-2xl border-none shadow-[0_8px_32px_rgba(34,197,94,0.2)]"
                  onClick={handleCheckout}
                  disabled={generateBill.isPending}
                >
                  {generateBill.isPending ? 'PROCESSING...' : 'PAY NOW'}
                </Button>
              ) : (
                <Button 
                  className="w-full h-[72px] bg-gradient-to-br from-primary to-primary/80 hover:to-primary text-primary-foreground rounded-[2rem] font-black text-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale border-none shadow-[0_8px_32px_rgba(79,70,229,0.2)]"
                  disabled={cart.length === 0 || !selectedTableId}
                  onClick={placeOrder}
                >
                  SEND TO KITCHEN
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modifier Modal */}
      <AnimatePresence>
        {selectedItemForMod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border/20 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl"
            >
              <h2 className="text-3xl font-black text-foreground mb-2">{selectedItemForMod.name}</h2>
              <p className="text-muted-foreground font-medium mb-8">Customize your order</p>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                {/* Mock Modifiers - in real app, map over modifier groups */}
                <div className="space-y-3">
                  <h4 className="font-black text-foreground uppercase tracking-widest text-xs">Add-ons</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Extra Cheese', 'No Onions', 'Spicy', 'Extra Mayo'].map(mod => {
                      const isSelected = itemModifiers['addons']?.includes(mod);
                      return (
                        <button
                          key={mod}
                          onClick={() => {
                            setItemModifiers(prev => {
                              const current = prev['addons'] || [];
                              if (isSelected) return { ...prev, addons: current.filter(m => m !== mod) };
                              return { ...prev, addons: [...current, mod] };
                            });
                          }}
                          className={cn(
                            "h-14 rounded-2xl font-black text-sm transition-all border flex items-center justify-between px-4",
                            isSelected 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-background border-border/20 text-muted-foreground hover:border-border/40"
                          )}
                        >
                          {mod}
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-foreground uppercase tracking-widest text-xs">Special Instructions</h4>
                  <Input 
                    placeholder="e.g. Allergy to peanuts..." 
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    className="h-14 rounded-2xl bg-background border-border/20 focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-border/10">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedItemForMod(null)}
                  className="flex-1 h-14 rounded-2xl font-black text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={confirmAddToCart}
                  className="flex-1 h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_32px_rgba(79,70,229,0.2)]"
                >
                  ADD TO ORDER
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentModal 
        open={isPaymentOpen} 
        onOpenChange={setIsPaymentOpen}
        bill={currentBill}
        onSuccess={() => {
           refetchOrder();
           setCart([]);
           setSelectedTableId(null);
        }}
      />
    </div>
  );
}
