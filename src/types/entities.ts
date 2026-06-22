export type AreaOption = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
};

export type ProjectOption = {
  id: string;
  name: string;
  status?: string;
};

export type ClientOption = {
  id: string;
  name: string;
  company?: string | null;
};

export type TaskView = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  dueTime: string | null;
  area: AreaOption | null;
  project: ProjectOption | null;
  client: ClientOption | null;
};

export type EventView = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  area: AreaOption | null;
  project: ProjectOption | null;
  client: ClientOption | null;
};

export type ProjectView = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  area: AreaOption | null;
  taskCount: number;
  eventCount: number;
  tasks: Pick<TaskView, "id" | "title" | "status" | "priority" | "dueDate">[];
  events: Pick<EventView, "id" | "title" | "startsAt">[];
};

export type ClientView = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  serviceType: string | null;
  status: string;
  observations: string | null;
  taskCount: number;
  eventCount: number;
};

export type AreaView = AreaOption & {
  taskCount: number;
  projectCount: number;
  eventCount: number;
  noteCount: number;
};
