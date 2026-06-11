"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, CalendarPlus } from "lucide-react";
import { EVENT_CATEGORY_LABELS } from "@/lib/constants";
import Link from "next/link";

const categories = Object.entries(EVENT_CATEGORY_LABELS);

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    maxCapacity: "",
    organizingCommunity: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        category: form.category,
        date: new Date(form.date).toISOString(),
        time: form.time,
        venue: form.venue,
        description: form.description || undefined,
        maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
        organizingCommunity: form.organizingCommunity || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create event");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/events/${data.event.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to events
      </Link>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <CalendarPlus className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in event details. You can open an attendance session after creating.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., AI/ML Workshop Series"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                placeholder="e.g., CEDAT Conference Hall"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Event description, agenda, speakers..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 200"
                  value={form.maxCapacity}
                  onChange={(e) =>
                    setForm({ ...form, maxCapacity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="community">Organizing Community</Label>
                <Input
                  id="community"
                  placeholder="e.g., AI/ML Community"
                  value={form.organizingCommunity}
                  onChange={(e) =>
                    setForm({ ...form, organizingCommunity: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Event"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
