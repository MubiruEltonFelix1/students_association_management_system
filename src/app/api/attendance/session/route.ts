import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTHORIZED_SCAN_ROLES } from "@/lib/constants";

// Start an attendance session for an event
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (!AUTHORIZED_SCAN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { eventId } = body;

  // Check if session already exists
  const existing = await prisma.attendanceSession.findUnique({
    where: { eventId },
  });

  if (existing) {
    // Re-activate
    const updated = await prisma.attendanceSession.update({
      where: { id: existing.id },
      data: { isActive: true, closedAt: null },
    });
    return NextResponse.json({ session: updated });
  }

  const attendanceSession = await prisma.attendanceSession.create({
    data: {
      eventId,
      openedById: userId,
    },
  });

  return NextResponse.json({ session: attendanceSession }, { status: 201 });
}

// Close a session
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId } = body;

  const updated = await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: { isActive: false, closedAt: new Date() },
  });

  return NextResponse.json({ session: updated });
}
