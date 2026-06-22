"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { projectSchema, type ProjectInput } from "@/lib/validations/projects";
import { assertOwnedLinks, logActivity, nullable, validationError, zodError } from "@/lib/actions/utils";
import type { ActionResult } from "@/types";

function revalidateProjectViews() {
  revalidatePath("/projetos");
  revalidatePath("/dashboard");
  revalidatePath("/tarefas");
  revalidatePath("/agenda");
  revalidatePath("/entrada-rapida");
}

async function getOwnedProject(userId: string, id: string) {
  const project = await prisma.project.findFirst({ where: { id, userId }, select: { id: true, name: true } });
  if (!project) throw new Error("Projeto não encontrado para este usuário.");
  return project;
}

export async function createProjectAction(input: ProjectInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos do projeto.", parsed.error.flatten().fieldErrors);
  }

  try {
    await assertOwnedLinks(user.id, { areaId: parsed.data.areaId });

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: nullable(parsed.data.description),
        status: parsed.data.status,
        areaId: parsed.data.areaId ?? null
      }
    });

    await logActivity({ userId: user.id, action: "create", entity: "Project", entityId: project.id });
    revalidateProjectViews();

    return { ok: true, message: "Projeto criado." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Você já tem um projeto com esse nome." };
    }

    return validationError(error);
  }
}

export async function updateProjectAction(id: string, input: ProjectInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(input);

  if (!parsed.success) {
    return zodError("Revise os campos do projeto.", parsed.error.flatten().fieldErrors);
  }

  try {
    await getOwnedProject(user.id, id);
    await assertOwnedLinks(user.id, { areaId: parsed.data.areaId });

    await prisma.project.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: nullable(parsed.data.description),
        status: parsed.data.status,
        areaId: parsed.data.areaId ?? null
      }
    });

    await logActivity({ userId: user.id, action: "update", entity: "Project", entityId: id });
    revalidateProjectViews();

    return { ok: true, message: "Projeto atualizado." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Você já tem um projeto com esse nome." };
    }

    return validationError(error);
  }
}

export async function archiveProjectAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await getOwnedProject(user.id, id);
    await prisma.project.update({ where: { id }, data: { status: "ARCHIVED" } });
    await logActivity({ userId: user.id, action: "archive", entity: "Project", entityId: id });
    revalidateProjectViews();

    return { ok: true, message: "Projeto arquivado." };
  } catch (error) {
    return validationError(error);
  }
}
