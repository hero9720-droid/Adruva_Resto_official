'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/superadmin/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        (window as any).__rms_access_token = data.accessToken;
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Security grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      />

      <div className="relative w-full max-w-md">
        {/* Warning badge */}
        <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit mx-auto">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Restricted Access</span>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl mb-4">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Adruva SaaS HQ</h1>
            <p className="text-slate-500 text-sm mt-1">SuperAdmin Control Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Admin Email</label>
              <input
                id="superadmin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="superadmin@adruvaresto.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  id="superadmin-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              id="superadmin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-50 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <><ShieldCheck className="h-4 w-4" /> Authenticate</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-700 mt-6">
            All access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
