import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarCheck,
  Award,
  TrendingUp,
  Clock,
  Trophy,
} from "lucide-react";
import { getCurrentSemester, attendanceScoreColor } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any).id;
  const currentSemester = getCurrentSemester();

  const [user, totalEvents, attendedEvents, totalPoints, recentAttendance, badges] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          registrationNumber: true,
          course: true,
          yearGroup: true,
          totalPoints: true,
          role: true,
          membershipStatus: true,
        },
      }),
      prisma.event.count({ where: { isActive: true } }),
      prisma.attendanceRecord.count({
        where: {
          memberId: userId,
          status: "PRESENT",
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      }),
      prisma.attendanceRecord.findMany({
        where: { memberId: userId, status: "PRESENT" },
        include: {
          session: {
            include: {
              event: { select: { title: true, category: true, date: true } },
            },
          },
        },
        orderBy: { timestamp: "desc" },
        take: 5,
      }),
      prisma.memberBadge.count({
        where: { memberId: userId },
      }),
    ]);

  const attendanceScore =
    totalEvents > 0
      ? Math.round((attendedEvents / totalEvents) * 100)
      : 0;

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">{user?.course} &middot; Year {user?.yearGroup}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Score
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={attendanceScoreColor(attendanceScore)}>
                {attendanceScore}%
              </span>
            </div>
            <Progress value={attendanceScore} className="mt-2 h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">
              {attendedEvents} of {totalEvents} events
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
            <Award className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {totalPoints?.totalPoints ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep attending to earn more
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges Earned
            </CardTitle>
            <Trophy className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">{badges}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Semester {currentSemester}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                user?.membershipStatus === "ACTIVE" ? "success" : "warning"
              }
            >
              {user?.membershipStatus}
            </Badge>
            <p className="mt-1 text-xs text-muted-foreground">
              {user?.role === "MEMBER" ? "Member" : user?.role}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No attendance records yet. Get started by attending a MUCOSA event!
              </p>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {record.session.event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString("en-UG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant="success" className="text-xs">
                      Present
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:bg-secondary/50 hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="font-medium">My Digital ID</p>
                <p className="text-xs text-muted-foreground">
                  View your membership card and QR code
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/leaderboard"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:bg-secondary/50 hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Trophy className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium">Leaderboard</p>
                <p className="text-xs text-muted-foreground">
                  See how you rank among peers
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/badges"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:bg-secondary/50 hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Award className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="font-medium">My Badges</p>
                <p className="text-xs text-muted-foreground">
                  View your earned achievements
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
