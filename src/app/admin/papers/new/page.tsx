
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { getFlattenedCategories } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const paperFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  categoryId: z.string({
    required_error: "Please select a category for this paper.",
  }),
  questionCount: z.coerce.number().int().positive({
    message: "Please enter a positive number of questions.",
  }),
  duration: z.coerce.number().int().positive({
    message: "Please enter a positive duration in minutes.",
  }),
});

type PaperFormValues = z.infer<typeof paperFormSchema>;

export default function NewPaperPage() {
  const router = useRouter();
  const { toast } = useToast();
  const flatCategories = getFlattenedCategories();

  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperFormSchema),
  });

  function onSubmit(data: PaperFormValues) {
    console.log(data);
    toast({
      title: "Paper Created",
      description: "The new paper has been saved (console only).",
    });
    router.push("/admin/papers");
  }

  return (
    <div className="space-y-6">
       <div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Papers
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Paper</CardTitle>
          <CardDescription>Fill out the form below to create a new question paper.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paper Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Physics 101 Final Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of what this paper covers..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category for this paper" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {flatCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} style={{ paddingLeft: `${1 + cat.level * 1.5}rem` }} disabled={cat.isParent}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <FormDescription>
                       You can only assign papers to subcategories.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <div className="flex justify-end gap-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/admin/papers')}>
                    Cancel
                </Button>
                <Button type="submit">Save Paper</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
