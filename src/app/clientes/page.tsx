import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Prisma } from "@prisma/client";
import { ClientCard } from "@/components/clients/client-card";
import { ClientDialog } from "@/components/clients/client-form";
import { ClientSearch } from "@/components/clients/client-search";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import type { ClientView } from "@/types/entities";

export const metadata: Metadata = {
  title: "Clientes"
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const q = one(searchParams.q)?.trim();

  const where: Prisma.ClientWhereInput = { userId: user.id };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } }
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      _count: {
        select: {
          tasks: true,
          events: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const serializedClients: ClientView[] = clients.map((client) => ({
    id: client.id,
    name: client.name,
    company: client.company,
    phone: client.phone,
    email: client.email,
    serviceType: client.serviceType,
    status: client.status,
    observations: client.observations,
    taskCount: client._count.tasks,
    eventCount: client._count.events
  }));

  return (
    <AppShell userEmail={user.email}>
      <PageHeader
        title="Clientes"
        description="Gerencie contatos, status comercial, tarefas e eventos vinculados."
        action={
          <ClientDialog
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo cliente
              </Button>
            }
          />
        }
      />
      <ClientSearch />

      <section className="grid gap-3 xl:grid-cols-2">
        {serializedClients.length > 0 ? (
          serializedClients.map((client) => <ClientCard key={client.id} client={client} />)
        ) : (
          <div className="xl:col-span-2">
            <EmptyState title="Nenhum cliente encontrado" description="Cadastre um cliente ou ajuste a busca." />
          </div>
        )}
      </section>
    </AppShell>
  );
}
