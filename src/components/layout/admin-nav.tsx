"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarPlus,
  QrCode,
  Users,
  ClipboardCheck,
  Award,
  ScrollText,
  Gift,
  TrendingUp,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarPlus },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/badges", label: "Badges", icon: Award },
  { href: "/admin/certificates", label: "Certificates", icon: ScrollText },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
  { href: "/admin/insights", label: "Insights", icon: TrendingUp },
  { href: "/admin/semester-report", label: "Reports", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export function AdminNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <span className="text-sm font-bold text-primary">M</span>
        </div>
        <span className="font-bold text-lg tracking-tight">MUCOSA</span>
        <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
          Admin
        </span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-3">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <div className="mb-3 rounded-lg bg-secondary/50 p-3">
          <p className="text-xs font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {user?.registrationNumber}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <LayoutDashboard className="h-4 w-4" />
          Member View
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
