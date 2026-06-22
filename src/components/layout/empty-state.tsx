import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-life-line bg-life-bg">
          <Icon className="h-5 w-5 text-life-cyan" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="max-w-sm text-sm text-life-muted">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
