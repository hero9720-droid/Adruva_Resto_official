'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
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
  Clock as ClockIcon,
  PenLine,
  Loader2,
  AlertCircle,
  Printer as PrinterIcon,
  WifiOff,
  X
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CartItem {
  cart_id: string; 
  id: string; 
  name: string;
  price: number;
  quantity: number;
  modifiers: Record<string, any[]>;
  notes: string;
  photo_url?: string;
}

export default function POSPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);
  
  const [selectedItemForMod, setSelectedItemForMod] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [itemModifiers, setItemModifiers] = useState<Record<string, any[]>>({});
  const [itemNotes, setItemNotes] = useState('');
  const [modErrors, setModErrors] = useState<Record<string, string>>({});
  const [isModLoading, setIsModLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems(selectedCategory === 'all' ? undefined : selectedCategory, debouncedSearch || undefined);
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
    
    setIsModLoading(true);
    setSelectedItemForMod(item);
    setSelectedVariant(hasVariants ? (item.variants.find((v:any) => v.is_default) || item.variants[0]) : null);
    setItemModifiers({});
    setItemNotes('');
    setModErrors({});
    
    // Simulate content preparation for premium feel
    setTimeout(() => setIsModLoading(false), 250);
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
        notes: notes,
        photo_url: item.photo_url
      }];
    });
  };

  const confirmAddToCart = () => {
    if (!selectedItemForMod) return;
    
    // Validation
    const errors: Record<string, string> = {};
    if (selectedItemForMod.modifier_groups) {
      selectedItemForMod.modifier_groups.forEach((mg: any) => {
        const selections = itemModifiers[mg.id] || [];
        if (mg.is_required && selections.length < (mg.min_select || 1)) {
          errors[mg.id] = `Select at least ${mg.min_select || 1} ${mg.name}`;
        }
      });
    }
    
    if (Object.keys(errors).length > 0) {
      setModErrors(errors);
      toast({ variant: "destructive", title: "Selection Required", description: "Please complete the required choices." });
      return;
    }

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

  const { isOnline, queueOrder, pendingCount } = useOfflineSync();

  const placeOrder = async () => {
    if (cart.length === 0 || !selectedTableId) return;

    setIsPlacingOrder(true);
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
    } finally {
      setIsPlacingOrder(false);
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

  const filteredItems = menuItems;

  const renderCartPanel = (className?: string) => {
    const tableInfo = selectedTableId ? tables?.find((t: any) => t.id === selectedTableId) : null;
    
    return (
      <div className={cn(
        "flex flex-col h-full bg-card shadow-md overflow-hidden relative",
        className ? className : "rounded-2xl border border-border"
      )}>
        {/* Header */}
        <div className="p-4 shrink-0 border-b border-border bg-card relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Current Order
            </h2>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge className="bg-destructive/10 text-destructive border-none px-2 py-1 flex items-center gap-1">
                  <WifiOff className="h-3 w-3" /> Offline
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => printer.connect()}
                title="Connect Printer"
              >
                 <PrinterIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          {/* Active Context Header */}
          <div className="flex justify-between items-center bg-muted/50 p-2.5 rounded-lg border border-border/50">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Selected Table</span>
              <span className="font-bold text-foreground text-sm">
                {tableInfo ? `Table ${tableInfo.name}` : 'None Selected'}
              </span>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">
              {activeOrder ? activeOrder.items.length : cart.length} Items
            </Badge>
          </div>
        </div>
        
        {/* Scrollable Items Container */}
        <div className="flex-1 overflow-y-auto p-4 relative z-10 min-h-0 bg-muted/20">
          {activeOrder ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-bold text-primary uppercase tracking-[0.1em] mb-0.5">Active Ticket</p>
                   <p className="text-2xl font-black text-foreground">#{activeOrder.order_number}</p>
                </div>
                <Badge className="bg-primary text-primary-foreground border-none px-3 py-1">{activeOrder.status.toUpperCase()}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {activeOrder.items.map((item: any) => {
                  const menuPhoto = menuItems?.find((m:any) => m.id === item.menu_item_id)?.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                  return (
                  <div key={item.id} className="flex items-stretch gap-3 bg-background p-3 rounded-2xl border border-border shadow-sm">
                    <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted relative border border-border">
                      <img src={menuPhoto} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col flex-1 justify-center min-w-0">
                       <div className="flex justify-between items-start mb-0.5">
                          <span className="font-bold text-foreground text-sm leading-tight line-clamp-2 pr-2">{item.menu_item_name}</span>
                       </div>
                       <div className="text-[10px] font-semibold text-muted-foreground mb-auto">
                          <span>Qty: {item.quantity}</span>
                       </div>
                       <div className="flex justify-between items-end mt-1">
                          <span className="font-black text-primary text-base">₹{(item.total_paise / 100).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-4">
              <div className="w-16 h-16 shrink-0 mb-3 rounded-full bg-muted flex items-center justify-center border border-border">
                 <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-base font-bold text-foreground mb-0.5">Cart is empty</p>
              <p className="text-xs font-medium text-muted-foreground">Select a table and add items.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.cart_id} className="flex items-stretch gap-3 bg-background p-3 rounded-2xl border border-border shadow-sm group">
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted relative border border-border">
                    <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-foreground text-sm leading-tight line-clamp-2 pr-2">{item.name}</h4>
                      <button onClick={() => removeFromCart(item.cart_id)} className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-[10px] font-semibold text-muted-foreground mb-auto">
                      {editingNoteId === item.cart_id ? (
                        <input 
                          autoFocus
                          defaultValue={item.notes}
                          onBlur={(e) => {
                            setCart(prev => prev.map(i => i.cart_id === item.cart_id ? { ...i, notes: e.target.value } : i));
                            setEditingNoteId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setCart(prev => prev.map(i => i.cart_id === item.cart_id ? { ...i, notes: e.currentTarget.value } : i));
                              setEditingNoteId(null);
                            }
                          }}
                          className="bg-background border border-border rounded px-2 py-1 text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Type note and hit Enter..."
                        />
                      ) : item.notes ? (
                         <span onClick={() => setEditingNoteId(item.cart_id)} className="text-amber-500 flex items-center gap-1 truncate cursor-pointer hover:text-amber-600"><PenLine className="h-2.5 w-2.5"/> {item.notes}</span>
                      ) : (
                         <span onClick={() => setEditingNoteId(item.cart_id)} className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors w-fit"><PenLine className="h-2.5 w-2.5"/> Add note</span>
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                       <span className="font-black text-primary text-lg leading-none">₹{(item.price * item.quantity) / 100}</span>
                       <div className="flex items-center bg-muted rounded-lg border border-border p-0.5 shrink-0">
                          <button onClick={() => updateQuantity(item.cart_id, -1)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-background transition-colors text-foreground shadow-sm bg-background border border-border/50"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-7 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cart_id, 1)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-background transition-colors text-foreground shadow-sm bg-background border border-border/50"><Plus className="h-3.5 w-3.5" /></button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 relative z-10 shrink-0 border-t border-border bg-card">
          <div className="space-y-2 mb-4">
             <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground">
                  ₹{((activeOrder ? activeOrder.items.reduce((s:any,i:any)=>s+i.total_paise,0) : cartTotal) / 100).toLocaleString()}
                </span>
             </div>
             <div className="pt-2 border-t border-dashed border-border flex justify-between items-end">
                <span className="font-bold text-foreground uppercase text-xs">Grand Total</span>
                <span className="text-xl font-black text-primary leading-none">
                  ₹{((activeOrder ? activeOrder.items.reduce((s:any,i:any)=>s+i.total_paise,0) : cartTotal) / 100).toLocaleString()}
                </span>
             </div>
          </div>

          {activeOrder ? (
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base transition-colors"
              onClick={handleCheckout}
              disabled={generateBill.isPending}
            >
              {generateBill.isPending ? 'PROCESSING...' : 'PAY NOW'}
            </Button>
          ) : (
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-base transition-colors disabled:opacity-50"
              disabled={cart.length === 0 || !selectedTableId || isPlacingOrder}
              onClick={placeOrder}
            >
              {isPlacingOrder ? 'SENDING...' : 'SEND TO KITCHEN'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 w-full pb-24 lg:pb-0">
        {/* Left Area: Tables & Menu (Expands down the page naturally) */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          
          {/* Horizontal Table Selector */}
          <div className="flex flex-col gap-3">
            {pendingCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-sm mb-2">
                 <AlertCircle className="h-4 w-4" /> 
                 <span className="font-bold text-xs uppercase tracking-widest">{pendingCount} offline order(s) queued. Will sync when online.</span>
              </div>
            )}
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Select Table</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                  {tables?.filter((t:any) => t.status === 'available').length || 0} Available
                </p>
              </div>
              {/* Map View Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    Map View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0 bg-background border-border overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 overflow-hidden bg-muted/30" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.1 }} />
                  <div className="absolute inset-0 overflow-hidden z-10">
                    {tables?.map((table: any) => (
                      <motion.button
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        initial={{ x: table.pos_x || 0, y: table.pos_y || 0 }}
                        animate={{ x: table.pos_x || 0, y: table.pos_y || 0 }}
                        className={cn(
                          "absolute w-28 h-28 rounded-2xl flex flex-col items-center justify-center shadow-sm border-2 transition-all",
                          selectedTableId === table.id 
                            ? "bg-foreground border-foreground text-background scale-110 z-20" 
                            : table.status === 'occupied'
                              ? "bg-destructive/10 border-destructive text-destructive"
                              : "bg-card border-border text-foreground hover:border-foreground/50"
                        )}
                      >
                         <span className="font-bold text-xl">{table.name}</span>
                         <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">{table.capacity} PAX</span>
                         {table.status === 'occupied' && !selectedTableId && (
                           <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive border-2 border-background" />
                         )}
                      </motion.button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Horizontal Scrolling Strip for Tables */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-2 px-2 -mx-2">
              {tables?.map((table: any) => (
                <button 
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={cn(
                    "shrink-0 w-[110px] h-16 rounded-xl flex flex-col items-center justify-center transition-colors border-2 relative",
                    selectedTableId === table.id 
                      ? "bg-foreground border-foreground text-background" 
                      : table.status === 'occupied' 
                        ? "bg-destructive/5 border-destructive/30 text-destructive hover:bg-destructive/10"
                        : "bg-card border-border text-foreground hover:border-foreground/30 hover:bg-muted"
                  )}
                >
                  <span className="text-sm font-bold uppercase">{table.name}</span>
                  <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest">{table.capacity} Pax</span>
                  {table.status === 'occupied' && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive border-2 border-background" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Browser (No fixed heights!) */}
          <div className="flex flex-col gap-6">
            {/* Sticky Search & Category Bar */}
            <div className="sticky top-20 z-30 flex flex-col md:flex-row md:items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-none sm:bg-transparent">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Search menu..." 
                      className="pl-11 h-12 rounded-xl border border-border bg-card text-foreground font-medium focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={cn("px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors border", selectedCategory === 'all' ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground")}
                    >
                      All
                    </button>
                    {categories?.map((cat: any) => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn("px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors border", selectedCategory === cat.id ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground")}
                      >
                        {cat.name}
                      </button>
                    ))}
                 </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 auto-rows-max gap-4 md:gap-5 pb-20 pt-2">
                {filteredItems?.map((item: any) => (
                  <div 
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-card rounded-2xl border border-border overflow-hidden group cursor-pointer hover:border-foreground/30 transition-colors flex flex-col min-w-[140px] min-h-[240px] shadow-sm hover:shadow-md"
                  >
                    <div className="h-32 md:h-40 bg-muted relative overflow-hidden shrink-0 border-b border-border">
                      <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      
                      {/* Advanced Item Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                         <Badge className={cn(
                           "h-6 w-6 rounded-md p-0 flex items-center justify-center border-none shadow-sm",
                           item.food_type === 'veg' ? "bg-emerald-600" : "bg-red-600"
                         )}>
                            {item.food_type === 'veg' ? <Leaf className="h-3.5 w-3.5 text-white" /> : <Flame className="h-3.5 w-3.5 text-white" />}
                         </Badge>
                         {item.is_featured && (
                           <Badge className="bg-amber-500 text-white border-none h-5 px-1.5 text-[9px] font-bold uppercase tracking-widest shadow-sm">HOT</Badge>
                         )}
                      </div>

                      {!item.is_available && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                           <Badge className="bg-foreground text-background font-bold px-3 py-1 rounded-md border-none">SOLD OUT</Badge>
                        </div>
                      )}

                      {/* Stock & ETA Info */}
                      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                         {item.current_stock !== undefined && (
                           <span className={cn(
                             "text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border",
                             item.current_stock < 5 ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground border-border"
                           )}>
                              {item.current_stock} LEFT
                           </span>
                         )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between bg-card">
                      <div className="mb-3">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-black text-sm md:text-base leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">{item.name}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{item.description || 'No description available'}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                         <span className="text-lg font-black text-foreground tracking-tighter">₹{(item.price_paise / 100).toLocaleString()}</span>
                         <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Plus className="h-5 w-5" />
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Cart (Desktop only) */}
        <div className="hidden lg:block w-[380px] shrink-0 sticky top-24 h-[calc(100vh-140px)]">
           {renderCartPanel()}
        </div>

        {/* Mobile Cart Sheet Trigger */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
           <Sheet>
              <SheetTrigger asChild>
                 <Button className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center relative border-none">
                    <ShoppingCart className="h-7 w-7" />
                    {(cart.length > 0 || activeOrder) && (
                      <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black">
                         {activeOrder ? activeOrder.items.length : cart.length}
                      </span>
                    )}
                 </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-none w-full sm:max-w-md">
                 {renderCartPanel("h-full border-none rounded-none")}
              </SheetContent>
           </Sheet>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedItemForMod(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 p-10 flex flex-col max-h-[90vh] border border-border"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6">
                  <div className="h-24 w-24 bg-secondary rounded-[1.5rem] overflow-hidden border border-border shrink-0">
                    <img src={selectedItemForMod.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">{selectedItemForMod.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-primary">₹{(selectedItemForMod.price_paise / 100).toLocaleString()}</span>
                      <Badge className={cn("bg-secondary text-slate-500 border-none", selectedItemForMod.food_type === 'veg' ? "text-emerald-500" : "text-red-500")}>
                        {selectedItemForMod.food_type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-secondary" onClick={() => setSelectedItemForMod(null)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 space-y-10 no-scrollbar">
                {isModLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {selectedItemForMod.description && (
                      <div className="bg-secondary/50 p-6 rounded-[1.5rem] border border-border">
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">{selectedItemForMod.description}</p>
                      </div>
                    )}
                    {selectedItemForMod.modifier_groups && selectedItemForMod.modifier_groups.map((mg: any) => (
                      <div key={mg.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{mg.name}</h4>
                            {mg.is_required && <Badge className="bg-destructive/10 text-destructive border-none h-4 px-1 text-[8px] font-black">REQUIRED</Badge>}
                          </div>
                          <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-full">Min: {mg.min_select} / Max: {mg.max_select}</span>
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
                                      // If max_select is 1, swap instead of doing nothing
                                      if (mg.max_select === 1) {
                                        return { ...prev, [mg.id]: [mod] };
                                      }
                                      return prev;
                                    }
                                    return { ...prev, [mg.id]: [...current, mod] };
                                  });
                                  setModErrors(prev => {
                                    const next = { ...prev };
                                    delete next[mg.id];
                                    return next;
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
                        {modErrors[mg.id] && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">{modErrors[mg.id]}</p>}
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400" onClick={() => setSelectedItemForMod(null)}>Cancel</Button>
                <Button className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow border-none uppercase tracking-widest" onClick={confirmAddToCart}>Add to Order</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
