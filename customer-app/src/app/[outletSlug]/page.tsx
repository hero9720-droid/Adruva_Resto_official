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
  ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useSocket } from '@/hooks/useSocket';

export default function DigitalMenu() {
  const { outletSlug } = useParams();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  
  const { items, addItem, updateQuantity, getTotal, getItemCount, clearCart } = useCart();
  
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [customer, setCustomer] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeOrder, setActiveOrder] = useState<any>(null);
  const { socket } = useSocket(menu?.outlet?.id);

  useEffect(() => {
    if (socket) {
      socket.on('order:status_change', (updatedOrder: any) => {
        if (activeOrder && updatedOrder.id === activeOrder.id) {
          setActiveOrder(updatedOrder);
        }
      });
      socket.on('item:ready', (item: any) => {
        if (activeOrder && item.order_id === activeOrder.id) {
          alert(`Your ${item.menu_item_name} is ready! 🍕`);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('order:status_change');
        socket.off('item:ready');
      }
    };
  }, [socket, activeOrder]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data } = await api.get(`/menu/public/${outletSlug}`);
        setMenu(data.data);
        if (data.data.categories.length > 0) {
          setSelectedCategory(data.data.categories[0].id);
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
        customer_id: customer?.id || null, // Link order to customer if logged in
        items: items.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          notes: ''
        }))
      });
      setActiveOrder(data.data);
      clearCart();
      alert(`Order #${data.data.order_number} placed successfully!`);
    } catch (error) {
      alert("Failed to place order. Please try again or call staff.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 font-black text-muted-foreground uppercase tracking-widest text-sm">Brewing Experience...</p>
    </div>
  );

  if (!menu) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="h-24 w-24 bg-card rounded-full shadow-none border border-border/10 flex items-center justify-center mb-6">
        <MapPin className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">Restaurant Not Found</h1>
      <p className="text-muted-foreground font-bold mb-8 max-w-sm">We couldn't find a digital menu for this link. Please check the URL or scan the QR code again.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-foreground">
      {/* Hero Header */}
      <div className="relative h-64 w-full overflow-hidden rounded-b-[2.5rem] shadow-none border-b border-border/10">
        <img 
          src={menu?.outlet?.banner_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070'} 
          className="w-full h-full object-cover"
          alt="Restaurant Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Active Order Status Bar */}
      <AnimatePresence>
        {activeOrder && activeOrder.status !== 'completed' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[60] bg-card/95 backdrop-blur-xl rounded-[2rem] p-4 shadow-2xl border border-border/10"
          >
             <div className="flex items-center justify-between gap-4">
                <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                   {activeOrder.status === 'confirmed' ? <Clock className="h-6 w-6 text-primary" /> : <ChefHat className="h-6 w-6 text-yellow-500" />}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order #{activeOrder.order_number}</span>
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">
                         {activeOrder.status === 'confirmed' ? 'In Kitchen' : activeOrder.status.toUpperCase()}
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: activeOrder.status === 'confirmed' ? '30%' : '70%' }}
                        className="h-full bg-primary rounded-full"
                      />
                   </div>
                </div>
                <button 
                  onClick={() => setActiveOrder(null)}
                  className="p-2 text-white/30 hover:text-white"
                >
                   <ChevronRight className="h-6 w-6" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Hero Actions */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
           <button 
             onClick={() => setShowBooking(true)}
             className="bg-white/20 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/30 transition-all shadow-lg"
           >
              <CalendarIcon className="h-4 w-4 text-white" />
              Book Table
           </button>
           {!customer ? (
             <button 
              onClick={() => setShowLogin(true)}
              className="bg-white/20 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/30 transition-all shadow-lg"
             >
                <Gift className="h-4 w-4 text-yellow-500" />
                Rewards
             </button>
           ) : (
             <div className="bg-yellow-500 px-4 py-2 rounded-xl border-none text-black flex items-center gap-3 shadow-xl">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase leading-none opacity-50">Rewards</span>
                   <span className="text-sm font-black leading-none">{customer.loyalty_points} PTS</span>
                </div>
                <div className="h-8 w-8 bg-black/10 rounded-lg flex items-center justify-center">
                   <Star className="h-4 w-4 fill-current" />
                </div>
             </div>
           )}
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex justify-between items-end">
             <div>
                <Badge className="mb-3 bg-primary text-primary-foreground border-none font-black uppercase tracking-widest px-3 py-1 text-[10px] shadow-sm">Open Now</Badge>
                <h1 className="text-4xl font-black tracking-tight">{menu?.outlet?.name || 'Adruva Gourmet'}</h1>
             </div>
             {tableId && (
                <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-[1.25rem] border border-white/20 shadow-lg text-center">
                   <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Table</p>
                   <p className="text-2xl font-black leading-none">#{tableId}</p>
                </div>
             )}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs font-bold text-white/80 uppercase tracking-widest">
             <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> 4.8</span>
             <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 20-30 min</span>
             <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {menu?.outlet?.city}</span>
          </div>
        </div>
      </div>

      {/* Login Overlay */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-border/10"
            >
               <button onClick={() => setShowLogin(false)} className="absolute top-6 right-8 text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[10px]">Close</button>
               <Gift className="h-12 w-12 text-yellow-500 mb-6" />
               <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight mb-2">Unlock Exclusive Gourmet Rewards</h2>
               <p className="text-xs font-bold text-muted-foreground mb-8 leading-relaxed">Enter your phone number to earn points on every bite and redeem them for free treats.</p>
               <div className="space-y-4">
                  <Input 
                    placeholder="Enter phone number" 
                    className="h-14 rounded-2xl border-border/10 bg-background font-black text-lg focus:border-primary transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button 
                    className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg"
                    onClick={() => handleLogin(phone)}
                    disabled={loggingIn || phone.length < 10}
                  >
                    {loggingIn ? 'Authenticating...' : 'View Rewards'}
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Overlay */}
      <AnimatePresence>
        {showBooking && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-border/10"
            >
               <button onClick={() => setShowBooking(false)} className="absolute top-6 right-8 text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[10px]">Close</button>
               <CalendarIcon className="h-12 w-12 text-primary mb-6" />
               <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight mb-2">Reserve Your Table</h2>
               <p className="text-xs font-bold text-muted-foreground mb-8 leading-relaxed">Tell us when you're coming, and we'll have your spot ready.</p>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Date</label>
                        <Input type="date" className="h-12 rounded-xl border-border/10 bg-background font-bold text-foreground" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Time</label>
                        <Input type="time" className="h-12 rounded-xl border-border/10 bg-background font-bold text-foreground" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Party Size</label>
                     <Input type="number" placeholder="Number of guests" className="h-12 rounded-xl border-border/10 bg-background font-bold text-foreground" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Phone Number</label>
                     <Input placeholder="For confirmation" className="h-12 rounded-xl border-border/10 bg-background font-bold text-foreground" />
                  </div>
                  
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs mt-6 shadow-[0_8px_32px_rgba(79,70,229,0.2)] transition-all"
                    onClick={() => {
                       alert("Reservation request sent! We'll confirm via SMS.");
                       setShowBooking(false);
                    }}
                  >
                    CONFIRM BOOKING
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/10 overflow-x-auto no-scrollbar flex items-center p-4 gap-3 shadow-none">
        {menu?.categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all",
              selectedCategory === cat.id 
                ? "bg-foreground text-background shadow-none" 
                : "bg-card text-muted-foreground border border-border/10 hover:border-foreground/50 hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="p-4 md:p-8 space-y-10 max-w-2xl mx-auto">
        {menu?.categories.filter((c: any) => !selectedCategory || c.id === selectedCategory).map((cat: any) => (
          <div key={cat.id} className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 px-2 text-foreground">
              {cat.name}
              <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{cat.items.length} ITEMS</span>
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {cat.items.map((item: any) => {
                const cartItem = items.find(i => i.id === item.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={item.id} 
                    className="bg-card p-5 rounded-[2rem] border border-border/10 flex gap-5 shadow-none relative overflow-hidden group"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            "h-3 w-3 border flex items-center justify-center p-[2px]",
                            item.food_type === 'veg' ? "border-green-500" : "border-destructive"
                          )}>
                            <div className={cn("h-full w-full rounded-full", item.food_type === 'veg' ? "bg-green-500" : "bg-destructive")} />
                          </div>
                          {item.is_featured && <Badge className="bg-destructive/10 text-destructive border-none font-black uppercase tracking-widest text-[8px] px-2 py-0.5">MUST TRY</Badge>}
                        </div>
                        <h3 className="font-black text-foreground text-lg leading-tight mb-1">{item.name}</h3>
                        <p className="text-xs font-bold text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex items-end justify-between pt-4 mt-auto">
                        <span className="text-xl font-black tracking-tighter text-foreground">₹{item.base_price_paise / 100}</span>
                        
                        {cartItem ? (
                           <div className="flex items-center bg-background rounded-xl overflow-hidden border border-border/10 shadow-none">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-black text-sm text-foreground">{cartItem.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="px-3 py-2 text-primary hover:bg-secondary transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                           </div>
                        ) : (
                          <Button 
                            onClick={() => addItem({
                              id: item.id,
                              name: item.name,
                              price_paise: item.base_price_paise,
                              food_type: item.food_type,
                              quantity: 1
                            })}
                            className="h-10 rounded-xl px-6 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-black uppercase tracking-widest text-[10px]"
                          >
                            ADD
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="relative h-32 w-32 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner">
                      <img 
                        src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                        alt={item.name}
                      />
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
            className="fixed bottom-6 left-6 right-6 z-50 max-w-2xl mx-auto"
          >
            <button 
              onClick={handlePlaceOrder}
              disabled={ordering}
              className="w-full bg-foreground text-background h-20 rounded-[2rem] flex items-center justify-between px-8 shadow-none group overflow-hidden active:scale-[0.98] transition-all border border-border/10"
            >
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary rounded-[1.25rem] flex items-center justify-center relative shadow-none">
                     <ShoppingBag className="h-6 w-6 text-primary-foreground" />
                     <span className="absolute -top-2 -right-2 h-6 w-6 bg-background text-foreground text-[10px] font-black rounded-full flex items-center justify-center border border-border/10">
                        {getItemCount()}
                     </span>
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-background/50 uppercase tracking-widest mb-0.5">Dine-in Order</p>
                     <p className="text-xl font-black tracking-tight text-background">{ordering ? 'PLACING...' : 'PLACE ORDER'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-background/50 uppercase tracking-widest mb-0.5">Total</p>
                     <p className="text-2xl font-black tracking-tighter text-background">₹{getTotal() / 100}</p>
                  </div>
                  {ordering ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <ChevronRight className="h-6 w-6 text-background/50 group-hover:text-background transition-colors" />}
               </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
