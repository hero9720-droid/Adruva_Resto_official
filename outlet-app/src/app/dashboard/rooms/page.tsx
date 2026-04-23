'use client';

import { useState } from 'react';
import { 
  Bed, 
  User, 
  Clock, 
  DoorOpen, 
  Plus, 
  ArrowRightCircle,
  History,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRooms, useCheckIn, useCheckOut } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateRoom } from '@/hooks/useRooms';

export default function RoomsPage() {
  const router = useRouter();
  const { data: rooms, isLoading } = useRooms();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [guestName, setGuestName] = useState('');

  const handleCheckIn = async () => {
    if (!selectedRoom || !guestName) return;
    try {
      await checkIn.mutateAsync({ id: selectedRoom.id, guest_name: guestName });
      toast({ title: 'Checked In', description: `${guestName} is now in ${selectedRoom.name}` });
      setSelectedRoom(null);
      setGuestName('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Check-in failed' });
    }
  };

  const handleCheckOut = async (room: any) => {
    try {
      await checkOut.mutateAsync(room.id);
      toast({ title: 'Checked Out', description: `${room.guest_name} has checked out.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Check-out failed' });
    }
  };

  const openRoomService = (room: any) => {
    // Redirect to POS with room context (need to update POS to handle this)
    router.push(`/dashboard/pos?room_id=${room.id}`);
  };

  if (isLoading) return <div className="p-8 h-screen flex items-center justify-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Hospitality Ledger...</div>;

  return (
    <div className="flex flex-col min-h-0 bg-background font-sans pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
            ROOMS
            <div className="h-4 w-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Hotel Hospitality Control</p>
        </div>
        
           <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex bg-secondary p-1.5 rounded-2xl border border-border shadow-inner">
                <div className="flex items-center gap-2 px-6 py-2.5 bg-card rounded-xl shadow-sm border border-border">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-foreground">
                    {rooms?.filter((r:any) => r.status === 'available').length} Vacant
                  </span>
                </div>
                <div className="flex items-center gap-2 px-6 py-2.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {rooms?.filter((r:any) => r.status === 'occupied').length} Occupied
                  </span>
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none w-full sm:w-auto">
                    <Plus className="h-5 w-5 mr-2" /> ADD ROOM
                  </Button>
                </DialogTrigger>
                <AddRoomDialog />
              </Dialog>
           </div>
      </div>

      {/* Room Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {rooms?.map((room: any) => (
               <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={room.id}
                className={cn(
                  "group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden shadow-soft",
                  room.status === 'available' ? "bg-card border-border hover:border-emerald-200 hover:shadow-glow-sm" :
                  room.status === 'occupied' ? "bg-primary/10 border-primary/20" :
                  "bg-amber-500/10 border-amber-500/20"
                )}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Bed className="h-32 w-32 -mr-8 -mt-8 rotate-12" />
                </div>

                 <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Floor {room.floor}</span>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter mt-1">{room.name}</h3>
                  </div>
                  <Badge className={cn(
                    "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                    room.status === 'available' ? "bg-emerald-500 text-white" :
                    room.status === 'occupied' ? "bg-primary text-primary-foreground shadow-glow-sm" :
                    "bg-amber-500 text-white"
                  )}>
                    {room.status}
                  </Badge>
                </div>

                 {room.status === 'occupied' ? (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4 p-4 bg-card/60 backdrop-blur-md rounded-2xl border border-border shadow-sm">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Guest</span>
                        <span className="font-black text-foreground">{room.guest_name}</span>
                      </div>
                    </div>
                     <div className="flex items-center justify-between px-2">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Room Service</span>
                          <span className="font-black text-2xl text-foreground">₹{(room.accumulated_paise / 100).toLocaleString()}</span>
                       </div>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="rounded-xl border-border text-slate-600 hover:text-primary hover:bg-primary/10"
                         onClick={() => openRoomService(room)}
                       >
                         <Plus className="h-4 w-4 mr-1" /> ORDER
                       </Button>
                    </div>
                     <div className="pt-6 grid grid-cols-2 gap-3">
                       <Button 
                         className="h-12 rounded-xl bg-card text-foreground border border-border hover:bg-secondary font-black text-xs uppercase"
                         onClick={() => handleCheckOut(room)}
                       >
                         CHECK OUT
                       </Button>
                       <Button className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs uppercase border-none">
                         BILLING
                       </Button>
                    </div>
                  </div>
                 ) : room.status === 'available' ? (
                  <div className="flex flex-col gap-8 h-full justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                       <DoorOpen className="h-5 w-5" />
                       <span className="text-sm font-black uppercase tracking-tighter">Ready for guest arrival</span>
                    </div>
                    <Button 
                      className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 border-none uppercase tracking-widest"
                      onClick={() => setSelectedRoom(room)}
                    >
                      CHECK IN
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 h-full justify-between">
                     <div className="flex items-center gap-3 text-amber-600">
                        <Clock className="h-5 w-5 animate-spin-slow" />
                        <span className="text-sm font-bold uppercase tracking-tighter">Cleaning in progress</span>
                     </div>
                     <Button 
                       variant="outline"
                       className="w-full h-14 rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50 font-black uppercase tracking-widest"
                     >
                       MARK READY
                     </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Check-in Modal */}
       <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Bed className="h-48 w-48 -mr-12 -mt-12" />
              </div>

               <div className="relative z-10">
                <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">Check In</h2>
                <p className="text-slate-500 font-medium text-lg mb-10 flex items-center gap-2">
                  Assigning guest to <span className="text-primary font-black uppercase">{selectedRoom.name}</span>
                </p>
                
                <div className="space-y-8">
                   <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Full Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="w-full h-16 rounded-2xl bg-secondary border-none px-6 text-lg font-black text-foreground placeholder:text-slate-500 focus:ring-2 ring-primary/20 transition-all shadow-inner"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                   <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-primary" 
                      onClick={() => { setSelectedRoom(null); setGuestName(''); }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 border-none uppercase tracking-widest"
                      onClick={handleCheckIn}
                      disabled={!guestName}
                    >
                      Confirm Arrival
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddRoomDialog() {
  const createRoom = useCreateRoom();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    type: 'Standard',
    capacity: 2,
    floor: 1,
    status: 'available'
  });

  const handleSave = async () => {
    if (!form.name) return;
    try {
      await createRoom.mutateAsync(form);
      toast({ title: "Room Created", description: `Room ${form.name} added to inventory.` });
      setForm({ name: '', type: 'Standard', capacity: 2, floor: 1, status: 'available' });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to create room" });
    }
  };

  return (
     <DialogContent className="max-w-md rounded-[2.5rem] border-none p-10 bg-card shadow-soft font-sans">
      <DialogHeader>
        <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">New Room</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-6">
         <div className="space-y-2">
          <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Room Name / Number</Label>
          <Input 
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="e.g. 101 or Executive A" 
            className="px-6 h-14 rounded-2xl border-none shadow-soft font-black text-lg bg-background text-foreground" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Floor</Label>
            <Input 
              type="number"
              value={form.floor}
              onChange={(e) => setForm({...form, floor: parseInt(e.target.value)})}
              className="px-6 h-14 rounded-2xl border-none shadow-soft font-black text-lg bg-background text-foreground" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Capacity</Label>
            <Input 
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({...form, capacity: parseInt(e.target.value)})}
              className="px-6 h-14 rounded-2xl border-none shadow-soft font-black text-lg bg-background text-foreground" 
            />
          </div>
        </div>
      </div>
      <DialogFooter>
         <Button 
          onClick={handleSave}
          disabled={!form.name || createRoom.isPending}
          className="w-full h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-black shadow-lg shadow-black/10 tracking-widest uppercase transition-all active:scale-[0.98] border-none"
        >
          {createRoom.isPending ? 'CREATING...' : 'ADD ROOM TO HOTEL'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
