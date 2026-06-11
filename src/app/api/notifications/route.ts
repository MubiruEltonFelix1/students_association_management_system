import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const notifications = await prisma.notification.findMany({
    where: { memberId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // If sending to all members
  if (body.allMembers) {
    const members = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: members.map((m) => ({
        memberId: m.id,
        title: body.title,
        message: body.message,
        type: body.type || "SYSTEM",
      })),
    });
    return NextResponse.json({ sent: members.length });
  }

  // Send to specific member
  const notification = await prisma.notification.create({
    data: {
      memberId: body.memberId,
      title: body.title,
      message: body.message,
      type: body.type || "SYSTEM",
    },
  });

  return NextResponse.json({ notification }, { status: 201 });
}
