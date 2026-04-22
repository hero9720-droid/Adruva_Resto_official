import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnlineOrdersPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Online Orders</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage Zomato, Swiggy, and Website orders.</p>
        </div>
        <Button className="bg-white text-slate-700 hover:bg-slate-50 w-full md:w-auto h-14 rounded-2xl px-8 shadow-sm font-black text-sm tracking-wide border border-slate-200">
          <RefreshCw className="h-5 w-5 mr-2" />
          SYNC NOW
        </Button>
      </div>

      <div className="py-24 text-center bg-white rounded-3xl shadow-soft border border-slate-100">
        <div className="w-24 h-24 mb-6 relative mx-auto">
           <div className="absolute inset-0 bg-indigo-50 rounded-3xl rotate-6" />
           <div className="absolute inset-0 bg-white border border-slate-200 rounded-3xl -rotate-3 flex items-center justify-center shadow-sm">
              <Globe className="h-10 w-10 text-indigo-400" />
           </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Aggregator Integration Pending</h3>
        <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
          Connect your aggregator accounts to view and accept incoming orders here.
        </p>
      </div>
    </div>
  );
}
