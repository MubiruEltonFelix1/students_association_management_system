"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";

interface ScanResult {
  type: "success" | "error" | "duplicate";
  message: string;
  memberName?: string;
  registrationNumber?: string;
  timestamp?: string;
}

export default function QRScannerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [error, setError] = useState("");

  // Get the session ID for this event
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.event?.attendanceSession?.isActive) {
          setSessionId(data.event.attendanceSession.id);
        } else {
          setError("No active attendance session for this event.");
        }
      })
      .catch(() => setError("Failed to load event."));
  }, [id]);

  async function startScanner() {
    setError("");
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning while processing
          if (processing) return;

          setProcessing(true);

          try {
            const qrData = JSON.parse(decodedText);
            if (!qrData.memberId) throw new Error("Invalid QR");

            const res = await fetch("/api/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                memberId: qrData.memberId,
              }),
            });

            const data = await res.json();

            if (res.ok) {
              setLastResult({
                type: "success",
                message: data.message,
                memberName: data.record.memberName,
                registrationNumber: data.record.registrationNumber,
                timestamp: data.record.timestamp,
              });
              setScanCount((c) => c + 1);
              toast({
                title: "Attendance Recorded",
                description: data.message,
                variant: "success",
              });
            } else if (res.status === 409) {
              setLastResult({
                type: "duplicate",
                message: data.message,
              });
              toast({
                title: "Already Recorded",
                description: data.message,
                variant: "warning",
              });
            } else {
              setLastResult({
                type: "error",
                message: data.message || data.error,
              });
              toast({
                title: "Error",
                description: data.message || data.error,
                variant: "destructive",
              });
            }
          } catch (err: any) {
            setLastResult({
              type: "error",
              message: "Invalid QR code. Not a valid MUCOSA membership QR.",
            });
            toast({
              title: "Invalid QR",
              description: "This does not appear to be a valid MUCOSA membership QR code.",
              variant: "destructive",
            });
          }

          // Resume scanning after a pause
          setTimeout(() => setProcessing(false), 1500);
        },
        (err) => {
          // Scanning errors are normal (e.g., no QR in view)
        }
      );

      setScanning(true);
    } catch (err: any) {
      setError(
        err.message || "Could not start camera. Please check permissions."
      );
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const StatusIcon = lastResult?.type === "success"
    ? CheckCircle2
    : lastResult?.type === "duplicate"
    ? AlertTriangle
    : XCircle;

  const statusColor =
    lastResult?.type === "success"
      ? "text-success"
      : lastResult?.type === "duplicate"
      ? "text-warning"
      : "text-destructive";

  const statusBg =
    lastResult?.type === "success"
      ? "bg-success/10 border-success/30"
      : lastResult?.type === "duplicate"
      ? "bg-warning/10 border-warning/30"
      : "bg-destructive/10 border-destructive/30";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        href={`/admin/events/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to event
      </Link>

      {error && !sessionId ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start an attendance session first from the event page.
            </p>
            <Link href={`/admin/events/${id}`}>
              <Button variant="outline" className="mt-4">
                Go to Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Scanner View */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                QR Scanner
              </CardTitle>
              <Badge variant={scanning ? "success" : "secondary"}>
                {scanning ? "Scanning" : "Ready"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden bg-black/40"
                style={{ minHeight: scanning ? "auto" : "200px" }}
              />

              {!scanning ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Camera className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Point your camera at a member&apos;s QR code
                  </p>
                </div>
              ) : null}

              <div className="flex gap-3">
                {!scanning ? (
                  <Button
                    onClick={startScanner}
                    className="w-full gap-2"
                    disabled={!sessionId}
                  >
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={stopScanner}
                    className="w-full gap-2"
                  >
                    <CameraOff className="h-4 w-4" />
                    Stop Camera
                  </Button>
                )}
              </div>

              {scanning && (
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Ready to scan — {scanCount} check-ins
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Scan Result */}
          {lastResult && (
            <Card className={`glass-card border ${statusBg}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <StatusIcon className={`h-6 w-6 mt-0.5 ${statusColor}`} />
                  <div className="flex-1">
                    <p className={`font-semibold ${statusColor}`}>
                      {lastResult.type === "success"
                        ? "Attendance Successfully Recorded"
                        : lastResult.type === "duplicate"
                        ? "Attendance Already Recorded"
                        : "Invalid Membership"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lastResult.message}
                    </p>
                    {lastResult.memberName && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg bg-background/50 p-3">
                        <UserCheck className="h-5 w-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">
                            {lastResult.memberName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lastResult.registrationNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
