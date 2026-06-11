import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getCurrentSemester,
  attendanceScoreColor,
  attendanceScoreLabel,
  attendanceScoreBg,
} from "@/lib/utils";
import { CalendarCheck, TrendingUp } from "lucide-react";

export default async function AttendancePage() {
  const session = await auth();
  const userId = (session?.user as any).id;
  const currentSemester = getCurrentSemester();

  const [totalEvents, records, user] = await Promise.all([
    prisma.event.count({ where: { isActive: true } }),
    prisma.attendanceRecord.findMany({
      where: { memberId: userId, status: "PRESENT" },
      include: {
        session: {
          include: {
            event: { select: { id: true, title: true, category: true, date: true, venue: true } },
          },
        },
      },
      orderBy: { timestamp: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    }),
  ]);

  const attendedCount = records.length;
  const missedCount = totalEvents - attendedCount;
  const score = totalEvents > 0 ? Math.round((attendedCount / totalEvents) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">Semester {currentSemester}</p>
      </div>

      {/* Score Card */}
      <Card className="glass-card">
        <CardContent className="py-8 text-center">
          <p className={`text-6xl font-bold ${attendanceScoreColor(score)}`}>
            {score}%
          </p>
          <p className="mt-2 text-muted-foreground">
            {attendedCount} of {totalEvents} events attended
          </p>
          <Progress value={score} className="mt-4 h-2 max-w-xs mx-auto" />
          <div className={`mt-4 inline-block rounded-lg border px-4 py-2 text-sm font-medium ${attendanceScoreBg(score)}`}>
            {attendanceScoreLabel(score)}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="rounded-lg bg-success/10 p-4">
              <p className="text-2xl font-bold text-success">{attendedCount}</p>
              <p className="text-xs text-muted-foreground">Attended</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-4">
              <p className="text-2xl font-bold text-destructive">{missedCount}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No attendance records yet.
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {r.session.event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.session.event.venue} &middot;{" "}
                      {new Date(r.session.event.date).toLocaleDateString("en-UG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">Present</Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
