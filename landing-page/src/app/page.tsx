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
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Adruva Resto</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-bold text-slate-900">Sign In</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold px-6">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div {...fadeInUp}>
            <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-4 py-1 mb-6 rounded-full font-bold">
               TRUSTED BY 500+ OUTLETS GLOBALLY
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-8">
              The AI-Powered <br />
              <span className="text-indigo-600">Restaurant Stack.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed">
              Consolidate your POS, Kitchen, Inventory, and CRM into one seamless, premium cloud ecosystem. Built for single outlets and global chains.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-lg font-black shadow-2xl shadow-indigo-200">
                Launch My Restaurant <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black border-slate-200 bg-white">
                <PlayCircle className="mr-2 h-5 w-5 text-indigo-600" /> Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Abstract background shapes */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] -z-10" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything You Need to Scale.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Modular architecture designed for high-volume operations and multi-tenant isolation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Touch POS', desc: 'Instant order processing with offline-first reliability.', icon: Store, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'Real-time KDS', desc: 'Zero-latency kitchen tickets with auditory alerts.', icon: ChefHat, color: 'text-orange-600', bg: 'bg-orange-50' },
              { title: 'Advanced Analytics', desc: 'Deep-dive into revenue, staff KPIs, and item performance.', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
              { title: 'Inventory Control', desc: 'Smart stock tracking with low-threshold auto-alerts.', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Loyalty CRM', desc: 'Track guest visits, preferences, and reward points.', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
              { title: 'Chain Management', desc: 'Sync menus and reports across 100+ locations globally.', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((f, i) => (
              <motion.div 
                key={f.title} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-xl shadow-slate-100/80 hover:scale-[1.03] transition-transform cursor-pointer overflow-hidden group">
                  <CardContent className="p-8">
                    <div className={`p-4 rounded-2xl w-fit mb-6 ${f.bg}`}>
                      <f.icon className={`h-8 w-8 ${f.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-8 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Simple, Transparent Pricing.</h2>
            <p className="text-slate-500 font-medium">No hidden fees. Scale as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
             {[
               { name: 'Starter', price: '₹2,999', features: ['Single Outlet', 'Standard POS', 'Basic Reports', 'Email Support'], best: false },
               { name: 'Professional', price: '₹5,999', features: ['Up to 3 Outlets', 'Full Inventory', 'Staff Attendance', 'Priority Support'], best: true },
               { name: 'Enterprise', price: 'Custom', features: ['Unlimited Outlets', 'Master Menu Sync', 'White-labeling', '24/7 Dedicated Manager'], best: false },
             ].map((plan) => (
               <Card key={plan.name} className={`border-none shadow-2xl relative ${plan.best ? 'scale-110 z-20 bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-900 shadow-slate-200/50'}`}>
                 <CardContent className="p-10">
                   {plan.best && <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 font-black px-4 py-1">MOST POPULAR</Badge>}
                   <h3 className="text-xl font-black uppercase tracking-widest mb-2">{plan.name}</h3>
                   <div className="flex items-baseline gap-1 mb-8">
                     <span className="text-5xl font-black">{plan.price}</span>
                     {plan.price !== 'Custom' && <span className="text-sm font-bold opacity-60">/month</span>}
                   </div>
                   <div className="space-y-4 mb-10">
                     {plan.features.map(f => (
                       <div key={f} className="flex items-center gap-3 text-sm font-medium">
                         <CheckCircle2 className={`h-5 w-5 ${plan.best ? 'text-indigo-300' : 'text-indigo-600'}`} />
                         {f}
                       </div>
                     ))}
                   </div>
                   <Button className={`w-full h-12 font-black ${plan.best ? 'bg-white text-indigo-600 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-black'}`}>
                      Select {plan.name}
                   </Button>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-indigo-400 fill-current" />
              <span className="text-2xl font-black tracking-tighter uppercase">Adruva Resto</span>
            </div>
            <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
              Empowering the next generation of food hospitality with cutting-edge technology and zero-latency infrastructure.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-xs text-indigo-400">Company</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <a href="#" className="hover:text-white transition-colors">About Us</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Careers</a>
            </div>
          </div>
          <div className="space-y-4">
             <h4 className="font-bold uppercase tracking-widest text-xs text-indigo-400">Legal</h4>
             <div className="flex flex-col gap-3 text-sm text-slate-300">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Compliance</a>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
           © 2024 Adruva Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
