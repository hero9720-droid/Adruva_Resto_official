'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import api from '@/lib/api';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof forgotSchema>) {
    setIsLoading(true);
    try {
      // Mocking for now as backend might not have this endpoint yet
      // const { data } = await api.post('/auth/forgot-password', values);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
      toast({
        title: 'Instructions Sent',
        description: 'Please check your email for reset instructions.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Request failed',
        description: error.response?.data?.error || 'Something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/30 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-card/80 backdrop-blur-2xl border border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-4 text-center pb-8 pt-10">
            <Link href="/login" className="absolute left-8 top-10 p-2 hover:bg-secondary rounded-xl transition-colors">
               <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Link>
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">Recover Access</CardTitle>
              <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                {isSent ? 'Check your inbox' : 'Reset your security key'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            {!isSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin@adruva.app" 
                            {...field} 
                            disabled={isLoading} 
                            className="h-14 rounded-2xl bg-secondary border-border text-foreground font-bold pl-6"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-glow" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Send Recovery Link'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center space-y-6">
                <p className="text-slate-500 font-medium leading-relaxed">
                  We've sent an email to <span className="text-foreground font-bold">{form.getValues('email')}</span> with instructions to reset your password.
                </p>
                <Button 
                  asChild
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground h-16 rounded-2xl font-black text-sm uppercase tracking-widest"
                >
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
