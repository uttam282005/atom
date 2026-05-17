import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import * as z from "zod";

const formSchema = z.object({
  thrustArea: z.string().min(1, "Thrust area is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  uom: z.enum(["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"]),
  target: z.coerce.number().min(0, "Target must be a positive number"),
  weightage: z.coerce.number().min(10, "Minimum weightage is 10%").max(100, "Maximum weightage is 100%"),
});

export async function PUT(req: NextRequest, { params }: { params: { goalId: string } }) {
  const session = await getServerSession(authOptions);
  const { goalId } = params;

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.ownerId !== session.user.id) {
    return NextResponse.json({ message: "Goal not found or you don't have permission to edit it." }, { status: 404 });
  }

  if (goal.lockedAt) {
    return NextResponse.json({ message: "Cannot edit a locked goal." }, { status: 403 });
  }

  const body = await req.json();
  const validation = formSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { thrustArea, title, description, uom, target, weightage } = validation.data;
  
  // Weightage validation
  const otherGoals = await prisma.goal.findMany({ 
    where: { 
      ownerId: session.user.id, 
      id: { not: goalId },
      status: { notIn: ['REJECTED'] }
    } 
  });
  const totalWeightage = otherGoals.reduce((sum, g) => sum + g.weightage, 0);
  if (totalWeightage + weightage > 100) {
    return NextResponse.json({ message: `Updating this goal would exceed the 100% total weightage limit. Current total for other goals is ${totalWeightage}%.` }, { status: 400 });
  }

  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        thrustArea,
        title,
        description,
        uom,
        target,
        weightage,
      },
    });
    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ message: "Failed to update goal." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { goalId: string } }) {
    const session = await getServerSession(authOptions);
    const { goalId } = params;
  
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
  
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });
  
    if (!goal || goal.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Goal not found or you don't have permission to delete it." }, { status: 404 });
    }
  
    if (goal.lockedAt) {
      return NextResponse.json({ message: "Cannot delete a locked goal." }, { status: 403 });
    }
  
    try {
      await prisma.goal.delete({
        where: { id: goalId },
      });
      return NextResponse.json({ message: "Goal deleted successfully." }, { status: 200 });
    } catch (error) {
      console.error("Error deleting goal:", error);
      return NextResponse.json({ message: "Failed to delete goal." }, { status: 500 });
    }
  }
