'use client';

import { Settings, ShieldAlert, Globe, Mail, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useGlobalSettings, useUpdateGlobalSettings } from '@/hooks/useSuperAdmin';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: settings } = useGlobalSettings();
  const updateSettings = useUpdateGlobalSettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    maintenance_mode: false,
    platform_fee_percent: '0',
    support_email: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        maintenance_mode: settings.maintenance_mode || false,
        platform_fee_percent: settings.platform_fee_percent?.toString() || '0',
        support_email: settings.support_email || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast({ title: "Settings Updated", description: "Global configuration synchronized successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Update failed" });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-4xl">
      <div className="bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
           <div className="p-4 bg-primary/10 rounded-3xl">
             <Settings className="h-10 w-10 text-primary" />
           </div>
           Platform Core Settings
        </h1>
        <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide">Configure global behavior and economic parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border bg-secondary/10">
            <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">Platform Governance</CardTitle>
            <CardDescription className="font-bold text-slate-500">Critical system-wide controls.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center justify-between p-8 bg-secondary/30 rounded-3xl border border-border group">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-destructive/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-black text-foreground uppercase tracking-widest text-xs mb-1">Maintenance Mode</p>
                    <p className="text-slate-500 font-bold text-[10px] tracking-wide">Disable access to all portals for emergency maintenance.</p>
                  </div>
               </div>
               <Switch 
                checked={formData.maintenance_mode}
                onCheckedChange={(val) => setFormData({...formData, maintenance_mode: val})}
               />
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                   <Globe className="h-3 w-3" /> Platform Fee (%)
                 </Label>
                 <Input 
                   type="number"
                   step="0.01"
                   placeholder="2.50" 
                   className="h-16 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus:ring-2 focus:ring-primary/20 text-xl"
                   value={formData.platform_fee_percent}
                   onChange={(e) => setFormData({...formData, platform_fee_percent: e.target.value})}
                 />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                   <Mail className="h-3 w-3" /> Support Escalation Email
                 </Label>
                 <Input 
                   type="email"
                   placeholder="support@adruva.com" 
                   className="h-16 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus:ring-2 focus:ring-primary/20"
                   value={formData.support_email}
                   onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                 />
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card rounded-[2.5rem] shadow-soft overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border bg-secondary/10">
            <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase">Visual Identity</CardTitle>
            <CardDescription className="font-bold text-slate-500">Configure global branding for all client portals.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Platform Identity Name</Label>
                   <Input 
                      placeholder="Adruva Resto" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                      value="Adruva Resto"
                      readOnly
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">System Version</Label>
                   <Input 
                      value="Enterprise SaaS v2.5.0-stable" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-primary"
                      readOnly
                   />
                </div>
             </div>
             <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between">
                <div>
                   <p className="font-black text-foreground uppercase tracking-widest text-xs mb-1">Whitelabel Engine</p>
                   <p className="text-slate-500 font-bold text-[10px] tracking-wide">Enterprise plans can override these with custom domains.</p>
                </div>
                <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">Active</Badge>
             </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 bg-amber-500/5 rounded-[2.5rem] shadow-soft overflow-hidden p-10">
           <div className="flex items-start gap-6">
              <div className="p-4 bg-amber-500/10 rounded-2xl">
                 <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-foreground tracking-tighter uppercase mb-2">Caution: High Impact Changes</h4>
                 <p className="text-slate-600 font-bold text-sm leading-relaxed">
                    Changes made here propagate to all multi-tenant nodes instantly. Maintenance mode will disconnect all active staff and customer sessions.
                 </p>
              </div>
           </div>
        </Card>

        <div className="flex justify-end gap-6">
           <Button type="submit" className="h-20 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[13px] shadow-glow transition-all border-none" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Synchronizing...' : (
                <span className="flex items-center gap-3"><Save className="h-5 w-5" /> Save Configuration</span>
              )}
           </Button>
        </div>
      </form>
    </div>
  );
}
