'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Edit2, Trash2, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Category, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useMenu';

const EMOJI_OPTIONS = ['🍛','🍕','🍔','🥗','🍜','🥩','🍣','🧁','🥤','🍺','☕','🍞','🥞','🍗','🌮','🥘'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  categories: Category[];
}

export default function CategoryPanel({ categories }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('🍛');

  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function openCreate() {
    setEditing(null);
    setSelectedIcon('🍛');
    reset({ name: '', icon: '🍛' });
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setSelectedIcon(cat.icon ?? '📁');
    reset({ name: cat.name, icon: cat.icon ?? '' });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const payload = { ...values, icon: selectedIcon };
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    setDialogOpen(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await del.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const busy = create.isPending || update.isPending;

  return (
    <>
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="py-10 text-center text-slate-400 border-2 border-dashed rounded-xl">
            <p className="text-sm">No categories yet</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-indigo-100 transition-colors">
                  {cat.icon || '📁'}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{cat.name}</p>
                  <p className="text-xs text-slate-500">{cat.item_count} item{cat.item_count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                  <Edit2 className="h-4 w-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cat)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))
        )}
        <button
          onClick={openCreate}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all text-sm"
        >
          <FolderPlus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Pick an Icon</Label>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSelectedIcon(e)}
                    className={`text-xl p-1.5 rounded-lg transition-colors ${selectedIcon === e ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-slate-100'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Category Name *</Label>
              <Input {...register('name')} placeholder="e.g. Starters" autoFocus />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit(onSubmit)} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Items in this category will become uncategorised. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              {del.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
