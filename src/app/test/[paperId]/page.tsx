"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { papers, questions as allQuestions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

type Props = {
  params: { paperId: string };
};

export default function TestPage({ params }: Props) {
  const router = useRouter();
  const paper = papers.find(p => p.id === params.paperId);
  const questions = allQuestions.filter(q => q.paperId === params.paperId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [timeLeft, setTimeLeft] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if(paper) {
      setTimeLeft(paper.duration * 60)
    }
  }, [paper]);
  
  useEffect(() => {
    if (!paper || !isMounted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paper, isMounted]);

  const submitTest = () => {
    const testId = `test_${params.paperId}_${Date.now()}`; 
    localStorage.setItem('latestTestResults', JSON.stringify({ paperId: params.paperId, answers }));
    router.push(`/results/${testId}`);
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  if (!paper || questions.length === 0) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">Paper not found</h1>
        <p>This question paper could not be loaded.</p>
        <Button onClick={() => router.push('/papers')} className="mt-4">Go to Papers</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 md:py-12 flex justify-center items-start">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl md:text-2xl">{paper.title}</CardTitle>
            <div className="flex items-center gap-2 font-medium text-accent-foreground bg-accent/20 px-3 py-1.5 rounded-full">
              <Clock className="h-5 w-5" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-right">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <h2 className="text-lg md:text-xl font-semibold mb-6">{currentQuestion.questionText}</h2>
          </div>
          <RadioGroup 
            value={answers[currentQuestionIndex]}
            onValueChange={handleAnswerChange} 
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-8 flex justify-between items-center">
            <Button variant="outline" onClick={goToPrevious} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Submit Test</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You cannot change your answers after submitting. Any unanswered questions will be marked as incorrect.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction onClick={submitTest}>Submit</AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={goToNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
