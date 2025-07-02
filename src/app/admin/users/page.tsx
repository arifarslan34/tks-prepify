import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>User management is not yet implemented.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
            <Users className="h-16 w-16 mb-4" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>This feature will allow you to manage user accounts and roles.</p>
        </CardContent>
      </Card>
    </div>
  )
}
