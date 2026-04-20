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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table Reservations</h1>
          <p className="text-slate-500">Manage guest bookings and floor availability.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2 font-bold text-slate-900">
               <CalendarIcon className="h-4 w-4 text-indigo-600" />
               {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
         </div>
         <div className="flex gap-2">
            <Badge variant="outline" className="bg-slate-50">Total: {reservations?.length || 0}</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Arrived: {reservations?.filter((r: any) => r.status === 'arrived').length}</Badge>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {isLoading ? (
             <div className="h-64 flex items-center justify-center text-slate-400">Loading bookings...</div>
           ) : reservations?.length === 0 ? (
             <div className="h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3">
                <CalendarIcon className="h-12 w-12 opacity-10" />
                <p>No reservations found for this date.</p>
                <Button variant="link" className="text-indigo-600">Create the first one</Button>
             </div>
           ) : (
             reservations.map((res: any) => (
               <Card key={res.id} className={`border-slate-200 hover:shadow-md transition-shadow group ${res.status === 'cancelled' ? 'opacity-50' : ''}`}>
                  <CardContent className="p-0">
                     <div className="flex items-stretch min-h-[100px]">
                        <div className="w-24 bg-slate-50 flex flex-col items-center justify-center border-r border-slate-100 p-4">
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Time</span>
                           <span className="text-xl font-black text-slate-900 leading-none">
                              {new Date(res.reservation_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                           </span>
                        </div>
                        <div className="flex-1 p-5 flex items-center justify-between">
                           <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                 <h3 className="font-black text-lg text-slate-900">{res.customer_name}</h3>
                                 <Badge className={cn(
                                    "rounded-lg font-black text-[10px] border-none px-2",
                                    res.status === 'confirmed' ? 'bg-indigo-500 text-white' :
                                    res.status === 'seated' ? 'bg-green-600 text-white' :
                                    res.status === 'arrived' ? 'bg-amber-500 text-white' :
                                    'bg-slate-200 text-slate-600'
                                 )}>
                                    {res.status.toUpperCase()}
                                 </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                 <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-indigo-400" /> {res.party_size} Guests</span>
                                 <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-amber-400" /> 
                                    {res.table_name ? `Table ${res.table_name}` : <span className="text-amber-600 underline underline-offset-4 cursor-pointer">Assign Table</span>}
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
           <Card className="border-slate-200">
              <CardHeader>
                 <CardTitle className="text-lg">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <Clock className="h-5 w-5 text-indigo-600" />
                       <span className="text-sm font-medium">Next Arrival</span>
                    </div>
                    <span className="font-bold">19:30</span>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Seated Guests</span>
                       <span className="font-bold">14</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Upcoming (2h)</span>
                       <span className="font-bold text-indigo-600">4 Bookings</span>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2"><Star className="h-12 w-12 text-indigo-100 fill-current" /></div>
              <CardHeader className="relative z-10">
                 <CardTitle className="text-sm uppercase font-black text-indigo-900 tracking-wider">VIP Note</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                 <p className="text-xs text-indigo-700 leading-relaxed italic">
                    "Mr. Sharma is celebrating his anniversary. Prefers a corner table with candlelight if possible."
                 </p>
                 <div className="flex items-center gap-2 mt-4">
                    <div className="h-6 w-px bg-indigo-200" />
                    <p className="text-[10px] text-indigo-400 font-bold uppercase">Linked to Guest ID: 9872</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
