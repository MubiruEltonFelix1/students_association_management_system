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
import {
  CalendarPlus,
  MapPin,
  Clock,
  Users,
  QrCode,
  Plus,
} from "lucide-react";
import { EVENT_CATEGORY_LABELS } from "@/lib/constants";
import Link from "next/link";

export default async function EventsPage() {
  const session = await auth();

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      attendanceSession: {
        select: {
          id: true,
          isActive: true,
          _count: { select: { records: true } },
        },
      },
    },
  });

  const upcomingEvents = events.filter(
    (e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );
  const pastEvents = events.filter(
    (e) => new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage MUCOSA events and attendance sessions
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2 neon-glow">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-primary" />
          Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              No upcoming events. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const sessionActive = event.attendanceSession?.isActive;
              const attendeeCount =
                event.attendanceSession?._count?.records ?? 0;

              return (
                <Link key={event.id} href={`/admin/events/${event.id}`}>
                  <Card className="glass-card h-full transition-all hover:border-primary/30 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="text-xs">
                          {EVENT_CATEGORY_LABELS[event.category] || event.category}
                        </Badge>
                        {sessionActive && (
                          <Badge
                            variant="success"
                            className="text-xs animate-pulse"
                          >
                            Live
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleDateString("en-UG", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.venue}
                      </div>
                      {event.maxCapacity && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {attendeeCount} / {event.maxCapacity}
                        </div>
                      )}
                      {sessionActive && (
                        <div className="mt-3 flex items-center gap-2 text-primary">
                          <QrCode className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Session open — ready to scan
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            Past Events
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <Link key={event.id} href={`/admin/events/${event.id}`}>
                <Card className="glass-card h-full opacity-60 hover:opacity-100 transition-all">
                  <CardHeader>
                    <Badge variant="outline" className="text-xs">
                      {EVENT_CATEGORY_LABELS[event.category] || event.category}
                    </Badge>
                    <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.date).toLocaleDateString("en-UG", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
