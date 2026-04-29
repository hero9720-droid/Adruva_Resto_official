'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Info, 
  ChevronRight, 
  Star,
  Clock,
  MapPin,
  Minus,
  Plus,
  Loader2,
  Gift,
  Calendar as CalendarIcon,
  ChefHat,
  Utensils,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

export default function DigitalMenu() {
  const { outletSlug } = useParams();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  
  const { items, addItem, updateQuantity, getTotal, getItemCount, clearCart } = useCart();
  const { toast } = useToast();
  
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [customer, setCustomer] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [partySize, setPartySize] = useState(2);

  const [activeOrder, setActiveOrder] = useState<any>(null);
  const { socket } = useSocket(menu?.outlet?.id);

  const [selectedItemForMod, setSelectedItemForMod] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [itemModifiers, setItemModifiers] = useState<Record<string, any[]>>({});
  const [itemNotes, setItemNotes] = useState('');

  useEffect(() => {
    if (socket && activeOrder) {
      socket.emit('join', `order:${activeOrder.id}`);
      
      socket.on('order:item_update', (updatedItem: any) => {
         // Refresh order to show status updates on items
         rehydrateActiveOrder(activeOrder.id, menu.outlet.id);
      });

      socket.on('order:status_change', (updatedOrder: any) => {
        if (updatedOrder.id === activeOrder.id) {
          setActiveOrder(updatedOrder);
        }
      });
      
      socket.on('item:ready', (item: any) => {
        if (item.order_id === activeOrder.id) {
          toast({
            title: "ITEM READY",
            description: `Your ${item.menu_item_name} is being served! 🍕`,
          });
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('order:item_update');
        socket.off('order:status_change');
        socket.off('item:ready');
      }
    };
  }, [socket, activeOrder?.id]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data } = await api.get(`/menu/public/${outletSlug}`);
        setMenu(data.data);
        if (data.data.categories.length > 0) {
          setSelectedCategory(data.data.categories[0].id);
        }
        
        const savedOrderId = localStorage.getItem('active_order_id');
        if (savedOrderId) {
          rehydrateActiveOrder(savedOrderId, data.data.outlet.id);
        }
      } catch (err) {
        console.error('Failed to fetch menu', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenu();

    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) {
      handleLogin(savedPhone);
    }
  }, [outletSlug]);

  const rehydrateActiveOrder = async (orderId: string, outletId: string) => {
    try {
      const { data } = await api.get(`/orders/public/${orderId}?outlet_id=${outletId}`);
      if (data.data && data.data.status !== 'served' && data.data.status !== 'cancelled') {
        setActiveOrder(data.data);
      } else {
        localStorage.removeItem('active_order_id');
      }
    } catch (err) {
      console.error('Failed to rehydrate order');
    }
  };

  const handleLogin = async (phoneToUse: string) => {
    setLoggingIn(true);
    try {
      const { data } = await api.get(`/customers/lookup?query=${phoneToUse}`);
      if (data.data) {
        setCustomer(data.data);
        localStorage.setItem('customer_phone', phoneToUse);
        setShowLogin(false);
      } else {
        alert("Guest profile not found. Please ask staff to register you!");
      }
    } catch (err) {
      console.error('Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleItemClick = (item: any) => {
    const hasVariants = item.variants && item.variants.length > 0;
    const hasModifiers = item.modifier_groups && item.modifier_groups.length > 0;
    
    if (!hasVariants && !hasModifiers) {
      addItem({
        id: item.id,
        name: item.name,
        price_paise: item.base_price_paise,
        food_type: item.food_type,
        quantity: 1,
        modifiers: {},
        notes: '',
        photo_url: item.photo_url
      });
      return;
    }

    setSelectedItemForMod(item);
    setSelectedVariant(hasVariants ? (item.variants.find((v:any) => v.is_default) || item.variants[0]) : null);
    setItemModifiers({});
    setItemNotes('');
  };

  const confirmAddToCart = () => {
    if (!selectedItemForMod) return;
    
    const basePrice = selectedVariant ? selectedVariant.price_paise : selectedItemForMod.base_price_paise;
    const modsPrice = Object.values(itemModifiers).flat().reduce((sum, mod) => sum + (mod.extra_price_paise || 0), 0);
    const finalPrice = basePrice + modsPrice;

    addItem({
      id: selectedItemForMod.id,
      variant_id: selectedVariant?.id,
      name: selectedVariant ? `${selectedItemForMod.name} (${selectedVariant.name})` : selectedItemForMod.name,
      price_paise: finalPrice,
      food_type: selectedItemForMod.food_type,
      quantity: 1,
      modifiers: itemModifiers,
      notes: itemNotes,
      photo_url: selectedItemForMod.photo_url
    });

    setSelectedItemForMod(null);
  };

  const handlePlaceOrder = async () => {
    if (!tableId) {
      alert("Please scan the QR code on your table to place an order.");
      return;
    }

    setOrdering(true);
    try {
      const { data } = await api.post('/orders/public', {
        outlet_id: menu.outlet.id,
        table_id: tableId,
        customer_id: customer?.id || null,
        items: items.map(i => ({
          menu_item_id: i.id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          modifiers_json: i.modifiers,
          notes: i.notes
        }))
      });
      setActiveOrder(data.data);
      localStorage.setItem('active_order_id', data.data.id);
      clearCart();
    } catch (error) {
      alert("Failed to place order. Please try again or call staff.");
    } finally {
      setOrdering(false);
    }
  };

  const filteredCategories = menu?.categories.map((cat: any) => ({
    ...cat,
    items: cat.items.filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((cat: any) => cat.items.length > 0) || [];

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 font-black text-muted-foreground uppercase tracking-widest text-sm">Brewing Experience...</p>
    </div>
  );

  const handleJoinWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      await api.post('/waitlist/public', {
        outlet_id: menu.outlet.id,
        customer_name: customer?.name || 'Guest',
        phone: phone || customer?.phone,
        party_size: partySize
      });
      toast({
        title: "QUEUED!",
        description: "You're on the list. We'll SMS you when your table is ready! 📲",
      });
      setShowWaitlist(false);
    } catch (err) {
      toast({
        title: "Waitlist Full",
        description: "Sorry, we're not accepting more entries right now.",
        variant: "destructive"
      });
    } finally {
      setWaitlistLoading(false);
    }
  };

  const getTierInfo = (points: number) => {
    if (points >= 5000) return { name: 'Platinum', color: 'bg-indigo-600', text: 'text-white' };
    if (points >= 2000) return { name: 'Gold', color: 'bg-amber-400', text: 'text-black' };
    if (points >= 500) return { name: 'Silver', color: 'bg-slate-300', text: 'text-black' };
    return { name: 'Bronze', color: 'bg-orange-600', text: 'text-white' };
  };

  return (
    <div className="min-h-screen bg-[#fcf8ff] pb-32 font-sans text-foreground">
      {/* Hero Header */}
      <div className="relative h-72 w-full overflow-hidden rounded-b-[3rem] shadow-2xl border-b border-border/5">
        <img 
          src={menu?.outlet?.banner_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070'} 
          className="w-full h-full object-cover scale-110"
          alt="Restaurant Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b24] via-[#1b1b24]/40 to-transparent" />
        
        {/* Hero Actions */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
           <button 
             onClick={() => setShowBooking(true)}
             className="bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all shadow-xl"
           >
              <CalendarIcon className="h-4 w-4 text-white" />
              Book
           </button>
           {!customer ? (
             <button 
              onClick={() => setShowLogin(true)}
              className="bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all shadow-xl"
             >
                <Gift className="h-4 w-4 text-yellow-400" />
                Rewards
             </button>
           ) : (
             <div className={cn("px-4 py-3 rounded-2xl border-none flex items-center gap-3 shadow-2xl", getTierInfo(customer.loyalty_points).color)}>
                <div className="flex flex-col">
                   <span className={cn("text-[8px] font-black uppercase leading-none opacity-60", getTierInfo(customer.loyalty_points).text)}>{getTierInfo(customer.loyalty_points).name} Member</span>
                   <span className={cn("text-sm font-black leading-none", getTierInfo(customer.loyalty_points).text)}>{customer.loyalty_points} PTS</span>
                </div>
                <div className="h-8 w-8 bg-black/10 rounded-lg flex items-center justify-center">
                   <Star className={cn("h-4 w-4 fill-current", getTierInfo(customer.loyalty_points).text)} />
                </div>
             </div>
           )}
        </div>

        <div className="absolute bottom-10 left-8 right-8 text-white">
          <div className="flex justify-between items-end">
             <div>
                <Badge className="mb-4 bg-primary text-primary-foreground border-none font-black uppercase tracking-widest px-4 py-1.5 text-[10px] shadow-glow">LIVE KITCHEN</Badge>
                <h1 className="text-5xl font-black tracking-tighter leading-tight">{menu?.outlet?.name}</h1>
             </div>
             {typeof window !== 'undefined' && localStorage.getItem('adruva_customer_session') && (
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl text-center">
                   <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                     {JSON.parse(localStorage.getItem('adruva_customer_session') || '{}').type === 'table' ? 'Table' : 'Room'}
                   </p>
                   <p className="text-3xl font-black leading-none tracking-tighter">
                     {JSON.parse(localStorage.getItem('adruva_customer_session') || '{}').space_name}
                   </p>
                </div>
             )}
          </div>
          <div className="flex items-center gap-6 mt-6 text-[10px] font-black text-white/80 uppercase tracking-widest">
             <span className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 4.8</span>
             <span className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl"><Clock className="h-4 w-4" /> 20-30 MIN</span>
             <span className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl"><MapPin className="h-4 w-4" /> {menu?.outlet?.city}</span>
          </div>
          
          {/* Waitlist CTA */}
          <div className="mt-8">
             <button 
               onClick={() => setShowWaitlist(true)}
               className="group relative flex items-center gap-4 bg-white/10 backdrop-blur-3xl p-5 rounded-[2rem] border border-white/20 hover:bg-white/20 transition-all w-full md:w-auto"
             >
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                   <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                   <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Queue Status</p>
                   <p className="text-sm font-black text-white">Full House? Join our Digital Waitlist</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/40 ml-auto group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>

      {/* Active Order Float */}
      <AnimatePresence>
        {activeOrder && activeOrder.status !== 'completed' && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-4 z-[60] px-4 -mt-10"
          >
             <div className="bg-[#1b1b24] text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-6 border border-white/5">
                <div className="flex items-center gap-5">
                   <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <ChefHat className="h-7 w-7 text-primary animate-bounce" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Order #{activeOrder.order_number}</span>
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-lg font-black tracking-tight">{activeOrder.status === 'confirmed' ? 'Chef is cooking...' : activeOrder.status.toUpperCase()}</p>
                   </div>
                </div>
                <Button variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 text-white/40 hover:text-white" onClick={() => {
                   setActiveOrder(null);
                   localStorage.removeItem('active_order_id');
                }}>
                   <X className="h-5 w-5" />
                </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="sticky top-0 z-50 bg-[#fcf8ff]/90 backdrop-blur-2xl border-b border-[#e4e1ee]/50 overflow-x-auto no-scrollbar flex items-center p-4 gap-3">
        {menu?.categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-8 py-4 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
              selectedCategory === cat.id 
                ? "bg-[#1b1b24] text-white shadow-xl shadow-black/10" 
                : "bg-white text-[#777587] border border-[#e4e1ee]/50 hover:border-[#1b1b24]/50"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="p-6 md:p-10 space-y-12 max-w-2xl mx-auto">
        {menu?.categories.filter((c: any) => !selectedCategory || c.id === selectedCategory).map((cat: any) => (
          <div key={cat.id} className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4 px-2 text-[#1b1b24]">
              {cat.name}
              <div className="h-1 w-1 rounded-full bg-[#c7c4d8]" />
              <span className="text-[#a09eb1] text-[10px] font-black uppercase tracking-[0.2em]">{cat.items.length} OPTIONS</span>
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {cat.items.map((item: any) => {
                const cartItems = items.filter(i => i.id === item.id);
                const quantity = cartItems.reduce((s, i) => s + i.quantity, 0);
                
                return (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-white p-6 rounded-[2.5rem] border border-[#e4e1ee]/30 flex gap-6 shadow-soft relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "h-4 w-4 border-2 flex items-center justify-center p-[2px] rounded-sm",
                            item.food_type === 'veg' ? "border-emerald-500" : "border-rose-500"
                          )}>
                            <div className={cn("h-full w-full rounded-full", item.food_type === 'veg' ? "bg-emerald-500" : "bg-rose-500")} />
                          </div>
                          {item.is_featured && <Badge className="bg-rose-50 text-rose-600 border-none font-black uppercase tracking-widest text-[8px] px-2.5 py-1 rounded-lg">CHEF'S SPECIAL</Badge>}
                        </div>
                        <h3 className="font-black text-[#1b1b24] text-xl tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-[13px] font-medium text-[#777587] line-clamp-2 leading-relaxed opacity-80">{item.description}</p>
                      </div>
                      <div className="flex items-end justify-between pt-6 mt-auto">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-[#a09eb1] uppercase tracking-widest mb-0.5">Price</span>
                           <span className="text-2xl font-black tracking-tighter text-[#1b1b24]">₹{item.base_price_paise / 100}</span>
                        </div>
                        
                        <Button 
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "h-12 rounded-[1.25rem] px-8 transition-all font-black uppercase tracking-widest text-[10px] border-none",
                            quantity > 0 ? "bg-[#1b1b24] text-white shadow-lg" : "bg-[#f5f2ff] text-primary hover:bg-primary hover:text-white"
                          )}
                        >
                          {quantity > 0 ? `${quantity} IN CART` : 'ADD'}
                        </Button>
                      </div>
                    </div>
                    <div className="relative h-36 w-36 rounded-[2rem] overflow-hidden shrink-0 shadow-inner group-hover:rotate-2 transition-transform duration-500">
                      <img 
                        src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                        alt={item.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {getItemCount() > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-6 right-6 z-50 max-w-2xl mx-auto"
          >
            <button 
              onClick={handlePlaceOrder}
              disabled={ordering}
              className="w-full bg-[#1b1b24] text-white h-24 rounded-[3rem] flex items-center justify-between px-10 shadow-2xl group overflow-hidden active:scale-[0.98] transition-all border border-white/5"
            >
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-primary rounded-[1.5rem] flex items-center justify-center relative shadow-glow">
                     <ShoppingBag className="h-7 w-7 text-white" />
                     <span className="absolute -top-2 -right-2 h-7 w-7 bg-white text-[#1b1b24] text-xs font-black rounded-full flex items-center justify-center border-4 border-[#1b1b24]">
                        {getItemCount()}
                     </span>
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Live Order Cart</p>
                     <p className="text-2xl font-black tracking-tight">{ordering ? 'PLACING...' : 'PLACE ORDER'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                     <p className="text-3xl font-black tracking-tighter">₹{getTotal() / 100}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                    {ordering ? <Loader2 className="h-6 w-6 animate-spin" /> : <ChevronRight className="h-7 w-7" />}
                  </div>
               </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customization Dialog */}
      <AnimatePresence>
        {selectedItemForMod && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-[#1b1b24]/60 backdrop-blur-xl">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[3rem] sm:rounded-[3rem] p-10 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h2 className="text-4xl font-black text-[#1b1b24] tracking-tighter mb-2">{selectedItemForMod.name}</h2>
                    <p className="text-sm font-bold text-[#777587] opacity-60 uppercase tracking-widest">Customize your selection</p>
                 </div>
                 <button onClick={() => setSelectedItemForMod(null)} className="h-12 w-12 rounded-2xl bg-[#fcf8ff] flex items-center justify-center text-[#c7c4d8] hover:text-[#1b1b24]">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              
              <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar pb-10">
                {selectedItemForMod.variants && selectedItemForMod.variants.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-black text-[#a09eb1] uppercase tracking-[0.2em] text-[10px] px-2">Choose Variant</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedItemForMod.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "h-16 rounded-2xl font-black text-sm transition-all border flex items-center justify-between px-6",
                            selectedVariant?.id === v.id ? "bg-[#f5f2ff] border-primary text-primary shadow-soft" : "bg-white border-[#e4e1ee]/50 text-[#777587]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                             <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", selectedVariant?.id === v.id ? "border-primary" : "border-[#c7c4d8]")}>
                                {selectedVariant?.id === v.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                             </div>
                             <span>{v.name}</span>
                          </div>
                          <span className="font-black text-lg">₹{v.price_paise / 100}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItemForMod.modifier_groups && selectedItemForMod.modifier_groups.map((mg: any) => (
                  <div key={mg.id} className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <h4 className="font-black text-[#a09eb1] uppercase tracking-[0.2em] text-[10px]">{mg.name}</h4>
                       <Badge className="bg-[#f5f2ff] text-primary border-none font-black text-[9px] px-3 py-1 rounded-lg">CHOOSE {mg.max_select}</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
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
                              "h-16 rounded-2xl font-black text-sm transition-all border flex items-center justify-between px-6",
                              isSelected ? "bg-[#f5f2ff] border-primary text-primary shadow-soft" : "bg-white border-[#e4e1ee]/50 text-[#777587]"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-[#c7c4d8]")}>
                                 {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
                              </div>
                              <div className="flex flex-col items-start">
                                <span>{mod.name}</span>
                                {mod.extra_price_paise > 0 && <span className="text-[10px] opacity-40 font-bold tracking-widest uppercase">+₹{mod.extra_price_paise / 100}</span>}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="space-y-4">
                   <h4 className="font-black text-[#a09eb1] uppercase tracking-[0.2em] text-[10px] px-2">Cooking Instructions</h4>
                   <Input 
                    placeholder="E.g. No onions, make it spicy..." 
                    className="h-16 rounded-2xl border-[#e4e1ee]/50 bg-[#fcf8ff] font-bold text-sm px-6 focus:border-primary"
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                   />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <Button className="w-full h-20 rounded-[2rem] bg-[#1b1b24] hover:bg-black text-white font-black shadow-2xl border-none uppercase tracking-widest text-xs flex items-center justify-between px-10" onClick={confirmAddToCart}>
                   <span>ADD TO CART</span>
                   <span className="text-2xl tracking-tighter">₹{((selectedVariant ? selectedVariant.price_paise : selectedItemForMod.base_price_paise) + Object.values(itemModifiers).flat().reduce((s,m) => s + (m.extra_price_paise || 0), 0)) / 100}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlist && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-[#1b1b24]/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center"
            >
               <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Clock className="h-10 w-10 text-primary" />
               </div>
               <h3 className="text-3xl font-black text-[#1b1b24] tracking-tighter mb-4">Join Waitlist</h3>
               <p className="text-sm font-bold text-[#777587] mb-10 leading-relaxed px-4">Tables are currently occupied. We'll hold your spot and SMS you as soon as one opens up.</p>
               
               <div className="space-y-6 mb-10">
                  <div className="text-left px-2">
                     <p className="text-[10px] font-black text-[#a09eb1] uppercase tracking-[0.2em] mb-3">Party Size</p>
                     <div className="flex items-center justify-between bg-[#fcf8ff] p-4 rounded-2xl border border-[#e4e1ee]/50">
                        <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-white" onClick={() => setPartySize(Math.max(1, partySize - 1))}>
                           <Minus className="h-5 w-5" />
                        </Button>
                        <span className="text-2xl font-black">{partySize}</span>
                        <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-white" onClick={() => setPartySize(partySize + 1)}>
                           <Plus className="h-5 w-5" />
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <Button className="h-20 rounded-[2rem] bg-[#1b1b24] hover:bg-black text-white font-black uppercase tracking-widest text-xs w-full shadow-2xl" onClick={handleJoinWaitlist} disabled={waitlistLoading}>
                     {waitlistLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CONFIRM POSITION'}
                  </Button>
                  <Button variant="ghost" className="h-16 rounded-[2rem] text-[#a09eb1] font-black uppercase tracking-widest text-[10px]" onClick={() => setShowWaitlist(false)}>
                     MAYBE LATER
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
