"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/card";
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
import { ScrollText, Plus, Loader2, Download } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { CERTIFICATE_CATEGORY_LABELS } from "@/lib/constants";
import Link from "next/link";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: "", category: "", achievement: "", semester: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/certificates").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ]).then(([certData, memberData]) => {
      setCertificates(certData.certificates || []);
      setMembers(memberData.members || []);
      setLoading(false);
    });
  }, []);

  async function issueCertificate() {
    setSubmitting(true);
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: form.memberId,
        category: form.category,
        achievement: form.achievement,
        semester: form.semester,
      }),
    });
    if (res.ok) {
      toast({ title: "Certificate issued", variant: "success" });
      setOpen(false);
      const data = await res.json();
      setCertificates([data.certificate, ...certificates]);
    } else {
      const err = await res.json();
      toast({ title: err.error || "Failed", variant: "destructive" });
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">Issue achievement certificates to members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Member</Label>
                <Select
                  value={form.memberId}
                  onValueChange={(v) => setForm({ ...form, memberId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.registrationNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CERTIFICATE_CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Achievement</Label>
                <Input
                  placeholder="e.g., 95% Attendance Excellence"
                  value={form.achievement}
                  onChange={(e) =>
                    setForm({ ...form, achievement: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input
                  placeholder="2024-S2"
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: e.target.value })
                  }
                />
              </div>
              <Button onClick={issueCertificate} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Issued Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Achievement</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm font-medium">
                    {c.member?.firstName} {c.member?.lastName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {CERTIFICATE_CATEGORY_LABELS[c.category] || c.category}
                  </TableCell>
                  <TableCell className="text-sm">{c.achievement}</TableCell>
                  <TableCell className="text-sm">{c.semester}</TableCell>
                  <TableCell>
                    <Link href={`/api/certificates/${c.id}/pdf`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {certificates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No certificates issued yet.
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
