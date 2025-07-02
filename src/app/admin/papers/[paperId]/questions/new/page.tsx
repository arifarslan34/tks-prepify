
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


const questionFormSchema = z.object({
  questionText: z.string().min(10, { message: "Question text must be at least 10 characters." }),
  type: z.enum(['mcq', 'short_answer']),
  options: z.array(z.object({ text: z.string().min(1, { message: "Option text cannot be empty." }) })).optional(),
  correctAnswer: z.string().min(1, { message: "A correct answer must be provided." }),
  explanation: z.string().optional(),
}).refine(data => {
    if (data.type === 'mcq') {
        return data.options && data.options.length >= 2;
    }
    return true;
}, {
    message: "MCQ questions must have at least 2 options.",
    path: ["options"],
}).refine(data => {
    if (data.type === 'mcq' && data.options && data.correctAnswer) {
        return data.options.some(opt => opt.text === data.correctAnswer);
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
      options: [{ text: "" }, { text: "" }],
      correctAnswer: undefined,
      explanation: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
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
                      field.onChange(value);
                      if (value === 'mcq' && fields.length === 0) {
                        append({ text: '' });
                        append({ text: '' });
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
                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Options & Correct Answer</FormLabel>
                        <FormDescription>
                          Add your options below. Select the radio button for the correct answer.
                        </FormDescription>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            {fields.map((item, index) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name={`options.${index}.text`}
                                render={({ field: optionField }) => (
                                  <div className="flex items-center gap-3">
                                    <RadioGroupItem value={optionField.value} id={item.id} />
                                    <Label htmlFor={item.id} className="flex-grow font-normal">
                                      <Input
                                        {...optionField}
                                        placeholder={`Option ${index + 1}`}
                                        onChange={(e) => {
                                          const oldValue = optionField.value;
                                          optionField.onChange(e);
                                          if (form.getValues("correctAnswer") === oldValue) {
                                            form.setValue("correctAnswer", e.target.value, { shouldValidate: true });
                                          }
                                        }}
                                      />
                                    </Label>
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
                                )}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "" })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Option
                  </Button>
                </div>
              )}

              {questionType === 'short_answer' && (
                <FormField
                  control={form.control}
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
