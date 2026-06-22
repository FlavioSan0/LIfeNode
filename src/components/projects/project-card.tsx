"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Archive, CalendarClock, Pencil } from "lucide-react";
import { toast } from "sonner";
import { archiveProjectAction } from "@/actions/projects";
import { ProjectDialog } from "@/components/projects/project-form";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AreaOption, ProjectView } from "@/types/entities";

export function ProjectCard({ project, areas }: { project: ProjectView; areas: AreaOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function archive() {
    if (!window.confirm("Arquivar este projeto?")) return;
    startTransition(async () => {
      const result = await archiveProjectAction(project.id);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge type="project" value={project.status} />
              {project.area ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-life-line px-2 py-0.5 text-xs text-life-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.area.color }} />
                  {project.area.name}
                </span>
              ) : null}
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight">{project.name}</h3>
              {project.description ? <p className="mt-1 line-clamp-2 text-sm text-life-muted">{project.description}</p> : null}
            </div>
          </div>
          <div className="flex gap-1">
            <ProjectDialog
              project={project}
              areas={areas}
              title="Editar projeto"
              trigger={
                <Button size="icon" variant="ghost" aria-label="Editar projeto">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button size="icon" variant="ghost" onClick={archive} disabled={isPending} aria-label="Arquivar projeto">
              <Archive className="h-4 w-4 text-life-amber" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md border border-life-line bg-life-bg p-3">
            <p className="text-lg font-semibold">{project.taskCount}</p>
            <p className="text-life-muted">tarefas vinculadas</p>
          </div>
          <div className="rounded-md border border-life-line bg-life-bg p-3">
            <p className="text-lg font-semibold">{project.eventCount}</p>
            <p className="text-life-muted">eventos vinculados</p>
          </div>
        </div>

        {project.tasks.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-life-muted">Tarefas recentes</p>
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-2 rounded-md border border-life-line bg-life-bg p-2 text-sm">
                <span className="line-clamp-1">{task.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge value={task.priority} />
                  <span className="text-xs text-life-muted">{formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {project.events.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-life-muted">Próximos eventos</p>
            {project.events.map((event) => (
              <div key={event.id} className="flex items-center gap-2 rounded-md border border-life-line bg-life-bg p-2 text-sm">
                <CalendarClock className="h-4 w-4 text-life-cyan" />
                <span className="line-clamp-1 flex-1">{event.title}</span>
                <span className="text-xs text-life-muted">{formatDateTime(event.startsAt)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
