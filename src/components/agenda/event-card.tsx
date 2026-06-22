"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CalendarClock, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEventAction } from "@/actions/events";
import { EventDialog } from "@/components/agenda/event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { AreaOption, ClientOption, EventView, ProjectOption } from "@/types/entities";

export function EventCard({
  event,
  areas,
  projects,
  clients
}: {
  event: EventView;
  areas: AreaOption[];
  projects: ProjectOption[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function removeEvent() {
    if (!window.confirm("Excluir este evento?")) return;

    startTransition(async () => {
      const result = await deleteEventAction(event.id);
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
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight">{event.title}</h3>
            {event.description ? <p className="mt-1 line-clamp-2 text-sm text-life-muted">{event.description}</p> : null}
          </div>
          <div className="flex gap-1">
            <EventDialog
              event={event}
              areas={areas}
              projects={projects}
              clients={clients}
              title="Editar evento"
              trigger={
                <Button size="icon" variant="ghost" aria-label="Editar evento">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button size="icon" variant="ghost" onClick={removeEvent} disabled={isPending} aria-label="Excluir evento">
              <Trash2 className="h-4 w-4 text-life-red" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-life-muted">
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-life-cyan" />
            {formatDateTime(event.startsAt)}
            {event.endsAt ? ` até ${formatDateTime(event.endsAt)}` : ""}
          </p>
          {event.location ? (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-life-cyan" />
              {event.location}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-life-muted">
          {event.area ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-life-line px-2 py-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.area.color }} />
              {event.area.name}
            </span>
          ) : null}
          {event.project ? <span className="rounded-md border border-life-line px-2 py-1">{event.project.name}</span> : null}
          {event.client ? <span className="rounded-md border border-life-line px-2 py-1">{event.client.name}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
