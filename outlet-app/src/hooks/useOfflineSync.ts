import { useState, useEffect } from 'react';
import api from '@/lib/api';

const QUEUE_KEY = 'offline_order_queue';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      const status = navigator.onLine;
      setIsOnline(status);
      if (status) {
        syncOrders();
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    // Initial check
    updateStatus();
    updatePendingCount();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const updatePendingCount = () => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    setPendingCount(queue.length);
  };

  const queueOrder = (orderData: any) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({
      ...orderData,
      id: `off_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    updatePendingCount();
  };

  const syncOrders = async () => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline orders...`);
    
    const remaining: any[] = [];
    for (const order of queue) {
      try {
        await api.post('/orders', order);
      } catch (err) {
        console.error('Failed to sync order:', err);
        remaining.push(order);
      }
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    updatePendingCount();
  };

  return { isOnline, pendingCount, queueOrder, syncOrders };
}
