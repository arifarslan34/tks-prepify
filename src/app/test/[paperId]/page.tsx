"use client";

import { useRouter } from 'next/navigation';
import { papers, questions as allQuestions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Props = {
  params: { paperId: string };
};

export default function SolvedPaperPage({ params }: Props) {
  const router = useRouter();
  const paper = papers.find(p => p.id === params.paperId);
  const questions = allQuestions.filter(q => q.paperId === params.paperId);

  if (!paper || questions.length === 0) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">Paper not found</h1>
        <p>This question paper could not be loaded.</p>
        <Button onClick={() => router.push('/papers')} className="mt-4">Go to Papers</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-4xl font-bold font-headline">{paper.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{paper.description}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
          <CardDescription>Review the questions and their correct answers below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-shrink-0 flex-grow-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-grow w-full">
                  <p className="font-semibold text-lg mb-4">{question.questionText}</p>
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-md border',
                          option === question.correctAnswer
                            ? 'bg-chart-2/20 border-chart-2'
                            : 'bg-card'
                        )}
                      >
                        {option === question.correctAnswer ? (
                          <CheckCircle2 className="h-5 w-5 text-chart-2 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 flex-shrink-0" />
                        )}
                        <span className="text-base">{option}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
                     <Lightbulb className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-1" />
                     <div>
                        <p className="font-semibold">Explanation</p>
                        <p className="text-muted-foreground">{question.explanation}</p>
                     </div>
                  </div>
                </div>
              </div>
              {index < questions.length - 1 && <Separator className="mt-8" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
