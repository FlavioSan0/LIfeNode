import {
  CalendarDays,
  CheckSquare,
  Gauge,
  Lightbulb,
  Settings,
  SquareKanban,
  Tags,
  UsersRound
} from "lucide-react";

export const mainNavItems = [
  { href: "/dashboard", label: "Hoje", icon: Gauge },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/projetos", label: "Projetos", icon: SquareKanban },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/entrada-rapida", label: "Novo", icon: Lightbulb }
] as const;

export const secondaryNavItems = [
  { href: "/areas", label: "Áreas", icon: Tags },
  { href: "/configuracoes", label: "Configurações", icon: Settings }
] as const;
