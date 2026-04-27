'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  FileStack, ClipboardList, Send, 
  CheckCircle2, XCircle, Truck, 
  Plus, Search, Info 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function Requisitions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const { data: requisitions, isLoading } = useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/requisitions');
      return data.data;
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/ingredients');
      return data.data;
    },
  });

  const { data: outlets } = useQuery({
    queryKey: ['outlets-list'],
    queryFn: async () => {
      const { data } = await api.get('/outlets');
      return data.data;
    },
  });

  const [newReq, setNewReq] = useState({
    to_outlet_id: '',
    items: [{ ingredient_id: '', quantity: 0 }],
    priority: 'normal',
    notes: ''
  });

  const createReq = useMutation({
    mutationFn: async (payload: any) => {
      await api.post('/inventory/requisitions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      setIsAddOpen(false);
      toast({ title: 'Indent Raised', description: 'Your request has been sent to the Central Kitchen.' });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/inventory/requisitions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      toast({ title: 'Status Updated' });
    }
  });

  const kitchens = outlets?.filter((o: any) => o.outlet_type === 'central_kitchen' || o.is_central_kitchen) || [];

  if (isLoading) return <div className="p-8 text-center">Loading requisitions...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Stock Indents</h2>
          <p className="text-slate-500 font-medium">Request and track stock transfers from the Central Kitchen.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-glow tracking-widest uppercase border-none">
              <Plus className="h-5 w-5 mr-3" />
              Raise Indent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card rounded-[2.5rem] border-none shadow-2xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">New Stock Requisition</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Request From</label>
                <select 
                  className="w-full h-14 rounded-2xl bg-secondary border-none font-bold text-foreground px-6 outline-none"
                  value={newReq.to_outlet_id}
                  onChange={(e) => setNewReq({...newReq, to_outlet_id: e.target.value})}
                >
                  <option value="">Select Central Kitchen / Warehouse</option>
                  {kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Items Needed</label>
                {newReq.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-2xl">
                    <select 
                      className="flex-1 h-12 rounded-xl bg-card border-none font-bold text-foreground px-4 outline-none"
                      value={item.ingredient_id}
                      onChange={(e) => {
                        const next = [...newReq.items];
                        next[idx].ingredient_id = e.target.value;
                        setNewReq({...newReq, items: next});
                      }}
                    >
                      <option value="">Select Ingredient</option>
                      {ingredients?.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                    </select>
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      className="w-24 h-12 rounded-xl bg-card border-none font-bold text-center"
                      value={item.quantity || ''}
                      onChange={(e) => {
                        const next = [...newReq.items];
                        next[idx].quantity = Number(e.target.value);
                        setNewReq({...newReq, items: next});
                      }}
                    />
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full h-10 rounded-xl font-bold text-primary hover:bg-primary/5 uppercase text-[10px]"
                  onClick={() => setNewReq({...newReq, items: [...newReq.items, { ingredient_id: '', quantity: 0 }]})}
                >
                  + Add More Items
                </Button>
              </div>

              <Button 
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest border-none shadow-glow mt-4"
                onClick={() => createReq.mutate({ ...newReq, from_outlet_id: outlets?.[0]?.id })} // Simplified for demo
                disabled={!newReq.to_outlet_id || createReq.isPending}
              >
                Send Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requisitions List */}
      <div className="grid grid-cols-1 gap-6">
        {requisitions?.map((req: any) => (
          <Card key={req.id} className="border-border shadow-soft bg-card rounded-[2.5rem] overflow-hidden group">
            <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className={cn(
                  "p-4 rounded-3xl",
                  req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                  req.status === 'received' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-primary/10 text-primary'
                )}>
                  <ClipboardList className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-xl text-foreground tracking-tight uppercase">Indent #{req.id.slice(0, 8)}</span>
                    <Badge className={cn(
                      "font-black text-[9px] uppercase border-none px-3 py-1",
                      req.status === 'pending' ? 'bg-amber-500 text-white' :
                      req.status === 'shipped' ? 'bg-primary text-white shadow-glow' :
                      req.status === 'received' ? 'bg-emerald-500 text-white' :
                      'bg-slate-500 text-white'
                    )}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    From: <span className="text-foreground">{req.to_outlet_name}</span> 
                    • Raised by: <span className="text-foreground">{req.creator_name}</span>
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {req.items.map((item: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-border text-slate-500 font-bold px-3 py-1 bg-secondary/30">
                        {item.quantity} x {ingredients?.find((i: any) => i.id === item.ingredient_id)?.name || 'Item'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Updated {new Date(req.updated_at).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  {req.status === 'shipped' && (
                    <Button 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl h-12 px-6 border-none shadow-soft"
                      onClick={() => updateStatus.mutate({ id: req.id, status: 'received' })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Received
                    </Button>
                  )}
                  <Button variant="outline" className="border-border text-slate-500 font-black uppercase tracking-widest rounded-xl h-12 px-6 hover:bg-secondary">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {requisitions?.length === 0 && (
          <div className="py-20 text-center bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border">
            <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="font-black text-slate-400 uppercase tracking-widest">No active indents found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
