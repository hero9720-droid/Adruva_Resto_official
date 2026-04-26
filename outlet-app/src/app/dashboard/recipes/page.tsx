'use client';

import { useState, useMemo } from 'react';
import { ChefHat, Plus, Search, Trash2, Edit2, Scale, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecipes, useCreateRecipe, useDeleteRecipe } from '@/hooks/useRecipes';
import { useMenuItems } from '@/hooks/useMenu';
import { useIngredients } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes();
  const deleteRecipe = useDeleteRecipe();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe.mutateAsync(id);
      toast({ title: "Recipe Deleted", description: "BOM mapping removed." });
    } catch (e) {
      toast({ variant: "destructive", title: "Deletion failed" });
    }
  };

  if (isLoading) return <div className="p-8 h-screen flex items-center justify-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing BOM Ledger...</div>;

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-background -m-8 p-8 font-sans pb-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Recipe Management</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage Bill of Materials (BOM) and food costing.</p>
        </div>
        <AddRecipeDialog />
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="py-24 text-center bg-card rounded-[2.5rem] shadow-soft border border-border">
          <div className="w-24 h-24 mb-8 relative mx-auto">
             <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-6" />
             <div className="absolute inset-0 bg-card border border-border rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
                <ChefHat className="h-10 w-10 text-primary/40" />
             </div>
          </div>
          <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">No Recipes Found</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
            Start building your recipes to accurately track ingredient consumption and automate stock depletion.
          </p>
          <div className="mt-10">
             <AddRecipeDialog variant="outline" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="bg-card border border-border shadow-soft rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                           <ChefHat className="h-7 w-7" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-tight">{recipe.menu_item_name}</h3>
                           <Badge className="bg-secondary text-slate-500 border-none font-black text-[9px] px-2.5 py-1 uppercase tracking-widest mt-1">
                              {recipe.ingredients.length} Ingredients
                           </Badge>
                        </div>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                       onClick={() => handleDelete(recipe.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </div>

                  <div className="space-y-4 mb-8 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
                     {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="p-4 bg-secondary/30 rounded-2xl border border-border flex justify-between items-center group/item hover:bg-secondary/50 transition-colors relative overflow-hidden">
                           <div className="flex items-center gap-3">
                              <Scale className="h-4 w-4 text-slate-400" />
                              <div className="flex flex-col">
                                 <span className="font-bold text-foreground">{ing.name}</span>
                                 <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">{ing.wastage_percent || 5}% Wastage</span>
                              </div>
                           </div>
                           <span className="font-black text-primary text-sm uppercase tracking-tighter">
                              {ing.quantity} {ing.unit}
                           </span>
                        </div>
                     ))}
                  </div>

                  <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Cost</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter">₹{(recipe.total_cost_paise / 100).toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Profit Margin</p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">~35%</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddRecipeDialog({ variant = "default" }: { variant?: "default" | "outline" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredient_id: string, quantity: number }[]>([]);
  
  const { data: menuItems } = useMenuItems();
  const { data: ingredients } = useIngredients();
  const createRecipe = useCreateRecipe();
  const { toast } = useToast();

  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    if (!menuSearch.trim()) return menuItems;
    return menuItems.filter((item: any) =>
      item.name.toLowerCase().includes(menuSearch.toLowerCase())
    );
  }, [menuItems, menuSearch]);

  const selectedMenuItemName = menuItems?.find((i: any) => i.id === selectedMenuItem)?.name;

  const handleAddIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { ingredient_id: '', quantity: 0 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...recipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeIngredients(updated);
  };

  const handleSave = async () => {
    if (!selectedMenuItem || recipeIngredients.length === 0) return;
    try {
      await createRecipe.mutateAsync({
        menu_item_id: selectedMenuItem,
        ingredients: recipeIngredients.filter(i => i.ingredient_id && i.quantity > 0)
      });
      toast({ title: "Recipe Created", description: "BOM linked to menu item." });
      setIsOpen(false);
      setSelectedMenuItem('');
      setMenuSearch('');
      setRecipeIngredients([]);
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to create recipe" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant === "default" ? "default" : "outline"} className={variant === "default" ? "h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none" : "h-14 px-8 rounded-2xl border-border text-primary hover:bg-secondary font-black tracking-widest uppercase"}>
          <Plus className="h-5 w-5 mr-2" />
          {variant === "default" ? "ADD RECIPE" : "CREATE FIRST RECIPE"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2.5rem] border-none p-10 bg-card shadow-soft font-sans">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase flex items-center gap-4">
             <Calculator className="h-8 w-8 text-primary" />
             Build BOM
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-8">
           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Menu Item</label>
              {/* Searchable dropdown for menu items */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    placeholder={selectedMenuItemName || "Search and select a dish..."}
                    value={menuSearch}
                    onChange={(e) => { setMenuSearch(e.target.value); if (selectedMenuItem) setSelectedMenuItem(''); }}
                    className="h-16 rounded-2xl bg-secondary border-none pl-12 text-base font-bold text-foreground shadow-inner focus-visible:ring-primary"
                  />
                </div>
                {(menuSearch || !selectedMenuItem) && menuSearch.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-card rounded-2xl border border-border shadow-2xl max-h-56 overflow-y-auto no-scrollbar">
                    {filteredMenuItems.length === 0 && (
                      <div className="py-8 text-center text-slate-400 font-bold text-sm">No dishes found.</div>
                    )}
                    {filteredMenuItems.map((item: any) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setSelectedMenuItem(item.id); setMenuSearch(''); }}
                        className="w-full text-left px-6 py-4 font-bold text-foreground hover:bg-secondary transition-colors text-sm border-b border-border/30 last:border-0"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
                {selectedMenuItemName && !menuSearch && (
                  <div className="mt-2 flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-black text-primary text-sm">{selectedMenuItemName}</span>
                    <button onClick={() => setSelectedMenuItem('')} className="ml-auto text-slate-400 hover:text-red-500 text-xs font-black">✕</button>
                  </div>
                )}
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ingredients & Quantities</label>
                 <Button variant="ghost" size="sm" onClick={handleAddIngredient} className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">
                    <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                 </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                 {recipeIngredients.map((ing, idx) => (
                   <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 bg-background rounded-2xl border border-border">
                      <div className="col-span-7">
                         <Select 
                           value={ing.ingredient_id} 
                           onValueChange={(val) => updateIngredient(idx, 'ingredient_id', val)}
                         >
                            <SelectTrigger className="h-12 rounded-xl bg-secondary border-none px-4 font-bold text-foreground">
                               <SelectValue placeholder="Ingredient" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-card">
                               {ingredients?.map((i: any) => (
                                 <SelectItem key={i.id} value={i.id} className="font-bold py-2">
                                    {i.name} ({i.unit})
                                 </SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="col-span-3">
                         <Input 
                           type="number" 
                           placeholder="Qty" 
                           value={ing.quantity || ''}
                           onChange={(e) => updateIngredient(idx, 'quantity', Number(e.target.value))}
                           className="h-12 rounded-xl bg-secondary border-none px-4 font-black text-foreground text-center" 
                         />
                      </div>
                      <div className="col-span-2 flex justify-end">
                         <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(idx)} className="h-10 w-10 text-slate-300 hover:text-red-500 rounded-xl">
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                 ))}
                 {recipeIngredients.length === 0 && (
                   <div className="py-10 text-center border-2 border-dashed border-border rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm italic">Click "Add Ingredient" to start mapping.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
           <div className="flex gap-4 w-full">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400" onClick={() => setIsOpen(false)}>
                 Cancel
              </Button>
              <Button 
                className="flex-[2] h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-black shadow-lg shadow-black/10 tracking-widest uppercase border-none"
                onClick={handleSave}
                disabled={!selectedMenuItem || recipeIngredients.length === 0 || createRecipe.isPending}
              >
                {createRecipe.isPending ? 'MAPPING...' : 'SAVE RECIPE'}
              </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
