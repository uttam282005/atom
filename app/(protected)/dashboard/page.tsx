import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Goal } from "@prisma/client";
import { cookies } from "next/headers";

async function getGoals() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/goals`, {
    headers: {
      Cookie: cookieString,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch goals:", await res.text());
    return [];
  }
  return res.json();
}

export default async function DashboardPage() {
  const goals: Goal[] = await getGoals();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Goals</h1>
        <Button asChild>
          <Link href="/goals/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Goal
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2">{goal.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">{goal.description}</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium">Weightage:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{goal.weightage}%</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium">Status:</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{goal.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${goal.achievement || 0}%` }}></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border rounded-lg p-8 text-center text-gray-500">
            <p>You haven't created any goals yet.</p>
            <Button asChild className="mt-4">
              <Link href="/goals/create">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
