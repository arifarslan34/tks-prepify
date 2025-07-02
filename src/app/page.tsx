import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categories, papers, getCategoryById } from '@/lib/data';
import { ArrowRight, Bookmark } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-card">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
              Ace Your Tests with <span className="text-primary">Expertly Solved</span> Question Papers
            </h1>
            <p className="text-lg text-muted-foreground">
              Prepify offers a vast library of solved question papers, complete with detailed explanations and practice tools to help you ace your exams.
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
      <section id="categories" className="container mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Explore by Category</h2>
          <p className="text-lg text-muted-foreground mt-2">Find question papers tailored to your subjects of interest.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/papers?category=${category.id}`}>
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 group">
                <CardHeader className="flex flex-row items-center gap-4">
                  {category.icon && <category.icon className="w-8 h-8 text-primary" />}
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Papers Section */}
      <section className="bg-card">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24">
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
              const category = getCategoryById(paper.categoryId);
              return (
              <Card key={paper.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{paper.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{category?.name || ''}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Bookmark className="h-5 w-5" />
                      <span className="sr-only">Bookmark</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{paper.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full" asChild>
                    <Link href={`/test/${paper.id}`}>View Paper</Link>
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
