import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = (session?.user as any).id;

  const notifications = await prisma.notification.findMany({
    where: { memberId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const isAdmin = ["PRESIDENT", "VICE_PRESIDENT", "GENERAL_SECRETARY", "ASST_GEN_SECRETARY", "SPEAKER", "TECHNICAL_DIRECTOR", "SUPER_ADMIN"].includes(
    (session?.user as any).role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Send and manage notifications" : "Your notifications"}
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between rounded-lg p-4 ${
                    n.isRead ? "bg-secondary/20" : "bg-primary/5 border border-primary/10"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${n.isRead ? "" : "text-primary"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {n.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
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
