'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Users, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Mail, 
  Phone,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  MonitorCheck,
  Zap,
  Globe,
  Camera,
  Map as GoogleMap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfToday } from 'date-fns';

export default function GlobalReservationHub() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    phone: '',
    email: '',
    party_size: 2,
    reservation_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: '',
    source: 'walk_in'
  });

  const { toast } = useToast();

  const fetchReservations = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      const res = await api.get(`/reservations/${outletId}?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      setReservations(res.data.data);
    } catch (err) {
      console.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedDate]);

  const handleBookingSubmit = async () => {
    const outletId = localStorage.getItem('last_outlet_id');
    try {
      await api.post(`/reservations/${outletId}`, newBooking);
      toast({ title: "Booking Confirmed", description: `Table reserved for ${newBooking.customer_name}.` });
      setShowBookingModal(false);
      fetchReservations();
    } catch (err) {
      toast({ variant: "destructive", title: "Booking failed" });
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      toast({ title: `Status Updated`, description: `Reservation marked as ${status}.` });
      fetchReservations();
    } catch (err) {
      console.error('Update failed');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Synchronizing Global Bookings...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Hub Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <CalendarDays className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Global Reservation Hub</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Seat <br />
             <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Centralize bookings from Google, Instagram, and Walk-ins. Optimize table turnover and manage guest arrivals with real-time seat assignment.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowBookingModal(true)}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <UserPlus className="h-5 w-5" /> Reserve Table
           </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-card p-6 rounded-[2.5rem] border border-border shadow-soft gap-6">
         <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="h-12 w-12 rounded-xl border border-border p-0"><ChevronLeft className="h-5 w-5" /></Button>
            <div className="text-center px-6">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Target Date</p>
               <p className="text-xl font-black text-foreground tracking-tighter uppercase">{format(selectedDate, 'EEEE, MMM do')}</p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="h-12 w-12 rounded-xl border border-border p-0"><ChevronRight className="h-5 w-5" /></Button>
         </div>

         <div className="flex items-center gap-4">
            <div className="bg-secondary p-1 rounded-xl flex gap-1">
               <Button 
                variant={view === 'list' ? 'default' : 'ghost'} 
                onClick={() => setView('list')}
                className={cn("h-10 px-4 rounded-lg font-black uppercase text-[9px] tracking-widest", view === 'list' && "bg-primary text-white")}
               >
                  <List className="h-4 w-4 mr-2" /> List
               </Button>
               <Button 
                variant={view === 'grid' ? 'default' : 'ghost'} 
                onClick={() => setView('grid')}
                className={cn("h-10 px-4 rounded-lg font-black uppercase text-[9px] tracking-widest", view === 'grid' && "bg-primary text-white")}
               >
                  <LayoutGrid className="h-4 w-4 mr-2" /> Grid
               </Button>
            </div>
            <div className="h-12 w-[1px] bg-border mx-2" />
            <div className="flex gap-2">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase">
                  {reservations.filter(r => r.status === 'confirmed').length} Confirmed
               </Badge>
               <Badge className="bg-blue-500/10 text-blue-500 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase">
                  {reservations.filter(r => r.status === 'arrived').length} Arrived
               </Badge>
            </div>
         </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-6">
         {reservations.length === 0 ? (
           <div className="py-40 text-center space-y-4 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border">
              <div className="h-20 w-20 bg-secondary rounded-full mx-auto flex items-center justify-center text-slate-300">
                 <CalendarDays className="h-10 w-10" />
              </div>
              <div>
                 <p className="text-xl font-black text-foreground uppercase tracking-tighter">Quiet Day Ahead</p>
                 <p className="text-sm font-bold text-slate-500">No bookings found for this date. Go ahead and add some manually!</p>
              </div>
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-6">
              {reservations.map((res) => (
                <Card key={res.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden hover:border-primary transition-all group">
                   <CardContent className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-10">
                         <div className="text-center w-24">
                            <p className="text-2xl font-black text-foreground tracking-tighter">{format(new Date(res.reservation_at), 'HH:mm')}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Arrival</p>
                         </div>
                         <div className="h-16 w-[1px] bg-border" />
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <p className="text-3xl font-black text-foreground tracking-tighter uppercase">{res.customer_name}</p>
                               <Badge className={cn(
                                 "border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg",
                                 res.source === 'google' ? "bg-red-500/10 text-red-500" : res.source === 'meta' ? "bg-blue-500/10 text-blue-500" : "bg-slate-500/10 text-slate-500"
                               )}>
                                  {res.source === 'google' && <GoogleMap className="h-3 w-3 mr-1 inline" />}
                                  {res.source === 'meta' && <Camera className="h-3 w-3 mr-1 inline" />}
                                  {res.source === 'web' && <Globe className="h-3 w-3 mr-1 inline" />}
                                  {res.source}
                               </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" /> {res.party_size} Pax</span>
                               <span className="flex items-center gap-1.5 text-foreground"><MapPin className="h-3.5 w-3.5 text-primary" /> {res.table_name || 'Unassigned'}</span>
                               <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {res.phone}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         {res.status === 'confirmed' && (
                           <Button 
                             onClick={() => handleStatusUpdate(res.id, 'arrived')}
                             className="bg-emerald-500 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20 gap-2"
                           >
                              <Zap className="h-4 w-4" /> Guest Arrived
                           </Button>
                         )}
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button variant="ghost" className="h-14 w-14 rounded-2xl border border-border p-0"><MoreVertical className="h-5 w-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-2xl">
                               <DropdownMenuItem onClick={() => handleStatusUpdate(res.id, 'no_show')} className="rounded-xl font-bold gap-3 p-3 text-red-500"><XCircle className="h-4 w-4" /> Mark No-show</DropdownMenuItem>
                               <DropdownMenuItem className="rounded-xl font-bold gap-3 p-3"><Zap className="h-4 w-4" /> Change Table</DropdownMenuItem>
                               <DropdownMenuItem className="rounded-xl font-bold gap-3 p-3"><Mail className="h-4 w-4" /> Send Reminder</DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
         )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
         <DialogContent className="max-w-4xl rounded-[4rem] p-0 border-none bg-card shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
               <div className="flex-1 p-12 space-y-8">
                  <div>
                     <h2 className="text-4xl font-black uppercase tracking-tighter">Manual Booking</h2>
                     <p className="font-bold text-slate-500">Reserve a table for phone or walk-in customers.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Guest Name</label>
                        <Input 
                          placeholder="Full Name"
                          value={newBooking.customer_name}
                          onChange={(e) => setNewBooking({...newBooking, customer_name: e.target.value})}
                          className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                        <Input 
                          placeholder="+91 00000 00000"
                          value={newBooking.phone}
                          onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                          className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Party Size</label>
                        <Input 
                          type="number"
                          value={newBooking.party_size}
                          onChange={(e) => setNewBooking({...newBooking, party_size: Number(e.target.value)})}
                          className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date & Time</label>
                        <Input 
                          type="datetime-local"
                          value={newBooking.reservation_at}
                          onChange={(e) => setNewBooking({...newBooking, reservation_at: e.target.value})}
                          className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Special Notes</label>
                     <Input 
                       placeholder="e.g. Birthday celebration, window seat..."
                       value={newBooking.notes}
                       onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
               </div>

               <div className="w-full md:w-[350px] bg-[#1b1b24] p-12 flex flex-col justify-between">
                  <div className="space-y-8">
                     <div className="h-20 w-20 bg-primary/10 rounded-[2.25rem] flex items-center justify-center text-primary shadow-glow">
                        <MonitorCheck className="h-10 w-10" />
                     </div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Availability Sync</h3>
                     <p className="text-white/40 font-bold leading-relaxed">The system will automatically suggest the best table based on the party size and buffer times.</p>
                  </div>

                  <div className="space-y-4">
                     <Button 
                      onClick={handleBookingSubmit}
                      className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
                     >
                        Confirm Booking
                     </Button>
                     <Button variant="ghost" onClick={() => setShowBookingModal(false)} className="w-full text-white/40 h-14 font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
