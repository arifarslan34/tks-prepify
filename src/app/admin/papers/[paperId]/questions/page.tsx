
"use client";

import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { questions as allQuestions } from "@/lib/data";
import { getPaperById } from "@/lib/category-service";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


export default function AdminPaperQuestionsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const paperId = params.paperId as string;
    const paper = getPaperById(paperId);
    const questions = allQuestions.filter(q => q.paperId === paperId);

    if (!paper) {
        return <div>Paper not found</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="outline" onClick={() => router.push('/admin/papers')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Papers
                </Button>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Questions for: {paper.title}</h1>
                    <p className="text-muted-foreground">Manage the questions for this paper.</p>
                </div>
                <Button asChild>
                <Link href={`/admin/papers/${paper.id}/questions/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Question
                </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>A list of all questions in this paper.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50%]">Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {questions.map((question) => (
                        <TableRow key={question.id}>
                            <TableCell className="font-medium">{question.questionText}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{question.type.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell className="truncate max-w-xs">{Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}</TableCell>
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
                                        <Link href={`/admin/papers/${paperId}/questions/${question.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => toast({
                                            title: "Question Deleted (simulation)",
                                            description: "This question has been deleted."
                                        })}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}
