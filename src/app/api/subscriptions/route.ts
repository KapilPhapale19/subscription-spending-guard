import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cost: z.number().positive("Cost must be positive"),
  billingCycle: z.enum(["monthly", "yearly"]),
  renewalDate: z.string(),
  category: z.string().min(1, "Category is required"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { renewalDate: "asc" },
  });

  return NextResponse.json(subscriptions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  try {
    const body = await req.json();
    const result = subscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        ...result.data,
        renewalDate: new Date(result.data.renewalDate),
        userId: session.user.id,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}