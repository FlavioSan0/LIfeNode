import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(value?: string | Date | null) {
  if (!value) return "Sem data";
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "Sem data";
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatLongDate(value: Date) {
  return format(value, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

export function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  return format(new Date(value), "yyyy-MM-dd");
}

export function toDateTimeInputValue(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function isOverdueDate(value?: string | Date | null, status?: string | null) {
  if (!value || status === "DONE" || status === "CANCELLED") return false;
  return isBefore(new Date(value), startOfDay(new Date()));
}
