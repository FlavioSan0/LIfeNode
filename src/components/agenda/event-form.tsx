"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEventAction, updateEventAction } from "@/actions/events";
import { FieldShell, OptionSelect } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toDateTimeInputValue } from "@/lib/format";
import { eventSchema, type EventInput } from "@/lib/validations/events";
import type { AreaOption, ClientOption, EventView, ProjectOption } from "@/types/entities";

type EventFormProps = {
  event?: EventView;
  areas: AreaOption[];
  projects: ProjectOption[];
  clients: ClientOption[];
  onSaved?: () => void;
};

export function EventForm({ event, areas, projects, clients, onSaved }: EventFormProps) {
  const router = useRouter();
  const form = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      location: event?.location ?? "",
      startsAt: event?.startsAt ? toDateTimeInputValue(event.startsAt) : "",
      endsAt: event?.endsAt ? toDateTimeInputValue(event.endsAt) : undefined,
      areaId: event?.area?.id,
      projectId: event?.project?.id,
      clientId: event?.client?.id
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = form;

  async function onSubmit(values: EventInput) {
    const result = event ? await updateEventAction(event.id, values) : await createEventAction(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    if (!event) reset();
    router.refresh();
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldShell label="Título" error={errors.title}>
        <Input placeholder="Ex.: Reunião com cliente" {...register("title")} />
      </FieldShell>
      <FieldShell label="Descrição" error={errors.description}>
        <Textarea placeholder="Pauta, links, contexto" {...register("description")} />
      </FieldShell>
      <FieldShell label="Local" error={errors.location}>
        <Input placeholder="Meet, escritório, endereço..." {...register("location")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Início" error={errors.startsAt}>
          <Input type="datetime-local" {...register("startsAt")} />
        </FieldShell>
        <FieldShell label="Fim" error={errors.endsAt}>
          <Input type="datetime-local" {...register("endsAt")} />
        </FieldShell>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <OptionSelect
          label="Área"
          value={watch("areaId")}
          onValueChange={(value) => setValue("areaId", value, { shouldValidate: true })}
          options={areas.map((area) => ({ value: area.id, label: area.name, color: area.color }))}
          error={errors.areaId}
        />
        <OptionSelect
          label="Projeto"
          value={watch("projectId")}
          onValueChange={(value) => setValue("projectId", value, { shouldValidate: true })}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.projectId}
        />
        <OptionSelect
          label="Cliente"
          value={watch("clientId")}
          onValueChange={(value) => setValue("clientId", value, { shouldValidate: true })}
          options={clients.map((client) => ({ value: client.id, label: client.name, hint: client.company }))}
          error={errors.clientId}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : event ? "Salvar evento" : "Criar evento"}
        </Button>
      </div>
    </form>
  );
}

export function EventDialog({
  trigger,
  event,
  areas,
  projects,
  clients,
  title = "Novo evento"
}: EventFormProps & {
  trigger: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Vincule compromissos a áreas, projetos e clientes.</DialogDescription>
        </DialogHeader>
        <EventForm event={event} areas={areas} projects={projects} clients={clients} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
