import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTHORIZED_SCAN_ROLES, POINTS_MAP } from "@/lib/constants";
import { getCurrentSemester } from "@/lib/utils";
import { z } from "zod";

const checkInSchema = z.object({
  sessionId: z.string().uuid(),
  memberId: z.string().uuid(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (!AUTHORIZED_SCAN_ROLES.includes(userRole)) {
    return NextResponse.json(
      { error: "You do not have permission to scan attendance" },
      { status: 403 }
    );
  }

  const scannerId = (session.user as any).id;

  try {
    const body = await req.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { sessionId, memberId } = parsed.data;

    // Validate session
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { event: true },
    });

    if (!attendanceSession || !attendanceSession.isActive) {
      return NextResponse.json(
        { error: "Attendance session is not active", status: "INACTIVE_SESSION" },
        { status: 400 }
      );
    }

    // Validate member
    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: "Invalid Membership",
          status: "INVALID_MEMBERSHIP",
          message: "This QR code does not belong to a registered member.",
        },
        { status: 404 }
      );
    }

    if (member.membershipStatus !== "ACTIVE") {
      return NextResponse.json(
        {
          error: "Membership not active",
          status: "MEMBERSHIP_NOT_ACTIVE",
          message: `Member has ${member.membershipStatus} status.`,
        },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_memberId: {
          sessionId,
          memberId,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error: "Attendance Already Recorded",
          status: "DUPLICATE",
          message: `${member.firstName} ${member.lastName} has already been checked in.`,
        },
        { status: 409 }
      );
    }

    // Record attendance
    const currentSemester = getCurrentSemester();

    const [record] = await prisma.$transaction([
      prisma.attendanceRecord.create({
        data: {
          sessionId,
          memberId,
          scannedById: scannerId,
          status: "PRESENT",
        },
      }),
      // Award points
      prisma.pointsTransaction.create({
        data: {
          memberId,
          points: POINTS_MAP[attendanceSession.event.category] || 10,
          reason: `${attendanceSession.event.category.replace(/_/g, " ")} Attendance`,
          category: attendanceSession.event.category as any,
          eventId: attendanceSession.eventId,
          semester: currentSemester,
        },
      }),
      // Update user total points
      prisma.user.update({
        where: { id: memberId },
        data: {
          totalPoints: {
            increment: POINTS_MAP[attendanceSession.event.category] || 10,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Attendance Successfully Recorded for ${member.firstName} ${member.lastName}`,
      record: {
        id: record.id,
        memberName: `${member.firstName} ${member.lastName}`,
        registrationNumber: member.registrationNumber,
        timestamp: record.timestamp,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
