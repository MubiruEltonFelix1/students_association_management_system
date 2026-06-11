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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";
import { getCurrentSemester } from "@/lib/utils";

export default async function LeaderboardPage() {
  const session = await auth();
  const currentSemester = getCurrentSemester();

  const members = await prisma.user.findMany({
    where: { membershipStatus: "ACTIVE" },
    orderBy: { totalPoints: "desc" },
    take: 50,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      registrationNumber: true,
      course: true,
      yearGroup: true,
      totalPoints: true,
    },
  });

  // Calculate attendance scores
  const totalEvents = await prisma.event.count({ where: { isActive: true } });
  const attendanceCounts = await prisma.attendanceRecord.groupBy({
    by: ["memberId"],
    where: { status: "PRESENT" },
    _count: { id: true },
  });

  const memberScores = members.map((m) => {
    const count =
      attendanceCounts.find((a) => a.memberId === m.id)?._count.id ?? 0;
    const attendanceScore =
      totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
    return { ...m, attendanceScore, eventsAttended: count };
  });

  const top3 = memberScores.slice(0, 3);
  const rest = memberScores.slice(3);

  const rankIcon = (rank: number) => {
    if (rank === 0)
      return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 1)
      return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 2)
      return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          Semester {currentSemester} rankings
        </p>
      </div>

      {/* Top 3 - Hall of Fame */}
      {top3.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {top3.map((m, i) => (
            <Card
              key={m.id}
              className={`glass-card text-center ${
                i === 0 ? "neon-glow border-warning/30" : ""
              }`}
            >
              <CardContent className="py-6">
                <div className="flex justify-center mb-3">{rankIcon(i)}</div>
                <Avatar className="h-14 w-14 mx-auto border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {m.firstName[0]}
                    {m.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-bold text-lg">
                  {m.firstName} {m.lastName}
                </h3>
                <p className="text-xs text-muted-foreground">{m.course}</p>
                <p className="text-xs text-muted-foreground">
                  Year {m.yearGroup}
                </p>
                <div className="mt-3 flex justify-center gap-3">
                  <Badge variant="warning" className="text-sm">
                    {m.totalPoints} pts
                  </Badge>
                  <Badge variant="success" className="text-sm">
                    {m.attendanceScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Rankings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            All Rankings
          </CardTitle>
          <CardDescription>
            Based on attendance, points, and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rest.length === 0 && top3.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No members ranked yet. Start attending events!
            </p>
          ) : (
            <div className="space-y-2">
              {rest.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                      {i + 4}
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-success font-medium">
                      {m.attendanceScore}%
                    </span>
                    <Badge variant="warning">{m.totalPoints} pts</Badge>
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
