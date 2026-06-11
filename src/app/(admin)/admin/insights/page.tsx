import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { getCurrentSemester } from "@/lib/utils";

export default async function AdminInsightsPage() {
  const session = await auth();
  const currentSemester = getCurrentSemester();

  const [
    totalMembers,
    totalEvents,
    courseBreakdown,
    yearBreakdown,
    eventCategoryBreakdown,
    zeroAttendanceMembers,
    topCourse,
  ] = await Promise.all([
    prisma.user.count({ where: { membershipStatus: "ACTIVE" } }),
    prisma.event.count(),
    prisma.user.groupBy({ by: ["course"], _count: { id: true } }),
    prisma.user.groupBy({ by: ["yearGroup"], _count: { id: true } }),
    prisma.event.groupBy({ by: ["category"], _count: { id: true } }),
    prisma.user.findMany({
      where: {
        membershipStatus: "ACTIVE",
        attendanceRecords: { none: {} },
      },
      select: { id: true, firstName: true, lastName: true, course: true },
    }),
    prisma.user.groupBy({ by: ["course"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 1 }),
  ]);

  const totalAttendanceRecords = await prisma.attendanceRecord.count({ where: { status: "PRESENT" } });
  const engagementScore = totalMembers > 0 ? Math.round((totalAttendanceRecords / (totalMembers * (totalEvents || 1))) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Insights</h1>
        <p className="text-muted-foreground">
          Data-driven recommendations and analytics
        </p>
      </div>

      {/* Key Questions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Most Active Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {topCourse[0]?.course || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {topCourse[0]?._count?.id || 0} members
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Semester Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{engagementScore}%</p>
            <Progress value={engagementScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Never Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">
              {zeroAttendanceMembers.length}
            </p>
            <p className="text-xs text-muted-foreground">members with zero attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Course & Year Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Members by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courseBreakdown.map((c) => (
                <div key={c.course} className="flex items-center justify-between">
                  <span className="text-sm">{c.course}</span>
                  <Badge variant="secondary">{c._count.id}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Members by Year Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yearBreakdown.map((y) => (
                <div key={y.yearGroup} className="flex items-center justify-between">
                  <span className="text-sm">Year {y.yearGroup}</span>
                  <Badge variant="secondary">{y._count.id}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zero Attendance Members */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Members With Zero Attendance
          </CardTitle>
          <CardDescription>
            These members have never attended any event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zeroAttendanceMembers.length === 0 ? (
            <p className="text-sm text-success py-4 text-center">
              All members have attended at least one event!
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {zeroAttendanceMembers.slice(0, 10).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                >
                  <p className="text-sm">
                    {m.firstName} {m.lastName}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {m.course}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {zeroAttendanceMembers.length > 0 && (
            <p>
              • <strong>{zeroAttendanceMembers.length} members</strong> have never attended. Consider sending them a reminder or checking if they&apos;re aware of MUCOSA events.
            </p>
          )}
          {engagementScore < 50 && (
            <p>
              • Overall engagement is below 50%. Try introducing more varied event types or collecting member feedback.
            </p>
          )}
          {engagementScore >= 70 && (
            <p>
              • Engagement is strong at {engagementScore}%. Keep the momentum — consider introducing specialized workshops or advanced challenges.
            </p>
          )}
          <p>
            • The most active course is <strong>{topCourse[0]?.course || "N/A"}</strong>. Consider targeted outreach to other courses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
