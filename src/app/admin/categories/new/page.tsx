
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import React, { useState, useEffect, useMemo } from "react";
import { fetchCategories, getFlattenedCategories, clearCategoriesCache } from "@/lib/category-service";
import type { Category } from "@/types";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils";
import { generateSeoDetails } from "@/ai/flows/generate-seo-flow";
import { generateDescription } from "@/ai/flows/generate-description-flow";

const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  slug: z.string().optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  parentId: z.string().optional(),
  featured: z.boolean().default(false).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;


// useSearchParams requires a Suspense boundary. We wrap the page in a client component
// that can be suspended while the search params are read.
function NewCategoryPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const cats = await fetchCategories();
        setAllCategories(cats);
        setLoading(false);
    };
    loadData();
  }, []);

  const flatCategories = useMemo(() => getFlattenedCategories(allCategories), [allCategories]);

  const parentIdParam = searchParams.get("parentId") || undefined;
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: parentIdParam === "none" ? undefined : parentIdParam,
      featured: false,
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    setIsSubmitting(true);
    try {
      const parentId = data.parentId === 'none' || !data.parentId ? null : data.parentId;
      const localSlug = slugify(data.slug || data.name);

      const categoryData = {
        name: data.name,
        slug: localSlug,
        description: data.description,
        parentId: parentId,
        featured: data.featured || false,
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        keywords: data.keywords || '',
      };


      await addDoc(collection(db, "categories"), categoryData);
      
      clearCategoriesCache();

      toast({
        title: "Category Created",
        description: "The new category has been saved successfully.",
      });
      router.push("/admin/categories");
      router.refresh(); // To ensure server components re-fetch data
    } catch (error) {
      console.error("Error creating category: ", error);
      toast({
        title: "Error",
        description: "Failed to create the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGenerateDescription() {
    const categoryName = form.getValues("name");
    if (!categoryName) {
      toast({
        title: "Category Name required",
        description: "Please fill in the category name before generating a description.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const result = await generateDescription({ name: categoryName });
      form.setValue("description", result.description, { shouldValidate: true });
      toast({
        title: "Description Generated",
        description: "AI has created a description for you.",
      });
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a description at this time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  async function handleGenerateSeo() {
    const categoryName = form.getValues("name");
    const categoryDescription = form.getValues("description");

    if (!categoryName || !categoryDescription) {
        toast({
            title: "Name and Description required",
            description: "Please fill in the category name and description before generating SEO details.",
            variant: "destructive",
        });
        return;
    }
    
    setIsGeneratingSeo(true);
    try {
        const result = await generateSeoDetails({
            name: categoryName,
            description: categoryDescription,
        });

        form.setValue("keywords", result.keywords, { shouldValidate: true });
        form.setValue("metaTitle", result.metaTitle, { shouldValidate: true });
        form.setValue("metaDescription", result.metaDescription, { shouldValidate: true });
        
        toast({
            title: "SEO Details Generated",
            description: "AI has filled in the SEO fields for you.",
        });

    } catch (error) {
        console.error("Error generating SEO details:", error);
        toast({
            title: "Generation Failed",
            description: "Could not generate SEO details at this time. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsGeneratingSeo(false);
    }
  }


  if (loading) {
    return (
        <div className="flex justify-center items-center h-full min-h-[calc(100vh-20rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Fill out the form below to create a new category.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quantum Mechanics" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>This is the public name for the category.</FormDescription>
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
                      <Input placeholder="e.g., quantum-mechanics" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>If left blank, the slug will be generated from the name.</FormDescription>
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
                       <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription || isSubmitting}
                      >
                        {isGeneratingDescription ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Generate
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="A brief description of the category..." {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Featured Category
                      </FormLabel>
                      <FormDescription>
                        Featured categories will be displayed on the homepage.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Top-level category)</SelectItem>
                        {flatCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} style={{ paddingLeft: `${1 + cat.level * 1.5}rem` }}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Assign this as a subcategory to an existing category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>SEO Details</CardTitle>
                            <CardDescription>Optimize this category for search engines.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateSeo} disabled={isGeneratingSeo || isSubmitting}>
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
                            <Input placeholder="e.g., Top Quantum Mechanics Papers" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormDescription>The title that appears in browser tabs and search results.</FormDescription>
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
                            <Textarea placeholder="A concise summary for search engine results..." {...field} disabled={isSubmitting} />
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
                            <Input placeholder="e.g., physics, quantum, exams" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormDescription>Comma-separated keywords for search engines.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Category
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewCategoryPage() {
    return (
        <React.Suspense fallback={
            <div className="flex justify-center items-center h-full min-h-[calc(100vh-20rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <NewCategoryPageComponent />
        </React.Suspense>
    )
}
