"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function DashboardHeader({ user }: { user: any }) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="font-bold text-lg tracking-tight">MUCOSA</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
