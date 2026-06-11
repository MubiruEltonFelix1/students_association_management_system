import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const badges = await prisma.badge.findMany({
    include: { memberBadges: { include: { member: { select: { firstName: true, lastName: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ badges });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const badge = await prisma.badge.create({
    data: {
      name: body.name,
      description: body.description,
      icon: body.icon,
      criteria: body.criteria,
    },
  });

  return NextResponse.json({ badge }, { status: 201 });
}
