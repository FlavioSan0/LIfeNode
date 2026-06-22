export const taskStatuses = [
  { value: "PENDING", label: "Pendente" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "DONE", label: "Concluída" },
  { value: "CANCELLED", label: "Cancelada" }
] as const;

export const priorities = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" }
] as const;

export const projectStatuses = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "ARCHIVED", label: "Arquivado" }
] as const;

export const clientStatuses = [
  { value: "LEAD", label: "Lead" },
  { value: "CONTACTED", label: "Contato feito" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "FINISHED", label: "Finalizado" }
] as const;

export const quickEntryTypes = [
  { value: "TASK", label: "Tarefa" },
  { value: "NOTE", label: "Nota" }
] as const;

export function labelFor<T extends readonly { value: string; label: string }[]>(options: T, value?: string | null) {
  return options.find((option) => option.value === value)?.label ?? value ?? "";
}
