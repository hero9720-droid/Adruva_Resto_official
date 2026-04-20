'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  History, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  ChevronRight,
  Utensils,
  Trash2,
  Smartphone,
  Mail
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useIngredients, useSuppliers, useRecordMovement, useCreateIngredient } from '@/hooks/useInventory';
import { useMenuItems } from '@/hooks/useMenu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const { data: ingredients, isLoading: itemsLoading } = useIngredients();
  const { data: suppliers } = useSuppliers();
  const { data: menuItems } = useMenuItems();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const { toast } = useToast();

  const lowStockItems = ingredients?.filter((i: any) => i.current_stock <= i.low_threshold) || [];

  const handleSaveRecipe = async () => {
    if (!selectedMenuItem) return;
    try {
      await api.post('/recipes', {
        menu_item_id: selectedMenuItem,
        ingredients: recipeIngredients.map(ri => ({
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity
        }))
      });
      toast({ title: "Recipe Saved", description: "Inventory will now auto-deduct for this item.", className: "bg-[#1b1b24] text-white border-none" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save recipe" });
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-hidden flex flex-col -m-8 p-8 bg-[#fcf8ff] font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-[#1b1b24] uppercase">
            Inventory
          </h1>
          <p className="text-[#777587] font-medium text-lg mt-1">Real-time stock tracking & culinary automation.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black tracking-widest uppercase bg-[#ffffff] text-[#4f46e5] hover:bg-[#f5f2ff]">
            <History className="h-5 w-5 mr-3" />
            Stock Ledger
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-[#4f46e5] hover:bg-[#3525cd] text-white font-black shadow-lg shadow-[#4f46e5]/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
            <Plus className="h-5 w-5 mr-3" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-[#e2dfff] rounded-2xl flex items-center justify-center text-[#3525cd] shadow-inner">
                <Package className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-[#777587] uppercase tracking-[0.2em]">Total Inventory Items</p>
                <p className="text-4xl font-black text-[#1b1b24] tracking-tighter mt-1">{ingredients?.length || 0}</p>
             </div>
          </div>
        </div>

        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-[#ffdad6] rounded-2xl flex items-center justify-center text-[#ba1a1a] shadow-inner">
                <AlertTriangle className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-[#777587] uppercase tracking-[0.2em]">Low Stock Critical</p>
                <p className="text-4xl font-black text-[#ba1a1a] tracking-tighter mt-1">{lowStockItems.length}</p>
             </div>
          </div>
        </div>

        <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-[#93f89e]/30 rounded-2xl flex items-center justify-center text-[#006e1c] shadow-inner">
                <Truck className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-[#777587] uppercase tracking-[0.2em]">Active Suppliers</p>
                <p className="text-4xl font-black text-[#1b1b24] tracking-tighter mt-1">{suppliers?.length || 0}</p>
             </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stock" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-[#ffffff] p-2 rounded-[1.5rem] self-start shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e4e1ee]/50 mb-8">
          <TabsTrigger value="stock" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">STOCK</TabsTrigger>
          <TabsTrigger value="recipes" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">RECIPES (BOM)</TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-[#1b1b24] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-lg data-[state=active]:shadow-black/10 text-[#777587] hover:text-[#1b1b24] transition-all">SUPPLIERS</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <TabsContent value="stock" className="space-y-6 mt-0">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#c7c4d8]" />
                <Input placeholder="Search ingredients..." className="pl-16 h-16 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black text-lg bg-[#ffffff] text-[#1b1b24] placeholder:text-[#a09eb1]" />
              </div>
              <Button variant="outline" className="h-16 px-8 rounded-[2rem] bg-[#ffffff] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-black uppercase tracking-widest text-[#777587] hover:bg-[#f5f2ff] hover:text-[#1b1b24]"><Filter className="h-5 w-5 mr-3" /> Filter</Button>
            </div>

            <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-[#f0ecf9]">
                    <TableHead className="px-8 py-6 font-black uppercase text-[11px] tracking-widest text-[#777587] h-14 pl-12">Ingredient</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-[#777587] h-14">Category</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-[#777587] h-14">Current Stock</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-[#777587] h-14">Cost/Unit</TableHead>
                    <TableHead className="px-8 py-6 text-right font-black uppercase text-[11px] tracking-widest text-[#777587] h-14 pr-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients?.map((item: any) => (
                    <TableRow key={item.id} className="border-[#f0ecf9] hover:bg-[#f5f2ff] transition-colors">
                      <TableCell className="px-8 py-6 pl-12">
                         <div className="flex flex-col">
                            <span className="font-black text-[#1b1b24] text-xl tracking-tight">{item.name}</span>
                            <span className="text-[10px] font-black text-[#a09eb1] uppercase tracking-widest mt-0.5">{item.unit}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge className="bg-[#fcf8ff] text-[#4f46e5] border border-[#e4e1ee] px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-xl">{item.category || 'GENERAL'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className={cn("text-2xl font-black tracking-tighter", item.current_stock <= item.low_threshold ? 'text-[#ba1a1a]' : 'text-[#1b1b24]')}>
                              {item.current_stock}
                            </span>
                            {item.current_stock <= item.low_threshold && (
                              <Badge className="bg-[#ffdad6] text-[#ba1a1a] border-none font-black text-[9px] px-3 py-1.5 uppercase tracking-widest">REPLENISH</Badge>
                            )}
                          </div>
                          <div className="w-40 h-3 bg-[#fcf8ff] rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500", item.current_stock <= item.low_threshold ? 'bg-[#ba1a1a]' : 'bg-[#4f46e5]')} 
                              style={{width: `${Math.min(100, (item.current_stock / (Math.max(1, item.low_threshold) * 2)) * 100)}%`}} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-[#1b1b24] text-lg">₹{(item.avg_cost_paise / 100).toFixed(2)}</TableCell>
                      <TableCell className="px-8 py-6 text-right pr-12">
                         <Button variant="ghost" className="h-12 px-6 rounded-2xl font-black text-[#4f46e5] hover:bg-[#e4e1ee] uppercase tracking-widest text-xs">UPDATE</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 flex flex-col h-[700px]">
                <h2 className="text-2xl font-black text-[#1b1b24] mb-8 uppercase tracking-tighter">1. Select Menu Item</h2>
                <div className="flex-1 space-y-3 overflow-y-auto pr-4 no-scrollbar">
                  {menuItems?.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMenuItem(item.id)}
                      className={cn(
                        "w-full p-4 rounded-[1.5rem] border-2 transition-all flex justify-between items-center group",
                        selectedMenuItem === item.id 
                          ? "border-[#4f46e5] bg-[#f5f2ff] shadow-lg shadow-[#4f46e5]/10" 
                          : "border-[#fcf8ff] hover:border-[#e4e1ee] bg-[#fcf8ff]"
                      )}
                    >
                      <div className="flex items-center gap-5">
                         <div className="h-14 w-14 bg-[#ffffff] rounded-xl overflow-hidden border border-[#f0ecf9] shadow-sm">
                            <img src={item.photo_url} className="w-full h-full object-cover" alt="" />
                         </div>
                         <span className={cn("font-black text-lg text-left leading-tight", selectedMenuItem === item.id ? "text-[#1b1b24]" : "text-[#777587]")}>
                           {item.name}
                         </span>
                      </div>
                      <ChevronRight className={cn("h-6 w-6 transition-transform", selectedMenuItem === item.id ? "text-[#4f46e5] translate-x-1" : "text-[#c7c4d8]")} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 flex flex-col h-[700px]">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-[#1b1b24] uppercase tracking-tighter">2. Recipe Composition</h2>
                   <Button 
                    disabled={!selectedMenuItem}
                    className="bg-[#1b1b24] hover:bg-black text-white rounded-2xl px-6 h-12 font-black text-xs tracking-widest uppercase disabled:opacity-50"
                    onClick={() => setRecipeIngredients([...recipeIngredients, { ingredient_id: ingredients?.[0]?.id, quantity: 0 }])}
                   >
                     ADD INGREDIENT
                   </Button>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar mb-8">
                   {!selectedMenuItem ? (
                     <div className="h-full flex flex-col items-center justify-center text-[#c7c4d8]">
                        <Utensils className="h-20 w-20 opacity-20 mb-6" />
                        <p className="font-black uppercase tracking-[0.2em] text-sm">Select a menu item to start</p>
                     </div>
                   ) : recipeIngredients.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-[#c7c4d8]">
                        <p className="font-black uppercase tracking-[0.2em] text-sm">No ingredients linked yet</p>
                     </div>
                   ) : (
                     recipeIngredients.map((ri, idx) => (
                       <div key={idx} className="flex gap-4 items-center bg-[#fcf8ff] p-4 rounded-[1.5rem] border border-[#f0ecf9]">
                          <select 
                            className="flex-1 h-14 rounded-2xl border-none bg-[#ffffff] px-6 font-black text-[#1b1b24] text-lg shadow-sm focus:ring-2 focus:ring-[#4f46e5] outline-none"
                            value={ri.ingredient_id}
                            onChange={(e) => {
                               const next = [...recipeIngredients];
                               next[idx].ingredient_id = e.target.value;
                               setRecipeIngredients(next);
                            }}
                          >
                            {ingredients?.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                          </select>
                          <Input 
                            type="number" 
                            placeholder="Qty" 
                            className="w-28 h-14 rounded-2xl border-none bg-[#ffffff] font-black text-lg text-center shadow-sm focus-visible:ring-[#4f46e5]"
                            value={ri.quantity || ''}
                            onChange={(e) => {
                               const next = [...recipeIngredients];
                               next[idx].quantity = parseFloat(e.target.value);
                               setRecipeIngredients(next);
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[#ba1a1a] hover:text-[#93000a] hover:bg-[#ffdad6] h-14 w-14 rounded-2xl shrink-0 transition-colors"
                            onClick={() => setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-6 w-6" />
                          </Button>
                       </div>
                     ))
                   )}
                </div>

                {selectedMenuItem && (
                  <Button 
                    className="w-full h-16 bg-[#4f46e5] hover:bg-[#3525cd] text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase shadow-xl shadow-[#4f46e5]/30 transition-all active:scale-[0.98] border-none"
                    onClick={handleSaveRecipe}
                  >
                    SAVE RECIPE & LINK INVENTORY
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suppliers?.map((s: any) => (
                <div key={s.id} className="bg-[#ffffff] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-[#ffffff] rounded-[2.5rem] p-8 hover:border-[#4f46e5] hover:shadow-xl transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-8">
                     <div className="h-20 w-20 bg-[#fcf8ff] rounded-3xl flex items-center justify-center group-hover:bg-[#e2dfff] transition-colors shadow-inner">
                        <Truck className="h-10 w-10 text-[#a09eb1] group-hover:text-[#3525cd] transition-colors" />
                     </div>
                     <Badge className="bg-[#93f89e]/30 text-[#006e1c] border-none font-black px-4 py-2 text-[10px] uppercase tracking-widest rounded-xl">ACTIVE</Badge>
                  </div>
                  <h3 className="text-3xl font-black text-[#1b1b24] tracking-tighter mb-2">{s.name}</h3>
                  <p className="text-[#a09eb1] font-black text-xs uppercase tracking-[0.2em] mb-8">{s.contact_person || 'GENERAL SUPPLIER'}</p>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 text-sm font-bold text-[#777587]">
                        <div className="h-10 w-10 rounded-xl bg-[#fcf8ff] flex items-center justify-center text-[#4f46e5]"><Smartphone className="h-5 w-5" /></div>
                        <span className="text-lg">{s.phone || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-4 text-sm font-bold text-[#777587]">
                        <div className="h-10 w-10 rounded-xl bg-[#fcf8ff] flex items-center justify-center text-[#4f46e5]"><Mail className="h-5 w-5" /></div>
                        <span className="truncate text-lg">{s.email || 'N/A'}</span>
                     </div>
                  </div>
                </div>
              ))}
              <button className="h-[380px] border-[3px] border-dashed border-[#e4e1ee] rounded-[2.5rem] flex flex-col items-center justify-center gap-6 text-[#c7c4d8] hover:border-[#4f46e5] hover:text-[#4f46e5] hover:bg-[#f5f2ff] transition-all group">
                 <div className="h-20 w-20 rounded-[2rem] border-[3px] border-dashed border-[#e4e1ee] flex items-center justify-center group-hover:border-[#4f46e5]">
                    <Plus className="h-10 w-10" />
                 </div>
                 <span className="font-black uppercase tracking-[0.2em] text-sm">Register New Supplier</span>
              </button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
