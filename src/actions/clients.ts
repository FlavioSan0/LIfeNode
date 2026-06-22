"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { clientSchema, type ClientInput } from "@/lib/validations/clients";
import { logActivity, nullable, validationError, zodError } from "@/lib/actions/utils";
import type { ActionResult } from "@/types";

function revalidateClientViews() {
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  revalidatePath("/tarefas");
  revalidatePath("/agenda");
  revalidatePath("/entrada-rapida");
}

async function getOwnedClient(userId: string, id: string) {
  const client = await prisma.client.findFirst({ where: { id, userId }, select: { id: true, name: true } });
  if (!client) throw new Error("Cliente não encontrado para este usuário.");
  return client;
}

export async function createClientAction(input: ClientInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos do cliente.", parsed.error.flatten().fieldErrors);
  }

  try {
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        company: nullable(parsed.data.company),
        phone: nullable(parsed.data.phone),
        email: nullable(parsed.data.email),
        serviceType: nullable(parsed.data.serviceType),
        status: parsed.data.status,
        observations: nullable(parsed.data.observations)
      }
    });

    await logActivity({ userId: user.id, action: "create", entity: "Client", entityId: client.id });
    revalidateClientViews();

    return { ok: true, message: "Cliente criado." };
  } catch (error) {
    return validationError(error);
  }
}

export async function updateClientAction(id: string, input: ClientInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos do cliente.", parsed.error.flatten().fieldErrors);
  }

  try {
    await getOwnedClient(user.id, id);

    await prisma.client.update({
      where: { id },
      data: {
        name: parsed.data.name,
        company: nullable(parsed.data.company),
        phone: nullable(parsed.data.phone),
        email: nullable(parsed.data.email),
        serviceType: nullable(parsed.data.serviceType),
        status: parsed.data.status,
        observations: nullable(parsed.data.observations)
      }
    });

    await logActivity({ userId: user.id, action: "update", entity: "Client", entityId: id });
    revalidateClientViews();

    return { ok: true, message: "Cliente atualizado." };
  } catch (error) {
    return validationError(error);
  }
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await getOwnedClient(user.id, id);
    await prisma.client.deleteMany({ where: { id, userId: user.id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Client", entityId: id });
    revalidateClientViews();

    return { ok: true, message: "Cliente excluído." };
  } catch (error) {
    return validationError(error);
  }
}
