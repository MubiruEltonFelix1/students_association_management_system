import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTHORIZED_SCAN_ROLES } from "@/lib/constants";
import { getCurrentSemester } from "@/lib/utils";

export async function GET() {
  const members = await prisma.user.findMany({
    where: { membershipStatus: "ACTIVE" },
    orderBy: { totalPoints: "desc" },
    take: 50,
    select: {
      id: true, firstName: true, lastName: true,
      course: true, yearGroup: true, totalPoints: true, registrationNumber: true,
    },
  });

  const totalEvents = await prisma.event.count({ where: { isActive: true } });
  const attendanceCounts = await prisma.attendanceRecord.groupBy({
    by: ["memberId"], where: { status: "PRESENT" }, _count: { id: true },
  });

  const leaderboard = members.map((m) => {
    const count = attendanceCounts.find((a) => a.memberId === m.id)?._count.id ?? 0;
    return {
      ...m,
      attendanceScore: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
      eventsAttended: count,
    };
  });

  return NextResponse.json({ leaderboard });
}

// Evaluate rewards
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (!AUTHORIZED_SCAN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentSemester = getCurrentSemester();
  const members = await prisma.user.findMany({
    where: { membershipStatus: "ACTIVE" },
    include: {
      _count: { select: { attendanceRecords: true } },
    },
  });

  const totalEvents = await prisma.event.count();
  const awarded: any[] = [];

  for (const m of members) {
    const score = totalEvents > 0 ? (m._count.attendanceRecords / totalEvents) * 100 : 0;

    const categories: string[] = [];
    if (score >= 90) categories.push("ATTENDANCE_CHAMPION");
    if (score >= 80) categories.push("MOST_CONSISTENT");
    if (m.totalPoints >= 200) categories.push("TOP_INNOVATOR");
    if (m.course.includes("Computer Science") && score >= 70) categories.push("COMMUNITY_CONTRIBUTOR");

    for (const cat of categories) {
      const existing = await prisma.reward.findUnique({
        where: { memberId_category_semester: { memberId: m.id, category: cat as any, semester: currentSemester } },
      });
      if (!existing) {
        const reward = await prisma.reward.create({
          data: {
            memberId: m.id,
            category: cat as any,
            semester: currentSemester,
            criteria: { attendanceScore: Math.round(score), totalPoints: m.totalPoints },
          },
        });
        awarded.push(reward);
      }
    }
  }

  const rewards = await prisma.reward.findMany({
    where: { semester: currentSemester },
    include: { member: { select: { firstName: true, lastName: true } } },
  });

  return NextResponse.json({ awarded: awarded.length, rewards });
}
