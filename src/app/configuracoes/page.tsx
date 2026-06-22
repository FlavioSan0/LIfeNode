import type { Metadata } from "next";
import { ShieldCheck, Smartphone, Unplug } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Configurações"
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = user.profile;
  const [tasks, projects, clients, events] = await Promise.all([
    prisma.task.count({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.client.count({ where: { userId: user.id } }),
    prisma.event.count({ where: { userId: user.id } })
  ]);

  return (
    <AppShell userEmail={user.email}>
      <PageHeader title="Configurações" description="Conta, segurança básica e informações do sistema." />

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="User ID" value={user.id} />
            <InfoRow label="E-mail" value={user.email ?? "Não informado"} />
            <InfoRow label="Nome" value={profile.name ?? "Não informado"} />
            <InfoRow label="Timezone" value={profile.timezone} />
            <LogoutButton className="gap-2" />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Sistema</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <Metric label="tarefas" value={tasks} />
              <Metric label="projetos" value={projects} />
              <Metric label="clientes" value={clients} />
              <Metric label="eventos" value={events} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preparado para evoluir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-life-muted">
              <p className="flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-life-green" />
                Consultas e actions filtradas por usuário autenticado.
              </p>
              <p className="flex gap-2">
                <Smartphone className="h-4 w-4 shrink-0 text-life-cyan" />
                Manifest, tema e navegação mobile-first configurados para PWA.
              </p>
              <p className="flex gap-2">
                <Unplug className="h-4 w-4 shrink-0 text-life-amber" />
                Área reservada para futuras integrações sem ativar IA, Notion ou WhatsApp nesta versão.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-life-line bg-life-bg p-3">
      <p className="text-xs uppercase tracking-normal text-life-muted">{label}</p>
      <p className="mt-1 break-all text-sm font-medium">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-life-line bg-life-bg p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-life-muted">{label}</p>
    </div>
  );
}
