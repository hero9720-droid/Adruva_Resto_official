'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MenuItem, Category, useCreateMenuItem, useUpdateMenuItem, useUploadMenuPhoto } from '@/hooks/useMenu';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const toNum = (v: unknown) => (v === '' || v === null || v === undefined ? 0 : Number(v));

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  base_price_paise: z.preprocess(toNum, z.number().min(0, 'Price must be ≥ 0')),
  cost_price_paise: z.preprocess(toNum, z.number().min(0)).default(0),
  food_type: z.enum(['veg', 'non_veg', 'egg', 'vegan']),
  preparation_time_minutes: z.preprocess(toNum, z.number().min(1)).default(15),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  station: z.enum(['kitchen', 'bar', 'grill', 'dessert', 'bakery']).default('kitchen'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  item?: MenuItem | null;
}

export default function ItemDialog({ open, onClose, categories, item }: Props) {
  const isEdit = !!item;
  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const upload = useUploadMenuPhoto();
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      food_type: 'veg',
      is_available: true,
      is_featured: false,
      preparation_time_minutes: 15,
      cost_price_paise: 0,
      station: 'kitchen',
    },
  });

  useEffect(() => {
    if (open && item) {
      reset({
        name: item.name,
        description: item.description ?? '',
        category_id: item.category_id ?? '',
        base_price_paise: item.base_price_paise / 100,
        cost_price_paise: item.cost_price_paise / 100,
        food_type: item.food_type,
        preparation_time_minutes: item.preparation_time_minutes,
        is_available: item.is_available,
        is_featured: item.is_featured,
        station: (item as any).station ?? 'kitchen',
      });
      setPhotoUrl(item.photo_url);
    } else if (open) {
      reset({ food_type: 'veg', is_available: true, is_featured: false, preparation_time_minutes: 15, cost_price_paise: 0, station: 'kitchen' });
      setPhotoUrl(null);
      setUploadProgress(0);
    }
  }, [open, item, reset]);

  const price = watch('base_price_paise') || 0;
  const cost = watch('cost_price_paise') || 0;
  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : null;


  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      // Step 1: Compression
      setUploadProgress(25);
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,           // Max 300KB per image
        maxWidthOrHeight: 800,    // Resize to max 800px
        useWebWorker: true,
        fileType: 'image/webp',   // Convert to WebP — best compression
      });
      setUploadProgress(50);

      const originalKB = Math.round(file.size / 1024);
      const compressedKB = Math.round(compressed.size / 1024);
      console.log(`Image compressed: ${originalKB}KB → ${compressedKB}KB`);

      // Step 2: Upload
      setUploadProgress(75);
      const url = await upload.mutateAsync(compressed as File);
      setUploadProgress(100);
      
      setPhotoUrl(url);
      toast({ title: '✅ Photo uploaded!', description: `${originalKB}KB → ${compressedKB}KB (saved ${Math.round((1 - compressedKB/originalKB)*100)}%)` });
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err?.response?.data?.error || err?.message || 'Upload failed';
      toast({ variant: 'destructive', title: 'Upload Failed', description: msg });
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      base_price_paise: Math.round(values.base_price_paise * 100),
      cost_price_paise: Math.round((values.cost_price_paise ?? 0) * 100),
      category_id: values.category_id || null,
      photo_url: photoUrl,
    };
    if (isEdit && item) {
      await update.mutateAsync({ id: item.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  }

  const isBusy = create.isPending || update.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Photo upload */}
          <div
            className="h-36 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors relative overflow-hidden bg-slate-50"
            onClick={() => fileRef.current?.click()}
          >
            {photoUrl ? (
              <>
                <img src={photoUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                  onClick={(e) => { e.stopPropagation(); setPhotoUrl(null); }}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                   <Loader2 className="h-10 w-10 animate-spin text-primary" />
                   <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{uploadProgress}%</span>
                </div>
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${uploadProgress}%` }}
                     className="h-full bg-primary"
                   />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-300 mb-1" />
                <p className="text-xs text-slate-400">Click to upload photo</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label>Item Name *</Label>
            <Input {...register('name')} placeholder="e.g. Paneer Butter Masala" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea {...register('description')} placeholder="Short description..." rows={2} />
          </div>

          {/* Category + Food Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue('category_id', v)} defaultValue={item?.category_id ?? ''}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Food Type</Label>
              <Select onValueChange={(v) => setValue('food_type', v as any)} defaultValue={item?.food_type ?? 'veg'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">🟢 Veg</SelectItem>
                  <SelectItem value="non_veg">🔴 Non-Veg</SelectItem>
                  <SelectItem value="egg">🟡 Egg</SelectItem>
                  <SelectItem value="vegan">🌿 Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Station Mapping */}
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prep Station *</Label>
            <Select onValueChange={(v) => setValue('station', v as any)} defaultValue={watch('station')}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
                <SelectItem value="kitchen">🍳 MAIN KITCHEN</SelectItem>
                <SelectItem value="bar">🍹 BAR COUNTER</SelectItem>
                <SelectItem value="grill">🔥 GRILL / TANDOOR</SelectItem>
                <SelectItem value="dessert">🍰 DESSERT STATION</SelectItem>
                <SelectItem value="bakery">🥐 BAKERY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price + Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Selling Price (₹) *</Label>
              <Input type="number" step="0.01" {...register('base_price_paise')} placeholder="0.00" />
              {errors.base_price_paise && <p className="text-xs text-red-500">{errors.base_price_paise.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Cost Price (₹)</Label>
              <Input type="number" step="0.01" {...register('cost_price_paise')} placeholder="0.00" />
            </div>
          </div>

          {/* Profit margin badge */}
          {margin && (
            <div className={`text-xs px-3 py-1.5 rounded-lg font-medium w-fit ${parseFloat(margin) >= 50 ? 'bg-green-50 text-green-700' : parseFloat(margin) >= 30 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
              Profit Margin: {margin}%
            </div>
          )}

          {/* Prep time */}
          <div className="space-y-1">
            <Label>Prep Time (minutes)</Label>
            <Input type="number" {...register('preparation_time_minutes')} />
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium">Available</p>
              <p className="text-xs text-slate-500">Show on menu & POS</p>
            </div>
            <Switch checked={watch('is_available')} onCheckedChange={(v) => setValue('is_available', v)} />
          </div>
          <div className="flex items-center justify-between border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium">Featured</p>
              <p className="text-xs text-slate-500">Highlight on customer app</p>
            </div>
            <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit(onSubmit)} disabled={isBusy}>
            {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
