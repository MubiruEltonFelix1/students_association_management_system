import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, QrCode, Users, Award, BarChart3 } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as any).role;
    if (
      [
        "PRESIDENT",
        "VICE_PRESIDENT",
        "GENERAL_SECRETARY",
        "ASST_GEN_SECRETARY",
        "SPEAKER",
        "TECHNICAL_DIRECTOR",
        "SUPER_ADMIN",
      ].includes(role)
    ) {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <span className="text-sm font-bold text-primary">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight">MUCOSA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 neon-glow"
            >
              Join MUCOSA
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-16 sm:pt-32 sm:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <QrCode className="h-3.5 w-3.5" />
                Digital Membership &amp; Attendance System
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Your{" "}
                <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
                  Digital
                </span>{" "}
                MUCOSA Identity
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                One scan. Instant check-in. Track your attendance, earn badges,
                climb the leaderboard, and build your computing journey — all
                from your digital membership card.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 neon-glow"
                >
                  Get Your Digital ID
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-8 py-3.5 text-base font-medium text-foreground transition-all hover:bg-secondary"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card rounded-xl p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">QR Check-In</h3>
                <p className="text-sm text-muted-foreground">
                  Scan your digital ID at any MUCOSA event. Instant, seamless
                  attendance tracking.
                </p>
              </div>
              <div className="glass-card rounded-xl p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <h3 className="mb-2 font-semibold">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Collect points, unlock badges, and earn certificates for your
                  participation.
                </p>
              </div>
              <div className="glass-card rounded-xl p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                  <BarChart3 className="h-5 w-5 text-chart-4" />
                </div>
                <h3 className="mb-2 font-semibold">Leaderboard</h3>
                <p className="text-sm text-muted-foreground">
                  Compete with peers. See where you rank each semester.
                </p>
              </div>
              <div className="glass-card rounded-xl p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <h3 className="mb-2 font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join workshops, hackathons, and innovation challenges. Build
                  together.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>Makerere University Computing Students Association &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
