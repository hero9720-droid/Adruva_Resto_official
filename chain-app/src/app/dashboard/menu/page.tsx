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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                 <BookOpen className="h-7 w-7 text-indigo-600" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">Master Catalog</h1>
           </div>
           <p className="text-slate-500 font-bold ml-1 tracking-wide">Define brand-wide dishes and synchronize them to all satellite outlets.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <Button 
             variant="outline" 
             className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50"
             onClick={() => setIsSyncModalOpen(true)}
           >
              <RefreshCw className="h-4 w-4 mr-2.5 text-indigo-600" />
              Propagate Changes
           </Button>
           <Button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-100">
              <Plus className="h-4 w-4 mr-2.5" />
              New Master Item
           </Button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="md:col-span-1 rounded-[2rem] border-slate-200/50 shadow-none overflow-hidden group">
            <CardContent className="p-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Master Items</p>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">{menuData?.items.length || 0}</p>
               <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-600 w-2/3 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400">65% CAP</span>
               </div>
            </CardContent>
         </Card>

         <div className="md:col-span-3 bg-white p-4 rounded-[2rem] border border-slate-200/50 shadow-none flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
               <Input 
                 placeholder="Search global catalog..." 
                 className="h-14 w-full pl-14 rounded-2xl bg-slate-50/50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
               <button 
                 onClick={() => setViewType('table')}
                 className={cn("p-3 rounded-xl transition-all", viewType === 'table' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600")}
               >
                  <List className="h-5 w-5" />
               </button>
               <button 
                 onClick={() => setViewType('grid')}
                 className={cn("p-3 rounded-xl transition-all", viewType === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600")}
               >
                  <LayoutGrid className="h-5 w-5" />
               </button>
            </div>
            <Button variant="ghost" className="h-14 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500">
               <Filter className="h-4 w-4 mr-2" />
               Filters
            </Button>
         </div>
      </div>

      {/* Content Area */}
      <Card className="rounded-[2.5rem] border-slate-200/50 shadow-none overflow-hidden min-h-[400px]">
        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between border-b border-slate-100">
           <div>
              <CardTitle className="text-2xl font-black text-slate-900">Brand Items</CardTitle>
              <CardDescription className="font-bold text-slate-400 mt-1">Managed centrally for all locations.</CardDescription>
           </div>
           <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-black tracking-widest text-[9px] uppercase">
                 <CheckCircle2 className="h-3 w-3 mr-1.5" /> 100% In Sync
              </Badge>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewType === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  <TableHead className="px-10 h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Item Detail</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Base Price</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Status</TableHead>
                  <TableHead className="px-10 h-16 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems?.map((item: any) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <TableCell className="px-10 py-6">
                       <div className="flex items-center gap-5">
                          <div className="h-16 w-16 bg-slate-100 rounded-2xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                             <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 tracking-tight text-lg group-hover:text-indigo-600 transition-colors">{item.name}</p>
                             <p className="text-xs font-bold text-slate-400 line-clamp-1 max-w-[200px] mt-0.5">{item.description}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-slate-100 text-slate-600 border-none font-black px-3 py-1 text-[10px] rounded-lg tracking-widest uppercase">
                          {menuData?.categories.find((c:any) => c.id === item.category_id)?.name || 'General'}
                       </Badge>
                    </TableCell>
                    <TableCell className="font-black text-xl text-slate-900 tracking-tighter">
                       ₹{item.base_price_paise / 100}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-10 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm">
                             <Edit3 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white hover:text-rose-600 hover:shadow-sm">
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
                  <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-200/50 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group cursor-pointer overflow-hidden relative">
                     <div className="h-48 w-full bg-slate-100 rounded-[2rem] overflow-hidden mb-6">
                        <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest">
                              {menuData?.categories.find((c:any) => c.id === item.category_id)?.name || 'General'}
                           </Badge>
                           <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{item.base_price_paise / 100}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                        <p className="text-xs font-bold text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                     </div>
                  </div>
               ))}
            </div>
          )}
          
          {(!filteredItems || filteredItems.length === 0) && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
               <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100">
                  <AlertCircle className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No items found</h3>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Adjust your search or add a new master item</p>
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
