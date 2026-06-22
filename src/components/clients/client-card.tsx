"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClientAction } from "@/actions/clients";
import { ClientDialog } from "@/components/clients/client-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientView } from "@/types/entities";

export function ClientCard({ client }: { client: ClientView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function removeClient() {
    if (!window.confirm("Excluir este cliente? Tarefas e eventos vinculados ficarão sem cliente.")) return;

    startTransition(async () => {
      const result = await deleteClientAction(client.id);
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
            <StatusBadge type="client" value={client.status} />
            <div>
              <h3 className="text-lg font-semibold leading-tight">{client.name}</h3>
              {client.company ? <p className="text-sm text-life-muted">{client.company}</p> : null}
            </div>
          </div>
          <div className="flex gap-1">
            <ClientDialog
              client={client}
              title="Editar cliente"
              trigger={
                <Button size="icon" variant="ghost" aria-label="Editar cliente">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button size="icon" variant="ghost" onClick={removeClient} disabled={isPending} aria-label="Excluir cliente">
              <Trash2 className="h-4 w-4 text-life-red" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-life-muted">
          {client.phone ? (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-life-cyan" />
              {client.phone}
            </p>
          ) : null}
          {client.email ? (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-life-cyan" />
              {client.email}
            </p>
          ) : null}
          {client.serviceType ? <p>Serviço: {client.serviceType}</p> : null}
          {client.observations ? <p className="line-clamp-2">{client.observations}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md border border-life-line bg-life-bg p-3">
            <p className="text-lg font-semibold">{client.taskCount}</p>
            <p className="text-life-muted">tarefas</p>
          </div>
          <div className="rounded-md border border-life-line bg-life-bg p-3">
            <p className="text-lg font-semibold">{client.eventCount}</p>
            <p className="text-life-muted">eventos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
