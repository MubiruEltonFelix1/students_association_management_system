"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  QrCode,
  Play,
  StopCircle,
  Loader2,
  UserCheck,
} from "lucide-react";
import { EVENT_CATEGORY_LABELS, ROLE_LABELS } from "@/lib/constants";
import { toast } from "@/components/ui/toaster";

interface EventDetail {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description: string | null;
  maxCapacity: number | null;
  organizingCommunity: string | null;
  attendanceSession: {
    id: string;
    isActive: boolean;
    openedAt: string;
    records: Array<{
      id: string;
      timestamp: string;
      status: string;
      member: {
        id: string;
        firstName: string;
        lastName: string;
        registrationNumber: string;
        course: string;
        yearGroup: number;
      };
    }>;
  } | null;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data.event);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleStartSession() {
    if (!event) return;
    setActionLoading(true);
    const res = await fetch("/api/attendance/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: "Session started", variant: "success" });
      router.refresh();
      window.location.reload();
    } else {
      toast({ title: data.error || "Failed", variant: "destructive" });
    }
    setActionLoading(false);
  }

  async function handleCloseSession() {
    if (!event?.attendanceSession) return;
    setActionLoading(true);
    const res = await fetch("/api/attendance/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: event.attendanceSession.id }),
    });
    if (res.ok) {
      toast({ title: "Session closed", variant: "success" });
      window.location.reload();
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Event not found.
      </div>
    );
  }

  const sessionActive = event.attendanceSession?.isActive;
  const attendeeCount = event.attendanceSession?.records?.length ?? 0;

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to events
      </Link>

      {/* Event Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <Badge variant="outline" className="mb-2">
                {EVENT_CATEGORY_LABELS[event.category] || event.category}
              </Badge>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
            </div>
            {sessionActive ? (
              <Badge variant="success" className="text-sm animate-pulse">
                Session Live
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-sm">
                No Active Session
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(event.date).toLocaleDateString("en-UG", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at {event.time}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </div>
            {event.maxCapacity && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {attendeeCount} / {event.maxCapacity} attended
              </div>
            )}
            {event.organizingCommunity && (
              <div className="text-muted-foreground">
                Hosted by: {event.organizingCommunity}
              </div>
            )}
          </div>

          <Separator />

          {/* Session Actions */}
          <div className="flex flex-wrap gap-3">
            {!sessionActive ? (
              <Button
                onClick={handleStartSession}
                disabled={actionLoading}
                className="gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Attendance Session
              </Button>
            ) : (
              <>
                <Link href={`/admin/events/${event.id}/scan`}>
                  <Button className="gap-2 neon-glow">
                    <QrCode className="h-4 w-4" />
                    Scan QR Codes
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleCloseSession}
                  disabled={actionLoading}
                  className="gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  Close Session
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendees */}
      {event.attendanceSession && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              Attendees ({attendeeCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendeeCount === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No attendees yet. Start scanning!
              </p>
            ) : (
              <div className="space-y-2">
                {event.attendanceSession.records.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {r.member.firstName} {r.member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.member.registrationNumber} &middot;{" "}
                        {r.member.course}
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
      )}
    </div>
  );
}
