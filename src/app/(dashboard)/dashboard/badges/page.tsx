import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, ShoppingBag } from "lucide-react";

export default async function BadgesPage() {
  const session = await auth();
  const userId = (session?.user as any).id;

  const [earnedBadges, allBadges] = await Promise.all([
    prisma.memberBadge.findMany({
      where: { memberId: userId },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    }),
    prisma.badge.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Badges</h1>
        <p className="text-muted-foreground">Achievements you&apos;ve earned</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allBadges.map((badge) => {
          const earned = earnedBadges.find((eb) => eb.badgeId === badge.id);
          return (
            <Card
              key={badge.id}
              className={`glass-card ${earned ? "" : "opacity-40"}`}
            >
              <CardContent className="py-6 text-center">
                <span className="text-4xl">{badge.icon}</span>
                <h3 className="mt-3 font-semibold">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
                {earned ? (
                  <p className="mt-3 text-xs text-success font-medium">
                    Earned — {earned.semester}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Not yet earned
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {allBadges.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No badges defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
