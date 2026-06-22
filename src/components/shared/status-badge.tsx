import { Badge } from "@/components/ui/badge";
import { clientStatuses, labelFor, projectStatuses, taskStatuses } from "@/constants/options";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  value: string;
  type: "task" | "project" | "client";
};

const statusClasses: Record<string, string> = {
  PENDING: "border-life-amber/30 bg-life-amber/10 text-life-amber",
  IN_PROGRESS: "border-life-cyan/30 bg-life-cyan/10 text-life-cyan",
  DONE: "border-life-green/30 bg-life-green/10 text-life-green",
  CANCELLED: "border-life-red/30 bg-life-red/10 text-life-red",
  ACTIVE: "border-life-green/30 bg-life-green/10 text-life-green",
  PAUSED: "border-life-amber/30 bg-life-amber/10 text-life-amber",
  COMPLETED: "border-life-blue/30 bg-life-blue/10 text-life-blue",
  ARCHIVED: "border-life-line bg-life-bg text-life-muted",
  LEAD: "border-life-blue/30 bg-life-blue/10 text-life-blue",
  CONTACTED: "border-life-cyan/30 bg-life-cyan/10 text-life-cyan",
  PROPOSAL: "border-life-amber/30 bg-life-amber/10 text-life-amber",
  FINISHED: "border-life-line bg-life-bg text-life-muted"
};

export function StatusBadge({ value, type }: StatusBadgeProps) {
  const options = type === "task" ? taskStatuses : type === "project" ? projectStatuses : clientStatuses;

  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", statusClasses[value])}>
      {labelFor(options, value)}
    </Badge>
  );
}
