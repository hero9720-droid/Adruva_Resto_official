'use client';

import { Clock, Users, UserPlus, Bell, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState([
    { id: '1', name: 'John Doe', partySize: 4, waitTime: 15, status: 'waiting' },
    { id: '2', name: 'Jane Smith', partySize: 2, waitTime: 5, status: 'notified' },
    { id: '3', name: 'Robert Brown', partySize: 6, waitTime: 30, status: 'waiting' },
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-primary/10 rounded-3xl">
               <Clock className="h-10 w-10 text-primary" />
             </div>
             Guest Queue
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide">Manage walk-in traffic and estimated wait times.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-secondary/50 px-8 py-5 rounded-3xl border border-border">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Wait</p>
              <p className="text-2xl font-black text-primary tracking-tighter">18 MINS</p>
           </div>
           <Button className="h-20 px-10 rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest border-none shadow-glow">
              <UserPlus className="h-6 w-6 mr-3" /> Add Guest
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-border flex flex-row items-center justify-between">
               <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">Active Queue</CardTitle>
               <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search guest..." className="pl-10 h-12 rounded-xl bg-secondary/50 border-none font-bold" />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {waitlist.map((guest) => (
                    <div key={guest.id} className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-all group">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                             {guest.partySize}
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-foreground tracking-tight">{guest.name}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Party of {guest.partySize}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wait Time</p>
                             <p className="text-lg font-black text-foreground tracking-tighter">{guest.waitTime}m</p>
                          </div>
                          <Badge className={cn(
                            "px-4 py-2 font-black uppercase tracking-widest text-[9px] rounded-xl border-none",
                            guest.status === 'waiting' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500 text-white'
                          )}>
                             {guest.status.toUpperCase()}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                             <Bell className="h-5 w-5" />
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <div className="space-y-8">
            <Card className="border border-primary/20 bg-primary/5 shadow-soft rounded-[2.5rem] p-10">
               <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">Table Availability</h3>
               <div className="space-y-6">
                  {[
                    { type: 'Small (2-4)', available: 4, total: 10 },
                    { type: 'Large (6-8)', available: 1, total: 5 },
                    { type: 'Booth', available: 0, total: 4 },
                  ].map((table) => (
                    <div key={table.type} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{table.type}</span>
                          <span className="font-black text-foreground text-lg">{table.available} / {table.total}</span>
                       </div>
                       <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(table.available/table.total)*100}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] p-10 text-center">
               <p className="text-slate-400 font-bold text-sm leading-relaxed mb-6">
                  Notify guests via SMS when their table is ready. Synchronized with the Floor Plan.
               </p>
               <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border hover:bg-secondary">
                  Open Floor Plan <ChevronRight className="h-4 w-4 ml-2" />
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
