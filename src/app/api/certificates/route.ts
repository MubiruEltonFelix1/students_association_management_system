import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const certificates = await prisma.certificate.findMany({
    include: { member: { select: { firstName: true, lastName: true, registrationNumber: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json({ certificates });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const certificate = await prisma.certificate.create({
    data: {
      memberId: body.memberId,
      category: body.category,
      achievement: body.achievement,
      semester: body.semester,
    },
  });

  return NextResponse.json({ certificate }, { status: 201 });
}
