"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Award, Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", criteriaType: "attendance_percentage", criteriaThreshold: "90" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/badges")
      .then((r) => r.json())
      .then((d) => {
        setBadges(d.badges || []);
        setLoading(false);
      });
  }, []);

  async function createBadge() {
    setSubmitting(true);
    const res = await fetch("/api/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        icon: form.icon,
        criteria: {
          type: form.criteriaType,
          threshold: parseInt(form.criteriaThreshold),
        },
      }),
    });
    if (res.ok) {
      toast({ title: "Badge created", variant: "success" });
      setOpen(false);
      const data = await res.json();
      setBadges([...badges, data.badge]);
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
          <p className="text-muted-foreground">Define and manage achievement badges</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Badge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input
                  placeholder="🏆"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Attendance Champion"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Awarded for..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Criteria Threshold (%)</Label>
                <Input
                  type="number"
                  value={form.criteriaThreshold}
                  onChange={(e) =>
                    setForm({ ...form, criteriaThreshold: e.target.value })
                  }
                />
              </div>
              <Button onClick={createBadge} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-chart-4" />
            All Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Criteria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-2xl">{b.icon}</TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {b.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {(b.criteria as any)?.type}: {(b.criteria as any)?.threshold}%
                  </TableCell>
                </TableRow>
              ))}
              {badges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No badges defined. Create the first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
