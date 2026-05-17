import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role, GoalStatus } from "@prisma/client";
import * as z from "zod";

const updateStatusSchema = z.object({
  status: z.enum([GoalStatus.APPROVED, GoalStatus.REJECTED]),
  comment: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { goalId: string } }) {
  const session = await getServerSession(authOptions);
  const { goalId } = params;

  if (!session?.user?.id || session.user.role !== Role.MANAGER) {
    return NextResponse.json({ message: "Not authenticated or not a manager" }, { status: 401 });
  }

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { owner: true },
  });

  // Check if the goal exists and if the logged-in manager is the manager of the goal's owner
  if (!goal || goal.owner.managerId !== session.user.id) {
    return NextResponse.json({ message: "Goal not found or you don't have permission to manage it." }, { status: 404 });
  }

  const body = await req.json();
  const validation = updateStatusSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { status, comment } = validation.data;

  // You can only approve/reject goals that have been submitted
  if (goal.status !== GoalStatus.SUBMITTED) {
      return NextResponse.json({ message: `Goal is not in a state to be ${status.toLowerCase()}. Current status: ${goal.status}` }, { status: 400 });
  }

  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        status: status,
        checkinComment: status === GoalStatus.REJECTED ? comment : null, // Only save comment on rejection
        lockedAt: status === GoalStatus.APPROVED ? new Date() : null, // Lock goal on approval
      },
    });

    // Optionally, create an audit log entry
    await prisma.auditLog.create({
        data: {
            goalId: goal.id,
            changedBy: session.user.id,
            change: `Manager ${status.toLowerCase()} goal.`
        }
    });


    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal status:", error);
    return NextResponse.json({ message: "Failed to update goal status." }, { status: 500 });
  }
}
