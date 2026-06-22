"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    router.replace(`/clientes?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-lg border border-life-line bg-life-card p-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-life-muted" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, empresa ou telefone"
          className="pl-9"
        />
      </div>
      <Button type="submit">Buscar</Button>
      <Button asChild variant="outline">
        <Link href="/clientes">Limpar</Link>
      </Button>
    </form>
  );
}
