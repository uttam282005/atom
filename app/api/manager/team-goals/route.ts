import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

import { Role } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (session.user.role !== Role.MANAGER) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const managerId = session.user.id;

    const teamGoals = await prisma.goal.findMany({
      where: {
        owner: {
          managerId,
        },
      },

      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: [
        {
          ownerId: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(teamGoals);
  } catch (error) {
    console.error("Error fetching team goals:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
