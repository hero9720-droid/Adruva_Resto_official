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
      toast({ title: "Recipe Saved", description: "Inventory will now auto-deduct for this item.", className: "bg-card text-foreground border-border" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save recipe" });
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-hidden flex flex-col -m-8 p-8 bg-background font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">
            Inventory
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Real-time stock tracking & culinary automation.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-none shadow-soft font-black tracking-widest uppercase bg-card text-primary hover:bg-secondary">
            <History className="h-5 w-5 mr-3" />
            Stock Ledger
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow tracking-widest uppercase transition-all active:scale-[0.98] border-none">
            <Plus className="h-5 w-5 mr-3" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Package className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Inventory Items</p>
                <p className="text-4xl font-black text-foreground tracking-tighter mt-1">{ingredients?.length || 0}</p>
             </div>
          </div>
        </div>

        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                <AlertTriangle className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Low Stock Critical</p>
                <p className="text-4xl font-black text-red-500 tracking-tighter mt-1">{lowStockItems.length}</p>
             </div>
          </div>
        </div>

        <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex items-center p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                <Truck className="h-8 w-8" />
             </div>
             <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Suppliers</p>
                <p className="text-4xl font-black text-foreground tracking-tighter mt-1">{suppliers?.length || 0}</p>
             </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stock" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-secondary p-2 rounded-[1.5rem] self-start shadow-inner border border-border mb-8">
          <TabsTrigger value="stock" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none">Stock</TabsTrigger>
          <TabsTrigger value="recipes" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none">Recipes (BOM)</TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none">Suppliers</TabsTrigger>
          <TabsTrigger value="po" className="rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none">Procurement</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <TabsContent value="stock" className="space-y-6 mt-0">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input placeholder="Search ingredients..." className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-card text-foreground placeholder:text-slate-500" />
              </div>
              <Button variant="outline" className="h-16 px-8 rounded-[2rem] bg-card border-none shadow-soft font-black uppercase tracking-widest text-slate-500 hover:bg-secondary hover:text-foreground"><Filter className="h-5 w-5 mr-3" /> Filter</Button>
            </div>

            <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
              <Table>
                <TableHeader>
                   <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
                    <TableHead className="px-8 py-6 font-black uppercase text-[11px] tracking-widest text-slate-500 h-14 pl-12">Ingredient</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500 h-14">Category</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500 h-14">Current Stock</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500 h-14">Cost/Unit</TableHead>
                    <TableHead className="px-8 py-6 text-right font-black uppercase text-[11px] tracking-widest text-slate-500 h-14 pr-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients?.map((item: any) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/50 transition-colors">
                      <TableCell className="px-8 py-6 pl-12">
                         <div className="flex flex-col">
                            <span className="font-black text-foreground text-xl tracking-tight">{item.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.unit}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge className="bg-secondary text-primary border-none px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-xl">{item.category || 'GENERAL'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className={cn("text-2xl font-black tracking-tighter", item.current_stock <= item.low_threshold ? 'text-red-500' : 'text-foreground')}>
                              {item.current_stock}
                            </span>
                            {item.current_stock <= item.low_threshold && (
                              <Badge className="bg-red-500/10 text-red-500 border-none font-black text-[9px] px-3 py-1.5 uppercase tracking-widest">REPLENISH</Badge>
                            )}
                          </div>
                          <div className="w-40 h-3 bg-secondary rounded-full overflow-hidden shadow-inner p-0.5">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500", item.current_stock <= item.low_threshold ? 'bg-red-500' : 'bg-primary')} 
                              style={{width: `${Math.min(100, (item.current_stock / (Math.max(1, item.low_threshold) * 2)) * 100)}%`}} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-foreground text-lg">₹{(item.avg_cost_paise / 100).toFixed(2)}</TableCell>
                      <TableCell className="px-8 py-6 text-right pr-12">
                         <Button variant="ghost" className="h-12 px-6 rounded-2xl font-black text-primary hover:bg-secondary uppercase tracking-widest text-xs">UPDATE</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card shadow-soft rounded-[2.5rem] p-8 flex flex-col h-[700px] border border-border">
                <h2 className="text-2xl font-black text-foreground mb-8 uppercase tracking-tighter">1. Select Menu Item</h2>
                <div className="flex-1 space-y-3 overflow-y-auto pr-4 no-scrollbar">
                  {menuItems?.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMenuItem(item.id)                       <div className="flex justify-between items-center rotate-0">
                         <div className="flex items-center gap-5">
                            <div className="h-14 w-14 bg-secondary rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform">
                               <img src={item.photo_url} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className={cn("font-black text-lg text-left leading-tight", selectedMenuItem === item.id ? "text-primary" : "text-slate-500 group-hover:text-foreground")}>
                              {item.name}
                            </span>
                         </div>
                         <ChevronRight className={cn("h-6 w-6 transition-transform", selectedMenuItem === item.id ? "text-primary translate-x-1" : "text-slate-400")} />
                      </div>
>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card shadow-soft rounded-[2.5rem] p-8 flex flex-col h-[700px] border border-border">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">2. Recipe Composition</h2>
                   <Button 
                    disabled={!selectedMenuItem}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 h-12 font-black text-xs tracking-widest uppercase disabled:opacity-50"
                    onClick={() => setRecipeIngredients([...recipeIngredients, { ingredient_id: ingredients?.[0]?.id, quantity: 0 }])}
                   >
                     ADD INGREDIENT
                   </Button>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar mb-8">
                   {!selectedMenuItem ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Utensils className="h-20 w-20 opacity-20 mb-6" />
                        <p className="font-black uppercase tracking-[0.2em] text-sm">Select a menu item to start</p>
                     </div>
                   ) : recipeIngredients.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-[0.2em] text-sm">No ingredients linked yet</p>
                     </div>
                   ) : (
                     recipeIngredients.map((ri, idx) => (
                       <div key={idx} className="flex gap-4 items-center bg-background p-4 rounded-[1.5rem] border border-border">
                          <select 
                            className="flex-1 h-14 rounded-2xl border-none bg-card px-6 font-black text-foreground text-lg shadow-sm focus:ring-2 focus:ring-primary outline-none"
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
                            className="w-28 h-14 rounded-2xl border-none bg-card font-black text-lg text-center shadow-sm focus-visible:ring-primary text-foreground"
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
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-14 w-14 rounded-2xl shrink-0 transition-colors"
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
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/30 transition-all active:scale-[0.98] border-none"
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
                <div key={s.id} className="bg-card shadow-soft border border-border rounded-[2.5rem] p-8 hover:border-primary hover:shadow-xl transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-8">
                     <div className="h-20 w-20 bg-secondary rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-inner">
                        <Truck className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black px-4 py-2 text-[10px] uppercase tracking-widest rounded-xl">Active</Badge>
                  </div>
                  <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{s.name}</h3>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-8">{s.contact_person || 'GENERAL SUPPLIER'}</p>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary"><Smartphone className="h-5 w-5" /></div>
                        <span className="text-lg">{s.phone || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary"><Mail className="h-5 w-5" /></div>
                        <span className="truncate text-lg">{s.email || 'N/A'}</span>
                     </div>
                  </div>
                </div>
              ))}
              <button className="h-[380px] border-[3px] border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-secondary transition-all group">
                 <div className="h-20 w-20 rounded-[2rem] border-[3px] border-dashed border-border flex items-center justify-center group-hover:border-primary">
                    <Plus className="h-10 w-10" />
                 </div>
                 <span className="font-black uppercase tracking-[0.2em] text-sm">Register New Supplier</span>
              </button>
            </div>
          </TabsContent>
          <TabsContent value="po" className="mt-0">
             <div className="bg-card shadow-soft rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center border border-border">
                <div className="h-32 w-32 bg-secondary rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                   <Truck className="h-14 w-14 text-primary" />
                </div>
                <h2 className="text-4xl font-black text-foreground tracking-tighter mb-4 uppercase">Procurement Engine</h2>
                <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                   Track purchase orders, manage vendor lead times, and reconcile received goods against digital invoices in one unified procurement hub.
                </p>
                <div className="flex gap-4">
                   <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow tracking-widest uppercase border-none">
                      <Plus className="h-5 w-5 mr-3" /> Create Purchase Order
                   </Button>
                   <Button variant="outline" className="h-16 px-10 rounded-2xl border-2 border-border font-black tracking-widest uppercase text-slate-500 hover:bg-secondary hover:text-foreground">
                      View Open POs
                   </Button>
                </div>
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
