"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CalendarClock, Check, MoreHorizontal, Pencil, Play, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { deleteTaskAction, setTaskStatusAction } from "@/actions/tasks";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { TaskDialog } from "@/components/tasks/task-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDate, isOverdueDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AreaOption, ClientOption, ProjectOption, TaskView } from "@/types/entities";

type TaskCardProps = {
  task: TaskView;
  areas: AreaOption[];
  projects: ProjectOption[];
  clients: ClientOption[];
  compact?: boolean;
};

export function TaskCard({ task, areas, projects, clients, compact = false }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const overdue = isOverdueDate(task.dueDate, task.status);

  function run(action: Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action;
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function removeTask() {
    if (!window.confirm("Excluir esta tarefa?")) return;
    run(deleteTaskAction(task.id));
  }

  return (
    <Card className={cn("overflow-hidden", overdue && "border-life-red/60")}>
      <CardContent className={cn("space-y-3 p-4", compact && "p-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {overdue ? <Badge className="bg-life-red text-white">Atrasada</Badge> : null}
              <StatusBadge type="task" value={task.status} />
              <PriorityBadge value={task.priority} />
            </div>
            <div>
              <h3 className="break-words text-base font-semibold leading-snug">{task.title}</h3>
              {task.description && !compact ? (
                <p className="mt-1 line-clamp-2 text-sm text-life-muted">{task.description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            <TaskDialog
              title="Editar tarefa"
              task={task}
              areas={areas}
              projects={projects}
              clients={clients}
              trigger={
                <Button size="icon" variant="ghost" aria-label="Editar tarefa">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" disabled={isPending} aria-label="Ações da tarefa">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => run(setTaskStatusAction(task.id, "IN_PROGRESS"))}>
                  <Play className="mr-2 h-4 w-4" />
                  Em andamento
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => run(setTaskStatusAction(task.id, "DONE"))}>
                  <Check className="mr-2 h-4 w-4" />
                  Concluir
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => run(setTaskStatusAction(task.id, "CANCELLED"))}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-life-red focus:text-life-red" onSelect={removeTask}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-life-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(task.dueDate)}
            {task.dueTime ? ` às ${task.dueTime}` : ""}
          </span>
          {task.area ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-life-line px-2 py-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: task.area.color }} />
              {task.area.name}
            </span>
          ) : null}
          {task.project ? <span className="rounded-md border border-life-line px-2 py-1">{task.project.name}</span> : null}
          {task.client ? <span className="rounded-md border border-life-line px-2 py-1">{task.client.name}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
