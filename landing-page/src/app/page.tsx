'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Store, 
  BarChart3, 
  Users, 
  ChefHat, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Globe,
  MonitorCheck,
  Package,
  Star,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-indigo-500/30 selection:text-white text-slate-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/50 backdrop-blur-2xl border-b border-white/5 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Zap className="h-6 w-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">Adruva<span className="text-indigo-500">Resto</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Ecosystem</a>
            <a href="#solutions" className="hover:text-indigo-400 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#company" className="hover:text-indigo-400 transition-colors">Enterprise</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-black text-xs uppercase tracking-widest text-slate-400 hover:text-white">Login</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_32px_rgba(79,70,229,0.3)] font-black text-xs uppercase tracking-widest px-8 h-12 rounded-xl">Book Demo</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div {...fadeInUp}>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-6 py-2 mb-10 rounded-full font-black tracking-[0.2em] uppercase text-[10px]">
               Next-Gen Restaurant OS • v4.0.0
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] mb-12">
              Future-Proof <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">Hospitality.</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 font-bold mb-16 leading-relaxed">
              Consolidate POS, Kitchen, Inventory, and Brand Ops into one ultra-fast, premium cloud architecture. Built for high-volume growth and global scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
              <Button size="lg" className="h-20 px-12 bg-white text-black hover:bg-slate-200 text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-3xl">
                Start Free Trial <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-20 px-12 text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-xl">
                <PlayCircle className="mr-3 h-6 w-6 text-indigo-400" /> Watch Cinematic
              </Button>
            </div>
          </motion.div>

          {/* Product Preview Image */}
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="w-full max-w-6xl relative"
          >
            <div className="absolute inset-0 bg-indigo-600/20 rounded-[3rem] blur-[100px] -z-10 animate-pulse" />
            <div className="bg-gradient-to-b from-white/10 to-transparent p-1.5 rounded-[3.5rem] shadow-3xl border border-white/10">
               <img 
                 src="adruva_dashboard_hero_1776838472648.png" 
                 alt="Adruva Dashboard Preview" 
                 className="rounded-[3rem] shadow-4xl w-full h-auto border border-white/5"
               />
            </div>
          </motion.div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
           <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
           <div className="absolute bottom-1/4 -right-48 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Stats Board */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02] backdrop-blur-3xl">
         <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
               {[
                 { label: 'Annual GMV', val: '$4.2B+' },
                 { label: 'Active Outlets', val: '12,500+' },
                 { label: 'Avg. Latency', val: '18ms' },
                 { label: 'Success Rate', val: '99.99%' },
               ].map(s => (
                 <div key={s.label}>
                    <p className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">{s.val}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{s.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-32">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-none px-4 py-2 mb-6 rounded-xl font-black tracking-widest uppercase text-[10px]">The Modular Ecosystem</Badge>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">Unified. Scalable. <br /> <span className="text-slate-500">Uncompromising.</span></h2>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto text-lg">Every touchpoint optimized for peak performance, from the kitchen line to the corporate boardroom.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Omni-Channel POS', desc: 'Dine-in, Takeaway, and Delivery orders handled via a single, low-latency interface.', icon: Store, color: 'text-indigo-400' },
              { title: 'Kitchen Intelligence', desc: 'AI-driven sequence management and real-time prep tracking for zero order errors.', icon: ChefHat, color: 'text-orange-400' },
              { title: 'Master Inventory', desc: 'Centralized recipe management and automated stock deduction with predictive alerts.', icon: Package, color: 'text-emerald-400' },
              { title: 'Global Chain Ops', desc: 'Manage 100+ locations. Sync menus, monitor staff, and view aggregated ROI instantly.', icon: Globe, color: 'text-blue-400' },
              { title: 'Customer Experience', desc: 'High-fidelity QR ordering with instant loyalty points and personalized rewards.', icon: Users, color: 'text-pink-400' },
              { title: 'Command Analytics', desc: 'Enterprise-grade BI tools to identify trends, optimize waste, and maximize margin.', icon: BarChart3, color: 'text-purple-400' },
            ].map((f, i) => (
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="group p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all cursor-pointer relative overflow-hidden">
                   <div className="h-16 w-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <f.icon className={`h-8 w-8 ${f.color}`} />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{f.title}</h3>
                   <p className="text-slate-400 text-sm font-bold leading-relaxed">{f.desc}</p>
                   <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-6 w-6 text-indigo-400 -rotate-45" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-32 px-8">
         <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[4rem] p-16 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 md:max-w-2xl text-center md:text-left">
               <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">Ready to Scale Your Brand?</h2>
               <p className="text-indigo-100 text-lg font-bold mb-12 opacity-80 leading-relaxed">Join 500+ global restaurant groups using Adruva to dominate their market. Get custom white-labeling and 24/7 priority support.</p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="h-16 px-10 bg-white text-indigo-600 hover:bg-slate-100 font-black uppercase tracking-widest text-xs rounded-2xl">Connect with Sales</Button>
                  <Button variant="ghost" className="h-16 px-10 text-white font-black uppercase tracking-widest text-xs border border-white/20 rounded-2xl hover:bg-white/10">View Enterprise Deck</Button>
               </div>
            </div>
            <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center"><Star className="h-6 w-6 text-indigo-600 fill-current" /></div>
                  <p className="font-black text-white text-lg tracking-tight">4.9/5 Rating on G2</p>
               </div>
               <div className="space-y-6">
                  {['Global Master Menu Sync', 'Multi-tenant RLS Security', 'Custom BI Reporting'].map(f => (
                    <div key={f} className="flex items-center gap-4 text-white font-bold text-sm">
                       <CheckCircle2 className="h-5 w-5 text-indigo-300" /> {f}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-8 bg-[#020617] border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-20">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                 <Zap className="h-7 w-7 text-white fill-current" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white uppercase">Adruva<span className="text-indigo-500">Resto</span></span>
            </div>
            <p className="text-slate-500 max-w-sm text-lg font-bold leading-relaxed uppercase tracking-widest text-[11px]">
              Empowering the next generation of food hospitality with zero-latency cloud infrastructure.
            </p>
            <div className="flex gap-6">
               <div className="h-10 w-10 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all" />
               <div className="h-10 w-10 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all" />
               <div className="h-10 w-10 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all" />
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-indigo-500">Ecosystem</h4>
            <div className="flex flex-col gap-5 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Digital POS</a>
              <a href="#" className="hover:text-white transition-colors">Kitchen Display</a>
              <a href="#" className="hover:text-white transition-colors">Inventory Cloud</a>
              <a href="#" className="hover:text-white transition-colors">Waiter App</a>
            </div>
          </div>
          <div className="space-y-8">
             <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-indigo-500">Infrastructure</h4>
             <div className="flex flex-col gap-5 text-sm font-bold text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Security & Compliance</a>
                <a href="#" className="hover:text-white transition-colors">API Reference</a>
                <a href="#" className="hover:text-white transition-colors">System Status</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
           <span>© 2024 Adruva Technologies. Global HQ.</span>
           <span className="flex items-center gap-2">Built with <Zap className="h-3 w-3 text-indigo-500 fill-current" /> for high performance</span>
        </div>
      </footer>
    </div>
  );
}
