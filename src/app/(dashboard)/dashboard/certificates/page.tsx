import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollText, Download, ExternalLink } from "lucide-react";
import { CERTIFICATE_CATEGORY_LABELS } from "@/lib/constants";
import Link from "next/link";

export default async function CertificatesPage() {
  const session = await auth();
  const userId = (session?.user as any).id;

  const certificates = await prisma.certificate.findMany({
    where: { memberId: userId },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground">
          Download your achievement certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            <ScrollText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No certificates earned yet.</p>
            <p className="text-sm mt-1">
              Attend events and participate actively to earn certificates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline">
                    {CERTIFICATE_CATEGORY_LABELS[cert.category] || cert.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{cert.achievement}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Semester: {cert.semester}
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <Link href={`/api/certificates/${cert.id}/pdf`}>
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                    <Link href={`/verify/${cert.verificationCode}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Verify
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
