'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Clock, Users, MapPin, 
  LogIn, LogOut, Timer, 
  AlertCircle, CheckCircle2, Calendar,
  Monitor, Smartphone, Fingerprint, 
  ChevronRight, MoreVertical, Coffee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function DutyRosterPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: liveRoster, isLoading } = useQuery({
    queryKey: ['live-roster'],
    queryFn: async () => {
      const { data } = await api.get('/staff/duty/live-roster');
      return data.data;
    },
  });

  const clockIn = useMutation({
    mutationFn: async () => {
      await api.post('/staff/duty/clock-in', { method: 'app' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-roster'] });
      toast({ title: "Clock-In Successful", description: "Your duty cycle has started." });
    }
  });

  const clockOut = useMutation({
    mutationFn: async () => {
      await api.post('/staff/duty/clock-out', { method: 'app' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-roster'] });
      toast({ title: "Clock-Out Successful", description: "Shift ended. Have a great day!" });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-[3rem]" />)}
    </div>
  </div>;

  const isClockedIn = liveRoster?.some((a: any) => a.staff_id === 'current_user_id_placeholder'); // In real app, match with user hook

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Timer className="h-4 w-4" /> Live Operations
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Duty Command Center</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">Shift Scheduler</Button>
           {isClockedIn ? (
             <Button 
               onClick={() => clockOut.mutate()}
               className="bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl px-8 shadow-lg shadow-red-500/20"
             >
                <LogOut className="h-4 w-4 mr-2" /> Finish Shift
             </Button>
           ) : (
             <Button 
               onClick={() => clockIn.mutate()}
               className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow"
             >
                <LogIn className="h-4 w-4 mr-2" /> Clock-In Now
             </Button>
           )}
        </div>
      </div>

      {/* Roster Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Users className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active On-Duty</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {liveRoster?.length || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-card overflow-hidden border-l-4 border-amber-500">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                 <AlertCircle className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Arrivals</span>
              <span className="text-4xl font-black tracking-tighter text-foreground">
                 {liveRoster?.filter((a: any) => a.is_late).length || 0}
              </span>
           </CardContent>
        </Card>

        <Card className="border-none shadow-soft rounded-[2rem] bg-indigo-600 text-white overflow-hidden">
           <CardContent className="p-8 flex flex-col gap-2 relative">
              <div className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                 <Coffee className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">In Break</span>
              <span className="text-4xl font-black tracking-tighter">0</span>
           </CardContent>
        </Card>
      </div>

      {/* Live Roster Feed */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Live Staff Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveRoster?.map((attendance: any) => (
            <Card key={attendance.id} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all border border-transparent hover:border-primary/20">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl">
                         {attendance.staff_name[0]}
                      </div>
                      <div>
                         <h4 className="font-black text-foreground uppercase tracking-tight">{attendance.staff_name}</h4>
                         <p className="text-[9px] font-black text-primary uppercase tracking-widest">{attendance.role}</p>
                      </div>
                   </div>
                   <Badge className={cn(
                     "h-6 px-3 border-none font-black text-[9px] uppercase tracking-widest",
                     attendance.is_late ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                   )}>
                      {attendance.is_late ? 'LATE' : 'ON TIME'}
                   </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clocked In</p>
                      <p className="text-sm font-bold text-foreground">
                         {format(new Date(attendance.clock_in), 'hh:mm a')}
                      </p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Method</p>
                      <div className="flex items-center gap-1 text-slate-600">
                         {attendance.clock_in_method === 'biometric' ? <Fingerprint className="h-3 w-3" /> : 
                          attendance.clock_in_method === 'app' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                         <span className="text-[10px] font-bold uppercase">{attendance.clock_in_method}</span>
                      </div>
                   </div>
                </div>

                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attendance.shift_name || 'No Shift'}</span>
                   </div>
                   <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-secondary">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {liveRoster?.length === 0 && (
             <div className="col-span-full h-40 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 gap-2">
                <Users className="h-8 w-8" />
                <p className="text-xs font-black uppercase tracking-widest">No staff members currently on duty</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
