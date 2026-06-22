import { Badge } from "@/components/ui/badge";
import { labelFor, priorities } from "@/constants/options";
import { cn } from "@/lib/utils";

const priorityClasses: Record<string, string> = {
  LOW: "border-life-line bg-life-bg text-life-muted",
  MEDIUM: "border-life-blue/30 bg-life-blue/10 text-life-blue",
  HIGH: "border-life-amber/30 bg-life-amber/10 text-life-amber",
  URGENT: "border-life-red/30 bg-life-red/10 text-life-red"
};

export function PriorityBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", priorityClasses[value])}>
      {labelFor(priorities, value)}
    </Badge>
  );
}
