"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { QrCode, Shield } from "lucide-react";

interface DigitalIDCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber: string;
    course: string;
    yearGroup: number;
    email: string;
    qrCode: string;
    membershipStatus: string;
    role: string;
    totalPoints: number;
  };
}

export function DigitalIDCard({ user }: DigitalIDCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const qrPayload = JSON.stringify({
      memberId: user.id,
      registrationNumber: user.registrationNumber,
      name: `${user.firstName} ${user.lastName}`,
    });

    QRCode.toDataURL(
      qrPayload,
      {
        width: 200,
        margin: 2,
        color: {
          dark: "#06b6d4",
          light: "#0a0a0f",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [user]);

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <Card className="glass-card neon-glow overflow-hidden">
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5" />
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-chart-4/5 rounded-full blur-2xl" />

        <CardContent className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <span className="text-sm font-bold text-primary">M</span>
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">MUCOSA</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Digital Membership Card
                </p>
              </div>
            </div>
            <Badge
              variant={
                user.membershipStatus === "ACTIVE" ? "success" : "warning"
              }
              className="text-xs"
            >
              {user.membershipStatus}
            </Badge>
          </div>

          {/* Card Body */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Member Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-bold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.course} &middot; Year {user.yearGroup}
                  </p>
                </div>
              </div>

              <div className="grid gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">Reg No:</span>
                  <span className="font-mono font-medium">
                    {user.registrationNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">Email:</span>
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">Points:</span>
                  <span className="font-bold text-warning">
                    {user.totalPoints}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Makerere University Computing Students Association
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-xl border-2 border-primary/20 bg-black/40 p-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Membership QR Code"
                    className="h-36 w-36"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center">
                    <QrCode className="h-10 w-10 text-muted-foreground animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Scan at MUCOSA events
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
