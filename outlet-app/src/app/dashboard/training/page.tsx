'use client';

import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Award, 
  Clock, 
  ChevronRight,
  BookOpen,
  Trophy,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TrainingCenterPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showExam, setShowExam] = useState<any>(null); // Exam questions
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchModules = async () => {
    try {
      const { data } = await api.get('/training/modules');
      setModules(data.data);
    } catch (err) {
      console.error('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleStartExam = async (moduleId: string) => {
    try {
      const { data } = await api.get(`/training/modules/${moduleId}/exam`);
      setShowExam(data.data);
      setAnswers({});
      setExamResult(null);
    } catch (err) {
      toast({ variant: "destructive", title: "No exam found for this module." });
    }
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/training/modules/${showExam.module_id}/submit`, {
        answers: Object.values(answers)
      });
      setExamResult(data.data);
      if (data.data.passed) {
        toast({ title: "Congratulations!", description: "You are now certified in this module." });
        fetchModules();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">Loading Academy...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Academy Header */}
      <div className="flex justify-between items-end bg-[#1b1b24] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[120px] -translate-y-20 translate-x-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <GraduationCap className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Adruva Academy</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
             Training <br />
             <span className="text-primary">Center</span>
          </h1>
          <p className="text-white/40 font-bold text-lg mt-8 ml-1 tracking-wide max-w-xl">
             Level up your skills. Complete certified training modules to earn professional badges and advance your career at {modules[0]?.chain_name || 'the chain'}.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative z-10 text-center">
           <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Certifications</p>
           <p className="text-4xl font-black text-white">{modules.filter(m => m.passed_at).length}</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {modules.map((m) => (
           <Card key={m.id} className="border border-border bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all">
              <CardHeader className="p-8 pb-0">
                 <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center">
                       {m.type === 'video' ? <PlayCircle className="h-8 w-8 text-primary" /> : <BookOpen className="h-8 w-8 text-primary" />}
                    </div>
                    {m.passed_at ? (
                       <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Certified</Badge>
                    ) : (
                       <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Not Started</Badge>
                    )}
                 </div>
                 <h3 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{m.title}</h3>
                 <CardDescription className="font-bold text-slate-500 mt-2 line-clamp-2">{m.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                 <div className="flex items-center gap-6 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {m.estimated_minutes} MIN</span>
                    <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> {m.min_passing_score}% Score</span>
                 </div>
                 <div className="flex gap-3">
                    <Button 
                      onClick={() => setSelectedModule(m)}
                      className="flex-1 bg-secondary text-primary hover:bg-primary hover:text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                       View Content
                    </Button>
                    <Button 
                      onClick={() => handleStartExam(m.id)}
                      className="flex-1 bg-primary text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px] shadow-glow"
                    >
                       {m.passed_at ? 'Retake Exam' : 'Start Exam'}
                    </Button>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Module Content Dialog */}
      <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
         <DialogContent className="max-w-4xl rounded-[3rem] p-10 border-none bg-card shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-4xl font-black uppercase tracking-tighter">{selectedModule?.title}</DialogTitle>
               <DialogDescription className="font-bold text-slate-500">Training Module Content</DialogDescription>
            </DialogHeader>
            <div className="py-10 space-y-8">
               {selectedModule?.type === 'video' ? (
                 <div className="aspect-video bg-black rounded-[2rem] flex items-center justify-center overflow-hidden border-8 border-secondary shadow-2xl">
                    <PlayCircle className="h-24 w-24 text-white/20" />
                    <p className="absolute text-white/40 font-black uppercase tracking-widest text-xs">Video Stream Loading...</p>
                 </div>
               ) : (
                 <div className="bg-secondary/20 p-10 rounded-[2rem] border border-border/50 max-h-[50vh] overflow-y-auto no-scrollbar">
                    <p className="text-xl font-bold text-slate-600 leading-relaxed">
                       {selectedModule?.description}. This is a training module designed to standardize operations. In production, this would render full markdown or a linked PDF.
                    </p>
                 </div>
               )}
            </div>
            <DialogFooter>
               <Button onClick={() => handleStartExam(selectedModule.id)} className="w-full bg-primary text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center gap-3">
                  I've Finished Studying <ArrowRight className="h-5 w-5" />
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog open={!!showExam} onOpenChange={() => !submitting && setShowExam(null)}>
         <DialogContent className="max-w-2xl rounded-[3rem] p-12 border-none bg-card shadow-2xl">
            {examResult ? (
              <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
                 <div className={cn(
                   "h-32 w-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl",
                   examResult.passed ? "bg-emerald-500 text-white shadow-glow-emerald" : "bg-red-500 text-white shadow-glow-red"
                 )}>
                    {examResult.passed ? <Award className="h-16 w-16" /> : <AlertCircle className="h-16 w-16" />}
                 </div>
                 <div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-2">{examResult.passed ? 'Certified!' : 'Keep Practicing'}</h2>
                    <p className="text-slate-500 font-bold text-lg">You scored {examResult.score}% in this module.</p>
                 </div>
                 <div className="flex justify-center gap-4">
                    <Badge className="bg-secondary text-primary px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] border-none">{examResult.correctCount} Correct</Badge>
                    <Badge className="bg-secondary text-primary px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] border-none">{examResult.totalCount} Total Questions</Badge>
                 </div>
                 <Button onClick={() => setShowExam(null)} className="w-full bg-[#1b1b24] text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] mt-10">Back to Academy</Button>
              </div>
            ) : (
              <>
                <DialogHeader>
                   <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Certification Exam</DialogTitle>
                   <DialogDescription className="font-bold text-slate-500">Complete the quiz below to earn your digital badge.</DialogDescription>
                </DialogHeader>
                <div className="py-8 space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar px-2">
                   {showExam?.questions.map((q: any, qIdx: number) => (
                     <div key={qIdx} className="space-y-6">
                        <div className="flex gap-4">
                           <span className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 font-black">Q{qIdx + 1}</span>
                           <p className="text-xl font-black text-foreground tracking-tight leading-tight pt-2">{q.question}</p>
                        </div>
                        <RadioGroup 
                          className="grid grid-cols-1 gap-3 ml-14"
                          onValueChange={(val: string) => setAnswers(prev => ({ ...prev, [qIdx]: parseInt(val) }))}
                        >
                           {q.options.map((opt: string, optIdx: number) => (
                             <div key={optIdx} className="flex items-center space-x-3">
                                <RadioGroupItem value={optIdx.toString()} id={`q${qIdx}-o${optIdx}`} className="h-5 w-5" />
                                <Label htmlFor={`q${qIdx}-o${optIdx}`} className="font-bold text-slate-600 cursor-pointer">{opt}</Label>
                             </div>
                           ))}
                        </RadioGroup>
                     </div>
                   ))}
                </div>
                <DialogFooter>
                   <Button 
                    onClick={handleSubmitExam} 
                    disabled={Object.keys(answers).length < showExam?.questions.length || submitting}
                    className="w-full bg-primary text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-glow"
                   >
                      {submitting ? 'Evaluating Results...' : 'Submit Final Answers'}
                   </Button>
                </DialogFooter>
              </>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
