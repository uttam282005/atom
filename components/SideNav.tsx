import Link from "next/link";
import { LayoutDashboard, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export default async function SideNav() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-64 h-full bg-gray-100 p-4">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          AtomQuest
        </Link>
      </div>
      <nav>
        <ul>
          <li>
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-200"
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </li>
          {session?.user.role === Role.MANAGER && (
            <li>
              <Link
                href="/manager/team-goals"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-200"
              >
                <Users className="mr-3 h-5 w-5" />
                Team Goals
              </Link>
            </li>
          )}
          {/* Add more links here as needed */}
        </ul>
      </nav>
    </div>
  );
}
