
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { papers } from '@/lib/data';
import { fetchCategories, getDescendantCategoryIds } from '@/lib/category-service';
import { ArrowRight, Bookmark, FileText, Folder } from 'lucide-react';
import Image from 'next/image';
import { getCategoryById } from '@/lib/category-service';

export default async function Home() {
  const allCategories = await fetchCategories();
  const featuredCategories = allCategories.filter(c => c.featured).slice(0, 4);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-card">
        <div className="container mx-auto px-16 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
              Excel in Your Tests with <span className="text-primary">Expertly Solved</span> Question Papers
            </h1>
            <p className="text-lg text-muted-foreground">
              Prepify offers a vast library of solved question papers, complete with detailed explanations and practice tools to help you excel in your exams.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/papers">Explore Papers</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
          <div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Student studying"
              data-ai-hint="student studying"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="container mx-auto px-16 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Explore by Category</h2>
          <p className="text-lg text-muted-foreground mt-2">Find question papers tailored to your subjects of interest.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCategories.length > 0 ? (
            featuredCategories.map((category) => {
              const paperCount = papers.filter(p => getDescendantCategoryIds(category.id, allCategories).includes(p.categoryId)).length;
              const subCategoryCount = category.subcategories?.length || 0;

              return (
                <Link key={category.id} href={`/categories/${category.slug}`} className="group">
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
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              <p>No featured categories available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
              <Link href="/categories">
                  Browse All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
          </Button>
        </div>
      </section>

      {/* Latest Papers Section */}
      <section className="bg-card">
        <div className="container mx-auto px-16 py-16 md:py-24">
          <div className="flex justify-between items-center mb-12">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Latest Question Papers</h2>
              <p className="text-lg text-muted-foreground mt-2">Jump into the latest papers added to our collection.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/papers">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {papers.slice(0, 3).map((paper) => {
              const category = getCategoryById(paper.categoryId, allCategories);
              return (
              <Card key={paper.id} className="flex flex-col">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{paper.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category?.name || ''}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Bookmark className="h-5 w-5" />
                      <span className="sr-only">Bookmark</span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-4 flex-grow">{paper.description}</p>
                </CardContent>
                <div className="px-6 pb-6">
                  <Button className="w-full" asChild>
                    <Link href={`/papers/${paper.slug}`}>View Paper</Link>
                  </Button>
                </div>
              </Card>
            )})}
          </div>
        </div>
      </section>
    </>
  );
}
