"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createProjectAction, updateProjectAction } from "@/actions/projects";
import { FieldShell, OptionSelect } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectStatuses } from "@/constants/options";
import { projectSchema, type ProjectInput } from "@/lib/validations/projects";
import type { AreaOption, ProjectView } from "@/types/entities";

type ProjectFormProps = {
  project?: ProjectView;
  areas: AreaOption[];
  onSaved?: () => void;
};

export function ProjectForm({ project, areas, onSaved }: ProjectFormProps) {
  const router = useRouter();
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      status: (project?.status as ProjectInput["status"]) ?? "ACTIVE",
      areaId: project?.area?.id
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

  async function onSubmit(values: ProjectInput) {
    const result = project ? await updateProjectAction(project.id, values) : await createProjectAction(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    if (!project) reset();
    router.refresh();
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldShell label="Nome" error={errors.name}>
        <Input placeholder="Ex.: MesaFlow" {...register("name")} />
      </FieldShell>
      <FieldShell label="Descrição" error={errors.description}>
        <Textarea placeholder="Objetivo, escopo e próximos marcos" {...register("description")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <OptionSelect
          label="Status"
          value={watch("status")}
          onValueChange={(value) => setValue("status", (value ?? "ACTIVE") as ProjectInput["status"], { shouldValidate: true })}
          options={projectStatuses.map((status) => ({ value: status.value, label: status.label }))}
          allowNone={false}
          error={errors.status}
        />
        <OptionSelect
          label="Área"
          value={watch("areaId")}
          onValueChange={(value) => setValue("areaId", value, { shouldValidate: true })}
          options={areas.map((area) => ({ value: area.id, label: area.name, color: area.color }))}
          error={errors.areaId}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : project ? "Salvar projeto" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}

export function ProjectDialog({
  trigger,
  project,
  areas,
  title = "Novo projeto"
}: ProjectFormProps & {
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
          <DialogDescription>Projetos agrupam tarefas, eventos e clientes relacionados.</DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} areas={areas} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
