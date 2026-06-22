"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { priorities, taskStatuses } from "@/constants/options";
import type { AreaOption, ClientOption, ProjectOption } from "@/types/entities";

const NONE_VALUE = "__none";

type TaskFiltersProps = {
  areas: AreaOption[];
  projects: ProjectOption[];
  clients: ClientOption[];
};

export function TaskFilters({ areas, projects, clients }: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === NONE_VALUE) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("q", query.trim() || undefined);
  }

  return (
    <div className="rounded-lg border border-life-line bg-life-card p-3">
      <form onSubmit={onSearch} className="grid gap-3 lg:grid-cols-[1.2fr_repeat(5,minmax(0,1fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-life-muted" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefa" className="pl-9" />
        </div>

        <FilterSelect
          value={searchParams.get("status") ?? NONE_VALUE}
          placeholder="Status"
          options={taskStatuses.map((item) => ({ value: item.value, label: item.label }))}
          onValueChange={(value) => updateParam("status", value)}
        />
        <FilterSelect
          value={searchParams.get("priority") ?? NONE_VALUE}
          placeholder="Prioridade"
          options={priorities.map((item) => ({ value: item.value, label: item.label }))}
          onValueChange={(value) => updateParam("priority", value)}
        />
        <FilterSelect
          value={searchParams.get("areaId") ?? NONE_VALUE}
          placeholder="Área"
          options={areas.map((area) => ({ value: area.id, label: area.name }))}
          onValueChange={(value) => updateParam("areaId", value)}
        />
        <FilterSelect
          value={searchParams.get("projectId") ?? NONE_VALUE}
          placeholder="Projeto"
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          onValueChange={(value) => updateParam("projectId", value)}
        />
        <FilterSelect
          value={searchParams.get("clientId") ?? NONE_VALUE}
          placeholder="Cliente"
          options={clients.map((client) => ({ value: client.id, label: client.name }))}
          onValueChange={(value) => updateParam("clientId", value)}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 lg:flex-none">
            Buscar
          </Button>
          <Button asChild variant="outline">
            <Link href="/tarefas">Limpar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

function FilterSelect({
  value,
  placeholder,
  options,
  onValueChange
}: {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
