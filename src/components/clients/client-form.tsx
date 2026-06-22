"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { FieldShell, OptionSelect } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clientStatuses } from "@/constants/options";
import { clientSchema, type ClientInput } from "@/lib/validations/clients";
import type { ClientView } from "@/types/entities";

type ClientFormProps = {
  client?: ClientView;
  onSaved?: () => void;
};

export function ClientForm({ client, onSaved }: ClientFormProps) {
  const router = useRouter();
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      company: client?.company ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      serviceType: client?.serviceType ?? "",
      status: (client?.status as ClientInput["status"]) ?? "LEAD",
      observations: client?.observations ?? ""
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

  async function onSubmit(values: ClientInput) {
    const result = client ? await updateClientAction(client.id, values) : await createClientAction(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    if (!client) reset();
    router.refresh();
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldShell label="Nome" error={errors.name}>
        <Input placeholder="Nome do contato" {...register("name")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Empresa" error={errors.company}>
          <Input placeholder="Empresa ou marca" {...register("company")} />
        </FieldShell>
        <FieldShell label="Telefone" error={errors.phone}>
          <Input placeholder="(84) 99999-9999" {...register("phone")} />
        </FieldShell>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="E-mail" error={errors.email}>
          <Input type="email" placeholder="cliente@email.com" {...register("email")} />
        </FieldShell>
        <FieldShell label="Tipo de serviço" error={errors.serviceType}>
          <Input placeholder="Landing page, CRM, automação..." {...register("serviceType")} />
        </FieldShell>
      </div>
      <OptionSelect
        label="Status"
        value={watch("status")}
        onValueChange={(value) => setValue("status", (value ?? "LEAD") as ClientInput["status"], { shouldValidate: true })}
        options={clientStatuses.map((status) => ({ value: status.value, label: status.label }))}
        allowNone={false}
        error={errors.status}
      />
      <FieldShell label="Observações" error={errors.observations}>
        <Textarea placeholder="Contexto comercial, combinados, histórico" {...register("observations")} />
      </FieldShell>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : client ? "Salvar cliente" : "Criar cliente"}
        </Button>
      </div>
    </form>
  );
}

export function ClientDialog({
  trigger,
  client,
  title = "Novo cliente"
}: ClientFormProps & {
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
          <DialogDescription>Cadastre contatos e acompanhe tarefas e agenda por cliente.</DialogDescription>
        </DialogHeader>
        <ClientForm client={client} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
