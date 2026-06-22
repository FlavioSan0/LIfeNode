"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/components/forms/form-field";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = form;

  async function onSubmit(values: LoginInput) {
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        redirectTo: searchParams.get("next") ?? "/dashboard"
      });

      if (!result?.ok) {
        toast.error("E-mail ou senha inválidos.");
        return;
      }

      toast.success("Login realizado.");
      router.replace(result.url ?? "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível fazer login.");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Acessar LifeNode</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldShell label="E-mail" error={errors.email}>
            <Input type="email" autoComplete="email" placeholder="voce@email.com" {...register("email")} />
          </FieldShell>
          <FieldShell label="Senha" error={errors.password}>
            <Input type="password" autoComplete="current-password" placeholder="Sua senha" {...register("password")} />
          </FieldShell>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
