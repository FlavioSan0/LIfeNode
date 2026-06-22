import "server-only";
import { prisma } from "@/lib/prisma";
import { serializeArea, serializeClient, serializeProject } from "@/lib/serializers";

export async function getLookupData(userId: string) {
  const [areas, projects, clients] = await Promise.all([
    prisma.area.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    }),
    prisma.client.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    })
  ]);

  return {
    areas: areas.map((area) => serializeArea(area)!),
    projects: projects.map((project) => serializeProject(project)!),
    clients: clients.map((client) => serializeClient(client)!)
  };
}
