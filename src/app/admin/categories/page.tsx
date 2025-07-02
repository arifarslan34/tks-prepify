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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
import { papers } from "@/lib/data";
import { fetchCategories, getFlattenedCategories, getDescendantCategoryIds } from "@/lib/category-service";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const allCategories = await fetchCategories();
  const flatCategories = getFlattenedCategories(allCategories);

  const getPaperCount = (categoryId: string) => {
    const descendantIds = getDescendantCategoryIds(categoryId, allCategories);
    return papers.filter(paper => descendantIds.includes(paper.categoryId)).length;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>A list of all categories and subcategories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Name</TableHead>
                <TableHead>Papers</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell 
                    className="font-medium"
                    style={{ paddingLeft: `${1 + category.level * 2}rem` }}
                  >
                    {category.name}
                  </TableCell>
                  <TableCell>
                    {getPaperCount(category.id)}
                  </TableCell>
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
                          <Link href={`/admin/categories/new?parentId=${category.id}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subcategory
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" disabled>
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
