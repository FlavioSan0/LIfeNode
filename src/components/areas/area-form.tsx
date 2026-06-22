"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAreaAction, updateAreaAction } from "@/actions/areas";
import { FieldShell } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { areaSchema, type AreaInput } from "@/lib/validations/areas";
import type { AreaView } from "@/types/entities";

type AreaFormProps = {
  area?: AreaView;
  onSaved?: () => void;
};

export function AreaForm({ area, onSaved }: AreaFormProps) {
  const router = useRouter();
  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area?.name ?? "",
      color: area?.color ?? "#2563EB",
      icon: area?.icon ?? "Circle"
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = form;

  async function onSubmit(values: AreaInput) {
    const result = area ? await updateAreaAction(area.id, values) : await createAreaAction(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    if (!area) reset();
    router.refresh();
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldShell label="Nome" error={errors.name}>
        <Input placeholder="Ex.: Estudos" {...register("name")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Cor" error={errors.color}>
          <Input type="color" className="h-10 p-1" {...register("color")} />
        </FieldShell>
        <FieldShell label="Ícone Lucide" error={errors.icon}>
          <Input placeholder="Ex.: BookOpen" {...register("icon")} />
        </FieldShell>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : area ? "Salvar área" : "Criar área"}
        </Button>
      </div>
    </form>
  );
}

export function AreaDialog({
  trigger,
  area,
  title = "Nova área"
}: AreaFormProps & {
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
          <DialogDescription>Áreas organizam contextos de vida, trabalho e clientes.</DialogDescription>
        </DialogHeader>
        <AreaForm area={area} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
