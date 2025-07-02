
"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { papers as allPapers, getCategoryById, getCategoryPath, getDescendantCategoryIds } from '@/lib/data';
import { getIdFromSlug, slugify } from '@/lib/utils';
import { Folder, FileText, ArrowRight, ChevronRight, CalendarDays, HelpCircle } from 'lucide-react';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const categoryId = getIdFromSlug(slug);

    const category = getCategoryById(categoryId);
    const categoryPath = getCategoryPath(categoryId);
    
    if (!category) {
        return (
            <div className="container mx-auto px-16 py-8 md:py-12 text-center">
                <h1 className="text-2xl font-bold">Category not found</h1>
                <Link href="/categories" className="mt-4 inline-block">
                    <Button>Back to Categories</Button>
                </Link>
            </div>
        );
    }

    const subCategories = category.subcategories || [];
    const papersInCategory = allPapers.filter(p => p.categoryId === categoryId);

    const getPaperCount = (catId: string) => {
        const descendantIds = getDescendantCategoryIds(catId);
        return allPapers.filter(paper => descendantIds.includes(paper.categoryId)).length;
    }

    return (
        <div className="container mx-auto px-16 py-8 md:py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Link href="/" className="hover:text-primary">Home</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/categories" className="hover:text-primary">Categories</Link>
                {categoryPath?.map((p, index) => {
                    const isLast = index === categoryPath.length - 1;
                    return (
                        <React.Fragment key={p.id}>
                            <ChevronRight className="h-4 w-4 mx-1" />
                            {isLast ? (
                                <span className="text-foreground font-medium">{p.name}</span>
                            ) : (
                                <Link href={`/categories/${p.id}-${slugify(p.name)}`} className="hover:text-primary">
                                    {p.name}
                                </Link>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>

            <h1 className="text-4xl font-bold font-headline mb-12">{category.name}</h1>

            {/* Sub-categories */}
            {subCategories.length > 0 && (
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-6">Sub-categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subCategories.map(sub => {
                            const paperCount = getPaperCount(sub.id);
                            return (
                                <Link key={sub.id} href={`/categories/${sub.id}-${slugify(sub.name)}`} className="group">
                                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 h-full hover:border-primary">
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-semibold pr-2">{sub.name}</h3>
                                                <Folder className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                                <FileText className="w-4 h-4" />
                                                <span>{paperCount} Paper{paperCount !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="mt-auto">
                                                <div className="flex items-center font-semibold text-primary">
                                                    Explore Category
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Papers */}
            {papersInCategory.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold mb-6">Papers in {category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {papersInCategory.map(paper => (
                           <Card key={paper.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold">{paper.title}</h3>
                                        {paper.featured && <Badge>Featured</Badge>}
                                    </div>
                                    <div className="flex items-center text-muted-foreground text-sm gap-6">
                                        {paper.year && (
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                <span>{paper.year}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>{paper.questionCount} Questions</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    <Button asChild className="w-full">
                                        <Link href={`/papers/${paper.id}-${slugify(paper.title)}`}>
                                            Start Studying
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {subCategories.length === 0 && papersInCategory.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No sub-categories or papers found in {category.name}.</p>
                    <Link href="/categories">
                        <Button variant="outline" className="mt-4">Explore other categories</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
