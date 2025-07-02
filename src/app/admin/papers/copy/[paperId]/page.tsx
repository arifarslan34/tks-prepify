
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
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchCategories, getFlattenedCategories, getCategoryPath, getCategoryById } from "@/lib/category-service";
import { getPaperById } from "@/lib/paper-service";
import type { Category, Paper } from "@/types";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/utils";
import { generatePaperDescription } from "@/ai/flows/generate-paper-description-flow";
import { generatePaperSeoDetails } from "@/ai/flows/generate-paper-seo-flow";
import { Switch } from "@/components/ui/switch";

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
  slug: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  questionCount: z.coerce.number().int().min(0, {
    message: "Number of questions cannot be negative.",
  }).default(0),
  duration: z.coerce.number().int().positive({
    message: "Please enter a positive duration in minutes.",
  }),
  year: z.coerce.number().int().optional(),
  session: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

type PaperFormValues = z.infer<typeof paperFormSchema>;

// Helper function moved outside the component
const getNewSlug = (paperData: PaperFormValues, allCategories: Category[]): string => {
    if (paperData.slug && slugify(paperData.slug)) {
        return slugify(paperData.slug);
    }
    const category = getCategoryById(paperData.categoryId, allCategories);
    const categorySlug = category ? category.slug.replace(/\//g, '-') : '';
    const sessionForSlug = paperData.session === 'none' ? '' : paperData.session || '';
    const titleSlug = slugify(`${paperData.title} ${paperData.year || ''} ${sessionForSlug}`.trim());

    return categorySlug ? `${categorySlug}-${titleSlug}` : titleSlug;
};


export default function CopyPaperPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const paperId = params.paperId as string;
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperFormSchema),
  });

  useEffect(() => {
    if (!paperId) return;
    const loadSourcePaper = async () => {
        setLoading(true);
        try {
            const [cats, sourcePaper] = await Promise.all([
                fetchCategories(),
                getPaperById(paperId),
            ]);
            
            setAllCategories(cats);

            if (sourcePaper) {
                form.reset({
                    ...sourcePaper,
                    title: `Copy of ${sourcePaper.title}`,
                    slug: '', // Clear slug to force regeneration or manual input
                    published: false, // Default copy to draft
                    featured: false, // Default copy to not featured
                    year: sourcePaper.year || undefined,
                    session: sourcePaper.session || 'none',
                });
            } else {
                toast({ title: "Error", description: "Source paper not found.", variant: "destructive" });
                router.push('/admin/papers');
            }
        } catch (error) {
            console.error("Error loading source paper:", error);
            toast({ title: "Error", description: "Failed to load source paper data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    loadSourcePaper();
  }, [paperId, form, router, toast]);

  const flatCategories = useMemo(() => getFlattenedCategories(allCategories), [allCategories]);
  
  const handleAiGeneration = useCallback(async (type: 'desc' | 'seo') => {
    const values = form.getValues();
    const { title, categoryId, description: desc } = values;

    const sessionValue = form.getValues("session");
    const session = sessionValue === 'none' ? undefined : sessionValue;

    const yearResult = z.coerce.number().int().optional().safeParse(values.year);
    const year = yearResult.success ? yearResult.data : undefined;
    
    if (!title || !categoryId) {
        toast({ title: "Title & Category Required", description: "Please enter a title and select a category.", variant: "destructive" });
        return;
    }
    if (type === 'seo' && !desc) {
        toast({ title: "Description Required", description: "Please provide a description to generate SEO content.", variant: "destructive" });
        return;
    }

    const categoryPath = getCategoryPath(categoryId, allCategories);
    const categoryName = categoryPath?.map(c => c.name).join(' / ') || '';
    const setLoadingState = type === 'desc' ? setIsGeneratingDesc : setIsGeneratingSeo;

    setLoadingState(true);
    try {
        if (type === 'desc') {
            const result = await generatePaperDescription({ title, categoryName, year, session });
            form.setValue("description", result.description, { shouldValidate: true });
            toast({ title: "Description Generated", description: "AI has created a description for you." });
        } else if (type === 'seo' && desc) {
            const result = await generatePaperSeoDetails({ title, description: desc, categoryName, year, session });
            form.setValue("keywords", result.keywords, { shouldValidate: true });
            form.setValue("metaTitle", result.metaTitle, { shouldValidate: true });
            form.setValue("metaDescription", result.metaDescription, { shouldValidate: true });
            toast({ title: "SEO Details Generated", description: "AI has filled in the SEO fields for you." });
        }
    } catch (error) {
        console.error(`Error generating ${type}:`, error);
        toast({ title: "Generation Failed", description: `Could not generate ${type}.`, variant: "destructive" });
    } finally {
        setLoadingState(false);
    }
  }, [form, allCategories, toast]);

  const onSubmit = useCallback(async (data: PaperFormValues) => {
    setIsSubmitting(true);
    try {
      const newPaperData = {
          ...data,
          slug: getNewSlug(data, allCategories),
          published: data.published || false,
          session: data.session === 'none' || !data.session ? null : data.session,
      };
      
      await addDoc(collection(db, "papers"), newPaperData);

      toast({
        title: "Paper Copied",
        description: "The new paper has been created successfully. Note: Questions are not copied and must be added manually.",
      });
      router.push("/admin/papers");
      router.refresh();
    } catch (error) {
      console.error("Error copying paper: ", error);
      toast({ title: "Error", description: "Failed to copy the paper.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [allCategories, router, toast]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full min-h-[calc(100vh-20rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Papers
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Copy Paper</CardTitle>
                    <CardDescription>Create a new paper based on an existing one. Edit the details below and save.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Paper Title</FormLabel>
                            <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Slug (Optional)</FormLabel>
                            <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormDescription>If left blank, a detailed slug will be generated from the title, category, year, and session.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Description</FormLabel>
                                <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => handleAiGeneration('desc')} disabled={isGeneratingDesc || isSubmitting}>
                                    {isGeneratingDesc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
                                </Button>
                            </div>
                            <FormControl>
                            <Textarea {...field} disabled={isSubmitting} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {flatCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id} style={{ paddingLeft: `${1 + cat.level * 1.5}rem` }} disabled={cat.isParent}>
                                    {cat.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                             <FormDescription>
                                You can only assign papers to subcategories that don't have their own children.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Published</FormLabel>
                                <FormDescription>Published papers will be visible on the public website.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Featured Paper</FormLabel>
                                <FormDescription>Featured papers will be highlighted on the homepage.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="questionCount"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Questions</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormDescription>Note: This is a static count for display. Questions are added separately.</FormDescription>
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
                                <Input type="number" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year (Optional)</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="session"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={isSubmitting}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a session" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="Fall">Fall</SelectItem>
                                        <SelectItem value="Spring">Spring</SelectItem>
                                        <SelectItem value="Summer">Summer</SelectItem>
                                        <SelectItem value="Special">Special</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>SEO Details</CardTitle>
                            <CardDescription>Optimize this paper for search engines.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAiGeneration('seo')} disabled={isGeneratingSeo || isSubmitting}>
                            {isGeneratingSeo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate with AI
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meta Title (Optional)</FormLabel>
                            <FormControl>
                            <Input {...field} value={field.value ?? ''} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meta Description (Optional)</FormLabel>
                            <FormControl>
                            <Textarea {...field} value={field.value ?? ''} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Keywords (Optional)</FormLabel>
                            <FormControl>
                            <Input {...field} value={field.value ?? ''} disabled={isSubmitting} />
                            </FormControl>
                             <FormDescription>Comma-separated keywords.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/papers')} disabled={isSubmitting}>
                Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Copy
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
