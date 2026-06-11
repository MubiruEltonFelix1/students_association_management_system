import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX } from "lucide-react";
import { CERTIFICATE_CATEGORY_LABELS } from "@/lib/constants";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: { member: { select: { firstName: true, lastName: true, registrationNumber: true, course: true } } },
  });

  if (!certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="glass-card max-w-md w-full text-center">
          <CardContent className="py-12">
            <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-destructive">Invalid Certificate</h1>
            <p className="text-muted-foreground mt-2">
              This verification code does not match any issued certificate.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="glass-card max-w-md w-full">
        <CardContent className="py-12 text-center">
          <ShieldCheck className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-xl font-bold text-success">Certificate Verified</h1>
          <p className="text-2xl font-bold mt-4">
            {certificate.member.firstName} {certificate.member.lastName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {certificate.member.registrationNumber}
          </p>
          <div className="mt-4 space-y-2">
            <Badge variant="outline">
              {CERTIFICATE_CATEGORY_LABELS[certificate.category] || certificate.category}
            </Badge>
            <p className="text-sm font-medium">{certificate.achievement}</p>
            <p className="text-xs text-muted-foreground">
              Semester {certificate.semester} &middot; Issued{" "}
              {new Date(certificate.issuedAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Issued by Makerere University Computing Students Association (MUCOSA)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
