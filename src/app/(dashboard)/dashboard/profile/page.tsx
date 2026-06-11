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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  QrCode,
  Award,
  CalendarCheck,
  Mail,
  Phone,
  GraduationCap,
  Hash,
} from "lucide-react";
import {
  getCurrentSemester,
  attendanceScoreColor,
  attendanceScoreLabel,
  attendanceScoreBg,
} from "@/lib/utils";
import { DigitalIDCard } from "@/components/dashboard/digital-id-card";

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session?.user as any).id;
  const currentSemester = getCurrentSemester();

  const [user, totalEvents, attendedEvents, badges, points] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
      }),
      prisma.event.count({ where: { isActive: true } }),
      prisma.attendanceRecord.count({
        where: { memberId: userId, status: "PRESENT" },
      }),
      prisma.memberBadge.findMany({
        where: { memberId: userId },
        include: { badge: true },
      }),
      prisma.pointsTransaction.findMany({
        where: { memberId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  if (!user) return null;

  const attendanceScore =
    totalEvents > 0 ? Math.round((attendedEvents / totalEvents) * 100) : 0;

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Your digital membership and attendance profile
        </p>
      </div>

      {/* Digital Membership ID Card */}
      <DigitalIDCard user={user} />

      {/* Profile Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <Badge
                  variant={
                    user.membershipStatus === "ACTIVE" ? "success" : "warning"
                  }
                  className="mt-1"
                >
                  {user.membershipStatus}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reg Number:</span>
                <span className="font-mono font-medium">
                  {user.registrationNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Course:</span>
                <span>
                  {user.course} — Year {user.yearGroup}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Score */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Attendance Score
            </CardTitle>
            <CardDescription>
              Semester {currentSemester}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p
                className={`text-5xl font-bold ${attendanceScoreColor(
                  attendanceScore
                )}`}
              >
                {attendanceScore}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {attendedEvents} of {totalEvents} events attended
              </p>
            </div>

            <Progress
              value={attendanceScore}
              className="h-2"
            />

            <div
              className={`rounded-lg border px-4 py-3 text-center text-sm font-medium ${attendanceScoreBg(
                attendanceScore
              )}`}
            >
              {attendanceScoreLabel(attendanceScore)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-2xl font-bold text-primary">
                  {attendedEvents}
                </p>
                <p className="text-xs text-muted-foreground">Attended</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-2xl font-bold text-muted-foreground">
                  {totalEvents - attendedEvents}
                </p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges & Points */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-chart-4" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No badges yet. Attend events and participate to earn badges!
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {badges.map((mb) => (
                  <div
                    key={mb.id}
                    className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3"
                  >
                    <span className="text-2xl">{mb.badge.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{mb.badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mb.semester}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Recent Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            {points.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No points yet. Start attending events!
              </p>
            ) : (
              <div className="space-y-2">
                {points.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm">{p.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="success">+{p.points}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
