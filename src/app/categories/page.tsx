import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { categories, papers, getDescendantCategoryIds } from '@/lib/data';
import { ArrowRight, Folder, FileText } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Browse All Categories</h1>
        <p className="text-lg text-muted-foreground mt-2">Find question papers tailored to your subjects of interest.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => {
          const paperCount = papers.filter(p => getDescendantCategoryIds(category.id).includes(p.categoryId)).length;
          const subCategoryCount = category.subcategories?.length || 0;

          return (
            <Link key={category.id} href={`/papers?category=${category.id}`} className="group">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 h-full hover:border-primary">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold pr-2">{category.name}</h3>
                    <Folder className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground flex-grow">
                    {subCategoryCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span>{subCategoryCount} Sub-categor{subCategoryCount > 1 ? 'ies' : 'y'}</span>
                      </div>
                    )}
                    {paperCount > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{paperCount} Paper{paperCount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
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
    </div>
  );
}
