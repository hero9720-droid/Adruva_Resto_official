'use client';

import { useState } from 'react';
import { 
  Users, 
  Clock, 
  PlayCircle, 
  StopCircle, 
  UserPlus, 
  History,
  TrendingUp,
  Wallet,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffList, useAttendance, useShift, useCreateStaff, useCurrentStatus } from '@/hooks/useStaff';
import { useToast } from '@/hooks/use-toast';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('directory');
  
  // Add Staff dialog state
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'waiter', pin: '', base_pay: '' });

  const { data: staff, isLoading: staffLoading } = useStaffList(activeTab === 'payroll' ? 'payroll' : undefined);
  const { clockIn, clockOut } = useAttendance();
  const { startShift, endShift } = useShift();
  const { data: currentStatus } = useCurrentStatus();
  const createStaff = useCreateStaff();
  const { toast } = useToast();

  const isClockedIn = currentStatus?.isClockedIn || false;
  const isShiftActive = currentStatus?.isShiftActive || false;

  const handleAddStaff = async () => {
    if (!newStaff.name.trim() || !newStaff.role) return;
    try {
      await createStaff.mutateAsync({
        name: newStaff.name,
        role: newStaff.role,
        pin: newStaff.pin || undefined,
        base_pay_paise: Math.round(Number(newStaff.base_pay || 0) * 100),
      });
      toast({ title: 'Staff Added', description: `${newStaff.name} has been added to the team.` });
      setNewStaff({ name: '', role: 'waiter', pin: '', base_pay: '' });
      setAddStaffOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to add staff' });
    }
  };

  const handleClockToggle = async () => {
    try {
      if (isClockedIn) {
        await clockOut.mutateAsync();
        toast({ title: "Clocked Out", description: "Your attendance has been recorded.", className: "bg-card text-foreground border-border" });
      } else {
        await clockIn.mutateAsync();
        toast({ title: "Clocked In", description: "Welcome back! Duty started.", className: "bg-primary text-primary-foreground border-none shadow-glow" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  const [shiftAmount, setShiftAmount] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  const handleShiftToggle = async () => {
    try {
      if (isShiftActive) {
        await endShift.mutateAsync({ closing_cash_paise: Math.round(Number(shiftAmount) * 100), notes: shiftNotes });
        toast({ title: "Shift Ended", description: "Register reconciled successfully." });
      } else {
        await startShift.mutateAsync({ opening_cash_paise: Math.round(Number(shiftAmount) * 100), notes: shiftNotes });
        toast({ title: "Shift Started", description: "Register is now live." });
      }
      setShiftAmount('');
      setShiftNotes('');
    } catch {
      toast({ variant: 'destructive', title: 'Shift update failed' });
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 bg-background font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">WORKFORCE</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage attendance, shifts and staff members.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleClockToggle} 
            className={cn(
              "h-14 px-8 rounded-2xl font-black tracking-widest uppercase transition-all shadow-soft border-none",
              isClockedIn 
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                : "bg-card text-primary hover:bg-secondary border border-border"
            )}
          >
            <Clock className="h-5 w-5 mr-3" />
            {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>
          <Button
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black shadow-glow tracking-widest uppercase transition-all active:scale-[0.98] border-none"
            onClick={() => setAddStaffOpen(true)}
          >
            <UserPlus className="h-5 w-5 mr-3" />
            Add Staff
          </Button>

          {/* Add Staff Dialog */}
          <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
            <DialogContent className="bg-card rounded-[2rem] border-border shadow-2xl p-8 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-foreground tracking-tighter">Add Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name *</Label>
                  <Input
                    value={newStaff.name}
                    onChange={e => setNewStaff(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Ravi Sharma"
                    className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-bold text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Role *</Label>
                  <Select value={newStaff.role} onValueChange={v => setNewStaff(p => ({ ...p, role: v }))}>
                    <SelectTrigger className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border shadow-xl bg-card">
                      <SelectItem value="outlet_manager">Outlet Manager</SelectItem>
                      <SelectItem value="captain">Captain</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">POS PIN</Label>
                    <Input
                      type="password"
                      maxLength={6}
                      value={newStaff.pin}
                      onChange={e => setNewStaff(p => ({ ...p, pin: e.target.value }))}
                      placeholder="4-6 digits"
                      className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Base Pay (₹/mo)</Label>
                    <Input
                      type="number"
                      value={newStaff.base_pay}
                      onChange={e => setNewStaff(p => ({ ...p, base_pay: e.target.value }))}
                      placeholder="15000"
                      className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-bold text-foreground"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-3 sm:gap-0 mt-2">
                <Button variant="ghost" onClick={() => setAddStaffOpen(false)} className="h-14 rounded-2xl font-black text-slate-500 hover:bg-secondary hover:text-foreground">CANCEL</Button>
                <Button
                  onClick={handleAddStaff}
                  disabled={createStaff.isPending || !newStaff.name.trim()}
                  className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black shadow-glow border-none"
                >
                  {createStaff.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ADD STAFF'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-8 border-b border-border">
         {['directory', 'attendance', 'payroll'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative",
               activeTab === tab ? "text-foreground" : "text-slate-400 hover:text-slate-500"
             )}
           >
             {tab}
             {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card shadow-soft rounded-[2rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shadow-inner text-primary">
                <TrendingUp className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Staff</p>
                <p className="text-4xl font-black text-foreground tracking-tighter mt-1">{staff?.length || 0}</p>
             </div>
          </div>
        </div>

        <div className="bg-card shadow-soft rounded-[2rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner text-emerald-500">
                <Users className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Members</p>
                <p className="text-4xl font-black text-foreground tracking-tighter mt-1">{staff?.filter((s: any) => s.is_active).length || 0}</p>
             </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-card text-foreground shadow-soft rounded-[2.5rem] overflow-hidden relative group transition-transform hover:-translate-y-1 border border-border">
           <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-primary/5 to-transparent -skew-x-12 translate-x-16" />
           <div className="p-8 h-full flex items-center justify-between relative z-10">
              <div className="space-y-2">
                 <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Current Shift Status</p>
                 <h2 className="text-4xl font-black tracking-tighter uppercase">{isShiftActive ? "Live & Open" : "Shift Closed"}</h2>
                 <p className="text-sm text-slate-500 font-medium">{isShiftActive ? "Register is accepting transactions." : "Open a shift to start billing."}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className={cn(
                      "h-16 px-8 rounded-2xl font-black text-lg uppercase tracking-widest transition-all",
                      isShiftActive 
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                    )}
                  >
                    {isShiftActive ? <><StopCircle className="h-6 w-6 mr-3" /> END SHIFT</> : <><PlayCircle className="h-6 w-6 mr-3" /> START SHIFT</>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card rounded-[2.5rem] p-8 border-border shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-foreground tracking-tighter text-center">
                      {isShiftActive ? "End Shift & Reconcile" : "Start New Shift"}
                    </DialogTitle>
                  </DialogHeader>
                      <div className="space-y-6 py-6">
                         <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">{isShiftActive ? "Closing Cash (in Register)" : "Opening Cash (Float)"}</Label>
                            <Input 
                              type="number" 
                              placeholder="Enter amount in ₹" 
                              value={shiftAmount}
                              onChange={e => setShiftAmount(e.target.value)}
                              className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-black text-lg text-foreground" 
                            />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Notes</Label>
                            <Input 
                              placeholder="Any remarks..." 
                              value={shiftNotes}
                              onChange={e => setShiftNotes(e.target.value)}
                              className="h-14 rounded-2xl bg-secondary border-border focus:border-primary text-foreground" 
                            />
                         </div>
                      </div>
                      <DialogFooter className="gap-3 sm:gap-0 mt-4">
                        <Button variant="ghost" className="h-14 rounded-2xl font-black text-slate-500 hover:bg-secondary hover:text-foreground">CANCEL</Button>
                        <Button 
                          className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black shadow-glow border-none" 
                          onClick={handleShiftToggle}
                          disabled={startShift.isPending || endShift.isPending}
                        >
                          {isShiftActive ? "CLOSE SHIFT" : "OPEN SHIFT"}
                        </Button>
                      </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'directory' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="directory"
              >
                <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
                  <div className="p-8 pb-4 flex flex-row items-center justify-between border-b border-secondary">
                     <div>
                       <h2 className="text-2xl font-black text-foreground">Staff Directory</h2>
                       <p className="font-medium text-slate-500 mt-1">Manage roles and permissions.</p>
                     </div>
                     <Badge className="bg-secondary text-primary hover:bg-secondary/90 border border-border px-4 py-2 font-black rounded-xl">ALL STAFF</Badge>
                  </div>
                  <div className="p-0">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14 pl-8">Staff Name</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Role</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Status</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14 text-right pr-8">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {staffLoading ? (
                             <TableRow><TableCell colSpan={4} className="text-center p-12 text-slate-400 font-black uppercase tracking-[0.2em]">Loading staff...</TableCell></TableRow>
                           ) : staff?.length === 0 ? (
                             <TableRow><TableCell colSpan={4} className="text-center p-12 text-slate-400 font-black uppercase tracking-[0.2em]">No staff members found.</TableCell></TableRow>
                           ) : (
                             staff?.map((s: any) => (
                               <TableRow key={s.id} className="border-secondary hover:bg-secondary/30 transition-colors">
                                  <TableCell className="font-bold text-foreground pl-8 py-5 text-lg">{s.name}</TableCell>
                                  <TableCell className="capitalize font-medium text-slate-500">{s.role}</TableCell>
                                  <TableCell>
                                     <Badge 
                                       className={cn(
                                         "border-none font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-widest",
                                         s.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary text-slate-400"
                                       )} 
                                       variant="outline"
                                     >
                                        {s.is_active ? 'Active' : 'Inactive'}
                                     </Badge>
                                  </TableCell>
                                  <TableCell className="text-right pr-8">
                                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-card shadow-sm hover:bg-secondary text-primary">
                                       <History className="h-5 w-5" />
                                     </Button>
                                  </TableCell>
                               </TableRow>
                             ))
                           )}
                        </TableBody>
                     </Table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payroll' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="payroll"
              >
                <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
                  <div className="p-8 pb-4 flex flex-row items-center justify-between border-b border-secondary">
                     <div>
                       <h2 className="text-2xl font-black text-foreground">Monthly Payroll</h2>
                       <p className="font-medium text-slate-500 mt-1">Calculated based on attendance & pay grades.</p>
                     </div>
                     <Badge className="bg-foreground text-background border-none font-black px-4 py-2 uppercase tracking-widest rounded-xl">
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                     </Badge>
                  </div>
                  <div className="p-0">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14 pl-8">Staff</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Role / Grade</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Hours</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Advances</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14 text-right pr-8">Est. Payout</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {staffLoading ? (
                             <TableRow><TableCell colSpan={5} className="text-center p-12 text-[#c7c4d8] font-black uppercase tracking-widest">Calculating payroll...</TableCell></TableRow>
                           ) : staff?.map((s: any) => (
                             <TableRow key={s.id} className="border-secondary hover:bg-secondary/30 transition-colors">
                                <TableCell className="font-bold text-foreground pl-8 py-5 text-lg">{s.name}</TableCell>
                                <TableCell>
                                   <p className="text-[11px] font-black text-primary uppercase tracking-widest">{s.role}</p>
                                   <p className="text-xs text-slate-400 font-bold mt-0.5">{s.grade_name || 'No Grade Assigned'}</p>
                                </TableCell>
                                <TableCell className="font-bold text-slate-500">
                                   <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-300" /> {s.total_hours?.toFixed(1) || '0.0'}h</span>
                                </TableCell>
                                <TableCell className="text-red-500 font-black text-lg">-₹{(s.total_advances || 0) / 100}</TableCell>
                                <TableCell className="text-right pr-8">
                                   <span className="text-2xl font-black text-primary tracking-tighter">₹{((s.estimated_payout_paise || 0) / 100).toLocaleString()}</span>
                                </TableCell>
                             </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col h-fit border border-border">
           <div className="p-8 pb-6 border-b border-secondary">
              <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                 <div className="p-2 bg-secondary rounded-xl text-primary">
                   <Wallet className="h-6 w-6" />
                 </div>
                 Shift Sales Summary
              </h2>
           </div>
           <div className="p-8 space-y-6">
               <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border">
                  <Wallet className="h-12 w-12 text-primary/40 mb-4" />
                  <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Real-time totals will appear here once shift is active.</p>
               </div>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-border text-slate-400" disabled>
                View Full Report
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
