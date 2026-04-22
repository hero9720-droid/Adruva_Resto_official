'use client';

import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Star
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReservations, useUpdateReservationStatus } from '@/hooks/useReservations';
import { useToast } from '@/hooks/use-toast';

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: reservations, isLoading } = useReservations(selectedDate);
  const updateStatus = useUpdateReservationStatus();
  const { toast } = useToast();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: "Status Updated", description: `Reservation is now ${status}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Update failed" });
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-background -m-8 p-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Table Reservations</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage guest bookings and floor availability.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-soft">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-border hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2 font-black text-foreground">
               <CalendarIcon className="h-4 w-4 text-primary" />
               {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <Button variant="outline" size="icon" className="border-border hover:bg-secondary"><ChevronRight className="h-4 w-4" /></Button>
         </div>
         <div className="flex gap-2">
            <Badge variant="outline" className="bg-secondary border-border text-slate-500">Total: {reservations?.length || 0}</Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Arrived: {reservations?.filter((r: any) => r.status === 'arrived').length}</Badge>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Registry...</div>
            ) : reservations?.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 bg-card/50">
                 <CalendarIcon className="h-12 w-12 opacity-10" />
                 <p className="font-black uppercase tracking-widest text-xs">No reservations found</p>
                 <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px]">Create the first one</Button>
              </div>
           ) : (
              reservations.map((res: any) => (
                <Card key={res.id} className={`border-border bg-card hover:shadow-glow-sm transition-all group rounded-[2rem] overflow-hidden ${res.status === 'cancelled' ? 'opacity-50' : ''}`}>
                   <CardContent className="p-0">
                      <div className="flex items-stretch min-h-[100px]">
                         <div className="w-24 bg-secondary flex flex-col items-center justify-center border-r border-border p-4">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Time</span>
                            <span className="text-xl font-black text-foreground leading-none">
                               {new Date(res.reservation_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                         </div>
                         <div className="flex-1 p-5 flex items-center justify-between">
                            <div className="space-y-1.5">
                               <div className="flex items-center gap-3">
                                  <h3 className="font-black text-lg text-foreground">{res.customer_name}</h3>
                                  <Badge className={cn(
                                     "rounded-lg font-black text-[10px] border-none px-2",
                                     res.status === 'confirmed' ? 'bg-primary text-primary-foreground' :
                                     res.status === 'seated' ? 'bg-emerald-500 text-white' :
                                     res.status === 'arrived' ? 'bg-amber-500 text-white' :
                                     'bg-secondary text-slate-600'
                                  )}>
                                     {res.status.toUpperCase()}
                                  </Badge>
                               </div>
                               <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary/60" /> {res.party_size} Guests</span>
                                  <span className="flex items-center gap-1.5">
                                     <MapPin className="h-3.5 w-3.5 text-amber-500/60" /> 
                                     {res.table_name ? `Table ${res.table_name}` : <span className="text-amber-500 underline underline-offset-4 cursor-pointer">Assign Table</span>}
                                  </span>
                                  {res.phone && <span className="text-slate-300 font-medium">| {res.phone}</span>}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {res.status === 'pending' && (
                                <Button size="sm" className="bg-indigo-600 font-black text-xs" onClick={() => handleStatusUpdate(res.id, 'confirmed')}>
                                   CONFIRM
                                </Button>
                              )}
                              {res.status === 'confirmed' && (
                                <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 font-black text-xs" onClick={() => handleStatusUpdate(res.id, 'arrived')}>
                                   <UserCheck className="h-3.5 w-3.5 mr-1.5" /> ARRIVED
                                </Button>
                              )}
                              {res.status === 'arrived' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 font-black text-xs" onClick={() => handleStatusUpdate(res.id, 'seated')}>
                                   SEAT GUEST
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-slate-600"><MoreVertical className="h-4 w-4" /></Button>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
             ))
           )}
        </div>

         <div className="space-y-6">
            <Card className="border-border bg-card rounded-[2rem] overflow-hidden shadow-soft">
               <CardHeader className="border-b border-border bg-secondary/30">
                  <CardTitle className="text-lg font-black tracking-tighter uppercase text-foreground">Quick Summary</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                     <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold text-foreground">Next Arrival</span>
                     </div>
                     <span className="font-black text-foreground">19:30</span>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Seated Guests</span>
                        <span className="font-black text-foreground">14</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Upcoming (2h)</span>
                        <span className="font-black text-primary">4 Bookings</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 overflow-hidden relative rounded-[2rem]">
               <div className="absolute top-0 right-0 p-2"><Star className="h-12 w-12 text-primary/10 fill-current" /></div>
               <CardHeader className="relative z-10">
                  <CardTitle className="text-sm uppercase font-black text-primary tracking-wider">VIP Note</CardTitle>
               </CardHeader>
               <CardContent className="relative z-10">
                  <p className="text-xs text-foreground/80 leading-relaxed italic font-medium">
                     "Mr. Sharma is celebrating his anniversary. Prefers a corner table with candlelight if possible."
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                     <div className="h-6 w-px bg-primary/20" />
                     <p className="text-[10px] text-primary/60 font-bold uppercase">Linked to Guest ID: 9872</p>
                  </div>
               </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
