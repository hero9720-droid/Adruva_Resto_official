'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QRResolverPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveQR = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/qr/resolve/${params.id}`);
        const data = await res.json();

        if (data.success) {
          const { outlet_slug, session_id, space_name, type, space_id } = data.data;
          
          // Store session context locally so the menu knows where to place orders
          localStorage.setItem('adruva_customer_session', JSON.stringify({
            session_id,
            space_id,
            space_name,
            type,
            scanned_at: new Date().toISOString()
          }));

          // Redirect to the outlet's digital menu
          router.replace(`/${outlet_slug}`);
        } else {
          setError(data.error || 'Failed to resolve QR code.');
        }
      } catch (err) {
        setError('Network error while resolving QR. Please check your connection.');
      }
    };

    resolveQR();
  }, [params.id, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in">
        <div className="h-20 w-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6">
          <UtensilsCrossed className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Connection Failed</h1>
        <p className="text-muted-foreground text-center max-w-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-full"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="relative">
        {/* Animated rings */}
        <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping duration-1000" />
        <div className="absolute inset-[-20px] border border-primary/10 rounded-full animate-ping duration-1000 delay-150" />
        
        <div className="h-24 w-24 bg-card shadow-2xl rounded-3xl flex items-center justify-center relative z-10 border border-border">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-foreground mt-12 mb-2 uppercase tracking-tighter">Preparing Table</h2>
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Establishing secure connection to the digital menu...</p>
    </div>
  );
}
