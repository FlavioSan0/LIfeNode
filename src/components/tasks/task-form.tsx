"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTaskAction, updateTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldShell, OptionSelect } from "@/components/forms/form-field";
import { priorities, taskStatuses } from "@/constants/options";
import { toDateInputValue } from "@/lib/format";
import { taskSchema, type TaskInput } from "@/lib/validations/tasks";
import type { AreaOption, ClientOption, ProjectOption, TaskView } from "@/types/entities";
import { useState } from "react";

type TaskFormProps = {
  task?: TaskView;
  areas: AreaOption[];
  projects: ProjectOption[];
  clients: ClientOption[];
  onSaved?: () => void;
};

export function TaskForm({ task, areas, projects, clients, onSaved }: TaskFormProps) {
  const router = useRouter();
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status as TaskInput["status"]) ?? "PENDING",
      priority: (task?.priority as TaskInput["priority"]) ?? "MEDIUM",
      dueDate: task?.dueDate ? toDateInputValue(task.dueDate) : undefined,
      dueTime: task?.dueTime ?? undefined,
      areaId: task?.area?.id,
      projectId: task?.project?.id,
      clientId: task?.client?.id
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

  async function onSubmit(values: TaskInput) {
    const result = task ? await updateTaskAction(task.id, values) : await createTaskAction(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    if (!task) reset();
    router.refresh();
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldShell label="Título" error={errors.title}>
        <Input placeholder="Ex.: Falar com Bruno sobre a landing page" {...register("title")} />
      </FieldShell>

      <FieldShell label="Descrição" error={errors.description}>
        <Textarea placeholder="Detalhes, contexto, links ou próximos passos" {...register("description")} />
      </FieldShell>

      <div className="grid gap-4 sm:grid-cols-2">
        <OptionSelect
          label="Status"
          value={watch("status")}
          onValueChange={(value) => setValue("status", (value ?? "PENDING") as TaskInput["status"], { shouldValidate: true })}
          options={taskStatuses.map((status) => ({ value: status.value, label: status.label }))}
          allowNone={false}
          error={errors.status}
        />
        <OptionSelect
          label="Prioridade"
          value={watch("priority")}
          onValueChange={(value) => setValue("priority", (value ?? "MEDIUM") as TaskInput["priority"], { shouldValidate: true })}
          options={priorities.map((priority) => ({ value: priority.value, label: priority.label }))}
          allowNone={false}
          error={errors.priority}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Prazo" error={errors.dueDate}>
          <Input type="date" {...register("dueDate")} />
        </FieldShell>
        <FieldShell label="Hora" error={errors.dueTime}>
          <Input type="time" {...register("dueTime")} />
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  );
}

export function TaskDialog({
  trigger,
  task,
  areas,
  projects,
  clients,
  title = "Nova tarefa"
}: TaskFormProps & {
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
          <DialogDescription>Organize prazo, prioridade e vínculos sem sair da tela atual.</DialogDescription>
        </DialogHeader>
        <TaskForm task={task} areas={areas} projects={projects} clients={clients} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
