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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const validation = formSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { thrustArea, title, description, uom, target, weightage } = validation.data;
  const userId = session.user.id;

  // Business logic validation
  const existingGoals = await prisma.goal.findMany({ where: { ownerId: userId, status: { notIn: ['REJECTED'] } } });
  
  if (existingGoals.length >= 8) {
    return NextResponse.json({ message: "You cannot have more than 8 goals." }, { status: 400 });
  }

  const totalWeightage = existingGoals.reduce((sum, goal) => sum + goal.weightage, 0);
  if (totalWeightage + weightage > 100) {
    return NextResponse.json({ message: `Adding this goal would exceed the 100% total weightage limit. Current total is ${totalWeightage}%.` }, { status: 400 });
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        ownerId: userId,
        thrustArea,
        title,
        description,
        uom,
        target,
        weightage,
        // Status defaults to DRAFT as per schema
      },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ message: "Failed to create goal." }, { status: 500 });
  }
}
