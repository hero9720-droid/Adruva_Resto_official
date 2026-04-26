'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Globe2, 
  Languages, 
  Search, 
  CheckCircle2, 
  History, 
  ChevronRight, 
  Zap, 
  Smartphone, 
  Eye, 
  Copy, 
  PenTool, 
  RefreshCcw,
  UtensilsCrossed,
  ChefHat,
  Star,
  Quote,
  LayoutDashboard,
  MoreVertical,
  Layers,
  FileText,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AIArchitectPage() {
  const [items, setItems] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('Royal Indian');

  const { toast } = useToast();

  const fetchData = async () => {
    const chainId = localStorage.getItem('last_chain_id');
    try {
      const [itemsRes, stylesRes] = await Promise.all([
        api.get(`/inventory/menu-items`), // Assuming this exists or using placeholder
        api.get(`/menu/ai/styles`)
      ]);
      setItems(itemsRes.data.data.slice(0, 10)); // Just a sample
      setStyles(stylesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data');
      // Placeholder data if API fails during dev
      setItems([
        { id: '1', name: 'Paneer Butter Masala', description: '', category: 'Main Course' },
        { id: '2', name: 'Chicken Tikka', description: 'Classic grilled chicken.', category: 'Appetizers' },
        { id: '3', name: 'Dal Makhani', description: '', category: 'Main Course' }
      ]);
      setStyles([{ id: '1', style_name: 'Royal Indian' }, { id: '2', style_name: 'Modern Fusion' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (itemId: string, language: 'english' | 'hindi') => {
    setGenerating(itemId);
    try {
      const res = await api.post(`/menu/ai/generate/${itemId}`, {
        tone: selectedStyle,
        language: language
      });
      toast({ 
        title: "Content Generated", 
        description: `New ${language} description is live on your QR menu.` 
      });
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Generation failed" });
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Consulting AI Culinary Experts...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* AI Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20 group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <Sparkles className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Generative Culinary Intelligence</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Menu <br />
             <span className="text-primary">Architect</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Elevate your guest's appetite. Use AI to craft high-fidelity, appetizing descriptions for your entire menu in multiple languages, ensuring your QR experience feels premium.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
           <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6 min-w-[200px] text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Descriptive Coverage</p>
              <p className="text-5xl font-black text-primary tracking-tighter">42%</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar Controls */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-8">
               <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <PenTool className="h-5 w-5 text-primary" /> Brand Voice
               </h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Copywriting Style</label>
                     <Select value={selectedStyle} onValueChange={(val) => val && setSelectedStyle(val)}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 bg-secondary/30 font-black px-6">
                           <SelectValue placeholder="Select Style" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 shadow-2xl">
                           {styles.map(s => <SelectItem key={s.id} value={s.style_name} className="font-bold py-3">{s.style_name}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap className="h-3 w-3" /> Tone Insight
                     </p>
                     <p className="text-xs font-bold text-primary/70 leading-relaxed italic">
                        "{selectedStyle}" will use luxurious adjectives like "succulent", "signature", and "artisanal" to emphasize quality.
                     </p>
                  </div>
               </div>
            </Card>

            <Card className="border-none bg-[#1b1b24] text-white shadow-2xl rounded-[2.5rem] p-8 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Smartphone className="h-16 w-16" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Mobile Preview</h3>
               <div className="bg-white/5 rounded-3xl p-6 border border-white/10 aspect-[9/16] relative flex flex-col justify-end overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60" className="absolute inset-0 object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-20 space-y-2">
                     <h4 className="text-xl font-black tracking-tighter uppercase">Paneer Tikka</h4>
                     <p className="text-[10px] text-white/60 leading-relaxed italic">"Cubes of creamy malai paneer, marinated in a vibrant yogurt-spice blend and grilled to smoky perfection in our traditional clay oven."</p>
                     <div className="pt-2 flex justify-between items-center">
                        <span className="text-primary font-black">₹420</span>
                        <Button size="sm" className="bg-primary text-white rounded-full h-8 px-4 font-black text-[10px] uppercase">Add</Button>
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         {/* Menu List */}
         <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center px-4">
               <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Menu Ingestion Feed</h2>
               <div className="relative w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search dishes..." className="h-12 bg-card border-border rounded-xl pl-11 font-bold text-xs" />
               </div>
            </div>

            <div className="space-y-4">
               {items.map((item) => (
                 <Card key={item.id} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all">
                    <CardContent className="p-8">
                       <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1 flex gap-6">
                             <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-slate-400">
                                <UtensilsCrossed className="h-8 w-8" />
                             </div>
                             <div>
                                <div className="flex items-center gap-3 mb-1">
                                   <Badge className="bg-secondary text-slate-500 border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                                      {item.category}
                                   </Badge>
                                   {!item.description && <Badge className="bg-amber-500/10 text-amber-500 border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">Missing Copy</Badge>}
                                </div>
                                <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-2">{item.name}</h4>
                                <p className={cn(
                                  "text-sm font-bold leading-relaxed",
                                  item.description ? "text-slate-500 italic" : "text-slate-300"
                                )}>
                                   {item.description || "No appetizing description provided. AI generation recommended to increase conversion."}
                                </p>
                             </div>
                          </div>

                          <div className="flex flex-col md:items-end justify-center gap-3">
                             <Button 
                               onClick={() => handleGenerate(item.id, 'english')}
                               disabled={generating === item.id}
                               className="bg-primary text-white h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[9px] shadow-glow gap-2"
                             >
                                {generating === item.id ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                Generate English
                             </Button>
                             <Button 
                               onClick={() => handleGenerate(item.id, 'hindi')}
                               disabled={generating === item.id}
                               variant="outline"
                               className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-border gap-2"
                             >
                                <Languages className="h-3 w-3" /> Generate Hindi
                             </Button>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
