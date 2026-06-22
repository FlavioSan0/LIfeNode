"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAreaAction } from "@/actions/areas";
import { AreaDialog } from "@/components/areas/area-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AreaView } from "@/types/entities";

export function AreaCard({ area }: { area: AreaView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dependencies = area.taskCount + area.projectCount + area.eventCount + area.noteCount;

  function removeArea() {
    const message =
      dependencies > 0
        ? "Esta área possui vínculos. A exclusão será bloqueada até você mover ou remover esses itens."
        : "Excluir esta área?";

    if (!window.confirm(message)) return;

    startTransition(async () => {
      const result = await deleteAreaAction(area.id);
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
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: area.color }} />
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{area.name}</h3>
              <p className="text-sm text-life-muted">{area.icon}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <AreaDialog
              area={area}
              title="Editar área"
              trigger={
                <Button size="icon" variant="ghost" aria-label="Editar área">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button size="icon" variant="ghost" onClick={removeArea} disabled={isPending} aria-label="Excluir área">
              <Trash2 className="h-4 w-4 text-life-red" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <Metric label="Tarefas" value={area.taskCount} />
          <Metric label="Projetos" value={area.projectCount} />
          <Metric label="Eventos" value={area.eventCount} />
          <Metric label="Notas" value={area.noteCount} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-life-line bg-life-bg p-2">
      <p className="font-semibold text-life-text">{value}</p>
      <p className="text-life-muted">{label}</p>
    </div>
  );
}
