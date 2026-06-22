"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { areaSchema, type AreaInput } from "@/lib/validations/areas";
import { logActivity, validationError, zodError } from "@/lib/actions/utils";
import type { ActionResult } from "@/types";

function revalidateAreaViews() {
  revalidatePath("/areas");
  revalidatePath("/dashboard");
  revalidatePath("/tarefas");
  revalidatePath("/projetos");
  revalidatePath("/agenda");
  revalidatePath("/entrada-rapida");
}

async function getOwnedArea(userId: string, id: string) {
  const area = await prisma.area.findFirst({ where: { id, userId }, select: { id: true, name: true } });
  if (!area) throw new Error("Área não encontrada para este usuário.");
  return area;
}

export async function createAreaAction(input: AreaInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = areaSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos da área.", parsed.error.flatten().fieldErrors);
  }

  try {
    const area = await prisma.area.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        color: parsed.data.color,
        icon: parsed.data.icon
      }
    });

    await logActivity({ userId: user.id, action: "create", entity: "Area", entityId: area.id });
    revalidateAreaViews();

    return { ok: true, message: "Área criada." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Você já tem uma área com esse nome." };
    }

    return validationError(error);
  }
}

export async function updateAreaAction(id: string, input: AreaInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = areaSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos da área.", parsed.error.flatten().fieldErrors);
  }

  try {
    await getOwnedArea(user.id, id);

    await prisma.area.update({
      where: { id },
      data: {
        name: parsed.data.name,
        color: parsed.data.color,
        icon: parsed.data.icon
      }
    });

    await logActivity({ userId: user.id, action: "update", entity: "Area", entityId: id });
    revalidateAreaViews();

    return { ok: true, message: "Área atualizada." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Você já tem uma área com esse nome." };
    }

    return validationError(error);
  }
}

export async function deleteAreaAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await getOwnedArea(user.id, id);

    const [tasks, projects, events, notes] = await Promise.all([
      prisma.task.count({ where: { userId: user.id, areaId: id } }),
      prisma.project.count({ where: { userId: user.id, areaId: id } }),
      prisma.event.count({ where: { userId: user.id, areaId: id } }),
      prisma.note.count({ where: { userId: user.id, areaId: id } })
    ]);

    const dependencies = tasks + projects + events + notes;
    if (dependencies > 0) {
      return {
        ok: false,
        message: `Esta área tem ${dependencies} vínculo(s). Remova ou mova esses itens antes de excluir.`
      };
    }

    await prisma.area.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Area", entityId: id });
    revalidateAreaViews();

    return { ok: true, message: "Área excluída." };
  } catch (error) {
    return validationError(error);
  }
}
