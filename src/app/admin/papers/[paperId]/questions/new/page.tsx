
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { getPaperById } from "@/lib/data";

const questionFormSchema = z.object({
  questionText: z.string().min(10, "Question text must be at least 10 characters."),
  type: z.enum(['mcq', 'short_answer']),
  options: z.string().optional(),
  correctAnswer: z.string().min(1, "Correct answer is required."),
  explanation: z.string().min(10, "Explanation must be at least 10 characters."),
}).refine(data => {
    if (data.type === 'mcq') {
        return !!data.options && data.options.split('\n').filter(opt => opt.trim() !== '').length >= 2;
    }
    return true;
}, {
    message: "MCQ questions must have at least 2 options, one per line.",
    path: ["options"],
}).refine(data => {
    if (data.type === 'mcq' && data.options) {
        const optionsArray = data.options.split('\n').map(opt => opt.trim()).filter(opt => opt !== '');
        return optionsArray.includes(data.correctAnswer.trim());
    }
    return true;
}, {
    message: "The correct answer must be one of the provided options.",
    path: ["correctAnswer"],
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function NewQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const paperId = params.paperId as string;
  const paper = getPaperById(paperId);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: 'mcq',
      questionText: '',
      options: '',
      correctAnswer: '',
      explanation: '',
    },
  });

  const questionType = form.watch("type");

  function onSubmit(data: QuestionFormValues) {
    console.log(data);
    toast({
      title: "Question Created",
      description: "The new question has been saved (console only).",
    });
    router.push(`/admin/papers/${paperId}/questions`);
  }
  
  if (!paper) return <div>Loading...</div>

  return (
    <div className="space-y-6">
       <div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Questions
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
          <CardDescription>Add a new question to the paper: {paper.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a question type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What is the capital of France?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {questionType === 'mcq' && (
                <FormField
                    control={form.control}
                    name="options"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Options</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Paris\nLondon\nBerlin\nMadrid" {...field} />
                        </FormControl>
                        <FormDescription>Enter one option per line.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}

              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <Input placeholder={questionType === 'mcq' ? 'e.g., Paris' : 'Enter the exact correct answer...'} {...field} />
                    </FormControl>
                     <FormDescription>
                       For MCQs, this must exactly match one of the options above.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide a detailed explanation for the correct answer..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                 <Button type="button" variant="outline" onClick={() => router.push(`/admin/papers/${paperId}/questions`)}>
                    Cancel
                </Button>
                <Button type="submit">Save Question</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
