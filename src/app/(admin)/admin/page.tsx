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
import {
  Users,
  CalendarCheck,
  UserCheck,
  UserX,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { getCurrentSemester } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  const currentSemester = getCurrentSemester();

  const [
    totalMembers,
    activeMembers,
    totalEvents,
    totalAttendanceRecords,
    recentSessions,
    topAttendees,
    eventsByCategory,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { membershipStatus: "ACTIVE" } }),
    prisma.event.count({ where: { isActive: true } }),
    prisma.attendanceRecord.count({ where: { status: "PRESENT" } }),
    prisma.attendanceSession.findMany({
      where: { isActive: true },
      include: {
        event: { select: { title: true, category: true, date: true } },
        _count: { select: { records: true } },
      },
      orderBy: { openedAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      orderBy: { totalPoints: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        course: true,
        totalPoints: true,
      },
    }),
    prisma.event.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ]);

  const attendancePercentage =
    totalMembers > 0
      ? Math.round((totalAttendanceRecords / (totalMembers * (totalEvents || 1))) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time attendance analytics &amp; insights
          </p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground neon-glow"
        >
          <CalendarCheck className="h-4 w-4" />
          Manage Events
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMembers} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Held
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentSessions.length} active sessions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Check-Ins
            </CardTitle>
            <UserCheck className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">
              {totalAttendanceRecords}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ~{attendancePercentage}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Semester
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-warning">
              {currentSemester}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Active Attendance Sessions</CardTitle>
          <CardDescription>
            Currently open sessions ready for check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No active sessions. Start one from the Events page.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                >
                  <div>
                    <p className="font-medium">{s.event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.event.category.replace("_", " ")} &middot;{" "}
                      {new Date(s.event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">{s._count.records} checked in</Badge>
                    <Link
                      href={`/admin/events/${s.eventId}/scan`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Scan QR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Members & Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-warning" />
              Top Members by Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAttendees.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-warning/20 text-warning"
                          : i === 1
                          ? "bg-muted-foreground/20 text-muted-foreground"
                          : i === 2
                          ? "bg-chart-2/20 text-chart-2"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.course}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">{m.totalPoints} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Events by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventsByCategory.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                >
                  <p className="text-sm">{cat.category.replace(/_/g, " ")}</p>
                  <Badge variant="secondary">{cat._count.id}</Badge>
                </div>
              ))}
              {eventsByCategory.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No events created yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
