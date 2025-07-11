import { auth } from "@clerk/nextjs/server";
import TaskManager from "@/components/TaskManager";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need to be signed in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <TaskManager />
    </div>
  );
}
