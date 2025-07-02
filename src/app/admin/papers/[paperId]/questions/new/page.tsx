
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { getPaperById } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";

const mcqSchema = z.object({
    type: z.literal('mcq'),
    questionText: z.string().min(10, { message: "Question text must be at least 10 characters." }),
    options: z.array(z.object({ text: z.string().min(1, { message: "Option text cannot be empty." }) })).min(2, "MCQ questions must have at least 2 options."),
    correctAnswers: z.array(z.string()).min(1, { message: "At least one correct answer must be selected." }),
    explanation: z.string().optional(),
});

const shortAnswerSchema = z.object({
    type: z.literal('short_answer'),
    questionText: z.string().min(10, { message: "Question text must be at least 10 characters." }),
    correctAnswer: z.string().min(1, { message: "A correct answer must be provided." }),
    explanation: z.string().optional(),
});

const questionFormSchema = z.discriminatedUnion("type", [mcqSchema, shortAnswerSchema])
  .refine(data => {
    if (data.type === 'mcq') {
        const optionTexts = data.options.map(opt => opt.text);
        return data.correctAnswers.every(answer => optionTexts.includes(answer));
    }
    return true;
  }, {
      message: "Correct answers must match one of the options.",
      path: ["correctAnswers"],
  });

type QuestionFormValues = z.infer<typeof questionFormSchema>;

const defaultValues: QuestionFormValues = {
  type: 'mcq',
  questionText: '',
  options: [{ text: "" }, { text: "" }],
  correctAnswers: [],
  explanation: '',
};

export default function NewQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const paperId = params.paperId as string;
  const paper = getPaperById(paperId);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "options"
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
                    <Select onValueChange={(value) => {
                      // @ts-ignore
                      field.onChange(value);
                      if (value === 'mcq' && fields.length === 0) {
                        append({ text: '' });
                        append({ text: '' });
                      } else if (value === 'short_answer') {
                        // @ts-ignore
                        form.setValue('options', undefined);
                        // @ts-ignore
                        form.setValue('correctAnswers', undefined);
                      }
                    }} defaultValue={field.value}>
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
                <div className="space-y-4 rounded-md border p-4">
                  <FormLabel>Options & Correct Answers</FormLabel>
                  <FormDescription>
                    Add your options below and check the box for each correct answer.
                  </FormDescription>
                  <div className="space-y-3">
                    {fields.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <FormField
                            control={form.control}
                            // @ts-ignore
                            name="correctAnswers"
                            render={({ field }) => (
                                <Checkbox
                                    // @ts-ignore
                                    checked={field.value?.includes(form.getValues(`options.${index}.text`))}
                                    onCheckedChange={(checked) => {
                                        // @ts-ignore
                                        const optionText = form.getValues(`options.${index}.text`);
                                        if (!optionText) return;
                                        const currentAnswers = field.value || [];
                                        if (checked) {
                                            field.onChange([...currentAnswers, optionText]);
                                        } else {
                                            field.onChange(currentAnswers.filter((val: string) => val !== optionText));
                                        }
                                    }}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            // @ts-ignore
                            name={`options.${index}.text`}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder={`Option ${index + 1}`}
                                    onChange={(e) => {
                                        const oldValue = field.value;
                                        const newValue = e.target.value;
                                        field.onChange(newValue);
                                        // @ts-ignore
                                        const correctAnswers = form.getValues("correctAnswers") || [];
                                        if (correctAnswers.includes(oldValue)) {
                                            // @ts-ignore
                                            form.setValue("correctAnswers", correctAnswers.map((ans: string) => ans === oldValue ? newValue : ans), { shouldValidate: true });
                                        }
                                    }}
                                />
                            )}
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 2}
                            >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove option</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "" })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Option
                  </Button>
                   {/* @ts-ignore */}
                  <FormMessage>{form.formState.errors.correctAnswers?.message || form.formState.errors.options?.message}</FormMessage>
                </div>
              )}

              {questionType === 'short_answer' && (
                <FormField
                  control={form.control}
                  // @ts-ignore
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the exact correct answer..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

               <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide a detailed explanation for the correct answer..." {...field} value={field.value || ''}/>
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
