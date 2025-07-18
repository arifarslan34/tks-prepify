
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchPapers } from '@/lib/paper-service';
import { fetchCategories, getFlattenedCategories, getDescendantCategoryIds, getCategoryById } from '@/lib/category-service';
import type { Category, Paper } from '@/types';
import { Search, Bookmark, Clock, ListChecks, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AllPapersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, papersData] = await Promise.all([
                fetchCategories(),
                fetchPapers(),
            ]);
            setAllCategories(cats);
            setAllPapers(papersData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);
  
  const flatCategories = useMemo(() => getFlattenedCategories(allCategories), [allCategories]);

  const filteredPapers = useMemo(() => {
    if (loading) return [];
    return allPapers.filter(paper => {
      if (!paper.published) return false;

      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        const descendantIds = getDescendantCategoryIds(selectedCategory, allCategories);
        matchesCategory = descendantIds.includes(paper.categoryId);
      }

      const categoryName = getCategoryById(paper.categoryId, allCategories)?.name || '';
      const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allPapers, allCategories, loading, searchTerm, selectedCategory]);

  return (
    <div className="container mx-auto px-16 py-8 md:py-12">
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
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
      
      {loading ? (
        <div className="col-span-full text-center py-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPapers.length > 0 ? (
            filteredPapers.map(paper => {
                const category = getCategoryById(paper.categoryId, allCategories);
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
                        <Link href={`/papers/${paper.slug}`}>View Paper</Link>
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
      )}
    </div>
  );
}
