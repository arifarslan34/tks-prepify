
"use client";

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { papers as allPapers, getFlattenedCategories, getDescendantCategoryIds, getCategoryById, getCategoryPath } from '@/lib/data';
import { Search, Bookmark, Clock, ListChecks, Folder, FileText, ArrowRight, ChevronRight, CalendarDays, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function AllPapersView() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const flatCategories = useMemo(() => getFlattenedCategories(), []);

  const filteredPapers = allPapers.filter(paper => {
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const descendantIds = getDescendantCategoryIds(selectedCategory);
      matchesCategory = descendantIds.includes(paper.categoryId);
    }

    const categoryName = getCategoryById(paper.categoryId)?.name || '';
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-6 sm:px-10 lg:px-16 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline mb-2">Question Papers</h1>
        <p className="text-lg text-muted-foreground">Browse our extensive collection of papers to prepare for your exams.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-card rounded-lg border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by title or topic..."
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {flatCategories.map(cat => (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className={cn(
                  cat.isParent && "font-bold"
                )}
                style={{ paddingLeft: `${2 + cat.level * 1.5}rem` }}
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPapers.length > 0 ? (
          filteredPapers.map(paper => {
            const category = getCategoryById(paper.categoryId);
            return (
              <Card key={paper.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-primary">{category?.name}</p>
                      <CardTitle className="mt-1">{paper.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 group">
                      <Bookmark className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:fill-primary/20 transition-colors" />
                      <span className="sr-only">Bookmark paper</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{paper.description}</CardDescription>
                  <div className="flex items-center text-muted-foreground text-sm mt-4 gap-6">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      <span>{paper.questionCount} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{paper.duration} min</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/test/${paper.id}`}>View Paper</Link>
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-xl text-muted-foreground">No papers found.</p>
            <p>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}


function CategoryView({ categoryId }: { categoryId: string }) {
    const category = getCategoryById(categoryId);
    const categoryPath = getCategoryPath(categoryId);
    
    if (!category) {
        return (
            <div className="container mx-auto px-6 sm:px-10 lg:px-16 py-8 md:py-12 text-center">
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
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 py-8 md:py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Link href="/" className="hover:text-primary">Home</Link>
                {categoryPath?.map((p, index) => {
                    const isLast = index === categoryPath.length - 1;
                    return (
                        <React.Fragment key={p.id}>
                            <ChevronRight className="h-4 w-4 mx-1" />
                            {isLast ? (
                                <span className="text-foreground font-medium">{p.name}</span>
                            ) : (
                                <Link href={`/papers?category=${p.id}`} className="hover:text-primary">
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
                                <Link key={sub.id} href={`/papers?category=${sub.id}`} className="group">
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
                    <h2 className="text-3xl font-bold mb-6">Papers</h2>
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
                                        <Link href={`/test/${paper.id}`}>
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
                    <p className="text-xl text-muted-foreground">No sub-categories or papers found.</p>
                    <Link href="/categories">
                        <Button variant="outline" className="mt-4">Explore other categories</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}

function PapersPageContent() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');

    if (categoryId && categoryId !== 'all') {
        return <CategoryView categoryId={categoryId} />;
    }
    
    return <AllPapersView />;
}

export default function PapersPage() {
    return (
        <Suspense fallback={<div className="container text-center p-24">Loading...</div>}>
            <PapersPageContent />
        </Suspense>
    )
}
