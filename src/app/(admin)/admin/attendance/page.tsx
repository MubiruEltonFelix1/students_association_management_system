import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { ClipboardCheck } from "lucide-react";

export default async function AdminAttendancePage() {
  const records = await prisma.attendanceRecord.findMany({
    include: {
      member: { select: { firstName: true, lastName: true, registrationNumber: true, course: true } },
      session: { include: { event: { select: { title: true, date: true } } } },
      scannedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Records</h1>
        <p className="text-muted-foreground">All check-in records across events</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Recent Records ({records.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Scanned By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-sm">
                      {r.member.firstName} {r.member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.member.registrationNumber}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{r.session.event.title}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(r.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.scannedBy.firstName} {r.scannedBy.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "PRESENT" ? "success" : "warning"}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No attendance records yet.
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
