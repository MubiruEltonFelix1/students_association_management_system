import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { member: true },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${certificate.verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  // Generate a simple HTML certificate
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate — ${certificate.achievement}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; }
    .cert { width: 900px; height: 650px; margin: 0 auto; padding: 60px; border: 6px solid #06b6d4; border-radius: 12px; text-align: center; position: relative; }
    .cert::before { content: ''; position: absolute; inset: 12px; border: 2px solid rgba(6,182,212,0.3); border-radius: 4px; pointer-events: none; }
    .logo { color: #06b6d4; font-size: 14px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px; }
    h1 { font-size: 32px; color: #0a0a0f; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 30px; }
    .name { font-size: 36px; font-weight: bold; color: #06b6d4; margin-bottom: 20px; }
    .body { font-size: 16px; color: #334155; line-height: 1.6; max-width: 500px; margin: 0 auto 30px; }
    .details { display: flex; justify-content: center; gap: 50px; margin-bottom: 30px; }
    .detail-item { text-align: center; }
    .detail-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
    .detail-value { font-size: 14px; color: #0a0a0f; font-weight: bold; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
    .signature { width: 150px; border-top: 1px solid #06b6d4; padding-top: 4px; font-size: 11px; color: #64748b; }
    .qr { text-align: center; }
    .qr img { width: 80px; }
    .qr-label { font-size: 8px; color: #94a3b8; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">MUCOSA</div>
    <h1>Certificate of Achievement</h1>
    <p class="subtitle">Makerere University Computing Students Association</p>
    <p class="name">${certificate.member.firstName} ${certificate.member.lastName}</p>
    <p class="body">This certificate is awarded for <strong>${certificate.achievement}</strong> in recognition of outstanding participation and dedication during Semester ${certificate.semester}.</p>
    <div class="details">
      <div class="detail-item">
        <div class="detail-label">Registration Number</div>
        <div class="detail-value">${certificate.member.registrationNumber}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Semester</div>
        <div class="detail-value">${certificate.semester}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Issued</div>
        <div class="detail-value">${new Date(certificate.issuedAt).toLocaleDateString()}</div>
      </div>
    </div>
    <div class="footer">
      <div class="signature">MUCOSA President</div>
      <div class="qr">
        <img src="${qrDataUrl}" alt="Verification QR" />
        <div class="qr-label">Scan to verify</div>
      </div>
      <div class="signature">General Secretary</div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html", "Content-Disposition": `inline; filename="certificate-${certificate.member.registrationNumber}.html"` },
  });
}
