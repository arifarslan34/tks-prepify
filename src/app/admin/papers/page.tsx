
"use client"

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { papers as allPapers } from "@/lib/data";
import { fetchCategories, getCategoryPath, getFlattenedCategories } from "@/lib/category-service";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


export default function AdminPapersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  const papers = allPapers.filter(paper => {
      const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || paper.categoryId.startsWith(selectedCategory);
      return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold">Manage Papers</h1>
            <p className="text-muted-foreground">A list of all question papers in the system.</p>
        </div>
        <Button asChild>
          <Link href="/admin/papers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Paper
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
              <SelectTrigger className="md:w-[280px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {flatCategories.map(cat => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    style={{ paddingLeft: `${1 + cat.level * 1.5}rem` }}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Questions</TableHead>
                    <TableHead className="text-center">Duration (min)</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {papers.map((paper) => {
                    const categoryPath = getCategoryPath(paper.categoryId, allCategories);
                    const categoryName = categoryPath?.map(c => c.name).join(' / ') || 'N/A';
                    return (
                    <TableRow key={paper.id}>
                        <TableCell className="font-medium">{paper.title}</TableCell>
                        <TableCell>
                        <Badge variant="outline">{categoryName}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{paper.questionCount}</TableCell>
                        <TableCell className="text-center">{paper.duration}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/papers/${paper.id}/questions`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add/Edit Questions
                                </Link>
                                </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/papers/${paper.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => toast({
                                    title: "Paper Deleted (simulation)",
                                    description: `The paper "${paper.title}" will be deleted.`,
                                })}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    )
                })}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
