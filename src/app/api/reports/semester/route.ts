import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSemester } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const currentSemester = getCurrentSemester();

  const [totalMembers, totalEvents, totalAttendance, topMembers, courseBreakdown] =
    await Promise.all([
      prisma.user.count({ where: { membershipStatus: "ACTIVE" } }),
      prisma.event.count(),
      prisma.attendanceRecord.count({ where: { status: "PRESENT" } }),
      prisma.user.findMany({ orderBy: { totalPoints: "desc" }, take: 10, select: { firstName: true, lastName: true, registrationNumber: true, course: true, yearGroup: true, totalPoints: true } }),
      prisma.user.groupBy({ by: ["course"], _count: { id: true } }),
    ]);

  if (format === "csv") {
    const header = "Rank,FirstName,LastName,RegistrationNumber,Course,YearGroup,TotalPoints\n";
    const rows = topMembers
      .map((m, i) => `${i + 1},${m.firstName},${m.lastName},${m.registrationNumber},${m.course},${m.yearGroup},${m.totalPoints}`)
      .join("\n");
    return new NextResponse(header + rows, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="mucosa-report-${currentSemester}.csv"` },
    });
  }

  // Default JSON
  return NextResponse.json({
    semester: currentSemester,
    totalMembers,
    totalEvents,
    totalAttendance,
    topMembers,
    courseBreakdown,
  });
}
