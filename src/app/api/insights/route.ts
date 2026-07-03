import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: "Add some subscriptions first" },
      { status: 400 }
    );
  }

  const subscriptionList = subscriptions
    .map(
      (s) =>
        `${s.name}: ₹${s.cost}/${s.billingCycle}, category: ${s.category}, renews: ${s.renewalDate.toDateString()}`
    )
    .join("\n");

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a concise personal finance assistant. Analyze the user's subscriptions and give practical, specific spending insights. Keep it under 150 words, use plain language, and use bullet points.",
        },
        {
          role: "user",
          content: `Here are my subscriptions:\n${subscriptionList}\n\nGive me insights on my spending, and flag anything that looks wasteful or worth reconsidering.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const insight = completion.choices[0]?.message?.content ?? "No insights generated.";

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("AI insight error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    );
  }
}