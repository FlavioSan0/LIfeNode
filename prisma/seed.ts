import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const areas = [
  { name: "San_Node", color: "#2563EB", icon: "Network" },
  { name: "Casamento", color: "#F59E0B", icon: "Heart" },
  { name: "FAB", color: "#22D3EE", icon: "Plane" },
  { name: "Estudos", color: "#22C55E", icon: "BookOpen" },
  { name: "Pessoal", color: "#94A3B8", icon: "User" },
  { name: "Clientes", color: "#EF4444", icon: "BriefcaseBusiness" },
  { name: "Ideias", color: "#A78BFA", icon: "Lightbulb" }
];

const projects = [
  "MesaFlow",
  "AgendaNode",
  "Portfólio",
  "Casamento",
  "Ilha do Copão",
  "ABF Representações",
  "Sistema de Estoque"
];

async function upsertClient(userId: string, data: Parameters<typeof prisma.client.create>[0]["data"]) {
  const existing = await prisma.client.findFirst({
    where: {
      userId,
      name: data.name
    }
  });

  if (existing) {
    return prisma.client.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.client.create({ data });
}

async function upsertTask(userId: string, data: Parameters<typeof prisma.task.create>[0]["data"]) {
  const existing = await prisma.task.findFirst({
    where: {
      userId,
      title: data.title
    }
  });

  if (existing) {
    return prisma.task.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.task.create({ data });
}

async function upsertEvent(userId: string, data: Parameters<typeof prisma.event.create>[0]["data"]) {
  const existing = await prisma.event.findFirst({
    where: {
      userId,
      title: data.title
    }
  });

  if (existing) {
    return prisma.event.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.event.create({ data });
}

async function main() {
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_USER_PASSWORD;
  const name = process.env.SEED_USER_NAME?.trim() || "Flávio";

  if (!email || !password) {
    throw new Error("Defina SEED_USER_EMAIL e SEED_USER_PASSWORD antes de rodar o seed.");
  }

  if (password.length < 8) {
    throw new Error("SEED_USER_PASSWORD deve ter pelo menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash
    },
    create: {
      email,
      name,
      passwordHash
    }
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      email: user.email,
      name: user.name,
      avatarUrl: user.image
    },
    create: {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.image
    }
  });

  const areaRecords = await Promise.all(
    areas.map((area) =>
      prisma.area.upsert({
        where: { userId_name: { userId: user.id, name: area.name } },
        update: area,
        create: { ...area, userId: user.id }
      })
    )
  );

  const areaByName = new Map(areaRecords.map((area) => [area.name, area]));

  const projectRecords = await Promise.all(
    projects.map((projectName, index) =>
      prisma.project.upsert({
        where: { userId_name: { userId: user.id, name: projectName } },
        update: {
          description: `Projeto inicial ${projectName}`,
          areaId: index === 3 ? areaByName.get("Casamento")?.id : areaByName.get("San_Node")?.id
        },
        create: {
          userId: user.id,
          name: projectName,
          description: `Projeto inicial ${projectName}`,
          areaId: index === 3 ? areaByName.get("Casamento")?.id : areaByName.get("San_Node")?.id
        }
      })
    )
  );

  const clients = await Promise.all([
    upsertClient(user.id, {
      userId: user.id,
      name: "Bruno Almeida",
      company: "BA Digital",
      phone: "(84) 99999-1001",
      email: "bruno@example.com",
      serviceType: "Landing page",
      status: "CONTACTED",
      observations: "Cliente interessado em captação de leads."
    }),
    upsertClient(user.id, {
      userId: user.id,
      name: "Mariana Costa",
      company: "Studio MC",
      phone: "(84) 99999-1002",
      email: "mariana@example.com",
      serviceType: "Sistema interno",
      status: "PROPOSAL"
    }),
    upsertClient(user.id, {
      userId: user.id,
      name: "ABF Representações",
      company: "ABF",
      phone: "(84) 99999-1003",
      serviceType: "Automação comercial",
      status: "ACTIVE"
    })
  ]);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  await Promise.all([
    upsertTask(user.id, {
      userId: user.id,
      title: "Revisar prioridades do dia",
      description: "Abrir o painel e definir foco principal.",
      status: "PENDING",
      priority: "HIGH",
      dueDate: today,
      dueTime: "09:00",
      areaId: areaByName.get("Pessoal")?.id
    }),
    upsertTask(user.id, {
      userId: user.id,
      title: "Enviar proposta da landing page",
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueDate: yesterday,
      dueTime: "16:00",
      areaId: areaByName.get("Clientes")?.id,
      clientId: clients[0].id
    }),
    upsertTask(user.id, {
      userId: user.id,
      title: "Planejar backlog do MesaFlow",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: tomorrow,
      projectId: projectRecords[0].id,
      areaId: areaByName.get("San_Node")?.id
    })
  ]);

  await Promise.all([
    upsertEvent(user.id, {
      userId: user.id,
      title: "Reunião com Bruno",
      description: "Alinhar detalhes da landing page.",
      location: "Google Meet",
      startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      endsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
      areaId: areaByName.get("Clientes")?.id,
      clientId: clients[0].id
    }),
    upsertEvent(user.id, {
      userId: user.id,
      title: "Bloco de estudos",
      location: "Casa",
      startsAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 20, 0),
      endsAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 30),
      areaId: areaByName.get("Estudos")?.id
    })
  ]);

  const existingNote = await prisma.note.findFirst({
    where: {
      userId: user.id,
      content: "Ideia: criar uma visão semanal com blocos de foco e lembretes rápidos."
    }
  });

  if (!existingNote) {
    await prisma.note.create({
      data: {
        userId: user.id,
        content: "Ideia: criar uma visão semanal com blocos de foco e lembretes rápidos.",
        type: "NOTE",
        areaId: areaByName.get("Ideias")?.id
      }
    });
  }

  console.log("Seed concluído para", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
