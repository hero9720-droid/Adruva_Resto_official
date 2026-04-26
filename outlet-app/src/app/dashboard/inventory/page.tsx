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
  Mail,
  FileText
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
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
import { useIngredients, useSuppliers, useRecordMovement, useCreateIngredient, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, useMovements } from '@/hooks/useInventory';
import { useMenuItems } from '@/hooks/useMenu';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useRecipe } from '@/hooks/useInventory';
import { useEffect } from 'react';

export default function InventoryPage() {
  const { toast } = useToast();
  const { data: ingredients } = useIngredients();
  const { data: suppliers } = useSuppliers();
  const { data: movements } = useMovements();
  const { data: menuItems } = useMenuItems();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: recipeData } = useRecipe(selectedMenuItem);
  const recordMovement = useRecordMovement();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: '',
    unit: '',
    low_threshold: 10,
    current_stock: 0
  });

  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  });

  const createIngredient = useCreateIngredient();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  useEffect(() => {
    if (recipeData) {
      setRecipeIngredients(recipeData.map((r: any) => ({
        ingredient_id: r.ingredient_id,
        quantity: r.quantity
      })));
    } else {
      setRecipeIngredients([]);
    }
  }, [recipeData]);

  const [adjustingItem, setAdjustingItem] = useState<any>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: 0,
    type: 'purchase', // purchase, waste, correction
    supplier_id: '',
    total_cost_paise: 0
  });

  const openSupplierDialog = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        gstin: supplier.gstin || ''
      });
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        gstin: ''
      });
    }
    setIsSupplierDialogOpen(true);
  };

  const handleSaveSupplier = async () => {
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({ id: editingSupplier.id, ...supplierForm });
        toast({ title: 'Supplier Updated', description: `${supplierForm.name} updated successfully.` });
      } else {
        await createSupplier.mutateAsync(supplierForm);
        toast({ title: 'Supplier Registered', description: `${supplierForm.name} registered successfully.` });
      }
      setIsSupplierDialogOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await deleteSupplier.mutateAsync(id);
      toast({ title: 'Supplier Deleted' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Delete Failed' });
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem) return;
    try {
      await recordMovement.mutateAsync({
        ingredient_id: adjustingItem.id,
        type: adjustmentForm.type,
        quantity: adjustmentForm.quantity,
        supplier_id: adjustmentForm.supplier_id || null,
        total_cost_paise: adjustmentForm.total_cost_paise || 0,
        notes: `Manual adjustment: ${adjustmentForm.type}`
      });
      setAdjustingItem(null);
      toast({ title: "Stock Adjusted", description: `${adjustingItem.name} levels updated.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Adjustment failed' });
    }
  };

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

  const handleCreateIngredient = async () => {
    try {
      await createIngredient.mutateAsync(newIngredient);
      setIsAddOpen(false);
      setNewIngredient({ name: '', category: '', unit: '', low_threshold: 10, current_stock: 0 });
      toast({ title: "Ingredient Added", description: "The ingredient has been successfully added to the registry.", className: "bg-emerald-600 text-white font-bold border-none" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to add ingredient" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 min-h-0 flex flex-col pb-10 bg-background font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase">
            Inventory
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">Real-time stock tracking & culinary automation.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <Button variant="outline" className="h-12 md:h-14 px-6 rounded-2xl border-none shadow-soft font-black tracking-widest uppercase bg-card text-primary hover:bg-secondary shrink-0">
            <History className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
            Stock Ledger
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 md:h-14 px-6 md:px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow tracking-widest uppercase transition-all active:scale-[0.98] border-none shrink-0">
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] bg-card border-none shadow-2xl p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">New Ingredient</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Name</label>
                  <Input 
                    placeholder="e.g. Tomato Puree" 
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                    <Input 
                      placeholder="e.g. VEG" 
                      value={newIngredient.category}
                      onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
                      className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Unit</label>
                    <Input 
                      placeholder="e.g. KG, LTR" 
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                      className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Initial Stock</label>
                    <Input 
                      type="number"
                      value={newIngredient.current_stock}
                      onChange={(e) => setNewIngredient({...newIngredient, current_stock: Number(e.target.value)})}
                      className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Low Threshold</label>
                    <Input 
                      type="number"
                      value={newIngredient.low_threshold}
                      onChange={(e) => setNewIngredient({...newIngredient, low_threshold: Number(e.target.value)})}
                      className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateIngredient}
                  disabled={!newIngredient.name || !newIngredient.unit || createIngredient.isPending}
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-glow mt-4 border-none"
                >
                  {createIngredient.isPending ? 'Saving...' : 'Add to Inventory'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
        <div className="bg-card shadow-soft rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex items-center p-6 md:p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-4 md:gap-6">
             <div className="h-12 w-12 md:h-16 md:w-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Package className="h-6 w-6 md:h-8 md:w-8" />
             </div>
             <div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Inventory Items</p>
                <p className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mt-1">{ingredients?.length || 0}</p>
             </div>
          </div>
        </div>

        <div className="bg-card shadow-soft rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex items-center p-6 md:p-8 transition-transform hover:-translate-y-1 border border-border">
          <div className="flex items-center gap-4 md:gap-6">
             <div className="h-12 w-12 md:h-16 md:w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8" />
             </div>
             <div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Low Stock Critical</p>
                <p className="text-3xl md:text-4xl font-black text-red-500 tracking-tighter mt-1">{lowStockItems.length}</p>
             </div>
          </div>
        </div>

        <div className="bg-card shadow-soft rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex items-center p-6 md:p-8 transition-transform hover:-translate-y-1 border border-border hidden md:flex">
          <div className="flex items-center gap-4 md:gap-6">
             <div className="h-12 w-12 md:h-16 md:w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                <Truck className="h-6 w-6 md:h-8 md:w-8" />
             </div>
             <div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Suppliers</p>
                <p className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mt-1">{suppliers?.length || 0}</p>
             </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stock" className="flex-1 flex flex-col">
        <TabsList className="bg-secondary p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] self-start shadow-inner border border-border mb-4 md:mb-8 overflow-x-auto no-scrollbar max-w-full flex-nowrap shrink-0">
          <TabsTrigger value="stock" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Stock Registry</TabsTrigger>
          <TabsTrigger value="low-stock" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/20 text-slate-500 hover:text-red-500 transition-all border-none whitespace-nowrap">Stock Alerts ({lowStockItems.length})</TabsTrigger>
          <TabsTrigger value="recipes" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Recipes (BOM)</TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Suppliers</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg md:rounded-xl px-4 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-slate-500 hover:text-primary transition-all border-none whitespace-nowrap">Movement Log</TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="stock" className="space-y-6 mt-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input 
                  placeholder="Search ingredients..." 
                  className="pl-16 h-16 rounded-[2rem] border-none shadow-soft font-black text-lg bg-card text-foreground placeholder:text-slate-500" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="h-16 px-8 rounded-[2rem] bg-card border-none shadow-soft font-black text-xs uppercase tracking-widest text-slate-500 outline-none cursor-pointer hover:bg-secondary transition-all"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(ingredients?.map((i: any) => i.category).filter(Boolean) || [])).map((cat: any) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
              <Table>
                <TableHeader>
                   <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
                    <TableHead className="px-8 py-6 font-black uppercase text-[11px] tracking-widest text-slate-500 pl-12">Ingredient</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Category</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Current Stock</TableHead>
                    <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Cost/Unit</TableHead>
                    <TableHead className="px-8 py-6 text-right font-black uppercase text-[11px] tracking-widest text-slate-500 pr-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients?.filter((item: any) => {
                    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
                    return matchesSearch && matchesCategory;
                  }).map((item: any) => (
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
                              <Badge className="bg-red-500/10 text-red-500 border-none font-black text-[9px] px-3 py-1.5 uppercase tracking-widest">CRITICAL</Badge>
                            )}
                          </div>
                          <div className="w-40 h-3 bg-secondary rounded-full overflow-hidden shadow-inner p-0.5">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500 shadow-glow", item.current_stock <= item.low_threshold ? 'bg-red-500' : 'bg-primary')} 
                              style={{width: `${Math.min(100, (item.current_stock / (Math.max(1, item.low_threshold) * 2)) * 100)}%`}} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-foreground text-lg">₹{(item.avg_cost_paise / 100).toFixed(2)}</TableCell>
                      <TableCell className="px-8 py-6 text-right pr-12">
                         <Button 
                          variant="ghost" 
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustmentForm({ quantity: 0, type: 'purchase', supplier_id: '', total_cost_paise: 0 });
                          }}
                          className="h-12 px-6 rounded-2xl font-black text-primary hover:bg-secondary uppercase tracking-widest text-[10px]"
                         >
                           Adjust
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="low-stock" className="mt-0">
             <div className="bg-card shadow-soft rounded-[2.5rem] border border-border p-10">
                <div className="flex items-center gap-5 mb-10">
                   <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                      <AlertTriangle className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Critical Stock Alerts</h2>
                      <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest mt-1">Immediate action required for these items</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {lowStockItems.map((item: any) => (
                      <div key={item.id} className="p-6 rounded-[2rem] bg-background border-2 border-red-500/20 flex flex-col gap-4 group hover:border-red-500 transition-all">
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-black text-foreground text-xl tracking-tight">{item.name}</h4>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                            </div>
                            <Badge className="bg-red-500 text-white border-none font-black text-[10px] px-3 py-1">LOW</Badge>
                         </div>
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">In Stock</p>
                               <p className="text-3xl font-black text-red-600 tracking-tighter">{item.current_stock} {item.unit}</p>
                            </div>
                            <Button className="h-12 px-6 rounded-xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Restock</Button>
                         </div>
                      </div>
                   ))}
                   {lowStockItems.length === 0 && (
                      <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest">All stock levels are optimal.</div>
                   )}
                </div>
             </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card shadow-soft rounded-[2.5rem] p-8 flex flex-col min-h-[500px] lg:h-[700px] border border-border">
                <h2 className="text-2xl font-black text-foreground mb-8 uppercase tracking-tighter">1. Select Menu Item</h2>
                <div className="flex-1 space-y-3 overflow-y-auto pr-4 no-scrollbar">
                  {menuItems?.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMenuItem(item.id)}
                      className={cn(
                        "w-full p-4 rounded-[1.5rem] border-2 transition-all group",
                        selectedMenuItem === item.id 
                          ? "border-primary bg-secondary shadow-lg shadow-primary/10" 
                          : "border-transparent hover:border-border bg-background"
                      )}
                    >
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-5">
                            <div className="h-14 w-14 bg-secondary rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform">
                               <img src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className={cn("font-black text-lg text-left leading-tight", selectedMenuItem === item.id ? "text-primary" : "text-slate-500 group-hover:text-foreground")}>
                               {item.name}
                            </span>
                         </div>
                         <ChevronRight className={cn("h-6 w-6 transition-transform", selectedMenuItem === item.id ? "text-primary translate-x-1" : "text-slate-400")} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card shadow-soft rounded-[2.5rem] p-8 flex flex-col min-h-[500px] lg:h-[700px] border border-border">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">2. Recipe Composition</h2>
                   <Button 
                    disabled={!selectedMenuItem}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 h-12 font-black text-[10px] tracking-widest uppercase disabled:opacity-50"
                    onClick={() => setRecipeIngredients([...recipeIngredients, { ingredient_id: ingredients?.[0]?.id, quantity: 0 }])}
                   >
                     ADD INGREDIENT
                   </Button>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar mb-8">
                   {!selectedMenuItem ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Utensils className="h-20 w-20 opacity-20 mb-6" />
                        <p className="font-black uppercase tracking-[0.2em] text-xs">Select a menu item to start</p>
                     </div>
                   ) : recipeIngredients.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-[0.2em] text-xs">No ingredients linked yet</p>
                     </div>
                   ) : (
                     recipeIngredients.map((ri, idx) => (
                       <div key={idx} className="flex gap-4 items-center bg-background p-4 rounded-[1.5rem] border border-border">
                          <select 
                            className="flex-1 h-14 rounded-2xl border-none bg-card px-6 font-black text-foreground text-sm shadow-sm focus:ring-2 focus:ring-primary outline-none"
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
                            className="w-24 h-14 rounded-2xl border-none bg-card font-black text-sm text-center shadow-sm focus-visible:ring-primary text-foreground"
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
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/30 transition-all active:scale-[0.98] border-none"
                    onClick={handleSaveRecipe}
                  >
                    SAVE RECIPE & LINK INVENTORY
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
             <div className="bg-card shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col border border-border">
               <Table>
                 <TableHeader>
                   <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
                     <TableHead className="px-8 py-6 font-black uppercase text-[11px] tracking-widest text-slate-500 pl-12">Date & Time</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Ingredient</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Type</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Quantity</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[11px] tracking-widest text-slate-500">Staff</TableHead>
                     <TableHead className="px-8 py-6 text-right font-black uppercase text-[11px] tracking-widest text-slate-500 pr-12">Total Cost</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {movements?.filter((m: any) => 
                      m.ingredient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.type?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((m: any) => (
                     <TableRow key={m.id} className="border-border hover:bg-secondary/50 transition-colors">
                       <TableCell className="px-8 py-6 pl-12 font-bold text-slate-500 text-xs">
                         {new Date(m.created_at).toLocaleString()}
                       </TableCell>
                       <TableCell className="font-black text-foreground text-lg tracking-tight">
                         {m.ingredient_name}
                       </TableCell>
                       <TableCell>
                         <Badge className={cn(
                           "border-none px-4 py-2 font-black text-[9px] uppercase tracking-widest rounded-xl",
                           m.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-500' :
                           m.type === 'waste' ? 'bg-red-500/10 text-red-500' :
                           'bg-indigo-500/10 text-indigo-500'
                         )}>
                           {m.type}
                         </Badge>
                       </TableCell>
                       <TableCell className="font-black text-lg">
                         {m.quantity}
                       </TableCell>
                       <TableCell className="font-bold text-slate-500 text-xs uppercase">
                         {m.staff_name || 'SYSTEM'}
                       </TableCell>
                       <TableCell className="px-8 py-6 pr-12 text-right font-black text-foreground text-lg">
                         ₹{(m.total_cost_paise / 100).toLocaleString()}
                       </TableCell>
                     </TableRow>
                   ))}
                   {movements?.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={6} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest">No movement records found.</TableCell>
                      </TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {suppliers?.map((s: any) => (
                <div 
                  key={s.id} 
                  onClick={() => openSupplierDialog(s)}
                  className="bg-card shadow-soft border border-border rounded-[2.5rem] p-8 hover:border-primary hover:shadow-xl transition-all cursor-pointer group relative"
                >
                  <div className="flex justify-between items-start mb-8">
                     <div className="h-20 w-20 bg-secondary rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-inner">
                        <Truck className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black px-4 py-2 text-[10px] uppercase tracking-widest rounded-xl">Active</Badge>
                  </div>
                  <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{s.name}</h3>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8">{s.contact_person || 'GENERAL SUPPLIER'}</p>
                  
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

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(s.id); }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              <button 
                onClick={() => openSupplierDialog()}
                className="h-[380px] border-[3px] border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-secondary transition-all group"
              >
                 <div className="h-20 w-20 rounded-[2rem] border-[3px] border-dashed border-border flex items-center justify-center group-hover:border-primary">
                    <Plus className="h-10 w-10" />
                 </div>
                 <span className="font-black uppercase tracking-[0.2em] text-sm">Register New Supplier</span>
              </button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)}>
        <DialogContent className="bg-card rounded-[2.5rem] border-border shadow-2xl p-10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">
              Adjust Stock: {adjustingItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Type</Label>
                  <select 
                    className="w-full h-14 rounded-2xl bg-secondary border-none font-bold text-foreground px-4 outline-none"
                    value={adjustmentForm.type}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, type: e.target.value})}
                  >
                    <option value="purchase">Purchase (Add)</option>
                    <option value="waste">Waste (Deduct)</option>
                    <option value="correction">Correction</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Quantity ({adjustingItem?.unit})</Label>
                  <Input 
                    type="number"
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity: Number(e.target.value)})}
                    className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                  />
                </div>
             </div>

             {adjustmentForm.type === 'purchase' && (
               <>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Supplier</Label>
                   <select 
                     className="w-full h-14 rounded-2xl bg-secondary border-none font-bold text-foreground px-4 outline-none"
                     value={adjustmentForm.supplier_id}
                     onChange={(e) => setAdjustmentForm({...adjustmentForm, supplier_id: e.target.value})}
                   >
                     <option value="">Select Supplier (Optional)</option>
                     {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Total Cost (₹)</Label>
                   <Input 
                     type="number"
                     placeholder="0.00"
                     onChange={(e) => setAdjustmentForm({...adjustmentForm, total_cost_paise: Math.round(Number(e.target.value) * 100)})}
                     className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                   />
                 </div>
               </>
             )}
          </div>
          <DialogFooter>
             <Button 
              onClick={handleAdjustStock}
              className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest border-none shadow-glow"
             >
               Confirm Adjustment
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier CRUD Dialog */}
      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent className="bg-card rounded-[2.5rem] border-border shadow-2xl p-10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">
              {editingSupplier ? 'Update Supplier' : 'New Vendor Profile'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Company Name *</Label>
               <Input 
                 placeholder="e.g. Fresh Veggies Ltd." 
                 value={supplierForm.name}
                 onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                 className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact Person</Label>
               <Input 
                 placeholder="Full Name" 
                 value={supplierForm.contact_person}
                 onChange={(e) => setSupplierForm({...supplierForm, contact_person: e.target.value})}
                 className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Phone Number</Label>
               <div className="relative">
                 <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="+91 00000 00000" 
                   value={supplierForm.phone}
                   onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                   className="pl-12 h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Address</Label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="supplier@example.com" 
                   value={supplierForm.email}
                   onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                   className="pl-12 h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
                 />
               </div>
             </div>
             <div className="space-y-2 col-span-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">GSTIN Registry</Label>
               <div className="relative">
                 <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="22AAAAA0000A1Z5" 
                   value={supplierForm.gstin}
                   onChange={(e) => setSupplierForm({...supplierForm, gstin: e.target.value})}
                   className="pl-12 h-14 rounded-2xl bg-secondary border-none font-bold text-foreground uppercase"
                 />
               </div>
             </div>
             <div className="space-y-2 col-span-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Registered Address</Label>
               <Input 
                 placeholder="Full office or warehouse address" 
                 value={supplierForm.address}
                 onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                 className="h-14 rounded-2xl bg-secondary border-none font-bold text-foreground"
               />
             </div>
          </div>
          <DialogFooter className="gap-4">
             <Button 
               variant="ghost" 
               onClick={() => setIsSupplierDialogOpen(false)}
               className="h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400"
             >
               Discard
             </Button>
             <Button 
               onClick={handleSaveSupplier}
               disabled={!supplierForm.name}
               className="h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest border-none px-10 shadow-glow"
             >
               {editingSupplier ? 'Update Profile' : 'Confirm Registration'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
