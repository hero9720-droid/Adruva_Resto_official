'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Eye, EyeOff, AlertTriangle, Zap, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/superadmin/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('sa_token', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Access denied. Unauthorized credentials.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div 
           className="absolute inset-0 opacity-[0.05]"
           style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between mb-8 px-6">
           <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">System Node: 0xSA1</span>
           </div>
           <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Secured Channel
           </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
           {/* Inner Glow */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
           
           {/* Header */}
           <div className="text-center mb-12">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] mb-8"
              >
                 <ShieldCheck className="h-10 w-10 text-white fill-current" />
              </motion.div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">ADRUVA<span className="text-indigo-500">HQ</span></h1>
              <p className="text-slate-500 font-bold text-sm mt-3 uppercase tracking-widest">Enterprise Governance Portal</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Identity Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       autoComplete="off"
                       placeholder="admin@adruvaresto.com"
                       className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-14 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.05] transition-all font-bold tracking-tight"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Access Key</label>
                 <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                       type={showPw ? 'text' : 'password'}
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       autoComplete="current-password"
                       placeholder="••••••••"
                       className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-14 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.05] transition-all font-bold tracking-tight"
                    />
                    <button
                       type="button"
                       onClick={() => setShowPw(!showPw)}
                       className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    >
                       {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                 </div>
              </div>

              <AnimatePresence>
                 {error && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-xs font-bold text-red-400 flex items-center gap-3"
                    >
                       <AlertTriangle className="h-4 w-4 shrink-0" />
                       {error}
                    </motion.div>
                 )}
              </AnimatePresence>

              <button
                 type="submit"
                 disabled={loading}
                 className="group relative w-full h-20 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-[1.5rem] font-black text-white text-sm uppercase tracking-[0.25em] transition-all shadow-[0_20px_40px_rgba(79,70,229,0.2)] active:scale-95 overflow-hidden"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                 ) : (
                    <span className="flex items-center justify-center gap-3">
                       <Zap className="h-5 w-5 fill-current" />
                       Initialize Session
                    </span>
                 )}
              </button>
           </form>

           <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                 <div className="h-[1px] w-8 bg-white/5" />
                 <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Protocol Secured</span>
                 <div className="h-[1px] w-8 bg-white/5" />
              </div>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed">
                 Unauthorized access is strictly prohibited under global digital safety acts.
              </p>
           </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex justify-center gap-8">
           {['2FA', 'SSL', 'AES-256'].map(t => (
              <span key={t} className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">{t}</span>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
