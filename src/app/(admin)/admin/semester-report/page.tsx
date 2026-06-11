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
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet, FileType } from "lucide-react";
import { getCurrentSemester } from "@/lib/utils";

export default async function SemesterReportPage() {
  const session = await auth();
  const currentSemester = getCurrentSemester();

  const [totalMembers, totalEvents, totalAttendance, topMembers, courseBreakdown, yearBreakdown] =
    await Promise.all([
      prisma.user.count({ where: { membershipStatus: "ACTIVE" } }),
      prisma.event.count(),
      prisma.attendanceRecord.count({ where: { status: "PRESENT" } }),
      prisma.user.findMany({ orderBy: { totalPoints: "desc" }, take: 10, select: { firstName: true, lastName: true, course: true, yearGroup: true, totalPoints: true } }),
      prisma.user.groupBy({ by: ["course"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.user.groupBy({ by: ["yearGroup"], _count: { id: true } }),
    ]);

  const attendanceRate = totalMembers > 0
    ? Math.round((totalAttendance / (totalMembers * (totalEvents || 1))) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Semester Report</h1>
          <p className="text-muted-foreground">
            End-of-semester analytics — {currentSemester}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" asChild>
            <a href="/api/reports/semester?format=pdf" download>
              <FileType className="h-4 w-4" />
              PDF
            </a>
          </Button>
          <Button variant="outline" className="gap-1.5" asChild>
            <a href="/api/reports/semester?format=csv" download>
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </a>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="py-6 text-center">
            <p className="text-3xl font-bold text-primary">{totalMembers}</p>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-6 text-center">
            <p className="text-3xl font-bold text-success">{totalEvents}</p>
            <p className="text-sm text-muted-foreground">Events Held</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-6 text-center">
            <p className="text-3xl font-bold text-warning">{attendanceRate}%</p>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Top 10 Most Active Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topMembers.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.course} &middot; Year {m.yearGroup}
                    </p>
                  </div>
                </div>
                <Badge variant="warning">{m.totalPoints} pts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course & Year */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Most Engaged Course</CardTitle>
          </CardHeader>
          <CardContent>
            {courseBreakdown.map((c) => (
              <div key={c.course} className="flex justify-between py-1">
                <span className="text-sm">{c.course}</span>
                <Badge variant="secondary">{c._count.id}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Most Active Year Group</CardTitle>
          </CardHeader>
          <CardContent>
            {yearBreakdown.map((y) => (
              <div key={y.yearGroup} className="flex justify-between py-1">
                <span className="text-sm">Year {y.yearGroup}</span>
                <Badge variant="secondary">{y._count.id}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
