import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Only admins and managers can fetch the user list
  const authorizedRoles: Role[] = [Role.ADMIN, Role.MANAGER];
  if (!session?.user?.id || !authorizedRoles.includes(session.user.role)) {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        // Optionally filter out the manager/admin themselves
        id: { not: session.user.id }
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Failed to fetch users." }, { status: 500 });
  }
}
