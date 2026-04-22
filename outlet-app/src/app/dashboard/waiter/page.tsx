import React from 'react';
import { Smartphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WaiterAppPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Waiter App</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Table-side ordering and KOT generation.</p>
        </div>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 w-full md:w-auto h-14 rounded-2xl px-8 shadow-glow font-black text-sm tracking-wide border-none">
          <Plus className="h-5 w-5 mr-2" />
          NEW ORDER
        </Button>
      </div>

      <div className="py-24 text-center bg-white rounded-3xl shadow-soft border border-slate-100">
        <div className="w-24 h-24 mb-6 relative mx-auto">
           <div className="absolute inset-0 bg-indigo-50 rounded-3xl rotate-6" />
           <div className="absolute inset-0 bg-white border border-slate-200 rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
              <Smartphone className="h-10 w-10 text-indigo-400" />
           </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Waiter Module Coming Soon</h3>
        <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
          The table-side order management screen is under construction.
        </p>
      </div>
    </div>
  );
}
