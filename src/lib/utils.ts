import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-UG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  return time;
}

export function getCurrentSemester(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 8 && month <= 12) return `${year}-S1`;
  return `${year}-S2`;
}

export function getSemesterLabel(semester: string): string {
  const [year, s] = semester.split("-");
  return s === "S1" ? `Semester 1, ${year} (Aug\u2013Dec)` : `Semester 2, ${year} (Jan\u2013May)`;
}

export function attendanceScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

export function attendanceScoreLabel(score: number): string {
  if (score >= 90) return "Excellent Participation";
  if (score >= 70) return "Good Participation";
  if (score >= 50) return "Needs Improvement";
  return "Poor Attendance";
}

export function attendanceScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (score >= 70) return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
  if (score >= 50) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  return "bg-red-500/10 border-red-500/30 text-red-400";
}
