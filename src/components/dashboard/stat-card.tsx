import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "blue" | "cyan" | "green" | "red" | "amber";
};

const tones = {
  blue: "text-life-blue bg-life-blue/10 border-life-blue/25",
  cyan: "text-life-cyan bg-life-cyan/10 border-life-cyan/25",
  green: "text-life-green bg-life-green/10 border-life-green/25",
  red: "text-life-red bg-life-red/10 border-life-red/25",
  amber: "text-life-amber bg-life-amber/10 border-life-amber/25"
};

export function StatCard({ label, value, icon: Icon, tone = "blue" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-md border", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          <p className="text-sm text-life-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
