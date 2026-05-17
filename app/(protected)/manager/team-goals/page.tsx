import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Goal, Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TeamGoalsTable from "@/components/manager/TeamGoalsTable";

interface TeamGoal extends Goal {
  owner: {
    name: string | null;
    email: string | null;
  };
}

async function getTeamGoals() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/manager/team-goals`, {
    cache: 'no-store',
    headers: {
      Cookie: cookieString,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch team goals:", await res.text());
    return [];
  }
  return res.json();
}

export default async function TeamGoalsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== Role.MANAGER) {
    // Or redirect to an unauthorized page
    redirect("/dashboard"); 
  }

  const teamGoals: TeamGoal[] = await getTeamGoals();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Team Goals</h1>
      <TeamGoalsTable initialGoals={teamGoals} />
    </div>
  );
}
