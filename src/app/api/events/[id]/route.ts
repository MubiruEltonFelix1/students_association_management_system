import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTHORIZED_SCAN_ROLES } from "@/lib/constants";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      attendanceSession: {
        include: {
          records: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  registrationNumber: true,
                  course: true,
                  yearGroup: true,
                },
              },
            },
            orderBy: { timestamp: "desc" },
          },
        },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const event = await prisma.event.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
