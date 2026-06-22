import type { Area, Client, Event, Project, Task } from "@prisma/client";
import type { AreaOption, ClientOption, EventView, ProjectOption, TaskView } from "@/types/entities";

export function serializeArea(area?: Pick<Area, "id" | "name" | "color" | "icon"> | null): AreaOption | null {
  if (!area) return null;
  return {
    id: area.id,
    name: area.name,
    color: area.color,
    icon: area.icon
  };
}

export function serializeProject(project?: Pick<Project, "id" | "name" | "status"> | null): ProjectOption | null {
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    status: project.status
  };
}

export function serializeClient(client?: Pick<Client, "id" | "name" | "company"> | null): ClientOption | null {
  if (!client) return null;
  return {
    id: client.id,
    name: client.name,
    company: client.company
  };
}

export function serializeTask(
  task: Task & {
    area?: Pick<Area, "id" | "name" | "color" | "icon"> | null;
    project?: Pick<Project, "id" | "name" | "status"> | null;
    client?: Pick<Client, "id" | "name" | "company"> | null;
  }
): TaskView {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    dueTime: task.dueTime,
    area: serializeArea(task.area),
    project: serializeProject(task.project),
    client: serializeClient(task.client)
  };
}

export function serializeEvent(
  event: Event & {
    area?: Pick<Area, "id" | "name" | "color" | "icon"> | null;
    project?: Pick<Project, "id" | "name" | "status"> | null;
    client?: Pick<Client, "id" | "name" | "company"> | null;
  }
): EventView {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    area: serializeArea(event.area),
    project: serializeProject(event.project),
    client: serializeClient(event.client)
  };
}
