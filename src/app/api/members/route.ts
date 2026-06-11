import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, registrationNumber: true, course: true, yearGroup: true },
    orderBy: { firstName: "asc" },
  });
  return NextResponse.json({ members });
}
