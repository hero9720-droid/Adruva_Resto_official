import React from 'react';
import { ChefHat, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecipesPage() {
  return (
    <div className="space-y-8 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-background -m-8 p-8 font-sans">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Recipe Management</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage Bill of Materials (BOM) and food costing.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/30 tracking-widest uppercase transition-all active:scale-[0.98] border-none">
          <Plus className="h-5 w-5 mr-2" />
          ADD RECIPE
        </Button>
      </div>

      <div className="py-24 text-center bg-card rounded-[2.5rem] shadow-soft border border-border">
        <div className="w-24 h-24 mb-8 relative mx-auto">
           <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-6" />
           <div className="absolute inset-0 bg-card border border-border rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
              <ChefHat className="h-10 w-10 text-primary/40" />
           </div>
        </div>
        <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">No Recipes Found</h3>
        <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
          Start building your recipes to accurately track ingredient consumption and cost margins.
        </p>
      </div>
    </div>
  );
}
