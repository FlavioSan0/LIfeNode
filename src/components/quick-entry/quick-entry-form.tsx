"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createQuickEntryAction } from "@/actions/notes";
import { FieldShell, OptionSelect } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { priorities, quickEntryTypes } from "@/constants/options";
import { quickEntrySchema, type QuickEntryInput } from "@/lib/validations/quick-entry";
import type { AreaOption, ClientOption, ProjectOption } from "@/types/entities";

type QuickEntryFormProps = {
  areas: AreaOption[];
  projects: ProjectOption[];
  clients: ClientOption[];
};

export function QuickEntryForm({ areas, projects, clients }: QuickEntryFormProps) {
  const router = useRouter();
  const form = useForm<QuickEntryInput>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      content: "",
      type: "TASK",
      priority: "MEDIUM"
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

  async function onSubmit(values: QuickEntryInput) {
    const result = await createQuickEntryAction(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    reset({ content: "", type: values.type, priority: "MEDIUM" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-life-line bg-life-card p-4">
      <FieldShell label="Entrada" error={errors.content}>
        <Textarea
          className="min-h-44 text-base"
          placeholder="Falar com Bruno amanhã às 14h sobre a landing page"
          {...register("content")}
        />
      </FieldShell>

      <div className="grid gap-4 sm:grid-cols-2">
        <OptionSelect
          label="Salvar como"
          value={watch("type")}
          onValueChange={(value) => setValue("type", (value ?? "TASK") as QuickEntryInput["type"], { shouldValidate: true })}
          options={quickEntryTypes.map((type) => ({ value: type.value, label: type.label }))}
          allowNone={false}
          error={errors.type}
        />
        <OptionSelect
          label="Prioridade"
          value={watch("priority")}
          onValueChange={(value) => setValue("priority", value as QuickEntryInput["priority"], { shouldValidate: true })}
          options={priorities.map((priority) => ({ value: priority.value, label: priority.label }))}
          error={errors.priority}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Data opcional" error={errors.date}>
          <Input type="date" {...register("date")} />
        </FieldShell>
        <OptionSelect
          label="Área"
          value={watch("areaId")}
          onValueChange={(value) => setValue("areaId", value, { shouldValidate: true })}
          options={areas.map((area) => ({ value: area.id, label: area.name, color: area.color }))}
          error={errors.areaId}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
          {isSubmitting ? "Salvando..." : "Salvar entrada"}
        </Button>
      </div>
    </form>
  );
}
