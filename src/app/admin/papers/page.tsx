import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminPapersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Papers</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Paper
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Papers</CardTitle>
          <CardDescription>A list of all question papers in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Paper management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
