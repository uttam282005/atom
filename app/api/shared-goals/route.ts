import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role, GoalStatus } from "@prisma/client";
import * as z from "zod";

const sharedGoalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thrustArea: z.string().min(1, "Thrust area is required"),
  target: z.coerce.number().min(0, "Target must be a positive number"),
  uom: z.enum(["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"]),
  employeeIds: z.array(z.string()).min(1, "You must select at least one employee"),
  defaultWeightage: z.coerce.number().min(10).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const authorizedRoles: Role[] = [Role.ADMIN, Role.MANAGER];
  if (!session?.user?.id || !authorizedRoles.includes(session.user.role)) {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const validation = sharedGoalSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { title, description, thrustArea, target, uom, employeeIds, defaultWeightage } = validation.data;

  try {
    // Use a transaction to ensure all or nothing is created
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the SharedGoal
      const sharedGoal = await tx.sharedGoal.create({
        data: {
          title,
          description,
          target,
          createdBy: session.user.id,
          // Note: The UoM is not on the SharedGoal model in the schema, so we'll apply it to each individual goal.
        },
      });

      // 2. Create individual goals for each employee
      for (const employeeId of employeeIds) {
        // Optional: Add validation to ensure the total weightage for each employee doesn't exceed 100%
        await tx.goal.create({
          data: {
            title,
            description,
            thrustArea,
            uom,
            target,
            weightage: defaultWeightage,
            ownerId: employeeId,
            sharedGoalId: sharedGoal.id,
            status: GoalStatus.DRAFT, // Or directly to SUBMITTED/APPROVED if desired
          },
        });
      }
      
      return sharedGoal;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Error creating shared goal:", error);
    return NextResponse.json({ message: "Failed to create shared goal." }, { status: 500 });
  }
}
