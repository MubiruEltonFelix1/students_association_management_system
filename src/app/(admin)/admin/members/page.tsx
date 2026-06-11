import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ROLE_LABELS } from "@/lib/constants";

export default async function AdminMembersPage() {
  const members = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      registrationNumber: true,
      course: true,
      yearGroup: true,
      role: true,
      membershipStatus: true,
      totalPoints: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">{members.length} registered members</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Members
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Reg Number</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {m.firstName[0]}
                          {m.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {m.firstName} {m.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {m.registrationNumber}
                  </TableCell>
                  <TableCell className="text-sm">{m.course}</TableCell>
                  <TableCell className="text-sm">Year {m.yearGroup}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ROLE_LABELS[m.role] || m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.membershipStatus === "ACTIVE" ? "success" : "warning"
                      }
                      className="text-xs"
                    >
                      {m.membershipStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-warning">
                    {m.totalPoints}
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No members registered yet.
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
