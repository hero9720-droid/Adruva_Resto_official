'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, MoreVertical, Edit2, Trash2,
  ImageIcon, ToggleLeft, ToggleRight, Star, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCategories, useMenuItems, useMenuStats, useUpdateMenuItem, useDeleteMenuItem, type MenuItem } from '@/hooks/useMenu';
import ItemDialog from '@/components/menu/ItemDialog';
import CategoryPanel from '@/components/menu/CategoryPanel';
import VariantsDialog from '@/components/menu/VariantsDialog';
import { ListPlus } from 'lucide-react';

const FOOD_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  veg:     { label: 'Veg',     color: 'text-green-600 border-green-200 bg-green-50' },
  non_veg: { label: 'Non-Veg', color: 'text-red-600 border-red-200 bg-red-50' },
  egg:     { label: 'Egg',     color: 'text-yellow-600 border-yellow-200 bg-yellow-50' },
  vegan:   { label: 'Vegan',   color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [variantsTarget, setVariantsTarget] = useState<MenuItem | null>(null);

  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: stats } = useMenuStats();
  const { data: items = [], isLoading: itemsLoading } = useMenuItems(
    activeCategory === 'all' ? undefined : activeCategory
  );
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  // Client-side search filter
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
  }, [items, search]);

  function openCreate() { setEditingItem(null); setItemDialogOpen(true); }
  function openEdit(item: MenuItem) { setEditingItem(item); setItemDialogOpen(true); }

  async function toggleAvailability(item: MenuItem) {
    await updateItem.mutateAsync({ id: item.id, is_available: !item.is_available });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteItem.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  // Plan limit bar
  const usagePercent = stats ? Math.round((stats.item_count / stats.max_menu_items) * 100) : 0;
  const usageColor = usagePercent >= 90 ? 'bg-destructive' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-primary';

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Menu Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage categories, items, variants and pricing.</p>
        </div>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 w-full md:w-auto h-14 rounded-2xl px-8 shadow-glow font-black text-sm tracking-wide border-none" onClick={openCreate}>
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Plan limit bar */}
      {stats && (
        <div className="bg-white border border-slate-100 shadow-soft rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50">
            <ImageIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Menu Capacity</span>
              <span className={`text-[11px] font-black tracking-widest uppercase ${usagePercent >= 90 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.item_count} / {stats.max_menu_items} ITEMS
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all ${usageColor}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
          </div>
          {usagePercent >= 90 && (
            <Badge className="bg-red-50 text-red-600 border border-red-100 py-2.5 px-5 rounded-xl font-black uppercase text-[10px] tracking-widest">Limit approaching</Badge>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="bg-slate-50 p-1.5 rounded-2xl mb-6 inline-flex border border-slate-200/60 shadow-inner">
          <TabsTrigger value="items" className="data-[state=active]:bg-white rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/50 transition-all">
            Items {stats ? `(${stats.item_count})` : ''}
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/50 transition-all">
            Categories {stats ? `(${stats.category_count})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* ── ITEMS TAB ── */}
        <TabsContent value="items" className="space-y-6">
          {/* Search + category filter */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-soft border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search items by name or description..."
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none font-medium focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-900 placeholder:text-slate-400 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar items-center px-1">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'secondary'}
                onClick={() => setActiveCategory('all')}
                className={`h-14 rounded-2xl px-8 font-black text-sm tracking-wide transition-all border ${activeCategory === 'all' ? 'bg-slate-900 text-white shadow-soft border-slate-900 hover:bg-black' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200 shadow-sm'}`}
              >
                ALL
              </Button>
              {catsLoading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-32 rounded-2xl shrink-0" />)
                : categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? 'default' : 'secondary'}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`h-14 rounded-2xl px-8 font-black text-sm tracking-wide transition-all shrink-0 border whitespace-nowrap ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-soft border-slate-900 hover:bg-black' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200 shadow-sm'}`}
                  >
                    {cat.icon} <span className="ml-2 uppercase">{cat.name}</span>
                  </Button>
                ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {itemsLoading ? (
              Array(8).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-3xl border-slate-100 shadow-soft">
                  <Skeleton className="h-48 w-full bg-slate-100" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4 bg-slate-100" />
                    <Skeleton className="h-4 w-1/2 bg-slate-100" />
                  </CardContent>
                </Card>
              ))
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-3xl shadow-soft border border-slate-100">
                <div className="w-24 h-24 mb-6 relative mx-auto">
                   <div className="absolute inset-0 bg-slate-100 rounded-3xl rotate-6" />
                   <div className="absolute inset-0 bg-white border border-slate-200 rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                   </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {search ? 'No items match your search' : 'No items yet'}
                </h3>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                  {search ? 'Try a different keyword' : 'Start by adding your first menu item to build your Culinary Canvas.'}
                </p>
                {!search && (
                  <Button className="mt-8 h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow font-black text-sm tracking-wide border-none" onClick={openCreate}>
                    <Plus className="h-5 w-5 mr-2" /> ADD ITEM
                  </Button>
                )}
              </div>
            ) : (
              filteredItems.map((item) => {
                const margin = item.base_price_paise > 0
                  ? (((item.base_price_paise - item.cost_price_paise) / item.base_price_paise) * 100).toFixed(0)
                  : null;
                const ft = FOOD_TYPE_CONFIG[item.food_type];
                return (
                  <Card key={item.id} className={`overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white border border-slate-100 rounded-3xl shadow-soft relative ${!item.is_available ? 'opacity-50 grayscale-[30%]' : ''}`}>
                    {/* Image */}
                    <div className="relative h-48 bg-slate-50 overflow-hidden">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      {/* Featured badge */}
                      {item.is_featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-amber-50 text-amber-600 border border-amber-100/50 font-black uppercase tracking-widest text-[10px] px-3 py-1.5 shadow-sm backdrop-blur-md">
                            <Star className="h-3 w-3 mr-1.5 fill-current" /> Must Try
                          </Badge>
                        </div>
                      )}
                      {/* 3-dot menu */}
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm bg-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200/50 hover:bg-white text-slate-700">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 bg-white">
                            <DropdownMenuItem onClick={() => openEdit(item)} className="rounded-xl font-bold cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900 py-3">
                              <Edit2 className="h-4 w-4 mr-3 text-slate-400" /> Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAvailability(item)} className="rounded-xl font-bold cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900 py-3">
                              {item.is_available
                                ? <><ToggleLeft className="h-4 w-4 mr-3 text-slate-400" /> Mark Unavailable</>
                                : <><ToggleRight className="h-4 w-4 mr-3 text-indigo-600" /> Mark Available</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVariantsTarget(item)} className="rounded-xl font-bold cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900 py-3">
                              <ListPlus className="h-4 w-4 mr-3 text-slate-400" /> Configure Variants
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-xl font-bold cursor-pointer py-3" onClick={() => setDeleteTarget(item)}>
                              <Trash2 className="h-4 w-4 mr-3" /> Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <Badge variant="destructive" className="px-4 py-2 text-[11px] font-black uppercase tracking-widest border border-red-200 shadow-sm bg-red-50 text-red-600">Unavailable</Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-[172px] right-4 bg-white/90 backdrop-blur-md rounded-xl p-2 shadow-sm border border-slate-100/50 z-10">
                       <div className={cn("h-3 w-3 rounded-full", item.food_type === 'veg' ? 'bg-emerald-500' : 'bg-red-500')} />
                    </div>

                    <CardContent className="p-6 bg-white relative">
                      <div className="flex items-start justify-between mb-2 pr-8">
                        <h3 className="font-black text-xl text-slate-900 leading-tight truncate group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                      </div>
                      <p className="text-[13px] font-medium text-slate-500 line-clamp-2 mb-6 h-10 leading-relaxed">{item.description || 'No description provided.'}</p>
                      
                      <div className="flex items-end justify-between pt-5 border-t border-slate-100">
                        <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{(item.base_price_paise / 100).toLocaleString()}</p>
                          {margin && (
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${parseInt(margin) >= 50 ? 'text-emerald-600' : parseInt(margin) >= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                              {margin}% MARGIN
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px] uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                          <Clock className="h-3.5 w-3.5" />
                          {item.preparation_time_minutes}m
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ── CATEGORIES TAB ── */}
        <TabsContent value="categories" className="pt-4">
          <div className="max-w-4xl">
            <CategoryPanel categories={categories} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Item create/edit dialog */}
      <ItemDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        categories={categories}
        item={editingItem}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 max-w-md bg-white">
          <AlertDialogHeader className="space-y-4">
            <div className="h-20 w-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-2 relative">
              <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
              <Trash2 className="h-8 w-8 text-red-500 relative z-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-center text-slate-900">Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500 text-base">
              This will permanently remove the item and all its variants from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 sm:space-x-4">
            <AlertDialogCancel className="h-14 rounded-2xl font-black text-sm tracking-widest uppercase border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex-1 shadow-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl font-black text-sm tracking-widest uppercase bg-red-500 hover:bg-red-600 text-white shadow-[0_8px_32px_rgba(239,68,68,0.2)] flex-1 border-none" onClick={confirmDelete}>
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Variants configure dialog */}
      <VariantsDialog
        open={!!variantsTarget}
        onClose={() => setVariantsTarget(null)}
        item={variantsTarget}
      />
    </div>
  );
}
