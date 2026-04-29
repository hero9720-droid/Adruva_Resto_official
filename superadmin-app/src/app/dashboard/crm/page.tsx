'use client';

import { 
  Users, 
  Search, 
  Mail, 
  Shield, 
  MoreVertical,
  KeyRound,
  UserMinus,
  Button as LucideButton
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  usePlatformCRM, 
  useDeactivateUser, 
  useResetPassword 
} from '@/hooks/useSuperAdmin';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function CRMPage() {
  const { data: users, isLoading } = usePlatformCRM();
  const deactivateUser = useDeactivateUser();
  const resetPassword = useResetPassword();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const handleDeactivate = async (portal: string, id: string, name: string) => {
    if (confirm(`Deactivate ${name}?`)) {
      await deactivateUser.mutateAsync({ portal, id });
      toast({ title: "User Deactivated" });
    }
  };

  const handleReset = async (portal: string, id: string, name: string) => {
    const pass = prompt(`Enter new password for ${name}:`, 'admin123');
    if (pass) {
      await resetPassword.mutateAsync({ portal, id, new_password: pass });
      toast({ title: "Password Updated" });
    }
  };

  const filteredUsers = users?.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-10 rounded-[2.5rem] shadow-soft border border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-6 uppercase">
             <div className="p-4 bg-orange-500/10 rounded-3xl">
               <Users className="h-10 w-10 text-orange-500" />
             </div>
             Enterprise CRM
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 ml-2 tracking-wide">Cross-portal identity management and access control.</p>
        </div>
        <div className="relative w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search identities..." 
            className="h-16 pl-14 rounded-2xl bg-secondary/50 border-none font-bold text-foreground focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-secondary/30 hover:bg-secondary/30 h-20">
                <TableHead className="px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Identity</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Portal</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Role Authority</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Member Since</TableHead>
                <TableHead className="text-right px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user: any) => (
                <TableRow key={user.id} className="border-b border-border hover:bg-secondary/50 transition-all h-24 group">
                  <TableCell className="px-10">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {user.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="px-3 py-1 font-black text-[9px] uppercase tracking-widest border-border text-slate-500">
                      {user.portal} Portal
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary/50" />
                      <span className="font-black text-slate-600 uppercase tracking-widest text-[10px]">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-black text-slate-400 tracking-tighter">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                             <MoreVertical className="h-5 w-5" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-card border-border rounded-xl">
                          <DropdownMenuItem className="gap-3 font-bold uppercase text-[10px]" onClick={() => handleReset(user.portal, user.id, user.name)}>
                             <KeyRound className="h-4 w-4 text-primary" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 font-bold uppercase text-[10px] text-rose-500 focus:text-rose-500" onClick={() => handleDeactivate(user.portal, user.id, user.name)}>
                             <UserMinus className="h-4 w-4" /> Deactivate
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && [1,2,3,4,5].map(i => (
                <TableRow key={i} className="animate-pulse h-24 border-b border-border">
                  <TableCell colSpan={5} className="bg-secondary/10" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
