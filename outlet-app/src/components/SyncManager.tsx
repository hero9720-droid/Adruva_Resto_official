'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/offline-db';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    // Watch sync queue
    const interval = setInterval(async () => {
      const count = await db.sync_queue.count();
      setPendingCount(count);
      
      if (navigator.onLine && count > 0 && !syncing) {
        processSyncQueue();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncing]);

  const processSyncQueue = async () => {
    setSyncing(true);
    try {
      const items = await db.sync_queue.orderBy('timestamp').toArray();
      
      for (const item of items) {
        try {
          await api({
            url: item.url,
            method: item.method,
            data: item.payload
          });
          // Remove from local queue if successful
          if (item.id) await db.sync_queue.delete(item.id);
        } catch (err) {
          console.error('Failed to sync item:', item, err);
          // Stop processing if it's a persistent error to avoid re-ordering issues
          break; 
        }
      }
      
      if (items.length > 0) {
        toast({ 
          title: 'Sync Complete', 
          description: `${items.length} offline transactions successfully synced to cloud.`,
          className: "bg-emerald-600 text-white font-bold border-none"
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
      {pendingCount > 0 && (
        <Badge className="bg-primary text-white h-10 px-4 rounded-xl flex items-center gap-2 border-none shadow-glow">
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          <span className="font-black uppercase tracking-widest text-[10px]">{pendingCount} PENDING</span>
        </Badge>
      )}
      
      {!isOnline ? (
        <Badge className="bg-red-500 text-white h-10 px-4 rounded-xl flex items-center gap-2 border-none shadow-lg">
          <WifiOff className="h-4 w-4" />
          <span className="font-black uppercase tracking-widest text-[10px]">OFFLINE MODE</span>
        </Badge>
      ) : (
        <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group hover:bg-emerald-500 hover:text-white transition-all cursor-help" title="Systems Online">
          <Wifi className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
