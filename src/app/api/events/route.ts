import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1),
  category: z.enum([
    "FRIDAY_SESSION",
    "WORKSHOP",
    "HACKATHON",
    "COMMUNITY_MEETUP",
    "RESEARCH_EVENT",
    "INNOVATION_CHALLENGE",
    "CAREER_TALK",
    "OTHER",
  ]),
  date: z.string().transform((s) => new Date(s)),
  time: z.string().min(1),
  venue: z.string().min(1),
  description: z.string().optional(),
  maxCapacity: z.number().int().positive().optional(),
  organizingCommunity: z.string().optional(),
});

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      attendanceSession: { select: { id: true, isActive: true } },
    },
  });
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        ...parsed.data,
        createdById: userId,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
