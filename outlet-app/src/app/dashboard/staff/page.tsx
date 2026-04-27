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
  Loader2,
  ShieldCheck,
  Layout,
  CalendarDays,
  CheckCircle2,
  XCircle
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
import { 
  useStaffList, 
  useAttendance, 
  useShift, 
  useCreateStaff, 
  useCurrentStatus, 
  useShiftSummary,
  useLeaveRequests,
  useRequestLeave,
  useUpdateLeaveStatus
} from '@/hooks/useStaff';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('directory');
  
  // Add Staff dialog state
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'waiter', pin: '', base_pay: '' });

  const { data: staff, isLoading: staffLoading } = useStaffList(activeTab === 'payroll' ? 'payroll' : undefined);
  const { clockIn, clockOut } = useAttendance();
  const { startShift, endShift } = useShift();
  const { data: currentStatus } = useCurrentStatus();
  const { data: shiftSummary } = useShiftSummary();
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
    <div className="space-y-6 md:space-y-8 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-10 bg-background font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase">WORKFORCE</h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">Manage attendance, shifts and staff members.</p>
        </div>
        <div className="flex flex-row md:flex-row gap-2 md:gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0 shrink-0">
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
          <TabAccessModal />

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

      <div className="flex gap-4 md:gap-8 border-b border-border overflow-x-auto no-scrollbar shrink-0">
         {['directory', 'attendance', 'payroll', 'leaves'].map((tab) => (
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
                         {isShiftActive && (
                           <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center">
                                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Expected Cash</p>
                                 <p className="text-2xl font-black text-emerald-600">₹{(shiftSummary?.cash_in_hand_paise / 100 || 0).toLocaleString()}</p>
                              </div>
                              <div className="h-px bg-emerald-500/10" />
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shift Sales</p>
                                    <p className="text-sm font-black text-foreground">₹{(shiftSummary?.total_sales_paise / 100 || 0).toLocaleString()}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                                    <p className="text-sm font-black text-foreground">{shiftSummary?.total_orders || 0}</p>
                                 </div>
                              </div>
                           </div>
                         )}
                         <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">{isShiftActive ? "Actual Cash in Drawer" : "Opening Cash (Float)"}</Label>
                            <div className="relative">
                               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                               <Input 
                                 type="number" 
                                 placeholder="0.00" 
                                 value={shiftAmount}
                                 onChange={e => setShiftAmount(e.target.value)}
                                 className="h-16 pl-10 rounded-2xl bg-secondary border-border focus:border-primary font-black text-2xl text-foreground" 
                               />
                            </div>
                            {isShiftActive && shiftAmount && (
                              <p className={cn(
                                "text-xs font-bold px-2",
                                (Number(shiftAmount) * 100) >= shiftSummary?.cash_in_hand_paise ? "text-emerald-500" : "text-red-500"
                              )}>
                                Difference: ₹{((Number(shiftAmount) * 100 - (shiftSummary?.cash_in_hand_paise || 0)) / 100).toFixed(2)}
                              </p>
                            )}
                         </div>
                         <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Remarks / Discrepancy Notes</Label>
                            <Input 
                              placeholder="e.g. Extra 50rs for change..." 
                              value={shiftNotes}
                              onChange={e => setShiftNotes(e.target.value)}
                              className="h-14 rounded-2xl bg-secondary border-border focus:border-primary text-foreground font-medium" 
                            />
                         </div>
                      </div>
                      <DialogFooter className="gap-3 sm:gap-0 mt-4">
                        <Button variant="ghost" className="h-14 rounded-2xl font-black text-slate-500 hover:bg-secondary hover:text-foreground">CANCEL</Button>
                        <Button 
                          className={cn(
                            "h-14 px-8 rounded-2xl font-black shadow-glow border-none",
                            isShiftActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-primary text-primary-foreground hover:bg-primary/90"
                          )} 
                          onClick={handleShiftToggle}
                          disabled={startShift.isPending || endShift.isPending}
                        >
                          {startShift.isPending || endShift.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : isShiftActive ? "CONFIRM & CLOSE" : "OPEN REGISTER"}
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
                  <div className="p-0 overflow-x-auto no-scrollbar">
                     <Table className="min-w-[600px]">
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
                  <div className="p-0 overflow-x-auto no-scrollbar">
                     <Table className="min-w-[600px]">
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

            {activeTab === 'leaves' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key="leaves"
              >
                <LeaveManagementSection />
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
                {!isShiftActive ? (
                   <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border">
                      <Wallet className="h-12 w-12 text-primary/40 mb-4" />
                      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Open a shift to see live register status.</p>
                   </div>
                ) : (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-secondary rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sales</p>
                            <p className="text-xl font-black text-foreground">₹{(shiftSummary?.total_sales_paise / 100 || 0).toLocaleString()}</p>
                         </div>
                         <div className="p-4 bg-secondary rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Orders</p>
                            <p className="text-xl font-black text-foreground">{shiftSummary?.total_orders || 0}</p>
                         </div>
                      </div>
                      <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                         <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Cash in Register</p>
                         <p className="text-3xl font-black text-primary">₹{(shiftSummary?.cash_in_hand_paise / 100 || 0).toLocaleString()}</p>
                      </div>
                   </div>
                )}
               <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-border text-slate-500 hover:bg-secondary hover:text-foreground"
                disabled={!isShiftActive}
               >
                 View Full Report
               </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
function TabAccessModal() {
  const permissions = [
    { role: 'Manager', tabs: ['POS', 'Bills', 'Staff', 'Inventory', 'Analytics', 'Compliance', 'Settings'] },
    { role: 'Cashier', tabs: ['POS', 'Bills', 'Inventory'] },
    { role: 'Waiter', tabs: ['POS (View)', 'Menu'] },
    { role: 'Chef', tabs: ['KDS', 'Menu', 'Inventory'] },
    { role: 'Inventory Mgr', tabs: ['Inventory', 'Recipes', 'Expenses'] },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-border text-slate-500 hover:bg-secondary font-black tracking-widest uppercase">
          <ShieldCheck className="h-5 w-5 mr-3" />
          Access Matrix
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl rounded-[3rem] p-10 bg-card border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-4xl font-black uppercase tracking-tighter mb-4">RBAC Access Matrix</DialogTitle>
          <p className="text-slate-500 font-bold mb-8">Role-Based Access Control configuration as per Hospitality OS PRD (Page 3).</p>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[60vh] no-scrollbar pr-2">
           {permissions.map((p) => (
             <div key={p.role} className="bg-secondary/50 p-8 rounded-[2.5rem] border border-border">
                <h4 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight">{p.role}</h4>
                <div className="flex flex-wrap gap-2">
                   {p.tabs.map(t => (
                     <Badge key={t} className="bg-card text-primary border-border font-black text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-widest">{t}</Badge>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function LeaveManagementSection() {
  const { data: leaves, isLoading } = useLeaveRequests();
  const updateStatus = useUpdateLeaveStatus();
  const { toast } = useToast();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status, manager_notes: 'Processed by Manager' });
      toast({ title: `Leave ${status}`, description: `Request has been marked as ${status}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  return (
    <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
      <div className="p-8 pb-4 flex flex-row items-center justify-between border-b border-secondary">
         <div>
           <h2 className="text-2xl font-black text-foreground">Leave Requests</h2>
           <p className="font-medium text-slate-500 mt-1">Review and approve employee time-off.</p>
         </div>
         <RequestLeaveDialog />
      </div>
      <div className="p-0 overflow-x-auto no-scrollbar">
         <Table className="min-w-[700px]">
            <TableHeader>
               <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14 pl-8">Staff Member</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Type / Dates</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Reason</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14">Status</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 h-14 text-right pr-8">Decision</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {isLoading ? (
                 <TableRow><TableCell colSpan={5} className="text-center p-12 text-slate-400 font-black uppercase tracking-widest">Loading requests...</TableCell></TableRow>
               ) : !leaves?.length ? (
                 <TableRow><TableCell colSpan={5} className="text-center p-12 text-slate-400 font-black uppercase tracking-widest">No active requests.</TableCell></TableRow>
               ) : (
                 leaves.map((l: any) => (
                   <TableRow key={l.id} className="border-secondary hover:bg-secondary/30 transition-colors">
                      <TableCell className="font-bold text-foreground pl-8 py-5 text-lg">
                        {l.staff_name}
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{l.role}</p>
                      </TableCell>
                      <TableCell>
                         <Badge className="bg-secondary text-primary border-none mb-1 text-[9px] uppercase tracking-widest px-2">{l.type}</Badge>
                         <p className="text-sm font-bold text-slate-500">
                           {format(new Date(l.start_date), 'dd MMM')} - {format(new Date(l.end_date), 'dd MMM, yyyy')}
                         </p>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-500 font-medium italic">"{l.reason}"</TableCell>
                      <TableCell>
                         <Badge 
                           className={cn(
                             "border-none font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-widest",
                             l.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : 
                             l.status === 'rejected' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                           )} 
                         >
                            {l.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                         {l.status === 'pending' ? (
                           <div className="flex gap-2 justify-end">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-10 w-10 rounded-xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                onClick={() => handleStatusUpdate(l.id, 'approved')}
                                disabled={updateStatus.isPending}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-10 w-10 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleStatusUpdate(l.id, 'rejected')}
                                disabled={updateStatus.isPending}
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                           </div>
                         ) : (
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PROCESSED</span>
                         )}
                      </TableCell>
                   </TableRow>
                 ))
               )}
            </TableBody>
         </Table>
      </div>
    </div>
  );
}

function RequestLeaveDialog() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState({ start_date: '', end_date: '', reason: '', type: 'sick' });
  const requestLeave = useRequestLeave();
  const { toast } = useToast();

  const handleRequest = async () => {
    try {
      await requestLeave.mutateAsync(payload);
      toast({ title: 'Request Sent', description: 'Your leave request is awaiting approval.' });
      setOpen(false);
      setPayload({ start_date: '', end_date: '', reason: '', type: 'sick' });
    } catch {
      toast({ variant: 'destructive', title: 'Request failed' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-6 bg-secondary text-primary hover:bg-secondary/80 border-none rounded-xl font-black text-xs uppercase tracking-widest">
           <CalendarDays className="h-4 w-4 mr-2" /> Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card rounded-[2.5rem] p-8 border-border shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-foreground tracking-tighter">Request Time Off</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">From</Label>
              <Input 
                type="date" 
                value={payload.start_date}
                onChange={e => setPayload(p => ({ ...p, start_date: e.target.value }))}
                className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-bold text-foreground" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">To</Label>
              <Input 
                type="date" 
                value={payload.end_date}
                onChange={e => setPayload(p => ({ ...p, end_date: e.target.value }))}
                className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-bold text-foreground" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Leave Type</Label>
            <Select value={payload.type} onValueChange={v => setPayload(p => ({ ...p, type: v }))}>
               <SelectTrigger className="h-14 rounded-2xl bg-secondary border-border font-bold text-foreground">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-card border-border rounded-2xl">
                 <SelectItem value="sick">Sick Leave</SelectItem>
                 <SelectItem value="casual">Casual Leave</SelectItem>
                 <SelectItem value="vacation">Vacation / Paid Time Off</SelectItem>
                 <SelectItem value="unpaid">Unpaid Leave</SelectItem>
               </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reason</Label>
            <Input 
              placeholder="e.g. Family function, unwell..." 
              value={payload.reason}
              onChange={e => setPayload(p => ({ ...p, reason: e.target.value }))}
              className="h-14 rounded-2xl bg-secondary border-border focus:border-primary font-medium text-foreground" 
            />
          </div>
        </div>
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-black text-slate-500 uppercase">Cancel</Button>
          <Button 
            className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-black shadow-glow uppercase"
            onClick={handleRequest}
            disabled={requestLeave.isPending || !payload.start_date || !payload.end_date}
          >
            {requestLeave.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
