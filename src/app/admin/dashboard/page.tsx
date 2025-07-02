
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Folder, PlusCircle, ArrowUpRight, HelpCircle, Loader2 } from 'lucide-react';
import { papers, questions as allQuestions, users, getPaperById } from '@/lib/data';
import { fetchCategories, getCategoryById, getFlattenedCategories } from '@/lib/category-service';
import type { Category } from '@/types';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useState, useEffect, useMemo } from 'react';

export default function AdminDashboardPage() {
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

  const totalPapers = papers.length;
  const totalCategories = useMemo(() => getFlattenedCategories(allCategories).length, [allCategories]);
  const totalQuestions = allQuestions.length;
  const totalUsers = users.length;

  const papersPerCategory = useMemo(() => allCategories
    .filter(c => !c.parentId) // only top level
    .map(category => ({
      name: category.name,
      total: papers.filter(paper => paper.categoryId.startsWith(category.id)).length,
  })), [allCategories]);

  const recentPapers = papers.slice(-5).reverse();
  
  if (loading) {
      return (
          <div className="flex justify-center items-center h-full min-h-[calc(100vh-20rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Admin!</p>
        </div>
        <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/papers/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Paper
              </Link>
            </Button>
             <Button asChild variant="outline">
              <Link href="/admin/categories/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Category
              </Link>
            </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPapers}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">+4 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">+20 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalUsers}</div>
            <p className="text-xs text-muted-foreground">+1 since last month</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Papers Overview</CardTitle>
                    <CardDescription>Number of papers per top-level category.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={papersPerCategory}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center">
                   <div className="grid gap-2">
                        <CardTitle>Recent Papers</CardTitle>
                        <CardDescription>The last 5 papers added to the system.</CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/admin/papers">View All <ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="text-right">Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentPapers.map((paper) => {
                                const category = getCategoryById(paper.categoryId, allCategories);
                                return (
                                <TableRow key={paper.id}>
                                    <TableCell>
                                        <div className="font-medium">{paper.title}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {paper.questionCount} questions
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline">{category?.name}</Badge>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
