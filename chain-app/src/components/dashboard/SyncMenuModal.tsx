'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOutlets, useSyncMenu } from '@/hooks/useChain';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox'; // I'll create this if it doesn't exist

export default function SyncMenuModal({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const { data: outlets } = useOutlets();
  const sync = useSyncMenu();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSync = async () => {
    if (selected.length === 0) {
      toast({ variant: "destructive", title: "Selection required", description: "Select at least one outlet to sync." });
      return;
    }

    try {
      await sync.mutateAsync(selected);
      toast({ title: "Sync Successful", description: `Menu synced to ${selected.length} outlets.` });
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failed" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Push Master Menu</DialogTitle>
          <DialogDescription>
            Select outlets where you want to propagate the master menu changes. 
            This will update existing items and add new ones.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
          {outlets?.map((outlet: any) => (
            <div 
              key={outlet.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                selected.includes(outlet.id) ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => handleToggle(outlet.id)}
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{outlet.name}</span>
                <span className="text-xs text-slate-400">{outlet.location || 'Maharashtra, India'}</span>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected.includes(outlet.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
              }`}>
                {selected.includes(outlet.id) && <div className="h-2 w-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 font-bold" 
            disabled={sync.isPending}
            onClick={handleSync}
          >
            {sync.isPending ? 'Syncing...' : `Sync to ${selected.length} Outlets`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
