'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Coins, 
  Percent, 
  TrendingUp, 
  Save, 
  AlertTriangle,
  Gift,
  Settings2,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LoyaltySettingsPage() {
  const [config, setConfig] = useState({
    points_to_paise: 100,
    max_redemption_percent: 50,
    earn_rate_paise: 10000
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/chain/details'); // We'll need to ensure this returns config
        if (data.data.loyalty_config) {
          setConfig(data.data.loyalty_config);
        }
      } catch (err) {
        console.error('Failed to fetch chain config');
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/chain/settings', { loyalty_config: config });
      toast({ title: "Settings Saved", description: "Loyalty program rules updated chain-wide." });
    } catch (err) {
      toast({ variant: "destructive", title: "Save failed", description: "Check your permissions and try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex justify-between items-end bg-card p-12 rounded-[3rem] shadow-2xl border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[120px] -translate-y-48 translate-x-48 group-hover:bg-primary/10 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
             <div className="p-4 bg-primary text-white rounded-2xl shadow-glow rotate-3">
                <Trophy className="h-8 w-8" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Rewards Engine</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
             Loyalty <span className="text-primary">Program</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl leading-relaxed">
            Configure how your customers earn and redeem rewards. Balance customer retention with healthy profit margins.
          </p>
        </div>
        <div className="relative z-10">
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-12 h-16 font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-glow flex items-center gap-4"
           >
              {isSaving ? 'Saving Changes...' : 'Save Configuration'}
              {!isSaving && <Save className="h-5 w-5" />}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Earning Rules */}
         <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-border bg-secondary/20">
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                        Earning Velocity
                     </CardTitle>
                     <CardDescription className="text-slate-500 font-bold mt-1">Define how much spend is required to earn 1 point.</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Spend Amount for 1 Point</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                     <Input 
                       type="number"
                       value={config.earn_rate_paise / 100}
                       onChange={(e) => setConfig({...config, earn_rate_paise: Number(e.target.value) * 100})}
                       className="h-20 bg-secondary/30 border-2 border-border rounded-[1.5rem] pl-12 pr-6 text-2xl font-black focus:border-primary transition-all outline-none"
                     />
                  </div>
                  <p className="text-xs text-slate-400 font-bold italic px-2 flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-orange-500" />
                     Currently: 1 point per ₹{config.earn_rate_paise / 100} spent.
                  </p>
               </div>

               <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] flex items-center gap-6">
                  <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-glow-emerald shrink-0">
                     <Gift className="h-8 w-8 text-white" />
                  </div>
                  <div>
                     <p className="font-black text-emerald-700 uppercase tracking-widest text-xs mb-1">Impact Simulation</p>
                     <p className="text-sm font-bold text-emerald-600/80">On a ₹1000 bill, the customer will earn <span className="font-black underline">{Math.floor(1000 / (config.earn_rate_paise / 100))} points</span>.</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Redemption Rules */}
         <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-border bg-secondary/20">
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Coins className="h-6 w-6 text-primary" />
                        Cash Value
                     </CardTitle>
                     <CardDescription className="text-slate-500 font-bold mt-1">Convert points back into real currency.</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Value of 1 Point (in ₹)</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                     <Input 
                       type="number"
                       step="0.1"
                       value={config.points_to_paise / 100}
                       onChange={(e) => setConfig({...config, points_to_paise: Number(e.target.value) * 100})}
                       className="h-20 bg-secondary/30 border-2 border-border rounded-[1.5rem] pl-12 pr-6 text-2xl font-black focus:border-primary transition-all outline-none"
                     />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-end px-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Redemption per Bill</label>
                     <span className="text-3xl font-black text-primary tracking-tighter">{config.max_redemption_percent}%</span>
                  </div>
                  <Slider 
                    value={[config.max_redemption_percent]}
                    onValueChange={(val: any) => setConfig({...config, max_redemption_percent: Array.isArray(val) ? val[0] : val})}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                     <span>Conservative (5%)</span>
                     <span>Aggressive (100%)</span>
                  </div>
               </div>

               <div className="bg-[#1b1b24] p-8 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Rule Preview</p>
                     <p className="text-white font-bold text-lg leading-tight">100 Points = <span className="text-primary font-black">₹{ (100 * config.points_to_paise) / 100 }</span></p>
                  </div>
                  <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center relative z-10">
                     <ChevronRight className="h-6 w-6 text-white" />
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
