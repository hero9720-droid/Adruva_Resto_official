'use client';

import { useState, useEffect } from 'react';
import { 
  Bed, 
  Utensils, 
  QrCode, 
  Settings2, 
  Plus, 
  Map as MapIcon, 
  LayoutGrid, 
  Smartphone, 
  Palette, 
  Download,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Maximize2,
  Trash2,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SpacesHubPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dining');
  
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [showQRDesigner, setShowQRDesigner] = useState(false);
  const [qrSettings, setQrSettings] = useState({
    color: '#E11D48',
    logo: true,
    style: 'dots',
    margin: 2
  });

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // In production, fetch from unified /spaces endpoint
      // For now, fetching separately
      const [tablesRes, roomsRes] = await Promise.all([
        api.get('/tables'),
        api.get('/rooms')
      ]);
      setTables(tablesRes.data.data);
      setRooms(roomsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Initializing Space Grid...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Unified Space Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <MapIcon className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Space & Asset Management</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Operational <br />
             <span className="text-primary">Spaces</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Consolidate your dining floor and stay wings. Manage tables and rooms, generate unified QR codes, and customize your digital menu branding in one place.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowQRDesigner(true)}
             variant="outline"
             className="bg-white/5 border-white/10 text-white rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 flex items-center gap-3"
           >
              <Palette className="h-5 w-5" /> QR Designer
           </Button>
           <Button className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
              <Plus className="h-5 w-5" /> New Space
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <TabsList className="bg-secondary p-1.5 rounded-2xl border border-border h-16">
               <TabsTrigger value="dining" className="rounded-xl px-10 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-soft transition-all h-full gap-2">
                  <Utensils className="h-4 w-4" /> Dine-in Floor
               </TabsTrigger>
               <TabsTrigger value="stay" className="rounded-xl px-10 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-soft transition-all h-full gap-2">
                  <Bed className="h-4 w-4" /> Stay Wings
               </TabsTrigger>
               <TabsTrigger value="qr_registry" className="rounded-xl px-10 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-soft transition-all h-full gap-2">
                  <QrCode className="h-4 w-4" /> QR Registry
               </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
               {activeTab === 'qr_registry' && (
                 <Button className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[9px] gap-2">
                    <Download className="h-4 w-4" /> Bulk Download PDF
                 </Button>
               )}
               <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
                  {activeTab === 'dining' ? `${tables.length} Tables` : activeTab === 'stay' ? `${rooms.length} Rooms` : `${tables.length + rooms.length} Digital Assets`}
               </Badge>
            </div>
         </div>

         {/* Dining Floor View (PDF Page 20 - Section Management) */}
         <TabsContent value="dining" className="mt-0 outline-none space-y-12">
            {['Main Hall', 'AC Section', 'Garden', 'Rooftop'].map((section) => {
               const sectionTables = tables.filter(t => t.section === section || (!t.section && section === 'Main Hall'));
               if (sectionTables.length === 0 && section !== 'Main Hall') return null;
               
               return (
                 <div key={section} className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                       <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">{section}</h3>
                       <div className="h-px flex-1 bg-border" />
                       <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase">{sectionTables.length} Tables</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                       {sectionTables.map((table) => (
                         <Card 
                          key={table.id}
                          onClick={() => setSelectedSpace({ ...table, type: 'table' })}
                          className={cn(
                            "border-2 border-transparent bg-card shadow-soft rounded-[2.5rem] cursor-pointer hover:border-primary transition-all group overflow-hidden relative",
                            table.status === 'occupied' && "bg-primary/5"
                          )}
                         >
                            <div className="p-8 text-center space-y-4">
                               <div className={cn(
                                 "h-16 w-16 mx-auto rounded-[1.5rem] flex items-center justify-center transition-all",
                                 table.status === 'available' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                               )}>
                                  <Utensils className="h-8 w-8" />
                               </div>
                               <div>
                                  <p className="text-xl font-black text-foreground tracking-tighter uppercase">{table.name}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{table.capacity} Guests</p>
                               </div>
                               <Badge className={cn(
                                 "border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg",
                                 table.status === 'available' ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"
                               )}>
                                  {table.status}
                                </Badge>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               <QrCode className="h-5 w-5 text-primary" />
                            </div>
                         </Card>
                       ))}
                    </div>
                 </div>
               );
            })}
         </TabsContent>

         {/* Stay Wings View (PDF Page 19 - Room Cleaning Status) */}
         <TabsContent value="stay" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {rooms.map((room) => (
                 <Card 
                  key={room.id}
                  onClick={() => setSelectedSpace({ ...room, type: 'room' })}
                  className="border-2 border-transparent bg-card shadow-soft rounded-[3rem] p-1 cursor-pointer hover:border-primary transition-all group overflow-hidden"
                 >
                    <CardContent className="p-8">
                       <div className="flex justify-between items-start mb-8">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center",
                            room.status === 'available' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                          )}>
                             <Bed className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <Badge className="bg-secondary text-slate-500 border-none font-black text-[9px] uppercase px-3 py-1 rounded-lg">Floor {room.floor || 'G'}</Badge>
                             <Badge className={cn(
                               "border-none font-black text-[8px] uppercase px-3 py-1 rounded-lg",
                               room.cleaning_status === 'dirty' ? "bg-red-500 text-white" : 
                               room.cleaning_status === 'cleaning' ? "bg-amber-500 text-white" : 
                               "bg-emerald-500 text-white"
                             )}>
                                {room.cleaning_status || 'READY'}
                             </Badge>
                          </div>
                       </div>
                       <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">Room {room.name}</h3>
                       <p className="text-sm font-bold text-slate-400 mb-6">{room.status === 'occupied' ? `Guest: ${room.guest_name || 'Checked In'}` : 'Ready for Check-in'}</p>
                       
                       <div className="flex items-center justify-between pt-6 border-t border-border">
                          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                             Update Status
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </TabsContent>

         {/* Unified QR Registry View */}
         <TabsContent value="qr_registry" className="mt-0 outline-none">
            <Card className="border-none bg-card shadow-soft rounded-[3rem] overflow-hidden">
               <Table>
                  <TableHeader className="bg-secondary/50">
                     <TableRow className="border-none">
                        <TableHead className="font-black uppercase tracking-widest text-[10px] p-8">Space / Asset Name</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Type</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Digital Link</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right p-8 text-primary">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {[...tables.map(t => ({...t, type: 'table'})), ...rooms.map(r => ({...r, type: 'room'}))].map((item, idx) => (
                       <TableRow key={idx} className="border-border hover:bg-secondary/20 transition-colors group">
                          <TableCell className="p-8 font-black text-foreground">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                                   {item.type === 'table' ? <Utensils className="h-5 w-5 text-slate-400" /> : <Bed className="h-5 w-5 text-slate-400" />}
                                </div>
                                <div>
                                   <p className="font-black uppercase tracking-tighter">{item.name}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.id.slice(0,8)}</p>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="text-center">
                             <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[8px] px-2 py-0.5">
                                {item.type}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                             <code className="text-[10px] font-bold bg-secondary/50 px-3 py-1 rounded-lg text-slate-500">
                                adruva.app/qr/{item.id.slice(0,6)}
                             </code>
                          </TableCell>
                          <TableCell className="p-8 text-right">
                             <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="rounded-lg h-9 w-9 p-0 border-border hover:bg-primary hover:text-white transition-all">
                                   <Download className="h-4 w-4" />
                                </Button>
                                <Button size="sm" className="bg-[#1b1b24] text-white rounded-lg h-9 px-4 font-black uppercase tracking-widest text-[8px] gap-2">
                                   <Smartphone className="h-3 w-3" /> Test
                                </Button>
                             </div>
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </Card>
         </TabsContent>
      </Tabs>

      {/* Space Detail Modal (With QR) */}
      <Dialog open={!!selectedSpace} onOpenChange={() => setSelectedSpace(null)}>
         <DialogContent className="max-w-4xl rounded-[4rem] p-0 border-none bg-card shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
               {/* Left Side: Space Info */}
               <div className="flex-1 p-12 space-y-10">
                  <div>
                     <Badge className="bg-primary/5 text-primary border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl mb-4">
                        {selectedSpace?.type === 'table' ? 'Dining Asset' : 'Hospitality Unit'}
                     </Badge>
                     <h2 className="text-6xl font-black tracking-tighter uppercase text-foreground leading-none">
                        {selectedSpace?.type === 'table' ? 'Table' : 'Room'} <br /> {selectedSpace?.name}
                     </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-secondary/50 p-6 rounded-3xl border border-border">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-xl font-black text-foreground capitalize">{selectedSpace?.status}</p>
                     </div>
                     <div className="bg-secondary/50 p-6 rounded-3xl border border-border">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {selectedSpace?.type === 'table' ? 'Capacity' : 'Cleaning Status'}
                        </p>
                        <p className="text-xl font-black text-foreground uppercase">
                           {selectedSpace?.type === 'table' ? `${selectedSpace?.capacity} Pax` : (selectedSpace?.cleaning_status || 'READY')}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <Button className="w-full bg-[#1b1b24] text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
                        <Smartphone className="h-5 w-5" /> View Live Orders
                     </Button>
                     <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 h-16 rounded-2xl border-border font-black uppercase tracking-widest text-[11px]">Edit Settings</Button>
                        <Button variant="outline" className="h-16 w-16 rounded-2xl border-border p-0 flex items-center justify-center">
                           <Trash2 className="h-5 w-5 text-red-400" />
                        </Button>
                     </div>
                  </div>
               </div>

               {/* Right Side: QR Code Panel */}
               <div className="w-full md:w-[400px] bg-[#1b1b24] p-12 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-50" />
                  <div className="relative z-10 w-full aspect-square bg-white rounded-[3rem] p-8 shadow-2xl flex items-center justify-center">
                     {/* Placeholder for real QR Component */}
                     <div className="w-full h-full border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                        <QrCode className="h-24 w-24 mb-4" />
                        <p className="font-black text-[10px] uppercase tracking-widest">Digital Menu Link</p>
                     </div>
                  </div>
                  <div className="relative z-10 w-full space-y-4 text-center">
                     <p className="text-white font-black uppercase tracking-widest text-[10px]">adruva.app/qr/{selectedSpace?.id}</p>
                     <div className="flex gap-3">
                        <Button className="flex-1 bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-glow gap-2">
                           <Download className="h-4 w-4" /> Download PDF
                        </Button>
                        <Button className="flex-1 bg-white/5 border border-white/10 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 gap-2">
                           <Layers className="h-4 w-4" /> Print Labels
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* QR Global Designer Sidebar (Overlay) */}
      <Dialog open={showQRDesigner} onOpenChange={setShowQRDesigner}>
         <DialogContent className="max-w-2xl rounded-[3rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">QR Designer</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Customize the aesthetic of your digital menu access points.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-8">
               <div className="flex items-center gap-10">
                  <div className="h-40 w-40 bg-secondary rounded-[2rem] flex items-center justify-center relative overflow-hidden group">
                     <QrCode className="h-20 w-20 text-primary" />
                     <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <div className="flex-1 space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Brand Primary Color</label>
                        <div className="flex gap-3">
                           {['#E11D48', '#2563EB', '#059669', '#D97706', '#000000'].map((c) => (
                             <button 
                                key={c} 
                                onClick={() => setQrSettings({...qrSettings, color: c})}
                                className={cn(
                                  "h-10 w-10 rounded-xl border-4",
                                  qrSettings.color === c ? "border-primary" : "border-transparent"
                                )} 
                                style={{ backgroundColor: c }} 
                             />
                           ))}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">QR Style</label>
                        <div className="flex gap-2">
                           <Badge variant="outline" className="rounded-lg h-10 px-4 font-black uppercase text-[9px] cursor-pointer hover:bg-secondary">Classic Squares</Badge>
                           <Badge className="bg-primary text-white rounded-lg h-10 px-4 font-black uppercase text-[9px] cursor-pointer">Modern Dots</Badge>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-secondary/50 p-6 rounded-3xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-card rounded-xl flex items-center justify-center text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="font-black text-foreground text-sm">Center Logo Overlay</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Place your restaurant logo in QR center</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="font-black text-primary text-[10px] uppercase">Toggle</Button>
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowQRDesigner(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">Discard</Button>
               <Button onClick={() => {
                 toast({ title: "Branding Saved", description: "QR aesthetics updated across all spaces." });
                 setShowQRDesigner(false);
               }} className="flex-1 bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow">Apply Aesthetics</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
