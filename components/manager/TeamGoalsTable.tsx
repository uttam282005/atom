"use client";

import { Goal, GoalStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TeamGoal extends Goal {
  owner: {
    name: string | null;
    email: string | null;
  };
}

interface TeamGoalsTableProps {
  initialGoals: TeamGoal[];
}

export default function TeamGoalsTable({ initialGoals }: TeamGoalsTableProps) {
  const router = useRouter();

  const handleUpdateStatus = async (goalId: string, status: GoalStatus, comment?: string) => {
    const res = await fetch(`/api/manager/team-goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment }),
    });

    if (res.ok) {
      // Refresh the page to show the updated goal status
      router.refresh();
    } else {
      const error = await res.json();
      alert(`Failed to update goal: ${error.message}`);
    }
  };

  const handleApprove = (goalId: string) => {
    handleUpdateStatus(goalId, GoalStatus.APPROVED);
  };

  const handleReject = (goalId:string) => {
    const comment = prompt("Please provide a reason for rejection:");
    if (comment) {
      handleUpdateStatus(goalId, GoalStatus.REJECTED, comment);
    }
  };

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Employee</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Goal Title</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Weightage</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialGoals.length > 0 ? (
              initialGoals.map((goal) => (
                <tr key={goal.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">{goal.owner.name}</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{goal.title}</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{goal.weightage}%</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{goal.status}</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                    {goal.status === GoalStatus.SUBMITTED && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(goal.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(goal.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                     {goal.status === GoalStatus.APPROVED && (
                        <span className="text-green-600 font-semibold">Approved</span>
                    )}
                    {goal.status === GoalStatus.REJECTED && (
                        <span className="text-red-600 font-semibold">Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No goals submitted by your team yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
