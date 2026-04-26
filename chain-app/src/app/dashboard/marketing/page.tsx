'use client';

import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Users, 
  Send, 
  Plus, 
  MessageSquare, 
  Target, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function MarketingHubPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_body: 'Hi {{name}}, we miss you! Use code RELOAD for 20% off your next visit at Adruva. 🍕',
    min_points: 0
  });

  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get('/marketing/campaigns');
      setCampaigns(data.data);
    } catch (err) {
      console.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/marketing/campaigns', {
        name: newCampaign.name,
        template_body: newCampaign.template_body,
        audience_filter: { min_points: Number(newCampaign.min_points) }
      });
      toast({ title: "Campaign Created", description: "Ready to reach your customers." });
      setShowCreate(false);
      fetchCampaigns();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to create campaign" });
    }
  };

  const handleExecute = async (id: string) => {
    setExecuting(id);
    try {
      const { data } = await api.post(`/marketing/campaigns/${id}/execute`);
      toast({ title: "Campaign Launched", description: data.message });
      fetchCampaigns();
    } catch (err) {
      toast({ variant: "destructive", title: "Launch failed" });
    } finally {
      setExecuting(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Initializing Ad Network...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Hero Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/20 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/30 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Megaphone className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Marketing Automation</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Growth <br />
             <span className="text-primary">Command</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Reach your customers where they are. Automate WhatsApp promotions, segment your audience, and drive repeat visits with surgical precision.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button 
             onClick={() => setShowCreate(true)}
             className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3"
           >
              <Plus className="h-5 w-5" /> New Campaign
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Stats Cards */}
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem]">
            <CardContent className="p-8">
               <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reach</p>
               <p className="text-4xl font-black text-foreground">{campaigns.reduce((s, c) => s + (c.sent_count || 0), 0)}</p>
               <p className="text-[11px] font-bold text-emerald-500 mt-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> 100% Delivery Rate</p>
            </CardContent>
         </Card>
         <Card className="border-none bg-card shadow-soft rounded-[2.5rem]">
            <CardContent className="p-8">
               <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-blue-500" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Segments</p>
               <p className="text-4xl font-black text-foreground">12</p>
               <p className="text-[11px] font-bold text-slate-500 mt-2">Personalized Templates</p>
            </CardContent>
         </Card>
      </div>

      {/* Campaigns Queue */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Recent Campaigns</h2>
            <Badge className="bg-secondary text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">{campaigns.length} TOTAL</Badge>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border border-border bg-card shadow-soft rounded-[3rem] overflow-hidden group hover:border-primary transition-all">
                 <CardContent className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-8">
                       <div className={cn(
                         "h-20 w-20 rounded-[2rem] flex items-center justify-center relative",
                         campaign.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/10 text-primary'
                       )}>
                          <Smartphone className="h-10 w-10" />
                          {campaign.status === 'active' && <div className="absolute inset-0 border-4 border-primary rounded-[2rem] animate-ping opacity-20" />}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className={cn(
                               "border-none font-black uppercase tracking-widest text-[8px] px-2.5 py-1 rounded-lg",
                               campaign.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'
                             )}>
                                {campaign.status}
                             </Badge>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(campaign.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{campaign.name}</h3>
                          <div className="flex items-center gap-4">
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-lg">
                                <Users className="h-3 w-3" /> Min {campaign.audience_filter?.min_points || 0} PTS
                             </span>
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-lg">
                                <Send className="h-3 w-3" /> {campaign.sent_count || 0} Sent
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 max-w-md bg-secondary/20 p-6 rounded-2xl border border-border/50">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" /> WhatsApp Template
                       </p>
                       <p className="text-sm font-bold text-slate-600 italic leading-relaxed line-clamp-2">"{campaign.template_body}"</p>
                    </div>

                    <div className="flex gap-4">
                       {campaign.status === 'draft' && (
                          <Button 
                            disabled={executing === campaign.id}
                            onClick={() => handleExecute(campaign.id)}
                            className="bg-primary text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[10px] shadow-glow flex items-center gap-3"
                          >
                             {executing === campaign.id ? 'Launching...' : <><Send className="h-5 w-5" /> Launch Now</>}
                          </Button>
                       )}
                       {campaign.status === 'completed' && (
                          <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[10px] px-6">
                             <CheckCircle2 className="h-5 w-5" /> Success
                          </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
         <DialogContent className="max-w-3xl rounded-[3rem] p-12 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Build Campaign</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Design your promotional message and select your target segment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Campaign Identity</label>
                     <Input 
                       placeholder="E.g. Diwali Weekend Special" 
                       value={newCampaign.name}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({...newCampaign, name: e.target.value})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Loyalty Segment (Min Points)</label>
                     <Input 
                       type="number"
                       placeholder="0 for All Customers" 
                       value={newCampaign.min_points}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCampaign({...newCampaign, min_points: Number(e.target.value)})}
                       className="h-16 rounded-2xl border-2 bg-secondary/30 font-bold px-6"
                     />
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp Template</label>
                     <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-lg">{'Supports {{name}} placeholder'}</span>
                  </div>
                  <Textarea 
                    placeholder="Enter your message here..." 
                    value={newCampaign.template_body}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCampaign({...newCampaign, template_body: e.target.value})}
                    className="min-h-[150px] rounded-[1.5rem] border-2 bg-secondary/30 font-bold p-6 text-lg leading-relaxed focus:border-primary"
                  />
               </div>
            </div>
            <DialogFooter className="flex gap-4">
               <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">Discard</Button>
               <Button onClick={handleCreate} className="flex-1 bg-primary text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow">Save Campaign</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
