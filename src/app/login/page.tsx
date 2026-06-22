import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Network } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Login"
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-life-bg px-4 py-10 surface-grid">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-life-line bg-life-card">
              <Network className="h-6 w-6 text-life-cyan" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-tight">LifeNode</p>
              <p className="text-sm text-life-muted">Central pessoal de comando</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-normal text-life-text sm:text-5xl">
              Tarefas, agenda, clientes e projetos em uma visão única.
            </h1>
            <p className="text-base text-life-muted">
              Um MVP privado, mobile-first e preparado para crescer com isolamento por usuário desde o primeiro dia.
            </p>
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}
