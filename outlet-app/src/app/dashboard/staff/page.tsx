'use client';

import { useState } from 'react';
import { 
  Users, 
  Clock, 
  PlayCircle, 
  StopCircle, 
  UserPlus, 
  History,
  ArrowRight,
  TrendingUp,
  Wallet
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
import { useStaffList, useAttendance, useShift } from '@/hooks/useStaff';
import { useToast } from '@/hooks/use-toast';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('directory');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const { data: staff, isLoading: staffLoading } = useStaffList(activeTab === 'payroll' ? 'payroll' : undefined);
  const { clockIn, clockOut } = useAttendance();
  const { startShift, endShift } = useShift();
  const { toast } = useToast();

  const handleClockToggle = async () => {
    try {
      if (isClockedIn) {
        await clockOut.mutateAsync();
        setIsClockedIn(false);
        toast({ title: "Clocked Out", description: "Your attendance has been recorded.", className: "bg-[#1b1b24] text-white border-none" });
      } else {
        await clockIn.mutateAsync();
        setIsClockedIn(true);
        toast({ title: "Clocked In", description: "Welcome back! Duty started.", className: "bg-[#4f46e5] text-white border-none" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar -m-8 p-8 bg-[#fcf8ff] font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-[#1b1b24] uppercase">WORKFORCE</h1>
          <p className="text-[#777587] font-medium text-lg mt-1">Manage attendance, shifts and staff members.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleClockToggle} 
            className={cn(
              "h-14 px-8 rounded-2xl font-black tracking-widest uppercase transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
              isClockedIn 
                ? "bg-[#ffdad6] text-[#ba1a1a] border-none hover:bg-[#ffb4ab]" 
                : "bg-[#ffffff] text-[#4f46e5] border-none hover:bg-[#f5f2ff]"
            )}
          >
            <Clock className="h-5 w-5 mr-3" />
            {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>
          <Button className="h-14 px-8 bg-[#4f46e5] hover:bg-[#3525cd] text-white rounded-2xl font-black shadow-lg shadow-[#4f46e5]/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
            <UserPlus className="h-5 w-5 mr-3" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-[#e4e1ee]">
         {['directory', 'attendance', 'payroll'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative",
               activeTab === tab ? "text-[#1b1b24]" : "text-[#a09eb1] hover:text-[#777587]"
             )}
           >
             {tab}
             {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#4f46e5] rounded-t-full" />}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-[#e2dfff] rounded-2xl flex items-center justify-center shadow-inner">
                <TrendingUp className="h-8 w-8 text-[#3525cd]" />
             </div>
             <div>
                <p className="text-[11px] font-black text-[#777587] uppercase tracking-[0.2em]">Total Staff</p>
                <p className="text-4xl font-black text-[#1b1b24] tracking-tighter mt-1">{staff?.length || 0}</p>
             </div>
          </div>
        </div>

        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-[#93f89e]/30 rounded-2xl flex items-center justify-center shadow-inner">
                <Users className="h-8 w-8 text-[#006e1c]" />
             </div>
             <div>
                <p className="text-[11px] font-black text-[#777587] uppercase tracking-[0.2em]">Active Members</p>
                <p className="text-4xl font-black text-[#1b1b24] tracking-tighter mt-1">{staff?.filter((s: any) => s.is_active).length || 0}</p>
             </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-[#1b1b24] text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden relative group transition-transform hover:-translate-y-1">
           <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-[#3525cd]/20 to-transparent -skew-x-12 translate-x-16" />
           <div className="p-8 h-full flex items-center justify-between relative z-10">
              <div className="space-y-2">
                 <p className="text-[#a09eb1] text-[11px] font-black uppercase tracking-[0.2em]">Current Shift Status</p>
                 <h2 className="text-4xl font-black tracking-tighter">{isShiftActive ? "LIVE & OPEN" : "SHIFT CLOSED"}</h2>
                 <p className="text-sm text-[#777587] font-medium">{isShiftActive ? "Register is accepting transactions." : "Open a shift to start billing."}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className={cn(
                      "h-16 px-8 rounded-2xl font-black text-lg uppercase tracking-widest transition-all",
                      isShiftActive 
                        ? "bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab]" 
                        : "bg-[#4f46e5] text-white hover:bg-[#3525cd] shadow-lg shadow-[#4f46e5]/30"
                    )}
                  >
                    {isShiftActive ? <><StopCircle className="h-6 w-6 mr-3" /> END SHIFT</> : <><PlayCircle className="h-6 w-6 mr-3" /> START SHIFT</>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#ffffff] rounded-[2.5rem] p-8 border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-[#1b1b24] tracking-tighter">
                      {isShiftActive ? "End Shift & Reconcile" : "Start New Shift"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                     <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-[#777587]">{isShiftActive ? "Closing Cash (in Register)" : "Opening Cash (Float)"}</Label>
                        <Input type="number" placeholder="Enter amount in ₹" className="h-14 rounded-2xl bg-[#fcf8ff] border-[#e4e1ee] focus:border-[#4f46e5] font-black text-lg" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-[#777587]">Notes</Label>
                        <Input placeholder="Any remarks..." className="h-14 rounded-2xl bg-[#fcf8ff] border-[#e4e1ee] focus:border-[#4f46e5]" />
                     </div>
                  </div>
                  <DialogFooter className="gap-3 sm:gap-0 mt-4">
                    <Button variant="ghost" className="h-14 rounded-2xl font-black text-[#777587] hover:bg-[#f5f2ff] hover:text-[#1b1b24]">CANCEL</Button>
                    <Button 
                      className="h-14 px-8 bg-[#4f46e5] hover:bg-[#3525cd] text-white rounded-2xl font-black shadow-lg shadow-[#4f46e5]/30" 
                      onClick={() => setIsShiftActive(!isShiftActive)}
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
                <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
                  <div className="p-8 pb-4 flex flex-row items-center justify-between border-b border-[#f0ecf9]">
                     <div>
                       <h2 className="text-2xl font-black text-[#1b1b24]">Staff Directory</h2>
                       <p className="font-medium text-[#777587] mt-1">Manage roles and permissions.</p>
                     </div>
                     <Badge className="bg-[#fcf8ff] text-[#4f46e5] hover:bg-[#f5f2ff] border border-[#e4e1ee] px-4 py-2 font-black rounded-xl">ALL STAFF</Badge>
                  </div>
                  <div className="p-0">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-[#fcf8ff] hover:bg-[#fcf8ff] border-[#f0ecf9]">
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14 pl-8">Staff Name</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14">Role</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14">Status</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14 text-right pr-8">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {staffLoading ? (
                             <TableRow><TableCell colSpan={4} className="text-center p-12 text-[#c7c4d8] font-black uppercase tracking-widest">Loading staff...</TableCell></TableRow>
                           ) : staff?.length === 0 ? (
                             <TableRow><TableCell colSpan={4} className="text-center p-12 text-[#c7c4d8] font-black uppercase tracking-widest">No staff members found.</TableCell></TableRow>
                           ) : (
                             staff?.map((s: any) => (
                               <TableRow key={s.id} className="border-[#f0ecf9] hover:bg-[#f5f2ff] transition-colors">
                                  <TableCell className="font-bold text-[#1b1b24] pl-8 py-5 text-lg">{s.name}</TableCell>
                                  <TableCell className="capitalize font-medium text-[#777587]">{s.role}</TableCell>
                                  <TableCell>
                                     <Badge 
                                       className={cn(
                                         "border-none font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-widest",
                                         s.is_active ? "bg-[#93f89e]/30 text-[#006e1c]" : "bg-[#f0ecf9] text-[#777587]"
                                       )} 
                                       variant="outline"
                                     >
                                        {s.is_active ? 'Active' : 'Inactive'}
                                     </Badge>
                                  </TableCell>
                                  <TableCell className="text-right pr-8">
                                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-[#ffffff] shadow-sm hover:bg-[#e4e1ee] text-[#4f46e5]">
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
                <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
                  <div className="p-8 pb-4 flex flex-row items-center justify-between border-b border-[#f0ecf9]">
                     <div>
                       <h2 className="text-2xl font-black text-[#1b1b24]">Monthly Payroll</h2>
                       <p className="font-medium text-[#777587] mt-1">Calculated based on attendance & pay grades.</p>
                     </div>
                     <Badge className="bg-[#1b1b24] text-[#ffffff] border-none font-black px-4 py-2 uppercase tracking-widest rounded-xl">
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                     </Badge>
                  </div>
                  <div className="p-0">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-[#fcf8ff] hover:bg-[#fcf8ff] border-[#f0ecf9]">
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14 pl-8">Staff</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14">Role / Grade</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14">Hours</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14">Advances</TableHead>
                              <TableHead className="font-black text-[11px] uppercase tracking-widest text-[#777587] h-14 text-right pr-8">Est. Payout</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {staffLoading ? (
                             <TableRow><TableCell colSpan={5} className="text-center p-12 text-[#c7c4d8] font-black uppercase tracking-widest">Calculating payroll...</TableCell></TableRow>
                           ) : staff?.map((s: any) => (
                             <TableRow key={s.id} className="border-[#f0ecf9] hover:bg-[#f5f2ff] transition-colors">
                                <TableCell className="font-bold text-[#1b1b24] pl-8 py-5 text-lg">{s.name}</TableCell>
                                <TableCell>
                                   <p className="text-[11px] font-black text-[#3525cd] uppercase tracking-widest">{s.role}</p>
                                   <p className="text-xs text-[#a09eb1] font-bold mt-0.5">{s.grade_name || 'No Grade Assigned'}</p>
                                </TableCell>
                                <TableCell className="font-bold text-[#777587]">
                                   <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#c7c4d8]" /> {s.total_hours?.toFixed(1) || '0.0'}h</span>
                                </TableCell>
                                <TableCell className="text-[#ba1a1a] font-black text-lg">-₹{(s.total_advances || 0) / 100}</TableCell>
                                <TableCell className="text-right pr-8">
                                   <span className="text-2xl font-black text-[#4f46e5] tracking-tighter">₹{((s.estimated_payout_paise || 0) / 100).toLocaleString()}</span>
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

        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col h-fit">
           <div className="p-8 pb-6 border-b border-[#f0ecf9]">
              <h2 className="text-xl font-black text-[#1b1b24] flex items-center gap-3">
                 <div className="p-2 bg-[#f5f2ff] rounded-xl text-[#4f46e5]">
                   <Wallet className="h-6 w-6" />
                 </div>
                 Shift Sales Summary
              </h2>
           </div>
           <div className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-[#fcf8ff] rounded-3xl border border-dashed border-[#c7c4d8]">
                 <Wallet className="h-12 w-12 text-[#c7c4d8] mb-4 opacity-50" />
                 <p className="text-[#777587] font-bold text-sm">Real-time shift totals will appear here once the shift is active.</p>
              </div>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-[#e4e1ee] text-[#a09eb1]" disabled>
                View Full Report
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
