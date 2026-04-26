'use client';

import { useState, useEffect } from 'react';
import { 
  Scale, 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  ChevronRight, 
  Utensils, 
  Beaker,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RecipeBuilderPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [miRes, ingRes] = await Promise.all([
          api.get('/menu/items'),
          api.get('/inventory/ingredients')
        ]);
        setMenuItems(miRes.data.data);
        setIngredients(ingRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const fetchRecipe = async () => {
        try {
          const { data } = await api.get(`/recipes/${selectedItem}`);
          setRecipeIngredients(data.data.map((i: any) => ({
             ingredient_id: i.ingredient_id,
             quantity: i.quantity,
             unit: i.unit
          })));
        } catch (err) {
          setRecipeIngredients([]);
        }
      };
      fetchRecipe();
    }
  }, [selectedItem]);

  const addIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { ingredient_id: '', quantity: 0, unit: 'G' }]);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...recipeIngredients];
    updated[index][field] = value;
    if (field === 'ingredient_id') {
      const ing = ingredients.find(i => i.id === value);
      if (ing) updated[index].unit = ing.unit;
    }
    setRecipeIngredients(updated);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      await api.post('/recipes', {
        menu_item_id: selectedItem,
        ingredients: recipeIngredients.filter(i => i.ingredient_id && i.quantity > 0)
      });
      toast({ title: "Recipe Saved", description: "Auto-deduction for this item is now active." });
    } catch (err) {
      toast({ variant: "destructive", title: "Save failed" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-12 rounded-[3rem] shadow-2xl border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -translate-y-32 translate-x-32 group-hover:bg-primary/10 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Link href="/dashboard/recipes">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-secondary">
                   <ArrowLeft className="h-5 w-5" />
                </Button>
             </Link>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Recipe Orchestration</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
             Recipe <span className="text-primary">Builder</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-6 ml-1 tracking-wide max-w-xl leading-relaxed">
             Map ingredients to menu items. Our engine will automatically subtract stock from your inventory as orders are served.
          </p>
        </div>
        <div className="h-40 w-40 bg-secondary rounded-[2.5rem] flex items-center justify-center rotate-12 relative z-10 border border-border shadow-inner">
           <Beaker className="h-20 w-20 text-primary drop-shadow-glow" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Item Selection */}
         <Card className="lg:col-span-1 border border-border bg-card shadow-soft rounded-[2.5rem]">
            <CardHeader className="p-10 border-b border-border bg-secondary/20">
               <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Utensils className="h-6 w-6 text-primary" />
                  Select Item
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto no-scrollbar">
               {menuItems.map((item) => (
                 <div 
                   key={item.id}
                   onClick={() => setSelectedItem(item.id)}
                   className={cn(
                     "p-8 border-b border-border last:border-0 transition-all cursor-pointer flex items-center justify-between group",
                     selectedItem === item.id ? "bg-primary/5 border-l-8 border-l-primary" : "hover:bg-secondary/30"
                   )}
                 >
                    <div className="flex items-center gap-5">
                       <div className="h-12 w-12 rounded-2xl bg-secondary overflow-hidden">
                          {item.photo_url ? <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center font-black text-slate-400">{item.name[0]}</div>}
                       </div>
                       <div>
                          <p className="font-black text-foreground">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category_name || 'Main Course'}</p>
                       </div>
                    </div>
                    {selectedItem === item.id && <ChevronRight className="h-6 w-6 text-primary" />}
                 </div>
               ))}
            </CardContent>
         </Card>

         {/* Recipe Editor */}
         <Card className="lg:col-span-2 border border-border bg-card shadow-soft rounded-[2.5rem] flex flex-col min-h-[600px]">
            <CardHeader className="p-10 border-b border-border bg-secondary/20 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Ingredient Map</CardTitle>
                  <CardDescription className="text-slate-500 font-bold">Add ingredients and their required quantities per dish.</CardDescription>
               </div>
               <Button 
                 onClick={addIngredient}
                 className="bg-[#1b1b24] text-white rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
               >
                  <Plus className="h-4 w-4" /> Add Component
               </Button>
            </CardHeader>
            <CardContent className="p-10 flex-1 space-y-4">
               {!selectedItem ? (
                 <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <Scale className="h-20 w-20 text-slate-200 mb-6" />
                    <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Choose a menu item to begin mapping</p>
                 </div>
               ) : (
                 recipeIngredients.map((item, idx) => (
                   <div key={idx} className="flex gap-4 items-end bg-secondary/20 p-6 rounded-[1.5rem] border border-border animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="flex-1 space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ingredient</label>
                         <Select 
                           value={item.ingredient_id} 
                           onValueChange={(val) => updateIngredient(idx, 'ingredient_id', val)}
                         >
                            <SelectTrigger className="h-14 rounded-xl border-2 bg-background font-bold">
                               <SelectValue placeholder="Search ingredients..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                               {ingredients.map(ing => (
                                 <SelectItem key={ing.id} value={ing.id} className="font-bold">{ing.name} ({ing.unit})</SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="w-32 space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Quantity</label>
                         <Input 
                           type="number" 
                           value={item.quantity} 
                           onChange={(e) => updateIngredient(idx, 'quantity', Number(e.target.value))}
                           className="h-14 rounded-xl border-2 bg-background font-black text-center"
                         />
                      </div>
                      <div className="h-14 flex items-center px-4 bg-secondary rounded-xl text-slate-500 font-black text-[10px] uppercase">
                         {item.unit || 'G'}
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => removeIngredient(idx)}
                        className="h-14 w-14 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                         <Trash2 className="h-6 w-6" />
                      </Button>
                   </div>
                 ))
               )}
            </CardContent>
            {selectedItem && (
               <div className="p-10 border-t border-border bg-secondary/10 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-slate-500 font-bold">
                     <AlertCircle className="h-5 w-5 text-primary" />
                     <span className="text-sm">Ingredients will be deducted when order is marked 'Ready'.</span>
                  </div>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || recipeIngredients.length === 0}
                    className="bg-primary text-white rounded-2xl h-16 px-12 font-black uppercase tracking-[0.2em] text-[11px] shadow-glow flex items-center gap-3"
                  >
                     {isSaving ? 'Synchronizing...' : 'Save Recipe'}
                     {!isSaving && <Save className="h-5 w-5" />}
                  </Button>
               </div>
            )}
         </Card>
      </div>
    </div>
  );
}
