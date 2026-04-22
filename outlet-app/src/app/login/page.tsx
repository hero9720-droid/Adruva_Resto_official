'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import api, { saveToken } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      
      if (data.success) {
        // Store access token in memory or axios defaults (axios instance handles refresh)
        saveToken(data.accessToken);
        
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${data.user.name}`,
        });
        
        // Redirect based on role or to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.response?.data?.error || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-4 text-center pb-8 pt-10">
            <div className="flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-white font-black text-4xl tracking-tighter italic">A</span>
              </motion.div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase italic">Adruva<span className="text-indigo-500">Resto</span></CardTitle>
              <CardDescription className="text-slate-400 font-bold tracking-wide text-xs uppercase">
                Operational Command Center
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Access</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input 
                             placeholder="name@adruvaresto.com" 
                             {...field} 
                             disabled={isLoading} 
                             className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-slate-600 focus-visible:ring-indigo-600/30 focus-visible:border-indigo-600/50 transition-all pl-6"
                           />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 font-bold text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Key</FormLabel>
                        <Button variant="link" size="sm" className="px-0 h-auto font-black text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors" asChild>
                          <a href="/forgot-password">Reset PIN</a>
                        </Button>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isLoading} 
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-slate-600 focus-visible:ring-indigo-600/30 focus-visible:border-indigo-600/50 transition-all pl-6"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 font-bold text-xs" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-[0_12px_40px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] border-none" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Authorize Entry'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <div className="px-8 pb-8 text-center">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                Protected by Adruva Shield &copy; 2026
             </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
