'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, MoreVertical, Edit2, Trash2,
  ImageIcon, ToggleLeft, ToggleRight, Star, Clock,
} from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Menu Management</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">Manage categories, items, variants and pricing.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto h-12 rounded-xl px-6 shadow-lg shadow-primary/20" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Plan limit bar */}
      {stats && (
        <div className="bg-card border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-foreground uppercase tracking-widest">Menu Capacity</span>
              <span className={`text-sm font-black ${usagePercent >= 90 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {stats.item_count} / {stats.max_menu_items} ITEMS
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all ${usageColor}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
          </div>
          {usagePercent >= 90 && (
            <Badge className="bg-destructive/10 text-destructive border-none py-2 px-4 rounded-xl font-black uppercase">Limit approaching</Badge>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6 inline-flex">
          <TabsTrigger value="items" className="data-[state=active]:bg-card rounded-lg px-6 py-2.5 font-bold data-[state=active]:shadow-sm">
            Items {stats ? `(${stats.item_count})` : ''}
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-card rounded-lg px-6 py-2.5 font-bold data-[state=active]:shadow-sm">
            Categories {stats ? `(${stats.category_count})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* ── ITEMS TAB ── */}
        <TabsContent value="items" className="space-y-6">
          {/* Search + category filter */}
          <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search items by name or description..."
                className="pl-12 h-12 rounded-xl bg-muted border-none font-medium focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveCategory('all')}
                className={`h-10 rounded-xl px-5 font-bold ${activeCategory === 'all' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted text-foreground hover:bg-muted/80'}`}
              >
                All
              </Button>
              {catsLoading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-xl shrink-0" />)
                : categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`h-10 rounded-xl px-5 font-bold shrink-0 ${activeCategory === cat.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                  >
                    {cat.icon} <span className="ml-2">{cat.name}</span>
                  </Button>
                ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {itemsLoading ? (
              Array(8).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-card rounded-[2rem] shadow-sm">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {search ? 'No items match your search' : 'No items yet'}
                </h3>
                <p className="text-muted-foreground font-medium mt-2 max-w-sm mx-auto">
                  {search ? 'Try a different keyword' : 'Start by adding your first menu item to build your Culinary Canvas.'}
                </p>
                {!search && (
                  <Button className="mt-8 h-12 px-8 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
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
                  <Card key={item.id} className={`overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border-none bg-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${!item.is_available ? 'opacity-50 grayscale-[30%]' : ''}`}>
                    {/* Image */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      {/* Featured badge */}
                      {item.is_featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-[#fff0eb] text-[#d84315] border-none font-black uppercase tracking-widest text-[10px] px-3 py-1.5 shadow-sm backdrop-blur-md">
                            <Star className="h-3 w-3 mr-1.5 fill-current" /> Must Try
                          </Badge>
                        </div>
                      )}
                      {/* 3-dot menu */}
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-lg bg-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border-none">
                              <MoreVertical className="h-5 w-5 text-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-none">
                            <DropdownMenuItem onClick={() => openEdit(item)} className="rounded-lg font-medium cursor-pointer">
                              <Edit2 className="h-4 w-4 mr-3 text-muted-foreground" /> Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAvailability(item)} className="rounded-lg font-medium cursor-pointer">
                              {item.is_available
                                ? <><ToggleLeft className="h-4 w-4 mr-3 text-muted-foreground" /> Mark Unavailable</>
                                : <><ToggleRight className="h-4 w-4 mr-3 text-primary" /> Mark Available</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg font-medium cursor-pointer" onClick={() => setDeleteTarget(item)}>
                              <Trash2 className="h-4 w-4 mr-3" /> Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                          <Badge variant="destructive" className="px-4 py-2 text-xs font-black uppercase tracking-widest border-none shadow-lg">Unavailable</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <h3 className="font-black text-xl text-foreground leading-tight truncate group-hover:text-primary transition-colors">{item.name}</h3>
                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest shrink-0 border-none px-2 py-1 ${ft?.color}`}>{ft?.label}</Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground line-clamp-2 mb-6 h-10 leading-relaxed">{item.description || 'No description provided.'}</p>
                      
                      <div className="flex items-end justify-between pt-4 border-t border-muted">
                        <div>
                          <p className="text-2xl font-black text-foreground tracking-tighter">₹{(item.base_price_paise / 100).toLocaleString()}</p>
                          {margin && (
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${parseInt(margin) >= 50 ? 'text-green-600' : parseInt(margin) >= 30 ? 'text-amber-500' : 'text-destructive'}`}>
                              {margin}% MARGIN
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs bg-muted px-3 py-1.5 rounded-lg">
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
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-center">Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-muted-foreground text-base">
              This will permanently remove the item and all its variants from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 sm:space-x-4">
            <AlertDialogCancel className="h-12 rounded-xl font-bold border-none bg-muted hover:bg-muted/80 flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-12 rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 flex-1" onClick={confirmDelete}>
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
