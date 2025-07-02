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
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { papers, getCategoryPath } from "@/lib/data";
import Link from "next/link";

export default function AdminPapersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Papers</h1>
        <Button asChild>
          <Link href="/admin/papers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Paper
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Papers</CardTitle>
          <CardDescription>A list of all question papers in the system.</CardDescription>
        </CardHeader>
        <CardContent>
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
                const categoryPath = getCategoryPath(paper.categoryId);
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
        </CardContent>
      </Card>
    </div>
  )
}
