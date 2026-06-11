"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Loader2, Sparkles } from "lucide-react";
import { REWARD_CATEGORY_LABELS } from "@/lib/constants";
import { toast } from "@/components/ui/toaster";
import { getCurrentSemester } from "@/lib/utils";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const currentSemester = getCurrentSemester();

  useEffect(() => {
    fetch("/api/rewards")
      .then((r) => r.json())
      .then((d) => {
        setRewards(d.rewards || []);
        setLoading(false);
      });
  }, []);

  async function evaluateRewards() {
    setEvaluating(true);
    const res = await fetch("/api/rewards", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast({ title: "Rewards evaluated!", description: `${data.awarded} members rewarded.`, variant: "success" });
      setRewards(data.rewards || []);
    } else {
      toast({ title: data.error || "Failed", variant: "destructive" });
    }
    setEvaluating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rewards Engine</h1>
          <p className="text-muted-foreground">
            Auto-evaluate and award outstanding members
          </p>
        </div>
        <Button onClick={evaluateRewards} disabled={evaluating} className="gap-2 neon-glow">
          {evaluating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Evaluate Semester {currentSemester}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(REWARD_CATEGORY_LABELS).map(([key, label]) => {
          const awarded = rewards.filter(
            (r: any) => r.category === key && r.semester === currentSemester
          );
          return (
            <Card key={key} className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  {label}
                </CardTitle>
                <CardDescription>
                  {awarded.length > 0
                    ? `${awarded.length} member(s) awarded`
                    : "Not yet awarded"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {awarded.length > 0 ? (
                  <div className="space-y-2">
                    {awarded.map((r: any) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                      >
                        <p className="text-sm font-medium">
                          {r.member?.firstName} {r.member?.lastName}
                        </p>
                        <Badge variant="success">
                          {new Date(r.awardedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Run evaluation to award members.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
