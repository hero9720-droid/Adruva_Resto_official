'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  RefreshCw, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Eye,
  Filter,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useMasterMenu, useCreateMasterItem, useSyncMenu } from '@/hooks/useChain';
import SyncMenuModal from '@/components/dashboard/SyncMenuModal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MasterMenuPage() {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');
  const { data: menuData, isLoading } = useMasterMenu();
  const { toast } = useToast();

  const filteredItems = menuData?.items.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[2.5rem] border border-border shadow-soft">
        <div>
           <div className="flex items-center gap-6 mb-4">
              <div className="p-4 bg-primary/10 rounded-3xl shadow-inner">
                 <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Master Catalog</h1>
           </div>
           <p className="text-slate-500 font-bold text-lg ml-2 tracking-wide leading-relaxed">Define brand-wide dishes and synchronize them to all satellite outlets.</p>
        </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
           <Button 
             variant="outline" 
             className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-border bg-card font-black uppercase tracking-widest text-[11px] hover:bg-secondary transition-all shadow-soft"
             onClick={() => setIsSyncModalOpen(true)}
           >
              <RefreshCw className="h-5 w-5 mr-3 text-primary" />
              Propagate Changes
           </Button>
           <Button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-glow border-none transition-all">
              <Plus className="h-5 w-5 mr-3" />
              New Master Item
           </Button>
        </div>
      </div>

       {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <Card className="md:col-span-1 rounded-[2.5rem] border border-border bg-card shadow-soft overflow-hidden group">
            <CardContent className="p-10">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Master Items</p>
               <p className="text-5xl font-black text-foreground tracking-tighter">{menuData?.items.length || 0}</p>
               <div className="mt-6 flex items-center gap-3">
                  <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-primary w-2/3 rounded-full shadow-glow" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">65% CAP</span>
               </div>
            </CardContent>
         </Card>

          <div className="md:col-span-3 bg-card p-6 rounded-[2.5rem] border border-border shadow-soft flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search global catalog..." 
                 className="h-16 w-full pl-16 rounded-[1.5rem] bg-secondary/50 border-none font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-500"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-2xl border border-border shadow-inner">
               <button 
                 onClick={() => setViewType('table')}
                 className={cn("p-4 rounded-xl transition-all shadow-none", viewType === 'table' ? "bg-card text-primary shadow-soft" : "text-slate-500 hover:text-foreground")}
               >
                  <List className="h-6 w-6" />
               </button>
               <button 
                 onClick={() => setViewType('grid')}
                 className={cn("p-4 rounded-xl transition-all shadow-none", viewType === 'grid' ? "bg-card text-primary shadow-soft" : "text-slate-500 hover:text-foreground")}
               >
                  <LayoutGrid className="h-6 w-6" />
               </button>
            </div>
            <Button variant="ghost" className="h-16 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-secondary">
               <Filter className="h-5 w-5 mr-3 text-primary" />
               Filters
            </Button>
         </div>
      </div>

       {/* Content Area */}
      <Card className="rounded-[2.5rem] border border-border bg-card shadow-soft overflow-hidden min-h-[500px]">
        <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between border-b border-border">
           <div>
              <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Brand Catalog</CardTitle>
              <CardDescription className="font-bold text-slate-500 text-base mt-2">Managed centrally for all locations.</CardDescription>
           </div>
           <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-5 py-2 rounded-xl font-black tracking-widest text-[10px] uppercase shadow-inner">
                 <CheckCircle2 className="h-4 w-4 mr-2" /> 100% In Sync
              </Badge>
           </div>
        </CardHeader>
         <CardContent className="p-0">
          {viewType === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-b border-border h-20">
                  <TableHead className="px-10 font-black uppercase tracking-widest text-slate-500 text-[11px]">Item Detail</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-slate-500 text-[11px]">Category</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-slate-500 text-[11px]">Base Price</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-slate-500 text-[11px]">Sync Status</TableHead>
                  <TableHead className="px-10 text-right font-black uppercase tracking-widest text-slate-500 text-[11px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                {filteredItems?.map((item: any) => (
                  <TableRow key={item.id} className="group hover:bg-secondary/50 transition-all border-b border-border h-28">
                    <TableCell className="px-10">
                       <div className="flex items-center gap-6">
                          <div className="h-20 w-20 bg-secondary rounded-[1.5rem] overflow-hidden shadow-inner group-hover:scale-105 transition-all duration-500 border border-border">
                             <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                             <p className="font-black text-foreground tracking-tighter text-xl group-hover:text-primary transition-colors">{item.name}</p>
                             <p className="text-sm font-bold text-slate-500 line-clamp-1 max-w-[300px] mt-1.5">{item.description}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-secondary text-primary border-none font-black px-4 py-2 text-[10px] rounded-xl tracking-widest uppercase shadow-inner">
                          {menuData?.categories.find((c:any) => c.id === item.category_id)?.name || 'General'}
                       </Badge>
                    </TableCell>
                    <TableCell className="font-black text-2xl text-foreground tracking-tighter">
                       ₹{item.base_price_paise / 100}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                          <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">In Sync</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-10 text-right">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-card hover:text-primary hover:shadow-soft border border-transparent hover:border-border">
                             <Edit3 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-card hover:text-rose-500 hover:shadow-soft border border-transparent hover:border-border">
                             <Trash2 className="h-5 w-5" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10">
               {filteredItems?.map((item: any) => (
                  <div key={item.id} className="bg-card rounded-[2.5rem] border border-border p-8 hover:shadow-glow hover:-translate-y-2 transition-all group cursor-pointer overflow-hidden relative shadow-soft">
                     <div className="h-56 w-full bg-secondary rounded-[2rem] overflow-hidden mb-8 border border-border">
                        <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                     </div>
                     <div className="space-y-6">
                        <div className="flex justify-between items-start">
                           <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                              {menuData?.categories.find((c:any) => c.id === item.category_id)?.name || 'General'}
                           </Badge>
                           <span className="text-3xl font-black text-foreground tracking-tighter">₹{item.base_price_paise / 100}</span>
                        </div>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors uppercase">{item.name}</h3>
                        <p className="text-sm font-bold text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                     </div>
                  </div>
               ))}
            </div>
           )}

           {(!filteredItems || filteredItems.length === 0) && (
            <div className="py-40 flex flex-col items-center justify-center text-center">
               <div className="h-32 w-32 bg-secondary rounded-[3rem] flex items-center justify-center mb-10 border border-border shadow-inner">
                  <AlertCircle className="h-14 w-14 text-slate-400" />
               </div>
               <h3 className="text-3xl font-black text-foreground tracking-tighter mb-3 uppercase">Catalog Empty</h3>
               <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Adjust your search or add a new master item</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SyncMenuModal 
        open={isSyncModalOpen} 
        onOpenChange={setIsSyncModalOpen} 
      />
    </div>
  );
}
