'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Percent, FileText, ShieldCheck, 
  Settings, Save, Plus, Trash2,
  AlertCircle, Download, Landmark,
  Receipt, Calculator, Scale
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useOutletProfile } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function TaxCompliancePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: outlet } = useOutletProfile();

  const { data: slabs, isLoading } = useQuery({
    queryKey: ['tax-slabs'],
    queryFn: async () => {
      const { data } = await api.get('/finance/tax-slabs');
      return data.data;
    },
  });

  const updateCompliance = useMutation({
    mutationFn: async (payload: any) => {
      await api.patch('/finance/compliance-info', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlet-profile'] });
      toast({ title: "Compliance Updated", description: "GSTIN and licensing info saved successfully." });
    }
  });

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-12 w-64 bg-secondary rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
      <div className="h-96 bg-secondary rounded-[3rem]" />
      <div className="h-96 bg-secondary rounded-[3rem]" />
    </div>
  </div>;

  return (
    <div className="p-8 space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Landmark className="h-4 w-4" /> Financial Integrity
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Tax & Compliance Hub</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl font-bold h-12 border-border px-6">
              <Download className="h-4 w-4 mr-2" /> GST Export (GSTR-1)
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl px-8 shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> Add Tax Slab
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Compliance Info */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Identity & Registration</h2>
            <Card className="border-none shadow-soft rounded-[3rem] bg-card p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GSTIN Number</label>
                     <Input 
                        placeholder="e.g. 27AAAAA0000A1Z5" 
                        defaultValue={outlet?.gstin}
                        className="h-14 rounded-2xl bg-secondary border-none font-bold text-lg focus:ring-2 ring-primary"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FSSAI License</label>
                     <Input 
                        placeholder="e.g. 12345678901234" 
                        defaultValue={outlet?.fssai_license}
                        className="h-14 rounded-2xl bg-secondary border-none font-bold text-lg focus:ring-2 ring-primary"
                     />
                  </div>
               </div>

               <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                     <p className="text-sm font-black text-primary uppercase tracking-tight">Standard Compliance</p>
                     <p className="text-xs font-medium text-slate-500 mt-1">
                        These details will be automatically included in your digital invoices and E-Way bills.
                     </p>
                  </div>
               </div>

               <Button className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs">
                  <Save className="h-4 w-4 mr-2" /> Save Compliance Data
               </Button>
            </Card>
         </div>

         {/* Tax Slabs */}
         <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 ml-2">Active Tax Slabs</h2>
            <div className="space-y-4">
               {slabs?.map((slab: any) => (
                 <Card key={slab.id} className="border-none shadow-soft rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1">
                          <div className="h-16 w-16 bg-secondary rounded-2xl flex flex-col items-center justify-center">
                             <span className="text-xl font-black text-foreground">{slab.percentage}%</span>
                             <Percent className="h-3 w-3 text-slate-400" />
                          </div>
                          <div>
                             <h4 className="text-xl font-black tracking-tight text-foreground uppercase">{slab.name}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">CODE: {slab.tax_code}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-4">
                          <Badge variant="outline" className={cn(
                            "h-7 px-3 border-none font-black text-[9px] uppercase tracking-widest",
                            slab.is_inclusive ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                             {slab.is_inclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
                          </Badge>
                          <Button variant="ghost" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500">
                             <Trash2 className="h-5 w-5" />
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}

               <Card className="border-2 border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-slate-300 gap-4 group hover:border-primary/50 transition-all cursor-pointer bg-transparent">
                  <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                     <Plus className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest">Create Custom Tax Slab</p>
               </Card>
            </div>
         </div>

      </div>
    </div>
  );
}
